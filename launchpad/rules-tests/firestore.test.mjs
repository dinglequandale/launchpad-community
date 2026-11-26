// Firestore security rules tests. Run with: npm run test:rules (needs Java + Firebase CLI).
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, getDocs, query, where,
  serverTimestamp, increment, arrayUnion,
} from 'firebase/firestore';

let env;
const alice = () => env.authenticatedContext('alice', { email: 'alice@example.com' }).firestore();
const bob = () => env.authenticatedContext('bob', { email: 'bob@example.com' }).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const seed = (fn) => env.withSecurityRulesDisabled((ctx) => fn(ctx.firestore()));

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-launchpad',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

// ---------------------------------------------------------------- users
test('users: signed-in users can read profiles, anonymous cannot', async () => {
  await seed((db) => setDoc(doc(db, 'users/bob'), { userName: 'Bob' }));
  await assertSucceeds(getDoc(doc(alice(), 'users/bob')));
  await assertFails(getDoc(doc(anon(), 'users/bob')));
});

test('users: only the owner can write their profile', async () => {
  await assertSucceeds(setDoc(doc(alice(), 'users/alice'), { userName: 'Alice' }));
  await assertFails(setDoc(doc(alice(), 'users/bob'), { userName: 'Hacked' }));
  await assertSucceeds(updateDoc(doc(alice(), 'users/alice'), { userAboutMe: 'hi' }));
});

test('users: joining a society requires a redeemed access-code grant', async () => {
  await assertFails(setDoc(doc(alice(), 'users/alice'), { userName: 'A', societies: ['hsfs'], societyPrimary: 'hsfs' }));
  await seed((db) => setDoc(doc(db, 'societies/hsfs/grants/alice'), { uid: 'alice' }));
  await assertSucceeds(setDoc(doc(alice(), 'users/alice'), { userName: 'A', societies: ['hsfs'], societyPrimary: 'hsfs' }));
});

test('users: existing members keep editing; legacy empty societyPrimary is allowed', async () => {
  await seed((db) => setDoc(doc(db, 'users/bob'), { userName: 'B', societies: ['hsfs'], societyPrimary: 'hsfs' }));
  await assertSucceeds(updateDoc(doc(bob(), 'users/bob'), { userAboutMe: 'x' }));
  await seed((db) => setDoc(doc(db, 'users/alice'), { userName: 'A', societyPrimary: '' }));
  await assertSucceeds(updateDoc(doc(alice(), 'users/alice'), { userAboutMe: 'x' }));
  await assertFails(updateDoc(doc(alice(), 'users/alice'), { societies: ['other'] }));
});

test('users: search query over searchTokens is allowed for signed-in users', async () => {
  await seed((db) => setDoc(doc(db, 'users/bob'), { userName: 'Bob', searchTokens: ['b', 'bo', 'bob'] }));
  const snap = await assertSucceeds(getDocs(query(collection(alice(), 'users'), where('searchTokens', 'array-contains', 'bo'))));
  if (snap.size !== 1) throw new Error('expected one search hit');
});

// ---------------------------------------------------------- connections
test('connections: clients cannot write; only participants can read', async () => {
  await assertFails(setDoc(doc(alice(), 'connections/c1'), { initiateUserId: 'alice', targetUserId: 'bob', status: 'approved' }));
  await seed((db) => setDoc(doc(db, 'connections/c1'), { initiateUserId: 'alice', targetUserId: 'bob', status: 'pending' }));
  await assertSucceeds(getDoc(doc(bob(), 'connections/c1')));
  const carol = env.authenticatedContext('carol').firestore();
  await assertFails(getDoc(doc(carol, 'connections/c1')));
  await assertFails(updateDoc(doc(bob(), 'connections/c1'), { status: 'approved' }));
});

// -------------------------------------------------------- opportunities
test('opportunities: creator-only edits', async () => {
  await assertFails(addDoc(collection(alice(), 'opportunities'), { title: 'x', createdBy: 'bob' }));
  await assertSucceeds(setDoc(doc(alice(), 'opportunities/o1'), { title: 'x', createdBy: 'alice' }));
  await assertFails(updateDoc(doc(bob(), 'opportunities/o1'), { title: 'defaced' }));
  await assertFails(deleteDoc(doc(bob(), 'opportunities/o1')));
  await assertSucceeds(updateDoc(doc(alice(), 'opportunities/o1'), { title: 'y' }));
  await assertFails(updateDoc(doc(alice(), 'opportunities/o1'), { createdBy: 'bob' }));
});

test('opportunities: admins may moderate', async () => {
  await seed(async (db) => {
    await setDoc(doc(db, 'admins/bob'), {});
    await setDoc(doc(db, 'opportunities/o1'), { title: 'x', createdBy: 'alice' });
  });
  await assertSucceeds(deleteDoc(doc(bob(), 'opportunities/o1')));
});

