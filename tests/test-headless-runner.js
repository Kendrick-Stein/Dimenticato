#!/usr/bin/env node
'use strict';

// Exercise the real CLI in a disposable fixture tree, never delete repository tests.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'dimenticato-runner-'));
const tests = path.join(fixture, 'tests');
const scripts = path.join(fixture, 'scripts');
let passed = 0;
function check(value, message) { assert.ok(value, message); passed++; }
function run(filter) {
  const args = [path.join(tests, 'run-headless.js')];
  if (filter !== undefined) args.push(filter);
  const result = spawnSync(process.execPath, args, {
    cwd: fixture, encoding: 'utf8', timeout: 10000
  });
  assert.ifError(result.error);
  return { status: result.status, output: result.stdout + result.stderr };
}

try {
  fs.mkdirSync(tests);
  fs.mkdirSync(scripts);
  for (const file of ['run-headless.js', 'dom-shim.js']) {
    fs.copyFileSync(path.join(__dirname, file), path.join(tests, file));
  }

  let result = run('definitely-not-a-test');
  check(result.status === 1, 'unmatched filter must fail');
  check(result.output.includes('没有匹配的测试'), 'unmatched filter explains the failure');
  check(!result.output.includes('0 passed, 0 failed'), 'empty run cannot look successful');

  for (const file of ['test-storage.js', 'test-quiz-engine.html', 'scripts/validate_vocab.js']) {
    result = run(file);
    check(result.status === 1, 'missing selected entry must fail: ' + file);
    check(result.output.includes('FAIL 测试入口不存在或不可读：' + file), 'missing entry is named: ' + file);
  }

  fs.mkdirSync(path.join(tests, 'test-storage.js'));
  result = run('test-storage.js');
  check(result.status === 1, 'directory cannot stand in for a test file');
  fs.rmdirSync(path.join(tests, 'test-storage.js'));

  // Other registered files are deliberately absent: a valid filtered run stays usable.
  fs.writeFileSync(path.join(tests, 'test-storage.js'), "console.log('2 passed, 0 failed');\n");
  result = run('test-storage.js');
  check(result.status === 0, 'existing selected Node harness passes');
  check(result.output.includes('1 harnesses — 2 passed, 0 failed'), 'Node summary is retained');

  fs.writeFileSync(path.join(scripts, 'validate_vocab.js'), "console.log('validate_vocab: ok');\n");
  result = run('validate_vocab.js');
  check(result.status === 0, 'existing selected validator passes');
  check(result.output.includes('scripts/validate_vocab.js'), 'validator path remains in report');

  fs.writeFileSync(path.join(tests, 'test-quiz-engine.html'),
    '<body><div id="results"><div class="pass">fixture assertion</div>' +
    '<div class="summary">1 passed, 0 failed</div></div></body>');
  result = run('test-quiz-engine.html');
  check(result.status === 0, 'existing selected HTML harness passes');
  check(result.output.includes('1 harnesses — 1 passed, 0 failed'), 'HTML summary is retained');

  fs.writeFileSync(path.join(tests, 'test-storage.js'),
    "console.error('fixture failure'); process.exit(1);\n");
  result = run('test-storage.js');
  check(result.status === 1 && result.output.includes('fixture failure'), 'Node failure still fails');

  fs.writeFileSync(path.join(tests, 'test-quiz-engine.html'), '<body><div id="results"></div></body>');
  result = run('test-quiz-engine.html');
  check(result.status === 1 && result.output.includes('缺少汇总行'), 'missing HTML summary still fails');

  // Full runs must reject all missing registrations before executing any partial suite.
  fs.writeFileSync(path.join(tests, 'test-quiz-engine.html'), '<body><script>throw Error("SHOULD_NOT_RUN");</script></body>');
  result = run();
  check(result.status === 1, 'incomplete full suite fails');
  check(result.output.includes('test-spaced-repetition.html') &&
    result.output.includes('test-headless-runner.js') &&
    result.output.includes('scripts/validate_modules.js'), 'all entry types checked before execution');
  check(!result.output.includes('SHOULD_NOT_RUN'), 'preflight prevents a misleading partial run');

  console.log('Headless runner OK: ' + passed + ' passed, 0 failed');
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
