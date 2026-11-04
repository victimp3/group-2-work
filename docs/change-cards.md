# Session 5 — Change cards

These tasks were selected during the AI-assisted local preparation.
Observations below come from source inspection and the supplied baseline test;
they are not claimed as observations of a live classroom prototype.

## Round 1 — Clear next-action guidance

- Observed problem: the original page falls back to “Scan a ticket.” even when
  the reader is offline or the host is unavailable. Fault labels do not give a
  visitor a clear next action.
- Desired behaviour: distinguish ready, known ticket, unknown ticket, offline
  reader, explicit reader error and unavailable host with useful instructions.
- Scope: `host/index.html` and behaviour checks in `host/ui.test.js`.
- Acceptance: known sample UID selects A2 and tells the visitor to follow the
  route; unknown ticket removes the old route and directs them to an organiser;
  offline/error states explain recovery; host failure removes guidance and
  asks for host/hotspot recovery; recovery accepts a fresh scan.
- Regression: clear display removes the route, suppresses that exact scan in
  this browser, and permits a later scan. Preserve keyboard access, the SVG
  map, existing API calls, ticket expiry and firmware.
- Result: local checks PASS. Pi/physical check PENDING.

## Round 2 — Validate ticket mapping on startup

- Observed problem: the original server parses JSON but does not validate map
  entries. A seat such as Z9 is outside the displayed hall, and empty directions
  cannot guide a visitor.
- Desired behaviour: fail before listening when configuration is invalid;
  identify the offending UID and the field needing correction.
- Scope: `host/server.js`, fixture isolation in `host/test.js`, new mapping
  checks, test fixture and the test command in `host/package.json`.
- Acceptance: all twelve map seats and non-empty routes remain valid; invalid
  seats, missing/blank/non-text routes, invalid entry/root shapes, malformed JSON,
  unreadable files and invalid UID keys fail with a useful message. Invalid
  configuration exits nonzero before the startup message.
- Regression: existing HTTP routes, JSON fields, unknown-card handling, clear
  display and expiry remain intact. Tests must not overwrite real card data.
- Result: local checks PASS. Pi/physical check PENDING.

No dependencies, frameworks, authentication, databases or firmware features
were added. The two firmware files match the original course source.
