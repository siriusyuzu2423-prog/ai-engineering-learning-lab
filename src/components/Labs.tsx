import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, FlaskConical, RotateCcw } from 'lucide-react';
import { activation, activationNames, affine, initialParameters, parameterKeys, trainingStep } from '../math';
import type { Activation, Parameters } from '../math';
import type { Demonstration, LabId } from '../courses/types';
import { Markdown } from './Markdown';

const format = (value: number, precision = 3) => (Math.abs(value) < 0.5 * 10 ** -precision ? 0 : value).toFixed(precision);

function Slider({ name, value, min, max, step, onChange }: {
  name: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void;
}) {
  return <label className="slider">
    <span>{name}<output>{format(value, step < 0.1 ? 2 : 1)}</output></span>
    <input type="range" aria-label={name} min={min} max={max} step={step} value={value}
      onChange={event => onChange(Number(event.currentTarget.value))} />
  </label>;
}

function Choices({ children, label }: { children: ReactNode; label: string }) {
  return <div className="choices" role="group" aria-label={label}>{children}</div>;
}

function Mango() {
  const [color, setColor] = useState(0.78);
  const [shape, setShape] = useState(0.62);
  const { z } = affine(color, shape, 0.9, 0.7, -0.9);
  return <>
    <p className="lab-hint">拖动两个特征，观察固定模型如何改变预测。示意权重为 0.9、0.7，偏置为 −0.9。</p>
    <div className="lab-grid">
      <div className="lab-controls">
        <Slider name="黄色程度 x₁" value={color} min={0} max={1} step={0.01} onChange={setColor} />
        <Slider name="细长程度 x₂" value={shape} min={0} max={1} step={0.01} onChange={setShape} />
      </div>
      <div className="lab-result" aria-live="polite">
        <span>分类分数</span>
        <output className="big-value" data-testid="mango-score">{format(z)}</output>
        <strong>{z >= 0 ? '预测为芒果' : '预测为其他水果'}</strong>
      </div>
    </div>
  </>;
}

