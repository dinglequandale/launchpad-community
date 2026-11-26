// End-to-end tests of the security-critical Cloud Functions against the emulators.
// Run with: npm run test:functions (needs Java + Firebase CLI).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';

const PROJECT = 'demo-launchpad';
let env, app, auth, fns;
const call = (name, data) => httpsCallable(fns, name)(data).then((r) => r.data);
// withSecurityRulesDisabled resolves to void, so capture the callback's result.
const admin = async (fn) => {
  let out;
  await env.withSecurityRulesDisabled(async (ctx) => { out = await fn(ctx.firestore()); });
  return out;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(check, label, timeoutMs = 20000) {
  const start = Date.now();
  for (;;) {
    const value = await check();
    if (value) return value;
    if (Date.now() - start > timeoutMs) throw new Error(`Timed out waiting for ${label}`);
    await sleep(300);
  }
}
async function signUp(email) {
  await signOut(auth).catch(() => {});
  const cred = await createUserWithEmailAndPassword(auth, email, 'test-password-123');
  return cred.user.uid;
}
const expectCode = async (promise, code) => {
  await assert.rejects(promise, (e) => { assert.equal(e.code, `functions/${code}`); return true; });
};

before(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
  await env.clearFirestore();
  app = initializeApp({ projectId: PROJECT, apiKey: 'demo-key' }, 'integration');
  auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  fns = getFunctions(app, 'us-central1');
  connectFunctionsEmulator(fns, '127.0.0.1', 5001);
});
after(async () => {
  await deleteApp(app);
  await env.cleanup();
});

test('search index: user and opportunity writes get searchTokens; admin task backfills', async () => {
  await admin((db) => setDoc(doc(db, 'users/u-search'), { userName: 'Jordan Rivera', schoolAttending: 'Bellaire High School' }));
  const tokens = await waitFor(async () => (await admin((db) => getDoc(doc(db, 'users/u-search')))).data().searchTokens, 'user tokens');
  assert.ok(tokens.includes('jor') && tokens.includes('bellaire'));

  await admin((db) => setDoc(doc(db, 'societies/hsfs/opportunities/o-search'), { title: 'Equity Research Intern', createdBy: 'x' }));
  await waitFor(async () => (await admin((db) => getDoc(doc(db, 'societies/hsfs/opportunities/o-search')))).data().searchTokens, 'society opp tokens');

  const task = await admin((db) => addDoc(collection(db, 'admin_tasks'), { type: 'rebuildSearchIndex' }));
  const result = await waitFor(async () => {
    const d = (await admin((db) => getDoc(doc(db, task.path)))).data();
    return d.status === 'done' || d.status === 'error' ? d : null;
  }, 'admin task');
  assert.equal(result.status, 'done', result.error);
});

test('manageConnections: pending only, only the target approves', async () => {
  const bobUid = await signUp('bob@example.com');
  await admin((db) => setDoc(doc(db, `users/${bobUid}`), { userName: 'Bob', email: 'bob@example.com' }));
  const aliceUid = await signUp('alice@example.com');
  await admin((db) => setDoc(doc(db, `users/${aliceUid}`), { userName: 'Alice', email: 'alice@example.com' }));

  await expectCode(call('manageConnections', { action: 'create', targetUserId: bobUid, status: 'approved' }), 'invalid-argument');
  await expectCode(call('manageConnections', { action: 'create', targetUserId: aliceUid, status: 'pending' }), 'invalid-argument');
  const created = await call('manageConnections', { action: 'create', targetUserId: bobUid, status: 'pending' });
  assert.equal(created.success, true);

  // The initiator cannot approve their own request.
  await expectCode(call('manageConnections', { action: 'updateStatus', connectionId: created.connectionId, status: 'approved' }), 'permission-denied');

  await signOut(auth);
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  await signInWithEmailAndPassword(auth, 'bob@example.com', 'test-password-123');
  const approved = await call('manageConnections', { action: 'updateStatus', connectionId: created.connectionId, status: 'approved' });
  assert.equal(approved.newStatus, 'approved');
  const mine = await call('manageConnections', { action: 'getByStatus', status: 'approved' });
  assert.equal(mine.count, 1);
});

