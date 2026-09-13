const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative) {
  const source = fs.readFileSync(path.join(__dirname, relative), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports });
  return exports;
}
const { buildCallTree } = load('../src/components/visualizers/generic/buildCallTree.ts');
function step(event, id, parent, depth) {
  return {
    execution_event: event, call_id: id, parent_call_id: parent,
    memory_view: { variables: [], call_stack: Array(depth).fill('same_name') },
    animation_hints: [],
  };
}

test('call IDs retain sibling identity and exact exit frames without animation hints', () => {
  const steps = [step('call', 0, null, 1)];
  for (let i = 1; i <= 150; i++) {
    steps.push(step('call', i, 0, 2), step('return', i, 0, 2));
  }
  steps.push(step('return', 0, null, 1));
  const nodes = buildCallTree(steps);
  assert.equal(nodes.length, 151);
  assert.equal(nodes[0].endStep, steps.length - 1);
  for (let i = 1; i <= 150; i++) {
    assert.equal(nodes[i].id, `call-${i}`);
    assert.equal(nodes[i].parentId, 'call-0');
    assert.equal(nodes[i].startStep, 2 * i - 1);
    assert.equal(nodes[i].endStep, 2 * i);
  }
});

test('recursive parent links and exception unwinding use trace IDs', () => {
  const nodes = buildCallTree([
    step('call', 4, null, 1), step('call', 8, 4, 2), step('call', 12, 8, 3),
    step('exception', 12, 8, 3), step('return', 12, 8, 3),
    step('return', 8, 4, 2), step('return', 4, null, 1),
  ]);
  assert.equal(nodes[2].parentId, 'call-8');
  assert.equal(nodes[2].endStep, 4);
  assert.equal(nodes[1].endStep, 5);
  assert.equal(nodes[0].endStep, 6);
});

test('legacy lessons still reconstruct from recursion hints', () => {
  const steps = [1, 2, 2, 1].map((depth, index) => ({
    memory_view: { variables: [], call_stack: Array(depth).fill('f') },
    animation_hints: [{ kind: index < 2 ? 'recurse_in' : 'recurse_out', target_indices: [depth], target_vars: [] }],
  }));
  const nodes = buildCallTree(steps);
  assert.equal(nodes.length, 2);
  assert.equal(nodes[1].parentId, nodes[0].id);
  assert.equal(nodes[1].endStep, 2);
  assert.equal(nodes[0].endStep, 3);
});

for (const [name, file] of [
  ['web', '../src/lib/animation/executionStateLabel.ts'],
  ['mobile', '../../mobile/src/lib/animation/executionStateLabel.ts'],
]) {
  test(`${name} labels distinguish pre-line state, function exit, and legacy data`, () => {
    const { executionStateLabel } = load(file);
    assert.match(executionStateLabel({ execution_event: 'line' }), /before/);
    assert.match(executionStateLabel({ execution_event: 'return', return_value: 42 }), /42/);
    assert.match(executionStateLabel({ execution_event: 'exception', exception: 'ValueError' }), /ValueError/);
    assert.equal(executionStateLabel({}), null);
  });
}
