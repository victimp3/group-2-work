// Exercise the real inline browser script with a small DOM substitute.
// A separate live-browser check is recorded in docs/test-log.md.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function page() {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const elements = new Map();
  for (const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
    const attributes = {};
    for (const attribute of match[0].matchAll(/([\w-]+)="([^"]*)"/g)) {
      attributes[attribute[1]] = attribute[2];
    }
    const classes = new Set();
    elements.set(match[1], {
      textContent: '', attributes: attributes, classes: classes, handlers: {},
      setAttribute(key, value) { this.attributes[key] = value; },
      getAttribute(key) { return this.attributes[key] ?? null; },
      classList: { add(value) { classes.add(value); }, remove(value) { classes.delete(value); } },
      addEventListener(event, handler) { this.handlers[event] = handler; }
    });
  }
  const context = vm.createContext({
    document: {
      getElementById(id) { return elements.get(id) || null; },
      querySelectorAll() { return [...elements.values()].filter(element => element.classes.has('selected')); }
    },
    fetch() { return new Promise(function () {}); },
    AbortSignal: { timeout() { return {}; } },
    setTimeout() {}
  });
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  return { context, get: id => elements.get(id) };
}

function state(ticket = null, online = true, ready = true) {
  return { reader: { online, ready }, ticket };
}
function known(at = 1) {
  return { at, known: true, seat: 'A2', route: 'Turn left to seat 2.' };
}

test('known ticket, clearing, same scan suppression and next scan', function () {
  const { context, get } = page();
  context.showTicket(state(known()));
  assert.match(get('guide').textContent, /Seat A2/);
  assert.match(get('next-action').textContent, /Follow the highlighted route/);
  assert.ok(get('seat-A2').classes.has('selected'));
  assert.match(get('route').getAttribute('d'), /^M 280 295/);
  get('clear-ticket').handlers.click();
  assert.equal(get('route').getAttribute('d'), '');
  context.showTicket(state(known()));
  assert.equal(get('route').getAttribute('d'), '');
  assert.equal(get('guide').textContent, 'Ready for a ticket.');
  context.showTicket(state(known(2)));
  assert.ok(get('seat-A2').classes.has('selected'));
});

test('unknown, offline, reader error and expiry remove the previous route', function () {
  const { context, get } = page();
  for (const [nextState, expected] of [
    [state({ at: 2, known: false }), /No seat is assigned/],
    [state(known(), false), /check Arduino power/],
    [state(null, true, false), /check the reader and restart/],
    [state(), /Hold one ticket card/]
  ]) {
    context.showTicket(state(known()));
    context.showTicket(nextState);
    assert.match(get('next-action').textContent, expected);
    assert.equal(get('route').getAttribute('d'), '');
    assert.equal(get('seat-A2').classes.has('selected'), false);
  }
});

test('host failure and clear keep recovery advice; recovery accepts fresh input', function () {
  const { context, get } = page();
  context.showTicket(state(known()));
  context.showHostError();
  assert.match(get('guide').textContent, /unavailable/);
  assert.match(get('next-action').textContent, /restore the Pi hotspot/);
  assert.equal(get('route').getAttribute('d'), '');
  get('clear-ticket').handlers.click();
  assert.match(get('next-action').textContent, /restart the server/);
  context.showTicket(state(known(3)));
  assert.match(get('guide').textContent, /Seat A2/);
});
