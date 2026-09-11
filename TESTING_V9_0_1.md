# 9.0.1 validation record

## Portable Node tests

From the repository root, with the existing Node >=22 requirement:

```sh
npm test
```

This runs the original `test:rules`, `test:server`, `test:commands`, then the new `test:client` (27 cases) and `test:http` (11 cases). No new npm runtime or test dependency was added. Test servers use separate local ports; they do not connect to a public game server.

The client harness executes the shipped inline JavaScript in Node's VM. It stubs presentation and timers, and models `localStorage` using a Map. The synthetic fixture in `tests/fixtures/v9-save.json` was captured with the unchanged 9.0.0 client, not produced by a replacement implementation. These are behavioral serialization/flow tests, not a claim about browser disk writes.

To compare the new client cases against a separate old 9.0.0 checkout, set `AETHERBOARD_SOURCE_ROOT` to that checkout and run the new test file from this repository. Baseline result recorded here: 27 cases, 8 pass / 19 fail. Patched result: 27 pass / 0 fail.

## Optional browser checks

The Python scripts require an available Playwright installation and Chromium. They use `CHROMIUM_EXECUTABLE` when supplied, otherwise a system `chromium` or Playwright's installed browser. They are separate from `npm test`.

```sh
python tests/browser-recovery-test.py
python tests/browser-online-recovery.py
```

The first checks 11 DOM/serialization scenarios. The second starts its own isolated Node server and creates two actual browser WebSocket clients. It deliberately seeds one unclaimed item, Blessing and Black Market entitlement to isolate recovery, disconnects and automatically reconnects the socket for each, verifies the same seat from the other client, and exercises the actual reward/pass controls. It does not pretend these injected entitlements were earned in full simulated battles.

The existing `tests/browser-validation.py` is also retained. It needs the game's server on port 8099 and exercises the older local/online scenarios. The only functional test-harness adjustment is a same-task target query/dispatch to avoid stale animated DOM handles; optional `AETHERBOARD_BROWSER_OUTPUT` redirects evidence rather than overwriting historical V9 documentation.

## Observed results

- Original three Node suites: PASS on untouched baseline and patched source.
- New client suite: 27 PASS after four separately reproduced repairs.
- New HTTP contract suite: 11 PASS, including `/health`, frontend/shared-rule bytes, no-store headers and `/socket` greeting.
- Syntax: PASS for server, rules and inline client.
- Browser recovery: 11/11 PASS.
- Live two-client reconnect/reward scenarios: all three PASS, no uncaught page errors.
- Existing full browser scenarios: PASS after atomic test-input adjustment, including actual Freeze/area-attack relays between browsers.
- Clean repository extraction: test result recorded separately in `evidence/clean-zip-tests.txt`.
- Baseline and preserved files: comparisons recorded in `evidence/change-manifest.json`.

## Failures and remaining gap disclosed

Two initial executions of the legacy browser harness timed out at a synthetic click on an animated unit. The initial logs are retained. An instrumented attempt succeeded; querying and dispatching in one browser task then passed the existing scenario. No production targeting or combat timing was changed.

Managed Chromium blocked local HTTP navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. The policy was left intact. All browser scripts explicitly load the original source into a document and use an in-memory storage shim. Real HTTP requests and actual browser WebSockets are tested separately. Native reload/disk-storage behavior, public tunnel uptime, HTTPS and actual devices still need external acceptance testing.

Visual inspection also found **pre-existing phone clipping** that the old “document width fits” check missed. At 390px width the board extends to x=485.27, outside its 374px arena. Before/after geometry is identical and no CSS changes are in this patch. Screenshots and measurements are retained in evidence; this is the next proposed narrowly scoped fix, not a passed usability check.

Read [AUDIT_V9_0_1.md](AUDIT_V9_0_1.md) for the feature classification, risks and staged work sequence.
