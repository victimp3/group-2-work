# IFI7386 Group 2 — Ticket guidance

RFID ticket scans select a seat and show walking directions on a hall map.
The project uses plain HTML/SVG/JavaScript, Node.js built-ins and the original
Arduino sketches. No npm dependency installation is required.

**Status:** local implementation and simulation verified. Pi delivery,
real-card mapping and physical acceptance are pending.
Group repository: https://github.com/victimp3/group-2-work

The root folders contain the runnable group application. This work retains
the existing group Git history, including the owner’s removal of the uploaded
course-materials folder. Group members and human reviewers: to be filled in
by the group.

## Start and test

Use Node.js >=18. Run these commands from the project root:

```sh
node --test host/test.js host/mapping.test.js host/ui.test.js
node host/server.js
```

Open http://localhost:3000. Stop with Ctrl+C. In another terminal:

```sh
node host/simulate.js ticket 04A1B2C3
node host/simulate.js ticket FFFFFFFF
node host/simulate.js reader-error
```

These are simulations, not RFID hardware tests. Each one-shot scan goes offline
after 10 seconds without heartbeats. A ticket expires after 15 seconds.
The original firmware sends reader heartbeats every 2 seconds.

## Layout and changes

- `host/index.html`: hall map and next-action guidance; clears stale routes on faults.
- `host/server.js`: original HTTP contract, with startup validation of ticket mappings.
- `host/tickets.json`: **sample cards only**. Replace with your actual RFID UIDs before physical acceptance.
- `host/test.js`, `host/mapping.test.js`, `host/ui.test.js`: HTTP, mapping and browser-logic checks.
- `host/fixtures/tickets.json`: stable test data; do not replace this with real cards.
- `ticket/ticket.ino`: original network firmware, unchanged.
- `ticket_serial/ticket_serial.ino`: original standalone reader check, unchanged.
- `docs/change-cards.md`, `docs/prompts.md`: the two bounded tasks.
- `docs/test-log.md`: actual local results and pending Pi evidence.
- `docs/demo-script.md`: English demonstration guide.
- `docs/workflow-guide.md`: startup, Git workflow and Pi handover steps.

The baseline is commit `6164eb9`, interface round `6afa7c7`, server round
`cf9c8a1`. Later documentation commits do not change the tested application.
Use the two rounds separately for Pi delivery; a single final deployment is not
evidence of two delivery loops.

## Real-card configuration

Read each card UID using `ticket_serial/ticket_serial.ino` and Serial Monitor at
115200. Preserve leading zeros and uppercase hexadecimal text. Remove a card
before scanning again. Change only the UID keys and assigned directions in
`host/tickets.json`, keeping the object format:

```json
{
  "04A1B2C3": {
    "seat": "A2",
    "route": "From the entrance, follow the centre aisle to row A. Turn left to seat 2."
  }
}
```

Allowed seats are A1–A4, B1–B4 and C1–C4. Routes must be non-empty text.
The server validates configuration at startup and stops with the offending UID
and problem if it is invalid. Restart after editing the mapping. The final
server also accepts an optional `TICKETS_FILE` environment variable for an
alternate mapping; automated tests use separate fixtures and temporary files.

## Raspberry Pi and Arduino

The Pi serves the app at http://10.42.0.1:3000 when hosting the saved `ifi-lab`
profile: SSID **IFI7386-G2**, OPEN security, address **10.42.0.1**. Use the Pi's
desktop Wi-Fi menu to connect to **TLU** for GitHub downloads, then restore the
same group hotspot for testing. No Ethernet connection is assumed.

Hardware: Arduino UNO R4 WiFi and RFID-RC522 V1.33. Follow the
[course wiring instructions](https://github.com/nullyks/ifi7386-interactive-systems/blob/main/sessions/04-integration-and-collaborative-development/group-2-ticket.md)
and power the reader from 3.3 V. Original pin assignments are SS D10, RST D9,
SCK D13, MOSI D11, MISO D12 and GND. The course examples use AMRFID 1.0.1
and MFRC522 1.4.12; WiFiS3 comes with the UNO R4 board package.

Upload firmware from the development computer using Arduino IDE and USB.
Git push/pull shares source; it does not upload firmware. No firmware changes
or compilation were performed in this work. The heartbeat reports that
initialisation was called; it does not prove the reader antenna is working.

## Attribution

Original examples: Tanel Toova, 2026, IFI7386 course materials, CC BY 4.0;
adapted for Group 2 with AI assistance. Changes: next-action interface guidance,
startup mapping validation, isolated tests and handover documentation.
[Original source](https://github.com/nullyks/ifi7386-interactive-systems),
source commit `eb81e6273404b167a4df0de8b96fed727045579d`.
See `LICENSE`. Course workflow:
[Session 5](https://github.com/nullyks/ifi7386-interactive-systems/tree/main/sessions/05-ai-assisted-development-and-git-workflow).
