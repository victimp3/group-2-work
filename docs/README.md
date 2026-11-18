# Technical documentation — Group 2 Ticket Guidance

This documentation describes the code present in
[victimp3/group-2-work](https://github.com/victimp3/group-2-work) at commit
`3d5d71716f392b46b6aa1981fb65af1de1b448e9`, reviewed on 18 November 2026.
It was generated with AI assistance from the repository source. Runtime and
hardware verification limits are recorded in the development guide.

| Document | Contents |
| --- | --- |
| [Architecture](architecture.md) | Components, data flow, state and browser rendering |
| [HTTP API](api.md) | Endpoints, JSON messages, validation and errors |
| [Development and operation](development.md) | Startup, mapping, simulation, tests and troubleshooting |
| [Host quick start](../host/README.md) | Short operational reference |

## Purpose and implemented scope

The application connects RFID ticket messages to a browser-based seating display.
A recognised card selects one seat, shows configured walking instructions, and
draws an SVG route from the entrance. The map contains 12 seats: A1–A4, B1–B4,
and C1–C4. Unknown cards and connection faults replace the previous guidance.

The host runs on Node.js 18 or later and uses only built-in modules. The page
contains its own HTML, CSS, SVG and JavaScript. No dependency installation,
frontend build, database or external web asset is required.

Manual ticket entry and a separate scan-only entry screen are planned in the
host README; neither is implemented in the reviewed page.

## Repository inventory

| Path | Responsibility |
| --- | --- |
| `host/server.js` | HTTP server, mapping validation and in-memory state |
| `host/index.html` | Kiosk interface, polling, seat highlighting and routes |
| `host/tickets.json` | Current UID-to-seat and text-direction assignments |
| `host/simulate.js` | Command-line sender for ticket and reader-error messages |
| `host/package.json` | Start/test scripts and minimum Node.js version |
| `host/test.js` | HTTP integration and expiry checks |
| `host/mapping.test.js` | Mapping validation checks using temporary files |
| `host/ui.test.js` | Browser-script checks using a DOM substitute |
| `README.md`, `host/README.md` | Existing project and host guidance |
| `LICENSE` | Repository licence text |

The reviewed tree has no Arduino sketches, test-fixture directory or earlier
handover documents, although the root README mentions them. In particular,
`host/test.js` requires the absent `host/fixtures/tickets.json`. Those references
describe material outside the reviewed tree and should not be treated as
available files or proof of successful hardware testing.

No application code or ticket assignments are changed by this documentation.
