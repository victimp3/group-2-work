# Session 5 — Test log

Date: 2026-11-04 (Europe/Tallinn). Environment: local macOS development computer,
Node.js, in-app browser and simulated HTTP input. No Raspberry Pi or Arduino
was connected to these checks. Human reviewers and driver rotation: PENDING.
Repository: https://github.com/victimp3/group-2-work. Pi clone path: PENDING.
Development copy: `group-2-work`. Existing shared history starts at `089ad2f`.
The group subsequently removed the uploaded teaching folder in `7c30386`.
This work is based on that updated history and preserves that removal.
Repository access was verified for the group collaborator account.
Code availability can be checked against the linked revisions below.

## Version record

| Version | Local commit | Verification |
|---|---|---|
| Unmodified course baseline | `6164eb9` | Original HTTP integration test PASS (1/1) |
| Round 1 interface | `6afa7c7` | HTTP and UI logic PASS before commit (4/4) |
| Round 2 server | `cf9c8a1` | HTTP, mapping and UI logic PASS (5/5) |

The final working tree retains the Round 2 application. Documentation and
screenshots were added later. The baseline, Round 1 and Round 2 checks were rerun directly in this group
repository before their respective commits; these are not Pi deployments.

## Evidence by round

| Field | Round 1 — interface | Round 2 — server |
|---|---|---|
| Problem and requested result | See change-cards.md: explicit next actions | See change-cards.md: reject invalid mappings at startup |
| Task specification | prompts.md, Round 1 | prompts.md, Round 2 |
| Changed files | index.html, ui.test.js | server.js, test.js, mapping.test.js, fixtures/tickets.json, package.json |
| Human review | PENDING | PENDING |
| Local automated result | PASS: known/unknown, offline, error, clear, expiry state, recovery | PASS: valid map seats, invalid entries, JSON/file errors, real startup rejection and original HTTP checks |
| Repository revision | [6afa7c7](https://github.com/victimp3/group-2-work/commit/6afa7c7) | [cf9c8a1](https://github.com/victimp3/group-2-work/commit/cf9c8a1) |
| Same commit on Pi | PENDING | PENDING |
| TLU → group hotspot switch | NOT PERFORMED | NOT PERFORMED |
| Physical action expected | Known card highlights seat and route; unknown card removes route | Valid actual card maps correctly after validation; invalid temporary mapping stops startup |
| Physical actual result | NOT TESTED | NOT TESTED |
| Main-path regression | Local HTTP simulation PASS; real RFID PENDING | Local HTTP simulation PASS; real RFID PENDING |
| Failure/recovery | Local logic checks PASS; live browser host stop/restart PASS on final build | Temporary invalid mapping exits 1 before listening; real production mapping bytes unchanged |
| Unverified | Pi, real cards, Wi-Fi, USB upload, human review | Same; actual group UIDs not supplied |

## Live browser checks on the final build

- Initial empty server: host connected, reader offline, recovery instructions.
- Simulator UID `04A1B2C3`: HTTP 200, A2 highlighted, route and next step visible.
- Clear display: route removed and ready-to-scan instructions displayed.
- Simulator UID `FFFFFFFF`: HTTP 200, unknown ticket advice, no retained route.
- Local server stopped: host unavailable, no route, restore/restart advice.
- Local server restarted: page automatically reconnects; empty reader state
  shows offline advice until new input. No manual reload was required.

Screenshots were captured on the earlier local preparation copy. Its host
application and test files are byte-identical to this repository after the
Round 2 changes. Automated checks were rerun here. Screenshots are **local
simulation evidence**, not Pi/hardware evidence:

- [Known ticket](evidence/known-ticket.png)
- [Unknown ticket](evidence/unknown-ticket.png)
- [Host unavailable](evidence/host-unavailable.png)

UI logic checks execute the actual inline page script against a small DOM
substitute. They do not prove browser layout or physical RFID behaviour.
The separate live-browser checks above cover the observed browser states.

## Firmware

`ticket/ticket.ino` and `ticket_serial/ticket_serial.ino`: unchanged from course
source. No compile, USB upload or Serial Monitor hardware verification performed.

## Complete this after each real delivery loop

Record pushed commit, Pi `git rev-parse --short HEAD`, operator/reviewer names,
network switch, actual card UID/seat, expected and actual result, PASS/FAIL,
physical screenshot or Serial Monitor evidence, and a failure/recovery result.
Do not change PENDING/NOT TESTED to PASS without performing the action.
If real-card configuration changes, record the NEW commit actually tested.
