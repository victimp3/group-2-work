# System architecture

Source: [server.js](../host/server.js), [index.html](../host/index.html),
[tickets.json](../host/tickets.json), and [simulate.js](../host/simulate.js).
See the [documentation index](README.md) for the reviewed revision.

## Components and boundaries

| Component | Implementation | Responsibility |
| --- | --- | --- |
| Reader/device | Firmware is absent from this tree | Intended sender of readiness and scanned UID messages |
| Host | Node.js `http`, `fs`, `path` | Validate input, resolve UID assignments, expose current state |
| Mapping | Local JSON file | Associate each UID with a seat and text route |
| Display | Browser with inline JavaScript and SVG | Poll state, show guidance and draw a fixed geometric route |
| Simulator | Node.js command-line script | Submit messages without an RFID device |

The root README describes an Arduino UNO R4 WiFi, RC522 reader and Raspberry Pi
hotspot. These are deployment context from existing documentation; firmware,
wiring and physical operation cannot be verified from the current source tree.

## Message and rendering flow

1. When `server.js` is loaded, it reads and validates the selected mapping file.
2. A device or simulator submits a version-1 JSON message to the host.
3. A valid ticket message updates reader readiness and replaces the current
   ticket with a recognised or unknown ticket result.
4. The browser fetches `/api/state` on page load, then schedules its next refresh
   1,000 ms after each request finishes. Each fetch has a 2,500 ms timeout.
5. Before rendering any state, the browser removes the previous seat selection
   and route. A recognised ticket is drawn only while the reader is online and
   ready and the scan has not been cleared in that browser.

Both the device and browser communicate with the host over HTTP. The browser
does not communicate directly with the RFID reader.

## Host state and lifetime

The module holds one `reader` object and one `ticket`, shared by every client and
by server instances created from that loaded module. This is a single-display
prototype, with no per-user sessions, scan history or persistence.

| Value | Meaning |
| --- | --- |
| `reader.seen` | Server timestamp of the last accepted reader or ticket message |
| `reader.ready` | Last reported readiness; an accepted scan sets it to true |
| `reader.online` | Computed as `seen > 0 && now - seen <= STALE_MS` |
| `ticket.at` | Server timestamp of the latest accepted scan |
| `ticket.known` | Whether the UID exists in the loaded mapping |
| `ticket.seat`, `ticket.route` | Present only for a recognised UID |

A snapshot includes the ticket while `now - ticket.at < TICKET_MS`.
Expiry filters the API response; it does not use a background deletion timer.
Reader freshness and ticket expiry are separate: an offline reader can coexist
with an unexpired ticket in the API, but the browser suppresses its route.

Reporting `ready: false` immediately clears the stored ticket. Reporting
`ready: true` refreshes readiness without extending ticket lifetime. Restarting
the process clears all transient state and reloads the mapping.

## Browser behaviour

| Condition | Display behaviour |
| --- | --- |
| Host request fails, times out, or returns invalid JSON | Host-unavailable recovery advice; route removed |
| Reader is offline | Check-power and network advice; route removed |
| Reader is online but not ready | Reader-error advice; route removed |
| Reader ready, no active ticket | Prompt to hold a card near the reader |
| Recognised active ticket | Seat label, configured text, highlighted seat and route |
| Unknown active ticket | Ask an organiser; no selected destination |
| Clear button pressed | Suppress the current scan in this browser |

Clearing records the scan timestamp locally. It sends no HTTP request and does
not clear the server or another browser. A later scan with a different timestamp
can display again; reloading the page resets the browser's suppression state.

`drawRoute()` uses the SVG seat element's coordinates. The path starts at
`(280, 295)`, goes vertically along the aisle at `x = 280`, then horizontally
to the seat centre. It does not calculate a route from the configured text.
Changing the map requires reviewing both the SVG geometry and this function.

## Implementation limits

There is no authentication, TLS configuration, rate limiting, reservation
management or database. Anyone who can reach the host can submit scan messages.
The service binds to all IPv4 interfaces. Use the intended controlled local
network; this implementation is not a public ticket-validation service.

The page includes textual status, live regions, a labelled map and a native
clear button. These features do not establish accessibility conformance:
keyboard, screen-reader, contrast and target-device usability checks remain
separate validation work.