test('sendSESEmail: auth required, type allow-list, fixed sender', async () => {
  await signOut(auth);
  await expectCode(call('sendSESEmail', { recipient: ['x@example.com'], subject: 's', htmlTemplate: '<p>x</p>' }), 'unauthenticated');
  await signUp('mailer@example.com');
  await expectCode(call('sendSESEmail', { recipient: ['x@example.com'], subject: 's', htmlTemplate: '<p>x</p>', emailType: 'anything' }), 'invalid-argument');
  await expectCode(call('sendSESEmail', { recipient: ['not-an-email'], subject: 's', htmlTemplate: '<p>x</p>' }), 'invalid-argument');
  const ok = await call('sendSESEmail', { recipient: ['friend@example.com'], subject: 'Hi\r\nBcc: evil@x.com', htmlTemplate: '<p>join</p>', emailType: 'invitation', sender: 'ceo@bank.com' });
  assert.equal(ok.recipientsCount, 1);
  const mail = await admin((db) => getDocs(query(collection(db, 'mail'), where('to', '==', 'friend@example.com'))));
  const m = mail.docs[0].data();
  assert.equal(m.from, 'Launchpad Networks <no-reply@launchpadhouston.com>');
  assert.ok(!m.message.subject.includes('\n'));
});

test('unsubscribe: links only for the caller; processing works and is single-use', async () => {
  await signUp('unsub@example.com');
  const link = await call('generateUnsubscribeLink', { email: 'victim@example.com', emailType: 'new_message' });
  const token = new URL(link).searchParams.get('token');
  const t = (await admin((db) => getDoc(doc(db, `unsubscribe_tokens/${token}`)))).data();
  assert.equal(t.email, 'unsub@example.com', 'token must be for the caller, not the requested address');
  await call('processUnsubscribe', { token });
  await expectCode(call('processUnsubscribe', { token }), 'failed-precondition');
  assert.deepEqual((await call('checkUnsubscribeStatus', { emailType: 'new_message' })).unsubscribed, true);
});

test('society access codes: verified and redeemed server-side', async () => {
  await admin((db) => setDoc(doc(db, 'societies/hsfs'), {
    accessCodes: { student: 'HSFS2026' }, usages_count: 0, usages_threshold: 100, daily_usages_threshold: 50,
  }));
  await signOut(auth);
  assert.equal((await call('verifySocietyAccessCode', { societyId: 'hsfs', code: 'WRONG' })).valid, false);
  assert.equal((await call('verifySocietyAccessCode', { societyId: 'hsfs', code: 'HSFS2026' })).valid, true);

  const uid = await signUp('member@example.com');
  await expectCode(call('redeemSocietyAccessCode', { societyId: 'hsfs', code: 'WRONG' }), 'failed-precondition');
  await call('redeemSocietyAccessCode', { societyId: 'hsfs', code: 'HSFS2026' });
  const again = await call('redeemSocietyAccessCode', { societyId: 'hsfs', code: 'HSFS2026' });
  assert.equal(again.alreadyMember, true);
  const society = (await admin((db) => getDoc(doc(db, 'societies/hsfs')))).data();
  assert.equal(society.usages_count, 1);
  assert.ok((await admin((db) => getDoc(doc(db, `societies/hsfs/grants/${uid}`)))).exists());
});

test('admin-only callables reject regular users', async () => {
  await signUp('regular@example.com');
  await expectCode(call('sendGraduationEmails', { testMode: true }), 'permission-denied');
  await expectCode(call('sendMigrationReminders', {}), 'permission-denied');
  await expectCode(call('resyncWaitlistToSheets', {}), 'permission-denied');
});

test('deleteMyAccount: removes profile, connections and the auth user', async () => {
  const otherUid = await signUp('other@example.com');
  await admin((db) => setDoc(doc(db, `users/${otherUid}`), { userName: 'Other' }));
  const uid = await signUp('leaving@example.com');
  await admin(async (db) => {
    await setDoc(doc(db, `users/${uid}`), { userName: 'Leaving' });
    await setDoc(doc(db, 'connections/del-1'), { initiateUserId: uid, targetUserId: otherUid, status: 'approved' });
  });
  await call('deleteMyAccount', {});
  assert.equal((await admin((db) => getDoc(doc(db, `users/${uid}`)))).exists(), false);
  assert.equal((await admin((db) => getDoc(doc(db, 'connections/del-1')))).exists(), false);
  await assert.rejects(call('deleteMyAccount', {})); // token no longer valid / user gone
});
