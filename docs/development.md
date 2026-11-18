# Development, operation and validation

See the [documentation index](README.md) for the reviewed source revision.

## Start locally

Install Node.js 18 or later with npm. No `npm install` or build step is needed.
From the repository root:

```sh
cd host
npm start
```

Open `http://localhost:3000`. Stop with Ctrl+C. Alternatively, run
`node host/server.js` from the repository root.

The server binds to `0.0.0.0`. Its startup message also prints
`http://10.42.0.1:3000`, but it does not create a hotspot or configure that
address. Another device must use an address actually assigned to the host.

## Configuration

| Variable | Default | Behaviour |
| --- | --- | --- |
| `PORT` | `3000` | TCP listening port |
| `TICKETS_FILE` | `tickets.json` beside `server.js` | Mapping loaded at module startup |
| `STALE_MS` | `10000` | Reader online freshness in milliseconds |
| `TICKET_MS` | `15000` | Ticket visibility lifetime in milliseconds |
| `HOST_URL` | `http://localhost:3000` | Simulator destination only |

A relative `TICKETS_FILE` path resolves from the process working directory.
The default path resolves from the server's directory. Numeric settings are
converted with `Number()`; the application does not validate their ranges.
Use valid ports and positive finite durations.

Example from the repository root:

```sh
PORT=3001 STALE_MS=10000 TICKET_MS=15000 node host/server.js
```

## Maintain ticket assignments

Edit [tickets.json](../host/tickets.json), then restart the server.
At the reviewed revision, the entries are:

| UID | Seat |
| --- | --- |
| `4A4E2A28` | A2 |
| `57BBCC01` | B3 |
| `04ABCDEF` | C1 |

The source file alone does not prove these match physical cards. Confirm the
actual UIDs on the device before a physical demonstration.

Each key must contain 8, 14 or 20 uppercase hexadecimal characters. Each value
must be an object with a seat matching `^[ABC][1-4]$` and a non-blank string
`route`. Example:

```json
{
  "4A4E2A28": {
    "seat": "A2",
    "route": "From the entrance, follow the centre aisle to row A. Turn left to seat 2."
  }
}
```

An unreadable file, malformed JSON, invalid root object or invalid entry stops
startup. Error messages identify the file and, when applicable, the UID.
Duplicate seat assignments are not rejected. The server does not check whether
the written directions agree with the selected seat.

## Simulate messages

With the server running, open another terminal at the repository root:

```sh
node host/simulate.js ticket 4A4E2A28
node host/simulate.js ticket FFFFFFFF
node host/simulate.js reader-error
```

The first command selects A2 with the reviewed mapping. The second replaces it
with an unknown-ticket message. The third reports `ready: false` and clears the
ticket. With no further messages, a one-shot scan loses reader-online status
after 10 seconds; its ticket expires after 15 seconds. The simulator does not
send recurring heartbeats.

To target a reachable Pi address:

```sh
HOST_URL=http://10.42.0.1:3000 node host/simulate.js ticket 4A4E2A28
```

Omitting the UID uses the simulator's default `04A1B2C3`, which is not in the
reviewed mapping and will therefore produce an unknown ticket.

## Automated tests and current gaps

From `host/`, the configured command is `npm test`. From the root, it is:

```sh
node --test host/test.js host/mapping.test.js host/ui.test.js
```

| Test file | Intended coverage | Current source limitation |
| --- | --- | --- |
| `test.js` | HTTP messages, rejection, state, expiry and page serving | Loads missing `host/fixtures/tickets.json` before registering its test |
| `mapping.test.js` | Valid mapping, invalid data, startup rejection and preservation of the real mapping | Uses temporary files; source inspection only in this documentation task |
| `ui.test.js` | Known/unknown cards, clear behaviour, faults and recovery | DOM substitute, not a real browser or accessibility test |

The mapping and UI checks can be selected independently:

```sh
node --test host/mapping.test.js host/ui.test.js
```

The full suite requires restoration of the missing fixture before it can run
successfully. `test.js` explicitly expects `04A1B2C3` to map to A2 and
`04112233` to B3, and uses `FFFFFFFF` as an unknown UID. Restore isolated
test data rather than replacing the actual card assignments.

### Validation record for this documentation change

- Compared the new documents with all source and test files in the reviewed tree.
- Confirmed the current mapping and the absence of the referenced firmware,
  fixtures and older handover documents.
- Attempted to invoke Node.js; the documentation environment returned
  `node: command not found`. Automated tests were therefore not executed.
- No browser, Raspberry Pi, Arduino or physical-card acceptance was performed.

Existing README claims of previous successful checks are historical statements,
not results reproduced by this documentation task.

## Manual acceptance procedure

After addressing the fixture issue, run automated checks in a Node.js environment.
For a local demonstration:

1. Start the host and open its page.
2. Submit a recognised UID; confirm the text, highlighted seat and entrance route.
3. Clear the display; confirm that the same scan does not reappear on refresh.
4. Submit a fresh recognised scan; confirm guidance returns.
5. Submit an unknown UID; confirm the previous destination disappears.
6. Report a reader error; confirm recovery advice and an empty route.
7. Submit a recognised scan and wait over 10 seconds without heartbeats; confirm
   the route disappears when the reader becomes offline.
8. Stop the host; confirm the browser shows host-unavailable recovery advice.

For hardware acceptance, separately verify the actual card UIDs, wiring,
firmware messages, network reachability, repeated scans and target display.
The root README describes an intended Pi hotspot named `IFI7386-G2`; its
configuration and firmware are not included in this revision.

## Troubleshooting and extension points

| Symptom | Check |
| --- | --- |
| Startup reports a mapping error | JSON syntax, file path, UID, seat and route format |
| Known physical card appears unknown | Compare its exact uppercase UID with the mapping; restart after edits |
| Route disappears after a simulated scan | A one-shot message provides no continuing heartbeat |
| Host connects but reader is offline | Device message delivery, power and network |
| Browser reports host unavailable | Host process, address, port and network connection |
| Test command fails before HTTP checks | Restore the missing fixture; do not alter real card data |

For a new endpoint, update `handleRequest()`, the API reference and meaningful
integration coverage. For a new hall layout, update SVG seats, `drawRoute()`,
the server's seat validator, mappings and related checks together. Manual ticket
entry needs both an interaction design and a defined lookup contract; no such
endpoint currently exists.
