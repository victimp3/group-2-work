# Group 2 ticket host

This Node.js server serves the ticket display and accepts reader status and ticket
scans from the device. It keeps the latest reader and ticket state in memory; a
restart clears that state and reloads the ticket mapping.

## Requirements

- Node.js 18 or later
- `tickets.json` in this directory, unless `TICKETS_FILE` is set

The server uses only Node.js built-in modules; no dependency installation is
needed.

## Run

From this directory:

```sh
npm start
```

The server listens on port `3000` on all network interfaces by default. It prints
the display URL (`http://10.42.0.1:3000`) and a local URL
(`http://localhost:3000`) when it starts. Set `PORT` to use another port. Stop
the server with Ctrl+C.

Run the host tests with:

```sh
npm test
```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `TICKETS_FILE` | `tickets.json` beside `server.js` | Path to the ticket mapping JSON file |
| `STALE_MS` | `10000` | Time without a reader message before the reader is reported offline |
| `TICKET_MS` | `15000` | Time a scanned ticket remains in the reported state |

The ticket mapping is loaded and validated when the server starts. Each property
is a card UID containing 8, 14, or 20 uppercase hexadecimal characters. Its
value must include a seat from rows A–F and seats 1–8, and a non-empty route:

```json
{
  "00000004": {
    "seat": "A5",
    "route": "Row A, Seat 5"
  }
}
```

An unreadable or invalid mapping prevents the server from starting and reports
the file or entry that needs correction.

## HTTP API

All API request and response bodies use JSON. POST requests must include
`"v": 1`. POST bodies are limited to 2048 characters.

### `GET /`

Serves the ticket display page from `index.html`.

### `GET /api/state`

Returns the current state:

```json
{
  "reader": {
    "seen": 0,
    "ready": false,
    "online": false
  },
  "ticket": null
}
```

`reader.seen` is the timestamp in milliseconds of the most recent reader
message, or `0` if none has arrived. `reader.online` becomes false when that
timestamp is older than `STALE_MS`. A ticket is returned only until `TICKET_MS`
after its scan; afterward `ticket` is `null`.

### `POST /api/reader`

Reports reader readiness:

```json
{ "v": 1, "ready": true }
```

`ready` must be a boolean. Reporting `false` clears the current ticket.

### `POST /api/ticket`

Reports a scanned UID:

```json
{ "v": 1, "uid": "00000004" }
```

The UID must contain 8, 14, or 20 uppercase hexadecimal characters. A matching
UID returns a ticket with `known: true`, its configured `seat`, and `route`. A
valid but unmapped UID returns a ticket with `known: false` and no destination.
A scan also marks the reader ready.

Invalid JSON, version, reader data, or UID returns HTTP 400 with an error code.
Unknown paths or unsupported methods return HTTP 404. Oversized request bodies
return HTTP 413.

## Planned UI changes

- Allow users to enter a ticket number manually as an alternative to scanning.
- Add a clean, simple entry page that displays only a prompt such as “Scan your
  ticket here to find your seat.” After a ticket is scanned, show the hall map
  with directions to the user's seat.

## Simulate a device message

With the server running, use the optional helper to submit a ticket scan or
report a reader error:

```sh
node simulate.js ticket 00000004
node simulate.js reader-error
```

The helper sends to `http://localhost:3000` by default. Set `HOST_URL` to target
another server URL, for example `HOST_URL=http://10.42.0.1:3000`.
