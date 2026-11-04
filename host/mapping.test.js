const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { loadTickets } = require('./server');

test('mapping validation uses temporary files and preserves the real mapping', function (t) {
  const realFile = path.join(__dirname, 'tickets.json');
  const original = fs.readFileSync(realFile);
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'ifi7386-mapping-'));
  t.after(function () { fs.rmSync(folder, { recursive: true, force: true }); });
  const file = path.join(folder, 'tickets.json');
  function write(value) { fs.writeFileSync(file, JSON.stringify(value)); }
  const valid = { '04A1B2C3': { seat: 'A2', route: 'Turn left to A2.' } };
  write(valid);
  assert.deepEqual(loadTickets(file), valid);
  for (const row of ['A', 'B', 'C']) {
    for (let column = 1; column <= 4; column++) {
      write({ '04A1B2C3': { seat: row + column, route: 'Follow the aisle.' } });
      assert.equal(loadTickets(file)['04A1B2C3'].seat, row + column);
    }
  }
  for (const seat of ['D1', 'A0', 'A5', 'a2', '', null, 2]) {
    write({ '04A1B2C3': { seat: seat, route: 'Go left.' } });
    assert.throws(function () { loadTickets(file); }, /entry "04A1B2C3": seat/);
  }
  for (const route of [undefined, '', '   ', null, 123]) {
    write({ '04A1B2C3': { seat: 'A2', route: route } });
    assert.throws(function () { loadTickets(file); }, /entry "04A1B2C3": route/);
  }
  for (const entry of [null, [], 'A2']) {
    write({ '04A1B2C3': entry });
    assert.throws(function () { loadTickets(file); }, /entry "04A1B2C3": expected an object/);
  }
  for (const root of [null, [], 'bad']) {
    write(root);
    assert.throws(function () { loadTickets(file); }, /expected an object keyed by card UID/);
  }
  write({ bad: { seat: 'A2', route: 'Go left.' } });
  assert.throws(function () { loadTickets(file); }, /entry "bad": UID/);
  fs.writeFileSync(file, '{');
  assert.throws(function () { loadTickets(file); }, /cannot read valid JSON/);
  assert.throws(function () { loadTickets(file + '.missing'); }, /cannot read valid JSON/);

  write({ '04A1B2C3': { seat: 'Z9', route: 'Go left.' } });
  const child = spawnSync(process.execPath, [path.join(__dirname, 'server.js')], {
    env: { ...process.env, TICKETS_FILE: file, PORT: '0' },
    encoding: 'utf8', timeout: 3000
  });
  assert.equal(child.error, undefined);
  assert.equal(child.status, 1, 'invalid mapping must stop startup');
  assert.match(child.stderr, /entry "04A1B2C3": seat/);
  assert.doesNotMatch(child.stdout, /Local test:/);
  assert.deepEqual(fs.readFileSync(realFile), original);
});
