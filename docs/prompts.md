# Saved implementation specifications

These are the bounded task specifications for the two implemented changes.
This file is a readable task record, not a verbatim export of the conversation.
The actual tool used was Codex desktop; the course allows another AI tool
when the same workflow can be demonstrated.

## Round 1 — Interface

Observed problem: the existing ticket page says “Scan a ticket” even while the
reader is offline or the host is unreachable. Make the next action clear for
ready, known ticket, unknown ticket, reader offline, explicit reader error and
host failure. Change only host/index.html plus relevant behaviour tests. Keep
plain HTML/SVG/JavaScript and add no dependencies. Preserve the clear-display
button, browser-local scan suppression, map IDs, route removal and keyboard
access. Preserve the server, Arduino endpoints, request fields and firmware.
Verify a known ticket, unknown ticket, offline/error, clearing and recovery;
remove previous routes whenever no valid guidance should be displayed.

## Round 2 — Server

Validate host/tickets.json before the existing Node server starts listening.
Each mapping must use a valid uppercase hexadecimal UID, a seat shown on the
current map (A1–A4, B1–B4 or C1–C4), and non-empty route text. Report the file,
offending key and exact problem; stop startup for invalid configuration.
Preserve valid mappings, routes, request fields and expiry behaviour. Add
checks using separate fixtures and temporary files; never overwrite the real
card mapping for a negative test. Add no dependencies and leave firmware
unchanged. Test valid configurations, bad entries and actual failed startup;
rerun the existing HTTP checks and explain anything not physically verified.

## Review points

The clear-display button was checked while the reader was offline and while
the host was unavailable: it must retain useful recovery advice rather than
resetting the page to an instruction to scan. The server integration test was
isolated from the editable production card mapping so real UID changes will
not invalidate assumptions about sample A2/B3 cards.
