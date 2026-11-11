export type Activation = 'identity' | 'relu' | 'leaky' | 'sigmoid' | 'tanh';
export const activationNames: Record<Activation, string> = {
  identity: '恒等', relu: 'ReLU', leaky: 'Leaky ReLU', sigmoid: 'Sigmoid', tanh: 'Tanh',
};

export function activation(name: Activation, z: number): { value: number; gradient: number | null } {
  switch (name) {
    case 'identity': return { value: z, gradient: 1 };
    case 'relu': return { value: Math.max(0, z), gradient: z === 0 ? null : Number(z > 0) };
    case 'leaky': return { value: z >= 0 ? z : 0.1 * z, gradient: z === 0 ? null : z > 0 ? 1 : 0.1 };
    case 'sigmoid': {
      const value = 1 / (1 + Math.exp(-z));
      return { value, gradient: value * (1 - value) };
    }
    case 'tanh': {
      const value = Math.tanh(z);
      return { value, gradient: 1 - value * value };
    }
  }
}

export function affine(x1: number, x2: number, w1: number, w2: number, b: number) {
  const term1 = x1 * w1;
  const term2 = x2 * w2;
  return { term1, term2, z: term1 + term2 + b };
}

export interface Parameters { w1: number; w2: number; b: number; v: number; c: number }
export const parameterKeys = ['w1', 'w2', 'b', 'v', 'c'] as const;
export const initialParameters: Parameters = { w1: 0.4, w2: -0.2, b: 0.1, v: 0.8, c: 0.1 };

export function trainingStep(p: Parameters, x1: number, x2: number, y: number, rate: number) {
  const { z } = affine(x1, x2, p.w1, p.w2, p.b);
  const h = activation('sigmoid', z).value;
  const prediction = p.v * h + p.c;
  const error = prediction - y;
  const loss = error ** 2 / 2;
  const upstream = error * p.v;
  const sigmoidGradient = h * (1 - h);
  const delta = upstream * sigmoidGradient;
  const gradients = { w1: delta * x1, w2: delta * x2, b: delta, v: error * h, c: error };
  const next = {
    w1: p.w1 - rate * gradients.w1,
    w2: p.w2 - rate * gradients.w2,
    b: p.b - rate * gradients.b,
    v: p.v - rate * gradients.v,
    c: p.c - rate * gradients.c,
  };
  const nextZ = affine(x1, x2, next.w1, next.w2, next.b).z;
  const nextPrediction = next.v * activation('sigmoid', nextZ).value + next.c;
  const nextLoss = (nextPrediction - y) ** 2 / 2;
  return { z, h, prediction, error, loss, upstream, sigmoidGradient, delta, gradients, next, nextLoss };
}
