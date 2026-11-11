import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activation, affine, initialParameters, parameterKeys, trainingStep } from '../src/math.ts';

test('affine neuron and activation values and derivatives', () => {
  assert.deepEqual(affine(1, 2, 0.8, -0.4, 0.5), { term1: 0.8, term2: -0.8, z: 0.5 });
  assert.deepEqual(activation('relu', -2), { value: 0, gradient: 0 });
  assert.deepEqual(activation('relu', 0), { value: 0, gradient: null });
  assert.deepEqual(activation('relu', 2), { value: 2, gradient: 1 });
  assert.deepEqual(activation('leaky', -2), { value: -0.2, gradient: 0.1 });
  assert.deepEqual(activation('leaky', 0), { value: 0, gradient: null });
  assert.deepEqual(activation('sigmoid', 0), { value: 0.5, gradient: 0.25 });
  assert.deepEqual(activation('tanh', 0), { value: 0, gradient: 1 });
});

test('all five backpropagation gradients agree with central finite differences', () => {
  const p = initialParameters;
  const step = trainingStep(p, 1, 2, 1, 0.2);
  const eps = 1e-5;
  for (const key of parameterKeys) {
    const plus = trainingStep({ ...p, [key]: p[key] + eps }, 1, 2, 1, 0).loss;
    const minus = trainingStep({ ...p, [key]: p[key] - eps }, 1, 2, 1, 0).loss;
    assert.ok(Math.abs(step.gradients[key] - (plus - minus) / (2 * eps)) < 1e-8, key);
    assert.equal(step.next[key], p[key] - 0.2 * step.gradients[key], key);
  }
  assert.ok(step.nextLoss < step.loss);
  assert.equal(step.nextLoss, trainingStep(step.next, 1, 2, 1, 0.2).loss);
});

test('a zero input has zero weight gradient and a large update can raise loss', () => {
  assert.equal(Math.abs(trainingStep(initialParameters, 0, 2, 1, 0.2).gradients.w1), 0);
  const step = trainingStep(initialParameters, 1, 2, 1, 2);
  assert.ok(step.nextLoss > step.loss);
});
