# HTTP API reference

Implemented by [server.js](../host/server.js). The default local base URL is
`http://localhost:3000`. JSON responses use `Content-Type: application/json`
and `Cache-Control: no-store`.

## Routes

| Method | Path | Response |
| --- | --- | --- |
| GET | `/` | HTML display page |
| GET | `/api/state` | Current reader and ticket state |
| POST | `/api/reader` | Update reader readiness |
| POST | `/api/ticket` | Submit a scanned UID |

Only these method/path combinations are handled. Other combinations return
HTTP 404. Routing uses the URL pathname, so a query string does not change the
selected endpoint. No general static-file route or CORS support is implemented.

POST requests must contain valid JSON with numeric `"v": 1`. Send the
`Content-Type: application/json` header, although the server does not enforce it.
The accumulated request-body string is limited to 2,048 JavaScript string
code units; this is not a byte-based limit.

## GET /api/state

Initial response:

```json
{
  "reader": { "seen": 0, "ready": false, "online": false },
  "ticket": null
}
```

After a recognised scan, the ticket has this shape; timestamps are illustrative:

```json
{
  "reader": { "seen": 1795022400000, "ready": true, "online": true },
  "ticket": {
    "at": 1795022400000,
    "known": true,
    "seat": "A2",
    "route": "From the entrance, follow the centre aisle to row A. Turn left to seat 2."
  }
}
```

An unmapped, correctly formatted UID produces
`{ "at": 1795022400000, "known": false }` as the ticket. No UID is included in
the state response. After expiry, `ticket` is `null`.

Times are server-generated milliseconds since the Unix epoch. Reader online
status defaults to a 10,000 ms freshness window; ticket lifetime defaults to
15,000 ms. See [architecture](architecture.md) for their independent behaviour.

## POST /api/reader

```json
{ "v": 1, "ready": true }
```

`ready` must be a boolean. An accepted request updates the reader's timestamp
and readiness. Setting it to false clears the ticket. Readiness alone does not
prove the reader can detect physical cards.

Success: HTTP 200, `{ "ok": true }`.

## POST /api/ticket

```json
{ "v": 1, "uid": "4A4E2A28" }
```

The UID must be a string of exactly 8, 14 or 20 uppercase hexadecimal characters.
Preserve leading zeros. Lowercase, separators and whitespace are rejected.

A valid request marks the reader ready and refreshes its timestamp. A matching
mapping entry produces a known ticket; a missing entry produces an unknown
ticket. Both return HTTP 200, `{ "ok": true }`. Retrieve the ticket result
through `GET /api/state`; the POST response does not contain the seat.

## Errors

All listed errors use the shape `{ "error": "CODE" }`.

| HTTP status | Code | Trigger |
| --- | --- | --- |
| 400 | `BAD_JSON` | Body cannot be parsed as JSON |
| 400 | `BAD_VERSION` | Parsed value is falsy or `v` is not numeric 1 |
| 400 | `BAD_READER` | Reader request has a non-boolean or missing `ready` |
| 400 | `BAD_UID` | Ticket UID is absent or fails format validation |
| 400 | `REQUEST_FAILED` | Caught request-processing failure before response headers are sent |
| 404 | `NOT_FOUND` | Unsupported method or path |
| 413 | `BODY_TOO_LARGE` | Accumulated body string exceeds 2,048 code units |

For a supported POST endpoint, body size is checked before JSON parsing, then
version, then endpoint-specific data. Extra JSON fields are ignored. Invalid
messages rejected by these validation checks do not update reader/ticket state.

## Example requests

Run the host first. These commands can run in another terminal:

```sh
curl http://localhost:3000/api/state
curl -H 'Content-Type: application/json' -d '{"v":1,"ready":true}' http://localhost:3000/api/reader
curl -H 'Content-Type: application/json' -d '{"v":1,"uid":"4A4E2A28"}' http://localhost:3000/api/ticket
curl http://localhost:3000/api/state
```

The UID in this example maps to A2 in the reviewed mapping. If the mapping is
changed, select a UID from the updated file.
