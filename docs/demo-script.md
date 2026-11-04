# Four-minute demonstration guide (English)

Use this as speaking notes. Statements below describe the implemented software;
complete the physical delivery evidence before claiming the full lab is done.

## 0:00–0:45 — Problem and input flow

“Our project guides a ticket holder to a seat. The Arduino reads the RFID UID
and posts it to the Pi. The Node server looks up the seat and directions. The
browser polls the server and draws a route. Our first problem was that the page
could still tell someone to scan when scanning was unavailable. Our second
problem was that invalid seat mappings were accepted at startup.”

## 0:45–1:45 — Interface demonstration

Show a known card: identify the selected seat, the written directions and the
new Next step text. Clear the display and scan again. Show an unknown card:
the previous route must disappear and the visitor is directed to an organiser.
Show the offline/host-failure state and its recovery instruction.

Use actual cards on the Pi for the final demonstration. If using the simulator,
say explicitly: “This input is simulated; the physical RFID path is not verified.”

## 1:45–2:45 — Server and AI review

“We kept the existing server and did not add dependencies. Startup validation
checks that each UID is valid, each seat exists on our map, and the route is
non-empty. An error identifies the entry and stops startup before listening.
Negative tests use temporary mappings, preserving our real card assignments.”

Show `loadTickets` in server.js, one saved specification in prompts.md, and the
automated test result. Explain why the clear-display button must retain fault
advice while the host or reader is unavailable.

## 2:45–3:30 — Git delivery

Show the real repository and matching Pi commit for each round. Explain:
“Commit saves a local version. Push shares it through GitHub. Pull updates the
Pi source. Restart runs the changed server. We use TLU for GitHub, then restore
IFI7386-G2 to test Arduino. Firmware is uploaded over USB, separately.”

Before publication/Pi testing, say “This part is pending” and show the local
commits as preparation only. Do not present local commits as completed delivery.

## 3:30–4:00 — Limitation and next test

“One remaining limitation is that reader initialisation heartbeats do not
prove the RFID antenna is working. Our next useful test is a known and unknown
real card, followed by unplug/reconnect and a fresh scan after recovery.”

Add the real results, group-member roles and one question from your group.
