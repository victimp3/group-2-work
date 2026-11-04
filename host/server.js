// RUN ON THE PI: node server.js. Stop with Ctrl+C.
// require loads libraries. These three are built into Node.js.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// Only Group 2 loads ticket assignments. Restart after changing this file.
// Tests can use a separate mapping without changing the group's real cards.
const tickets = loadTickets(process.env.TICKETS_FILE || path.join(__dirname, 'tickets.json'));
const STALE_MS = Number(process.env.STALE_MS || 10000);
const TICKET_MS = Number(process.env.TICKET_MS || 15000);
let reader = { seen: 0, ready: false };
let ticket = null;

function snapshot() {
  const now = Date.now();
  let currentTicket = null;
  if (ticket !== null && now - ticket.at < TICKET_MS) {
    currentTicket = ticket;
  }
  return {
    reader: {
      seen: reader.seen,
      ready: reader.ready,
      online: reader.seen > 0 && now - reader.seen <= STALE_MS
    },
    ticket: currentTicket
  };
}

function reply(response, status, data) {
  // 200 = success; 400 = invalid data; 404 = unknown path.
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store' // Do not reuse old data from browser cache.
  });
  response.end(JSON.stringify(data)); // Convert data back to JSON text.
}

function validUid(uid) {
  if (typeof uid !== 'string') {
    return false;
  }
  if (uid.length !== 8 && uid.length !== 14 && uid.length !== 20) {
    return false;
  }
  const allowed = '0123456789ABCDEF';
  for (const character of uid) {
    if (!allowed.includes(character)) {
      return false;
    }
  }
  return true;
}

function loadTickets(filePath) {
  let mapping;
  try {
    mapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error('Ticket mapping ' + filePath + ': cannot read valid JSON: ' + error.message);
  }
  function invalid(key, problem) {
    throw new Error('Ticket mapping ' + filePath + ', entry "' + key + '": ' + problem);
  }
  if (mapping === null || typeof mapping !== 'object' || Array.isArray(mapping)) {
    throw new Error('Ticket mapping ' + filePath + ': expected an object keyed by card UID.');
  }
  for (const [uid, entry] of Object.entries(mapping)) {
    if (!validUid(uid)) {
      invalid(uid, 'UID must contain 8, 14 or 20 uppercase hexadecimal characters.');
    }
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      invalid(uid, 'expected an object with seat and route.');
    }
    if (typeof entry.seat !== 'string' || !/^[ABC][1-4]$/.test(entry.seat)) {
      invalid(uid, 'seat must be on the hall map: A1–A4, B1–B4 or C1–C4.');
    }
    if (typeof entry.route !== 'string' || entry.route.trim().length === 0) {
      invalid(uid, 'route must be non-empty text.');
    }
  }
  return mapping;
}

// async/await allows waiting for network input without blocking Node.
async function handleRequest(request, response) {
  const endpoint = new URL(request.url, 'http://localhost').pathname;
  // GET asks for information. These two routes serve the browser.
  if (request.method === 'GET' && endpoint === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    return; // This request is finished.
  }
  if (request.method === 'GET' && endpoint === '/api/state') {
    reply(response, 200, snapshot());
    return;
  }
  // POST brings new data from Arduino.
  const known = ['/api/reader', '/api/ticket'];
  if (request.method !== 'POST' || !known.includes(endpoint)) {
    reply(response, 404, { error: 'NOT_FOUND' });
    return;
  }
  try {
    let body = '';
    // A message may arrive in pieces: join them before reading JSON.
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 2048) {
        reply(response, 413, { error: 'BODY_TOO_LARGE' });
        return;
      }
    }
    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      reply(response, 400, { error: 'BAD_JSON' });
      return;
    }
    if (!data || data.v !== 1) {
      reply(response, 400, { error: 'BAD_VERSION' });
      return;
    }
    if (endpoint === '/api/reader') {
      if (typeof data.ready !== 'boolean') {
        reply(response, 400, { error: 'BAD_READER' });
        return;
      }
      reader = { seen: Date.now(), ready: data.ready };
      if (!data.ready) {
        ticket = null;
      }
    } else if (endpoint === '/api/ticket') {
      if (!validUid(data.uid)) {
        reply(response, 400, { error: 'BAD_UID' });
        return;
      }
      reader = { seen: Date.now(), ready: true };
      if (Object.hasOwn(tickets, data.uid)) {
        ticket = {
          at: Date.now(), known: true,
          seat: tickets[data.uid].seat,
          route: tickets[data.uid].route
        };
      } else {
        // Unknown UID is a valid scan, but has no destination.
        ticket = { at: Date.now(), known: false };
      }
    }
    reply(response, 200, { ok: true });
  } catch (error) {
    if (!response.headersSent) {
      reply(response, 400, { error: 'REQUEST_FAILED' });
    }
  }
}

function createServer() {
  return http.createServer(handleRequest);
}
// Direct run starts server; tests can import it without starting it.
if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer();
  // 0.0.0.0 accepts connections from other devices too.
  server.listen(port, '0.0.0.0', function () {
    console.log('Open http://10.42.0.1:' + port);
    console.log('Local test: http://localhost:' + port);
  });
}
module.exports = { createServer: createServer, loadTickets: loadTickets };