function Neuron() {
  const defaults = { x1: 1, x2: 2, w1: 0.8, w2: -0.4, b: 0.5 };
  const [p, setP] = useState(defaults);
  const [fn, setFn] = useState<Activation>('relu');
  const { term1, term2, z } = affine(p.x1, p.x2, p.w1, p.w2, p.b);
  const a = activation(fn, z).value;
  const sliders = [['x1', '输入 x₁'], ['x2', '输入 x₂'], ['w1', '权重 w₁'], ['w2', '权重 w₂'], ['b', '偏置 b']] as const;
  return <>
    <div className="lab-toolbar">
      <label className="field-inline">激活函数
        <select aria-label="激活函数" value={fn} onChange={event => setFn(event.target.value as Activation)}>
          {Object.entries(activationNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
        </select>
      </label>
      <button className="button quiet" onClick={() => { setP(defaults); setFn('relu'); }}><RotateCcw size={15} />重置</button>
    </div>
    <div className="lab-grid">
      <div className="lab-controls">
        {sliders.map(([key, name]) => <Slider key={key} name={name} value={p[key]} min={-3} max={3} step={0.1}
          onChange={value => setP(old => ({ ...old, [key]: value }))} />)}
      </div>
      <div className="lab-result" aria-live="polite">
        <span>加权项 + 偏置</span>
        <strong className="numeric">{format(term1)} + ({format(term2)}) + ({format(p.b)})</strong>
        <span>预激活 z = {format(z)}</span>
        <span>激活后输出 a</span>
        <output className="big-value" data-testid="neuron-output">{format(a)}</output>
      </div>
    </div>
  </>;
}

const plotted = ['relu', 'leaky', 'sigmoid', 'tanh'] as const;
const curveColors: Record<typeof plotted[number], string> = { relu: '#633cc1', leaky: '#a25313', sigmoid: '#157456', tanh: '#245ca7' };

function CurveChart({ selected, x, derivative }: { selected: typeof plotted[number]; x: number; derivative: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const width = 600, height = 250, left = 43, right = 20, top = 14, bottom = 29;
    const yMin = derivative ? -0.15 : -1.3;
    const yMax = derivative ? 1.15 : 4.2;
    const px = (n: number) => left + (n + 4) / 8 * (width - left - right);
    const py = (n: number) => top + (yMax - n) / (yMax - yMin) * (height - top - bottom);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#594f63';
    function line(x1: number, y1: number, x2: number, y2: number, color: string) {
      ctx!.beginPath();
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 1;
      ctx!.moveTo(x1, y1);
      ctx!.lineTo(x2, y2);
      ctx!.stroke();
    }
    for (let tick = -4; tick <= 4; tick += 2) {
      line(px(tick), top, px(tick), height - bottom, tick === 0 ? '#a49aad' : '#e3ddec');
      ctx.fillText(String(tick), px(tick) - 5, height - 9);
    }
    for (const tick of derivative ? [0, 0.25, 0.5, 0.75, 1] : [-1, 0, 1, 2, 3, 4]) {
      line(left, py(tick), width - right, py(tick), tick === 0 ? '#a49aad' : '#e3ddec');
      ctx.fillText(String(tick), 8, py(tick) + 4);
    }
    for (const fn of [...plotted.filter(name => name !== selected), selected]) {
      ctx.beginPath();
      ctx.strokeStyle = curveColors[fn];
      ctx.lineWidth = fn === selected ? 3 : 1.4;
      ctx.globalAlpha = fn === selected ? 1 : 0.44;
      let start = true;
      for (let i = 0; i <= 240; i++) {
        const input = -4 + i / 30;
        const sample = activation(fn, input);
        const y = derivative ? sample.gradient : sample.value;
        if (y === null) { start = true; continue; }
        if (start) ctx.moveTo(px(input), py(y));
        else ctx.lineTo(px(input), py(y));
        start = false;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    line(px(x), top, px(x), height - bottom, '#857595');
    const point = activation(selected, x);
    const y = derivative ? point.gradient : point.value;
    if (y !== null) {
      ctx.fillStyle = curveColors[selected];
      ctx.beginPath();
      ctx.arc(px(x), py(y), 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [selected, x, derivative]);
  return <canvas ref={canvas} width={1200} height={500} className="chart" role="img"
    aria-label={`横轴是输入 z，纵轴是${derivative ? '局部导数' : '输出'}。同时绘制 ReLU、Leaky ReLU、Sigmoid 与 Tanh。`} />;
}

function ActivationLab() {
  const [x, setX] = useState(1);
  const [selected, setSelected] = useState<typeof plotted[number]>('relu');
  const [derivative, setDerivative] = useState(false);
  return <>
    <div className="lab-toolbar">
      <label className="field-inline">突出显示
        <select aria-label="突出显示" value={selected} onChange={event => setSelected(event.target.value as typeof selected)}>
          {plotted.map(fn => <option value={fn} key={fn}>{activationNames[fn]}</option>)}
        </select>
      </label>
      <Choices label="曲线模式">
        <button aria-pressed={!derivative} onClick={() => setDerivative(false)}>输出曲线</button>
        <button aria-pressed={derivative} onClick={() => setDerivative(true)}>梯度曲线</button>
      </Choices>
    </div>
    <CurveChart selected={selected} x={x} derivative={derivative} />
    <Slider name="输入 z" value={x} min={-4} max={4} step={0.1} onChange={setX} />
    <div className="table-scroll"><table className="lab-table">
      <thead><tr><th scope="col">函数</th><th scope="col">输出</th><th scope="col">局部导数</th></tr></thead>
      <tbody>{plotted.map(fn => {
        const { value, gradient } = activation(fn, x);
        return <tr key={fn} className={fn === selected ? 'highlight-row' : ''}>
          <th scope="row"><i className="curve-dot" style={{ background: curveColors[fn] }} />{activationNames[fn]}</th>
          <td>{format(value)}</td><td>{gradient === null ? '不可导' : format(gradient)}</td>
        </tr>;
      })}</tbody>
    </table></div>
  </>;
}

const stages = ['前向传播', '计算损失', '反向求导', '参数更新'] as const;
const parameterLabels = { w1: 'w₁', w2: 'w₂', b: 'b', v: 'v', c: 'c' };

function Training() {
  const [parameters, setParameters] = useState(initialParameters);
  const [sample, setSample] = useState({ x1: 1, x2: 2, y: 1, rate: 0.2 });
  const [stage, setStage] = useState(0);
  const [iteration, setIteration] = useState(0);
  const step = trainingStep(parameters, sample.x1, sample.x2, sample.y, sample.rate);
  function reset() {
    setParameters(initialParameters);
    setSample({ x1: 1, x2: 2, y: 1, rate: 0.2 });
    setStage(0);
    setIteration(0);
  }
  function apply() {
    if (!Object.values(step.next).every(Number.isFinite) || !Number.isFinite(step.nextLoss)) return;
    setParameters(step.next);
    setStage(0);
    setIteration(iteration + 1);
  }
  function setParameter(key: keyof Parameters, value: string) {
    const parsed = Number(value);
    if (value.trim() && Number.isFinite(parsed) && Math.abs(parsed) <= 100) {
      setParameters(old => ({ ...old, [key]: parsed }));
      setIteration(0);
    }
  }
  const canApply = Object.values(step.next).every(Number.isFinite) && Number.isFinite(step.nextLoss);
  return <>
    <div className="lab-toolbar">
      <span className="iteration">已更新 {iteration} 步</span>
      <button className="button quiet" onClick={reset}><RotateCcw size={15} />重置</button>
    </div>
    <p className="lab-hint">两个输入 → Sigmoid 隐藏单元 → 线性输出。一次只使用一条样本。</p>
    <details className="experiment-settings">
      <summary>调整样本、学习率与参数</summary>
      <div className="settings-grid">
        <Slider name="输入 x₁" value={sample.x1} min={-3} max={3} step={0.1} onChange={x1 => setSample(old => ({ ...old, x1 }))} />
        <Slider name="输入 x₂" value={sample.x2} min={-3} max={3} step={0.1} onChange={x2 => setSample(old => ({ ...old, x2 }))} />
        <Slider name="目标 y" value={sample.y} min={-2} max={2} step={0.1} onChange={y => setSample(old => ({ ...old, y }))} />
        <Slider name="学习率 η" value={sample.rate} min={0.01} max={2} step={0.01} onChange={rate => setSample(old => ({ ...old, rate }))} />
      </div>
      <div className="parameter-fields">
        {parameterKeys.map(key => <label key={key}>{parameterLabels[key]}
          <input key={parameters[key]} type="number" step="any" min="-100" max="100" aria-label={`参数 ${parameterLabels[key]}`}
            defaultValue={parameters[key]} onBlur={event => {
              setParameter(key, event.currentTarget.value);
              event.currentTarget.value = String(Math.abs(Number(event.currentTarget.value)) <= 100 && event.currentTarget.value
                ? Number(event.currentTarget.value) : parameters[key]);
            }}
            onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
        </label>)}
      </div>
      <p className="lab-hint">参数输入范围 ±100，回车或离开输入框后应用。</p>
    </details>
    <Choices label="训练步骤">
      {stages.map((name, i) => <button key={name} aria-pressed={stage === i} onClick={() => setStage(i)}>{i + 1}. {name}</button>)}
    </Choices>
    <div className="stage" aria-live="polite">
      {stage === 0 && <>
        <Markdown text={String.raw`$z=w_1x_1+w_2x_2+b$，$h=\sigma(z)$，$\hat y=vh+c$。`} />
        <div className="stage-values"><span>预激活 z <b>{format(step.z, 5)}</b></span>
          <span>隐藏激活 h <b>{format(step.h, 5)}</b></span>
          <span>预测 ŷ <b data-testid="prediction">{format(step.prediction, 5)}</b></span></div>
      </>}
      {stage === 1 && <>
        <Markdown text={String.raw`$e=\hat y-y$，$L=\frac12(\hat y-y)^2$。`} />
        <div className="stage-values"><span>误差 e <b>{format(step.error, 5)}</b></span>
          <span>损失 L <b data-testid="loss">{format(step.loss, 5)}</b></span></div>
      </>}
      {stage === 2 && <>
        <Markdown text={String.raw`$\delta_z=(e\,v)\,h(1-h)$，$\nabla_w L=\delta_z x$，$\partial_b L=\delta_z$。输出层有 $\partial_v L=eh$、$\partial_c L=e$。`} />
        <div className="stage-values"><span>上游梯度 ev <b>{format(step.upstream, 5)}</b></span>
          <span>局部导数 h(1−h) <b>{format(step.sigmoidGradient, 5)}</b></span>
          <span>隐藏层 δz <b>{format(step.delta, 5)}</b></span></div>
      </>}
      {stage === 3 && <Markdown text={String.raw`每个参数同时执行 $\theta_{\rm new}=\theta-\eta\nabla_\theta L$。当前学习率为 ${sample.rate}。`} />}
      {stage >= 2 && <div className="table-scroll"><table className="lab-table">
        <thead><tr><th scope="col">参数</th><th scope="col">当前值</th><th scope="col">梯度</th>{stage === 3 && <th scope="col">更新值</th>}</tr></thead>
        <tbody>{parameterKeys.map(key => <tr key={key}><th scope="row">{parameterLabels[key]}</th>
          <td>{format(parameters[key], 5)}</td><td data-testid={`gradient-${key}`}>{format(step.gradients[key], 5)}</td>
          {stage === 3 && <td>{format(step.next[key], 5)}</td>}</tr>)}</tbody>
      </table></div>}
      {stage === 3 && <p>损失预览 <strong>{format(step.loss, 5)} → <span data-testid="updated-loss">{format(step.nextLoss, 5)}</span></strong>
        {!canApply && '。数值超出可计算范围，请重置或减小参数。'}</p>}
    </div>
    <div className="lab-actions">
      {stage === 3
        ? <button className="button primary" onClick={apply} disabled={!canApply}>应用更新 <ArrowRight size={16} /></button>
        : <button className="button secondary" onClick={() => setStage(stage + 1)}>下一步 <ArrowRight size={16} /></button>}
    </div>
  </>;
}

function Xor() {
  const [values, setValues] = useState([0, 1]);
  const [nonlinear, setNonlinear] = useState(true);
  const sum = values[0] + values[1];
  const h1 = nonlinear ? Math.max(0, sum) : sum;
  const h2 = nonlinear ? Math.max(0, sum - 1) : sum - 1;
  return <>
    <Choices label="异或输入">{[[0, 0], [0, 1], [1, 0], [1, 1]].map(pair =>
      <button key={pair.join()} aria-pressed={pair.join() === values.join()} onClick={() => setValues(pair)}>({pair.join(', ')})</button>)}</Choices>
    <label className="check-field"><input type="checkbox" checked={nonlinear} onChange={event => setNonlinear(event.target.checked)} /> 隐藏层使用 ReLU</label>
    <div className="observation" aria-live="polite">h₁ = {h1}，h₂ = {h2}，网络输出 <b>{h1 - 2 * h2}</b>，异或目标 {values[0] ^ values[1]}。</div>
  </>;
}

function Scaling() {
  const [x, setX] = useState(20);
  const mean = 20;
  const sigma = Math.sqrt(200 / 3);
  return <>
    <p className="lab-hint">用固定训练数据 [10, 20, 30] 估计均值 20 和总体标准差 {format(sigma)}。</p>
    <Slider name="新输入 x" value={x} min={0} max={40} step={1} onChange={setX} />
    <div className="stage-values" aria-live="polite"><span>Min–Max <b>{format((x - 10) / 20)}</b></span>
      <span>标准化 <b>{format((x - mean) / sigma)}</b></span></div>
  </>;
}

function Batch() {
  const [size, setSize] = useState(3);
  const [offset, setOffset] = useState(0);
  const gradients = [4, -2, 1, 3, -4, 4];
  const batch = gradients.slice(offset, offset + size);
  const mean = batch.reduce((sum, value) => sum + value, 0) / batch.length;
  return <>
    <p className="lab-hint">同一个参数点上，6 个样本的梯度分别为 [4, −2, 1, 3, −4, 4]。</p>
    <Choices label="批大小">{[[1, '单样本'], [3, '小批量'], [6, '全批量']].map(([n, label]) =>
      <button key={n} aria-pressed={size === n} onClick={() => { setSize(Number(n)); setOffset(0); }}>{label}</button>)}</Choices>
    <div className="observation" aria-live="polite">本批梯度 [{batch.join(', ')}]，均值为 <b>{format(mean)}</b>。</div>
    <button className="button secondary" onClick={() => setOffset((offset + size) % gradients.length)} disabled={size === 6}>切到下一批 <ArrowRight size={15} /></button>
  </>;
}

const labs: Record<LabId, { title: string; view: () => ReactNode }> = {
  mango: { title: '拖动特征，预测一颗水果', view: Mango },
  neuron: { title: '神经元计算器', view: Neuron },
  activation: { title: '激活函数与梯度对照', view: ActivationLab },
  training: { title: '逐步执行一次训练', view: Training },
  xor: { title: '检查异或的四组输入', view: Xor },
  scaling: { title: '用同一组统计量缩放新输入', view: Scaling },
  batch: { title: '比较不同批次的梯度', view: Batch },
};

export function Lab({ demo }: { demo: Demonstration }) {
  const [index, setIndex] = useState(0);
  if ('lab' in demo) {
    const { title, view: View } = labs[demo.lab];
    return <section className="lab" aria-label={title}>
      <div className="lab-title"><FlaskConical size={19} /><h2>{title}</h2></div>
      <View />
    </section>;
  }
  return <section className="lab" aria-label="情境演示">
    <div className="lab-title"><FlaskConical size={19} /><h2>切换情境观察</h2></div>
    <Choices label="选择情境">{demo.cases.map(([label], i) =>
      <button key={label} aria-pressed={i === index} onClick={() => setIndex(i)}>{label}</button>)}</Choices>
    <p className="observation" aria-live="polite">{demo.cases[index][1]}</p>
  </section>;
}