// ------------------------------------------------- server-only collections
test('mail, reports, invitations, feedback, unsubscribe, rate limits: no client writes', async () => {
  for (const path of ['mail/m', 'reports/r', 'invitation_batches/i', 'feedback/f', 'unsubscribe_tokens/t', 'unsubscribed_emails/e', 'rate_limits/x', 'admin_tasks/t', 'admins/alice']) {
    await assertFails(setDoc(doc(alice(), path), { x: 1 }));
  }
  await seed((db) => setDoc(doc(db, 'reports/r'), { reason: 'x' }));
  await assertFails(getDoc(doc(alice(), 'reports/r')));
});

// ------------------------------------------------------------- societies
test('societies: root doc (access codes) is not client-readable or writable', async () => {
  await seed((db) => setDoc(doc(db, 'societies/hsfs'), { accessCodes: { student: '123456' } }));
  await assertFails(getDoc(doc(alice(), 'societies/hsfs')));
  await assertFails(getDoc(doc(anon(), 'societies/hsfs')));
  await assertFails(updateDoc(doc(alice(), 'societies/hsfs'), { usages_count: 0 }));
});

test('societies: profile and opportunity writes require membership', async () => {
  await assertFails(setDoc(doc(alice(), 'societies/hsfs/users/alice'), { userName: 'A' }));
  await assertFails(setDoc(doc(alice(), 'societies/hsfs/opportunities/o1'), { createdBy: 'alice' }));
  await seed((db) => setDoc(doc(db, 'societies/hsfs/grants/alice'), { uid: 'alice' }));
  await assertSucceeds(setDoc(doc(alice(), 'societies/hsfs/users/alice'), { userName: 'A' }));
  await assertSucceeds(setDoc(doc(alice(), 'societies/hsfs/opportunities/o1'), { createdBy: 'alice' }));
  await assertFails(getDoc(doc(bob(), 'societies/hsfs/opportunities/o1')));
  await assertSucceeds(getDoc(doc(alice(), 'societies/hsfs/grants/alice')));
  await assertFails(setDoc(doc(alice(), 'societies/hsfs/grants/bob'), { uid: 'bob' }));
});

// --------------------------------------------------------------- waitlist
const waitlistEntry = (extra = {}) => ({
  fullName: 'Pat Doe', gradeLevel: '10th', interests: ['Finance'], email: 'pat@example.com',
  createdAt: serverTimestamp(), syncedToSheets: false, ...extra,
});

test('waitlist: public sign-up works, with validation, and is not readable', async () => {
  await assertSucceeds(addDoc(collection(anon(), 'waitlist'), waitlistEntry()));
  await assertFails(addDoc(collection(anon(), 'waitlist'), waitlistEntry({ email: 'not-an-email' })));
  await assertFails(addDoc(collection(anon(), 'waitlist'), waitlistEntry({ isAdmin: true })));
  await assertFails(getDocs(collection(alice(), 'waitlist')));
});

// ------------------------------------------------------ 6 degree applications
test('6_degree_applications: owner create only', async () => {
  await assertSucceeds(addDoc(collection(alice(), '6_degree_applications'), { userId: 'alice', selectedPath: 'new' }));
  await assertFails(addDoc(collection(alice(), '6_degree_applications'), { userId: 'bob' }));
  await assertFails(addDoc(collection(anon(), '6_degree_applications'), { userId: 'alice' }));
});

// ------------------------------------------------------- migration tokens
test('migration_tokens: owner can read and mark used, nothing else', async () => {
  await seed((db) => setDoc(doc(db, 'migration_tokens/t1'), { userId: 'alice', used: false, emailType: 'graduation' }));
  await assertSucceeds(getDoc(doc(alice(), 'migration_tokens/t1')));
  await assertFails(getDoc(doc(bob(), 'migration_tokens/t1')));
  await assertFails(updateDoc(doc(alice(), 'migration_tokens/t1'), { used: true, userId: 'bob' }));
  await assertSucceeds(updateDoc(doc(alice(), 'migration_tokens/t1'), { used: true, usedAt: new Date() }));
  await assertFails(updateDoc(doc(alice(), 'migration_tokens/t1'), { used: false }));
});

// --------------------------------------------------- onboarding analytics
test('onboarding_analytics: merge-increment writes work; reads are admin-only', async () => {
  const ref = (db) => doc(db, 'onboarding_analytics/2026-11-26');
  const write = (db, name) => setDoc(ref(db), { date: '2026-11-26', count: increment(1), firstNames: arrayUnion(name) }, { merge: true });
  await assertSucceeds(write(alice(), 'Alice'));
  await assertSucceeds(write(bob(), 'Bob'));
  await assertFails(getDoc(ref(alice())));
  await assertFails(setDoc(ref(alice()), { date: '2026-11-26', count: 999, firstNames: [] }));
});

test('high_schools: signed-in users can add, nobody can edit', async () => {
  await assertSucceeds(setDoc(doc(alice(), 'high_schools/s1'), { label: 'Bellaire High School', value: 'bellaire' }));
  await assertFails(updateDoc(doc(bob(), 'high_schools/s1'), { label: 'x' }));
});
