// Storage security rules tests. Run with: npm run test:rules (needs Java + Firebase CLI).
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { ref, uploadBytes, getBytes } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';

let env;
const storageAs = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).storage();
const png = new Uint8Array([137, 80, 78, 71]);
const pdf = new Uint8Array([37, 80, 68, 70]);
const upload = (uid, path, data, contentType) => uploadBytes(ref(storageAs(uid), path), data, { contentType });

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-launchpad',
    storage: { rules: readFileSync('storage.rules', 'utf8') },
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearStorage();
  await env.clearFirestore();
});

test('profile pictures: own path only, images only, public read', async () => {
  await assertSucceeds(upload('alice', 'profile_pictures/pfp_alice', png, 'image/png'));
  await assertFails(upload('alice', 'profile_pictures/pfp_bob', png, 'image/png'));
  await assertFails(upload('alice', 'profile_pictures/pfp_alice', pdf, 'application/pdf'));
  await assertSucceeds(getBytes(ref(storageAs(null), 'profile_pictures/pfp_alice')));
});

test('resumes: own paths only, documents only, signed-in read', async () => {
  await assertSucceeds(upload('alice', 'resumes/resume_alice.pdf', pdf, 'application/pdf'));
  await assertSucceeds(upload('alice', 'resumes/resume_alice', pdf, 'application/pdf'));
  await assertFails(upload('alice', 'resumes/resume_bob.pdf', pdf, 'application/pdf'));
  await assertFails(upload('alice', 'resumes/resume_alice.pdf', png, 'text/html'));
  await assertSucceeds(getBytes(ref(storageAs('bob'), 'resumes/resume_alice.pdf')));
  await assertFails(getBytes(ref(storageAs(null), 'resumes/resume_alice.pdf')));
});

test('feedback screenshots: per-user folder', async () => {
  await assertSucceeds(upload('alice', 'feedback/alice/1_shot.png', png, 'image/png'));
  await assertFails(upload('alice', 'feedback/bob/1_shot.png', png, 'image/png'));
  await assertFails(upload('alice', 'feedback/1_shot.png', png, 'image/png'));
});

test('opportunity logos: only the opportunity creator', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'opportunities/o1'), { createdBy: 'alice' });
    await setDoc(doc(db, 'societies/hsfs/opportunities/o2'), { createdBy: 'alice' });
  });
  await assertSucceeds(upload('alice', 'opportunity-logos/o1', png, 'image/png'));
  await assertSucceeds(upload('alice', 'opportunity-logos/o2', png, 'image/png'));
  await assertFails(upload('bob', 'opportunity-logos/o1', png, 'image/png'));
  await assertFails(upload('alice', 'opportunity-logos/missing', png, 'image/png'));
});

test('6 degree application files: uid-prefixed names only', async () => {
  await assertSucceeds(upload('alice', '6_degree_applications/alice_1_0_cv.pdf', pdf, 'application/pdf'));
  await assertFails(upload('alice', '6_degree_applications/bob_1_0_cv.pdf', pdf, 'application/pdf'));
  await assertFails(getBytes(ref(storageAs('bob'), '6_degree_applications/alice_1_0_cv.pdf')));
});

test('everything else is denied', async () => {
  await assertFails(upload('alice', 'random/file.png', png, 'image/png'));
});
