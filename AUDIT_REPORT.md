# Launchpad audit — findings and remediation

Branch: `audit/security-and-stability-fixes` (based on `main` @ `5ab4d6e`). Nothing has been
committed or deployed yet.

**Bottom line:** the repo was deployable but unsafe:
- Anyone on the internet could wipe every user account or send email as the platform.
- Any signed-in user could forge connections, rewrite anyone's opportunities and files, and read or change the HSFS access codes.
- Several headline features never worked: the waitlist, Six Degrees applications, HSFS sign-up, account deletion, password change, and "connect with resume".

The issues that live in code are fixed on this branch. The ones that need credentials, infrastructure or a product decision are listed under **Action required**.

Status key: ✅ fixed in this branch · ⚠️ needs action outside the code · 🔶 left as-is (decision needed)

---

## Action required (cannot be done in code)

1. ⚠️ **Rotate the Azure VM's SSH password and turn off password login.** It is in the README and in git history (`ssh launchpad@20.3.232.3`).
2. ⚠️ **Shut down or re-key the Typesense server** (`launchpad-typesense.westus2.cloudapp.azure.com`). Its admin key (`xyz`) shipped in every client bundle, so anyone could read, rewrite or delete the user index. Nothing uses it any more; delete the VM if it isn't needed.
3. ⚠️ **Delete the deployed `deleteAuthUsers` function** if it is live: `firebase functions:delete deleteAuthUsers`. Until then, one unauthenticated HTTP request deletes every account.
4. ⚠️ **Deploy rules and functions together**: `firebase deploy --only firestore:rules,storage,functions`, then hosting. Run them against the emulator first (see below).
5. ⚠️ **Create `admins/{uid}` documents** for the people who run graduation emails and Sheets re-syncs.
6. ⚠️ **Delete the test account** whose password was committed in `CLAUDE.md` (`test.playwright.user@example.com`).
7. ⚠️ **Check Stream Chat permissions** in the Stream dashboard. The client can create channels with any user ID; the server should restrict this.
8. ⚠️ **Check the Algolia key** is search-only and that the indexed records don't include emails.
9. ⚠️ **Optional:** rewrite git history to purge the SSH password and test credentials. Rotating them (items 1 and 6) is what actually matters.
10. ⚠️ **Upgrade the Functions runtime** from Node 20 (end-of-life April 2026) to Node 22. Move the Sheets sync off the deprecated `functions.config()` to params or secrets.

Rules testing: this machine has no Java or Firebase CLI, so the new `firestore.rules` and `storage.rules` have not been run in the emulator. They were reviewed by hand against every read and write the client makes. Test them before deploying.

---

## Critical

| # | Issue | Status |
|---|---|---|
| C1 | `deleteAuthUsers` was a public, unauthenticated HTTP endpoint that deleted **every** Firebase Auth user. | ✅ deleted (⚠️ also delete the deployed one) |
| C2 | `sendSESEmail` had **no auth check** and accepted any sender, recipients and HTML. It was an open mail relay on `launchpadhouston.com`. | ✅ now requires sign-in; fixed sender, allow-listed types, ≤10 recipients per call, 25 per user per day |
| C3 | Firestore `connections`: any signed-in user could read, write or delete any connection, forge "approved" links between strangers, and read the whole social graph. | ✅ participants read; only Functions write |
| C4 | Firestore `mail`: any signed-in user could write to the outbound mail queue, which is a second open relay. | ✅ server-only |
| C5 | Typesense admin key and host shipped in the browser bundle (`typesenseClient.jsx`). | ✅ removed from code and bundle (⚠️ infra) |
| C6 | VM SSH password committed in `README.md`. | ✅ removed (⚠️ rotate) |
| C7 | `manageConnections`: callers could create a connection already `approved`, and `updateStatus` let anyone set any connection's status by ID. | ✅ create is `pending` only; only the target can approve |
| C8 | Stored XSS: opportunity "apply" and "learn more" links went straight into `href` and `window.open`. React 18 executes `javascript:` URLs, and any user can create opportunities. `stableLinkCheck` let `javascript:alert('http')` through. | ✅ `src/utils/safeUrl.js` applied to every user-supplied link |

## High

