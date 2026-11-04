# Group 2 — Development and Pi handover guide

Repository: https://github.com/victimp3/group-2-work

The runnable application is at the repository root. The existing group Git
history is retained, including the owner's removal of the original uploaded
teaching folder. This guide, the interface and the handover materials use English.

## Start locally

Use Node.js 18 or later. No dependency installation is needed.

```sh
node --test host/test.js host/mapping.test.js host/ui.test.js
node host/server.js
```

Open http://localhost:3000. Keep the terminal running; stop with Ctrl+C.
In a second terminal, simulate known, unknown and reader-error input:

```sh
node host/simulate.js ticket 04A1B2C3
node host/simulate.js ticket FFFFFFFF
node host/simulate.js reader-error
```

One-shot simulation has no recurring heartbeat: the reader goes offline after
10 seconds. Ticket guidance expires after 15 seconds. Simulation does not
verify the physical reader, Wi-Fi or Pi.

## Configure actual cards before physical acceptance

The supplied `host/tickets.json` contains sample UIDs. Use Arduino IDE to open
`ticket_serial/ticket_serial.ino`, choose UNO R4 WiFi and the correct USB port,
upload it, then open Serial Monitor at 115200. Preserve uppercase hexadecimal
UIDs and leading zeros. Remove a card before scanning again.

Update UID keys, assigned seats and English directions in `host/tickets.json`.
Seats must be A1–A4, B1–B4 or C1–C4; directions must be non-empty text. Restart
the server after editing. Keep `host/fixtures/tickets.json` as stable test data.
Commit actual mapping changes and record the new version tested on the Pi.

The network firmware remains unchanged. Use Arduino IDE and USB on the
development computer to upload `ticket/ticket.ino` when preparing the board.
Its hotspot remains IFI7386-G2 and server address 10.42.0.1:3000. A Git push or
pull does not install firmware. Do not change the board's SSID to TLU.

## Development revisions and delivery evidence

| Stage | Commit | Local result |
|---|---|---|
| Existing group history | 089ad2f, then 7c30386 | Teaching folder uploaded, then removed by owner |
| Runnable baseline | 6164eb9 | Original HTTP check PASS |
| Interface improvement | 6afa7c7 | HTTP and UI checks PASS, 4/4 |
| Server improvement | cf9c8a1 | HTTP, UI and mapping checks PASS, 5/5 |

These are development revisions. Publishing both improvements together does
not establish two completed Pi delivery loops. Pi deployment, real-card tests,
human review and driver rotation still need to be recorded. Do not move the
shared remote main branch backwards to reproduce earlier stages.

For each subsequent classroom change, use one active writer on main: review,
test, commit, push, pull on the Pi, restore its hotspot, restart and test with
physical input. Rotate the driver between the two required rounds. If using
the prepared historical revisions for a demonstration, agree that approach
with the instructor and record the exact revision actually running.

## First Pi clone

At the Pi's own keyboard and display, use the desktop Wi-Fi menu to connect to
TLU. Check internet access, Git and Node.js 18 or later. Then:

```sh
cd ~
git clone https://github.com/victimp3/group-2-work.git team-project
cd team-project
git remote -v
git rev-parse --short HEAD
node --test host/test.js host/mapping.test.js host/ui.test.js
```

If `~/team-project` exists, inspect it instead of overwriting it. A public
repository needs no GitHub login for Pi clone/pull access.

Restore the saved `ifi-lab` hotspot using the desktop Wi-Fi menu:
SSID **IFI7386-G2**, security **OPEN**, Pi address **10.42.0.1**. Reuse the
existing profile rather than creating a different network. Start:

```sh
node host/server.js
```

Open http://localhost:3000 in the Pi browser. Another device on the group
hotspot uses http://10.42.0.1:3000. Verify the baseline using an actual card.

## Every Pi update and test

1. Stop the server with Ctrl+C and switch the Pi to TLU using desktop Wi-Fi.
2. From the existing clone, inspect and update:

```sh
cd ~/team-project
git status --short --branch
git pull --ff-only origin main
git rev-parse --short HEAD
node --test host/test.js host/mapping.test.js host/ui.test.js
```

Preserve and reconcile local edits or a non-fast-forward state before continuing;
do not force-push or overwrite work. Match the tested commit with GitHub.

3. Restore IFI7386-G2, start `node host/server.js` and reload the Pi browser.
4. Wait for Arduino to reconnect; check Serial Monitor for HTTP 200. Rescan a
   card because restarting the server clears its in-memory state.
5. Check a known card's seat and route, an unknown card clearing the old route,
   the clear-display button, and a relevant failure/recovery.
6. For server validation, use the separate temporary mapping below, then return
   to the real configuration and repeat a physical known-card test.
7. Record operator/reviewer, pushed and Pi commits, network switch, expected and
   actual results, physical evidence and remaining limitations in test-log.md.

## Demonstrate invalid configuration without editing real cards

With the server stopped, run from the project root:

```sh
node -e 'require("node:fs").writeFileSync("/tmp/ifi7386-invalid-tickets.json", JSON.stringify({"04A1B2C3":{"seat":"Z9","route":"Go left"}}))'
TICKETS_FILE=/tmp/ifi7386-invalid-tickets.json node host/server.js
```

The server must report the offending UID and seat problem, and exit before
listening. The real mapping remains unchanged. Start `node host/server.js`
normally and rescan an actual card to check recovery.

## Demonstration materials

- `change-cards.md`: the two bounded improvements.
- `prompts.md`: readable task specifications, not a fabricated transcript.
- `test-log.md`: verified local results and pending physical evidence.
- `demo-script.md`: approximately four minutes of English speaking notes.
- `evidence/`: local simulation screenshots, not Pi or Arduino evidence.

Keep PENDING/NOT TESTED entries until the corresponding action is performed.