| # | Issue | Status |
|---|---|---|
| H1 | Any user could edit or delete any opportunity (rules "TEMPORARILY OPEN"). | ✅ creator or admin only |
| H2 | HSFS access codes: any user could read every code from `societies/hsfs` and rewrite codes and limits. The check ran in the browser, and anyone could add `societies: ['hsfs']` to their own profile. | ✅ new `verifySocietyAccessCode` / `redeemSocietyAccessCode` callables; society doc is server-only; rules require a redeemed grant |
| H3 | Storage: any user could overwrite anyone's profile picture, resume or opportunity logo, with no size or type limits. Feedback uploads could overwrite each other. | ✅ owner-only paths, size and type limits, per-user feedback folder |
| H4 | HTML injection in every notification email (names, bios, message previews, report and feedback text, opportunity titles), which enabled phishing from the platform domain. | ✅ central `escapeHtml`; all templates wrapped; subjects stripped of CR/LF |
| H5 | Graduation emails, migration reminders and Sheets re-sync: any signed-in user could trigger mass emails (`testMode` skipped the May check). | ✅ admin-only (`admins/{uid}`) |
| H6 | `generateUnsubscribeLink` was unauthenticated and accepted any email, so anyone could unsubscribe anyone. `checkUnsubscribeStatus` let callers test whether an address was registered. | ✅ caller's own email only |
| H7 | `sendEmailNotifications`: any user could email any user with a made-up sender name and body. | ✅ requires an existing connection; sender name comes from the server; rate-limited |
| H8 | `sendInviteEmail`: unlimited recipients, unvalidated addresses, unescaped HTML. | ✅ validated, capped (20 per call, 50 per day), escaped |
| H9 | Chat session leak: logging out from the TopBar never disconnected Stream, so the next account in that tab got the previous user's chat session. (The `LogoutButton` that did disconnect was never rendered.) | ✅ `logout()` disconnects; reconnect checks user ID |
| H10 | Reports, invitation batches and onboarding analytics (minors' first names) were readable by every user. | ✅ admin-only reads |

## Broken features (bugs)

| # | Issue | Status |
|---|---|---|
| B1 | **Account deletion.** `AuthContext` stored `{...user}`, which dropped `User.delete()`. The profile was deleted, then the call threw, leaving the account half-deleted. Connections, files and the Stream user were never cleaned up. | ✅ stores the real `User`; new `deleteMyAccount` callable removes everything |
| B2 | **Password change.** `SecuritySettings` used `const currentUser = useAuth()` (the context object), so every user was told "not available for Google accounts". | ✅ fixed; proper re-authentication |
| B3 | **Waitlist.** `waitlist` had no Firestore rule, so every signup was denied. | ✅ public create with validation |
| B4 | **Six Degrees applications.** No Firestore or Storage rules, so both the submission and the file uploads were denied. | ✅ owner-scoped rules |
| B5 | **HSFS sign-up.** Signed-out visitors can't read `societies/hsfs`, so the code check always failed for new users. | ✅ server-side verify |
| B6 | **HSFS opportunities** (`societies/{id}/opportunities`) had no rules. | ✅ member-scoped rules |
| B7 | **Graduation migration page.** <ul><li>`migration_tokens` had no rules.</li><li>It loaded `userId` from the URL but wrote to whoever was signed in.</li><li>The College→Professional link pointed to a route that didn't exist, and set the type to "College Student" anyway.</li><li>The college dropdown had `options={[]}`.</li></ul> | ✅ all fixed; `/migrate-to-professional` route added |
| B8 | **Scheduled graduation emails never sent:** it looped over the deleted `tenants` collection, called the function without auth, and ran in June while the function only sends in May. | ✅ shared core, runs May 15, idempotent |
| B9 | Sheets re-sync called the CloudFunction wrapper with a snapshot, not `.run()`. | ✅ |
| B10 | "Connect with resume" read `resumes/{uid}`, which nothing writes. Onboarding wrote `resume_{uid}` and Edit Profile wrote `resume_{uid}.pdf`. | ✅ `findUserResume` checks all paths; new uploads use `.pdf` |
| B11 | `GlobalAuthWrapper` returned its listener cleanup from inside an async function, so Firestore listeners piled up and kept firing after logout. | ✅ |
| B12 | `ConnectionProvider` called the backend on public pages while signed out, didn't refetch after login, and fetched twice on every tab focus. | ✅ keyed on auth, throttled |
| B13 | Onboarding save errors were swallowed, so users went to `/Home` with no profile and bounced back to onboarding. | ✅ errors surface with a toast |
| B14 | Failed uploads saved the profile with `null` files and no message. | ✅ errors surface |
| B15 | HSFS users' root profile had no email, so they never got notifications. | ✅ |
| B16 | No 404 route: unknown URLs showed "Something went wrong". | ✅ Not Found page |
| B17 | Login didn't handle `auth/invalid-credential` (the current Firebase error), so users saw a generic error. | ✅ |
| B18 | Unsubscribe: real errors were rewritten as `internal`, and unsubscribing from one email type overwrote earlier unsubscribes. | ✅ shared `utils/unsubscribe.js`, per-type list, transaction |
| B19 | The opportunity matcher crashed on malformed skills and emailed the opportunity's own creator. | ✅ |
| B20 | Opportunity emails showed "Invalid Date" when the deadline was stored as a string. | ✅ |
| B21 | The `/parent-verify` page (feature removed) called hooks conditionally and called functions that aren't deployed. | ✅ removed with the parental modals |
| B22 | `sendSESEmail` built a malformed `From:` header (`Launchpad Networks <Launchpad Networks <…>>`). | ✅ |
| B23 | Stream connect: it passed a `null` token through, two concurrent connects raced, and a fresh device with no cached profile loaded forever. | ✅ |
| B24 | Missing React `key` props; `BasicUserInfo` referenced an undefined `onSearchQueryChange`. | ✅ |
| B25 | Admin-only Firebase SDK initialization ran in the wrong order (`getStreamJWT` called `initializeApp()` without the `apps.length` check every other module uses). | ✅ initialized once in `index.js` |

## Build, CI and repo hygiene

| # | Issue | Status |
|---|---|---|
| I1 | Both GitHub Actions workflows ran `npm run build` at the repo root with no install, but the app is in `launchpad/`. Automatic deploys could never work. | ✅ |
| I2 | `Dockerfile` and `start.sh` ran the Vite **dev server** as production, used a different Typesense version from the README, and ran a populate script that reads the deleted `tenants` collection and needs a local service-account key. | ✅ removed with the Typesense tooling |
| I3 | `launchpad/.gitignore` ignored **every** `*.json`, which would silently drop files like `firestore.indexes.json`. The `.firebase/` deploy cache was committed. | ✅ targeted credential patterns; cache untracked |
| I4 | Admin seed scripts (`populateOpportunities`, `seedHighSchools`, …) were bundled into the client. | ✅ no longer imported |
| I5 | ESLint flagged 876 `prop-types` errors (the project doesn't use PropTypes) and linted Cloud Functions as browser code (125 false `no-undef`), burying the real bugs. | ✅ 1,626 → 562 problems; remaining are unused variables and unescaped apostrophes |
| I6 | Unused components: `OrganizationProfileRevamped`, `OpportunityForm` (842 lines), `LogoutButton`, `LoginIcon`, `LoadingBar`, `SaveChanges`, `ReadMore`, `CustomSelectTest`, and the school-version functions. | ✅ deleted |
| I7 | `CLAUDE.md` contained a test account's password and described connections wrongly (as two documents per pair). | ✅ |
| I8 | The production JS bundle is a single 3.1 MB file (856 KB gzipped) with no code splitting. | 🔶 recommend route-level `lazy()` |

## Remaining risks (decisions needed)

- 🔶 **`sendSESEmail` still sends HTML written by the client.** It now requires sign-in, is capped at 25 recipients per user per day, and uses a fixed sender. A signed-in user could still send their own HTML to those recipients. The real fix is moving the invitation templates server-side.
- 🔶 **Every signed-in user can read every profile, including email addresses**, many of them minors'. That's the current "community-wide directory" design. Consider moving email and other private fields to `users/{uid}/private`.
- 🔶 Users can still set arbitrary fields on their own profile (`userType`, `email`, …). Only `societies` is protected.
- 🔶 `onOpportunityCreated` reads the **whole** `users` collection on every new opportunity. That's a cost and scaling problem.
- 🔶 Every app load shows a forced 3.5-second loading animation.
- 🔶 There are many `console.log` calls that print user data in production.
- 🔶 Existing HSFS members have no `grants/{uid}` doc. The rules fall back to the `societies` field on their profile, so they keep working without a backfill.

## Verification performed

- `npm run build` passes, and the bundle no longer contains the Typesense host or key, or the seed scripts.
- ESLint shows zero `no-undef`, `rules-of-hooks` or `jsx-key` errors.
- The Functions bundle loads all 24 exports.
- Assertions on the pure logic passed: template escaping (`<script>` and `javascript:` neutralized), unsubscribe rules, CR/LF stripping in headers, email validation, URL filtering.
- Browser smoke test of public pages (landing, login, HSFS access, 404, removed route): they render with no runtime errors. Signed-in flows were **not** exercised, because that would write to the production Firebase project.
- **Not verified:** the rules in the emulator; the Functions against a live or emulated Firestore; deployment.
