import type { Course, Demonstration } from './types';

const cases = (...items: (readonly [string, string])[]): Demonstration => ({ cases: items });

export const neuralNetworks: Course = {
  id: '01-neural-networks',
  number: '01',
  title: '人工神经网络基础',
  description: '从一颗芒果出发，学会构建神经网络、计算梯度，再把模型放进完整的工程流程。',
  source: 'https://visionary-laboratory.github.io/ai-engineering-course/model-foundations/lectures/01-neural-networks/',
  sourceCredit: '上海创智学院 · AI 工程学',
  roadmapAnchor: 'topic-1',
  closingAnchor: 'topic-165',
  modules: [
    {
      id: 'overview',
      title: '引言与概览',
      sourceAnchor: 'topic-1',
      topics: [
        {
          id: 'topic-3', title: '从芒果识别理解机器学习', shortTitle: '芒果识别与机器学习', pages: [3, 5], priority: '必学',
          summary: '给模型看带标签的例子，让它学习如何把水果的特征变成分类预测。',
          example: '你用颜色和细长程度挑芒果。黄色、细长的水果也可能是别的品种。收集芒果与其他水果的样本后，可以用两项特征训练模型，再用学到的规则判断一颗没见过的水果。',
          theory: String.raw`把两项特征写成 $x_1,x_2$，把芒果记为 $y=1$，其他水果记为 $y=0$。最简单的分类规则先算分数，再用阈值给出预测。

$$
s=w_1x_1+w_2x_2+b,\qquad \hat y=\mathbf 1[s\ge 0].
$$

训练从带标签的样本选择参数 $w_1,w_2,b$。推断时固定参数，只替换输入。下面用一组示意参数展示推断。`,
          demonstration: { lab: 'mango' },
          recall: { question: '给已经训练好的模型一颗新水果时，哪些量改变？哪些量沿用？', answer: '颜色和细长程度等输入特征改变。训练得到的权重和偏置沿用，模型据此计算新的预测。' },
        },
        {
          id: 'topic-6', title: '人工智能的起点与不同研究路线', shortTitle: 'AI 的起点与研究路线', pages: [6, 15], priority: '选学',
          summary: '研究智能可以从规则、从数据学到的表示，或从与环境的互动出发。',
          example: '问两次「你会下国际象棋吗」。脚本可能返回相同的模板，能利用对话上下文的系统可以接着解释。文字表现能用来比较行为，但一次对话不足以确定系统的通用能力。',
          theory: String.raw`这里用形式化描述对照三条研究路线。符号系统可以使用条件规则 $A\land B\Rightarrow C$。连接主义用带参数的函数 $f_\theta(x)$ 表示输入到输出的关系。强调与环境交互的系统可用策略 $\pi(a\mid s)$ 表示给定状态时如何选动作。

图灵提出以可观察的交流表现来探讨机器智能。面向具体任务的系统常称为狭义 AI，通用人工智能讨论跨任务能力。「强人工智能」在哲学语境还涉及理解与心智，含义随语境而变。`,
          demonstration: cases(['符号规则', '按「王受到攻击且无合法应对 ⇒ 将死」检查局面。可追踪结论使用了哪些条件。'], ['连接主义', '用许多带评价的棋局训练网络，同一参数集可给新局面评分。'], ['环境交互', '对弈时选一步棋，观察对手响应与最终胜负，再用回报改进策略。']),
          recall: { question: '一个程序可以与人自然对话。这个观察可以支持什么判断？', answer: '它支持对该对话条件下的行为表现作判断。要评价跨任务能力，需要更多任务与独立证据。' },
        },
        {
          id: 'topic-16', title: '从人工智能到深度学习', shortTitle: 'AI、机器学习与深度学习', pages: [16, 26], priority: '选学',
          summary: '深度学习属于机器学习，它用多层表示逐步改变数据的表达方式。',
          example: '识别字符时，规则系统可以检查笔画形状。手工设计特征的学习系统可以从样本学习判别权重。深度网络还可把用于判别的中间表示从数据中学出来。',
          theory: String.raw`课程用领域包含关系 $\mathrm{DL}\subseteq\mathrm{ML}\subseteq\mathrm{AI}$ 组织概念。深度网络把多次变换组合为 $f=f_L\circ\cdots\circ f_1$，各层可产生不同粒度的表示。实际进展同时取决于数据、计算资源和训练方法。`,
          demonstration: cases(['规则系统', '人写笔画模板，程序按模板判别。属于 AI 的一种做法。'], ['机器学习', '输入人工提取的笔画特征，训练模型学到判别权重。'], ['深度学习', '输入像素，用可训练的层提取局部线条并组合成字符表示。']),
          recall: { question: '一个只靠人写规则的棋类程序，属于这三层中的哪一层？', answer: '可以属于 AI。只有由数据或经验学习的部分才归入机器学习。' },
        },
        {
          id: 'topic-27', title: '发展方向：大数据、模型与特征学习', shortTitle: '模型与特征学习', pages: [27, 30], priority: '拓展',
          summary: '特征提取器和预测器可以围绕同一个任务目标一起优化。',
          example: '识别鸟种时，可以先手工测量翅膀长度，也可以训练表示网络，让它根据识别误差逐步学会利用羽毛纹理与外形。',
          theory: String.raw`令 $g_\phi$ 提取表示，$h_\theta$ 预测。端到端监督训练可最小化 $\frac1n\sum_i \ell(h_\theta(g_\phi(x_i)),y_i)$。当两部分都可训练时，损失可通过链式法则同时更新 $\phi,\theta$。课程也用生成、多模态和推理模型的演进讨论数据、模型与领域知识的结合。`,
          demonstration: cases(['手工特征', '设计者固定翅长和颜色的计算方式，只拟合分类器参数。'], ['冻结表示', '复用已有网络的表示，只训练任务所需的预测层。'], ['联合优化', '放开两部分参数，任务损失会同时影响中间表示与最终预测。']),
          recall: { question: '冻结特征提取器时，训练会改变特征提取器的参数吗？', answer: '不会。前向仍会使用它的输出，优化器只更新允许训练的参数。' },
        },
      ],
    },
    {
      id: 'mlp',
      title: '多层感知机',
      sourceAnchor: 'topic-31',
      topics: [
        {
          id: 'topic-32', title: '神经元与线性分类器', shortTitle: '神经元与线性分类器', pages: [32, 40], priority: '必学',
          summary: '神经元先给输入加权求和并加偏置，再把结果交给激活函数。',
          example: '设两个输入分别为 1、2，权重为 0.8、−0.4，偏置为 0.5。两个加权项相互抵消，加上偏置后得到 0.5。ReLU 保留这个正值。',
          theory: String.raw`$$
z=w_1x_1+w_2x_2+b,\qquad a=\phi(z).
$$

多个单元同时计算时，$z=Wx+b$。对 $d$ 维输入与 $m$ 个输出，$W\in\mathbb R^{m\times d}$，每行是一套权重。二分类以 $z=0$ 为阈值时，改变 $b$ 会移动超平面，改变非零 $w$ 可以改变法向。`,
          demonstration: { lab: 'neuron' },
          recall: { question: '如果某个输入等于 0，仅改变它的权重会使这次输出怎样变化？', answer: '本次输出不变，因为这一项的乘积仍为 0。其他样本上的输出可能变化。' },
        },
        {
          id: 'topic-41', title: '为什么需要隐藏层', shortTitle: '为什么需要隐藏层', pages: [41, 47], priority: '必学',
          summary: '带非线性的隐藏层先重组输入，让原空间中无法线性分开的类别变得可分。',
          example: '异或的两个正例在正方形的对角线上。用直线分两类时，两类点的凸包线段在中心相交。',
          theory: String.raw`令 $s=x_1+x_2$，对二值输入可用 $h_1=\mathrm{ReLU}(s)$ 和 $h_2=\mathrm{ReLU}(s-1)$，再令输出为 $h_1-2h_2$，则 $s=0,1,2$ 时依次输出 $0,1,0$。

两层仿射变换直接复合只得到 $W_2W_1x+W_2b_1+b_2$。插入激活后的函数是 $W_2\phi(W_1x+b_1)+b_2$，ReLU 的折点让上面的异或构造成为可能。`,
          demonstration: { lab: 'xor' },
          recall: { question: '把示例的 ReLU 全部换成恒等函数，网络的表达能力会怎样？', answer: '两层可合并为一个仿射映射，无法用线性边界分开异或的两类。' },
        },
        {
          id: 'topic-48', title: '激活函数：让层的组合具有非线性', shortTitle: '激活函数与非线性', pages: [48, 59], priority: '必学',
          summary: '激活函数改变输出形状，它的局部导数也会影响反向传播。',
          example: '当输入是 −2 时，ReLU 输出 0；Leaky ReLU 在负侧仍保留信号。Sigmoid 在两端趋于平坦，对输入变化变得不敏感。',
          theory: String.raw`$$
\mathrm{ReLU}(z)=\max(0,z),\qquad
\sigma(z)=\frac1{1+e^{-z}},\qquad \sigma'(z)=\sigma(z)(1-\sigma(z)).
$$

ReLU 在正侧导数为 $1$，负侧为 $0$，折点处不可导。Leaky ReLU 在负侧用小正斜率。二分类可用 Sigmoid 表示正类概率。互斥多分类常对一组 logits 用 $p_i=e^{z_i}/\sum_j e^{z_j}$，其偏导为 $p_i(\mathbf 1[i=j]-p_j)$，各输出相互关联。`,
          demonstration: { lab: 'activation' },
          recall: { question: 'Sigmoid 的输入很大时，输出与局部梯度各接近什么值？', answer: '输出接近 1，局部梯度接近 0。若这一步出现在深层链路上，乘积中的小因子会压低反传梯度。' },
        },
        {
          id: 'topic-60', title: '把网络作为一个完整函数', shortTitle: '前向传播与张量形状', pages: [60, 65], priority: '必学',
          summary: '前向传播按顺序执行各层，并让上一层输出的形状匹配下一层输入。',
          example: '两项水果特征进入三个隐藏单元，再输出两项类别分数。第一层含 6 个权重和 3 个偏置，第二层含 6 个权重和 2 个偏置。',
          theory: String.raw`$$
h=\phi(W_1x+b_1)\in\mathbb R^3,\qquad z=W_2h+b_2\in\mathbb R^2.
$$

列向量约定下 $W_1$ 是 $3\times 2$，$W_2$ 是 $2\times 3$，共 $17$ 个可训练参数。若输出为互斥类别，可在两个 logits 上使用 Softmax。对单样本给出的形状也可扩展为批量计算。`,
          demonstration: cases(['输入', '输入向量有 2 项。第一层矩阵有 3 行，每行使用这 2 项。'], ['隐藏层', '第一层计算出 3 个值。逐元素激活后，形状仍然是 3。'], ['输出层', '第二层矩阵有 2 行，每行使用 3 个隐藏值，最终产生 2 项分数。']),
          recall: { question: '如果隐藏层改为 4 个单元，两层权重矩阵的形状是什么？', answer: String.raw`第一层 $4\times2$，第二层 $2\times4$。两个偏置的长度分别为 4 和 2。` },
        },
      ],
    },
    {
      id: 'training',
      title: '神经网络训练',
      sourceAnchor: 'topic-66',
      topics: [
        {
          id: 'topic-67', title: '从损失函数到梯度下降', shortTitle: '损失函数与梯度下降', pages: [67, 71], priority: '必学',
          summary: '损失衡量预测误差，负梯度提供局部下降方向，学习率决定沿该方向走多远。',
          example: '标量参数 $w=0$，目标为 2，令 $L=(w-2)^2/2$。梯度为 −2。若学习率是 0.25，一步更新到 0.5，损失由 2 降为 1.125。',
          theory: String.raw`对可微损失，沿 $-\nabla L$ 走一小步有 $L(\theta-\eta\nabla L)\approx L(\theta)-\eta\|\nabla L\|^2$。因此梯度下降采用

$$
\theta_{t+1}=\theta_t-\eta\nabla_\theta L(\theta_t).
$$

梯度为零时这一步不移动。学习率太大时，一阶近似不足以保证损失下降。训练损失也只是训练目标的度量。`,
          demonstration: { lab: 'training' },
          recall: { question: '某参数梯度为 −0.4，学习率为 0.1。它会增减多少？', answer: String.raw`增加 0.04，因为更新量是 $-0.1\times(-0.4)=0.04$。` },
        },
        {
          id: 'topic-72', title: '反向传播：沿计算图传递梯度', shortTitle: '反向传播与链式法则', pages: [72, 85], priority: '必学',
          summary: '前向传播求节点值；反向传播把上游梯度乘上局部导数，并累加分支贡献。',
          example: String.raw`令 $u=3x$，$L=u^2/2$。当 $x=2$，先算出 $u=6$；从损失传回的导数是 $6\times3=18$。`,
          theory: String.raw`设节点 $v$ 直接影响下游节点 $u_j$。其损失梯度为

$$
\frac{\partial L}{\partial v}=\sum_j
\frac{\partial L}{\partial u_j}\frac{\partial u_j}{\partial v}.
$$

按计算图的逆拓扑顺序执行，从 $\partial L/\partial L=1$ 开始。单路径上相乘，多条路径在汇合点相加。矩阵计算可写成向量与雅可比矩阵的乘积。`,
          demonstration: { lab: 'training' },
          recall: { question: '若同一个权重同时影响两个分支，两个分支各返回一个梯度。怎么得到权重总梯度？', answer: '在同一参数上相加。每一项先沿自己的分支用链式法则得到。' },
        },
        {
          id: 'topic-86', title: '跟随算例完成一次参数更新', shortTitle: '一次参数更新的算例', pages: [86, 97], priority: '必学',
          summary: '一次训练步按前向求值、算损失、反传求导、同时更新参数的顺序执行。',
          example: '原课用输入 $(1,2)$ 和标签 1 演算多层 Sigmoid。这里沿用这组输入与标签，把网络缩成一个 Sigmoid 隐藏单元和一个线性输出，便于检查所有参数。',
          theory: String.raw`令 $z=w^\top x+b$、$h=\sigma(z)$、$\hat y=vh+c$、$L=(\hat y-y)^2/2$，并记 $e=\hat y-y$。输出层梯度为 $\partial_v L=eh$、$\partial_c L=e$。由链式法则，

$$
\delta_z=e\,v\,h(1-h),\quad
\nabla_w L=\delta_z x,\quad \partial_b L=\delta_z.
$$

使用同一次前向的参数计算全部梯度，再一起更新。更新后重新前向，比较新旧损失。`,
          demonstration: { lab: 'training' },
          recall: { question: '若 $x_1=0$，为什么第一项权重 $w_1$ 的梯度为 0？', answer: '这条样本的预激活值对 $w_1$ 的局部导数就是 $x_1=0$，沿链路相乘仍得到 0。' },
        },
        {
          id: 'topic-98', title: '泛化、过拟合与正则化', shortTitle: '泛化与正则化', pages: [98, 105], priority: '必学',
          summary: '用未参与训练的数据观察泛化，用正则化或验证集早停限制过拟合。',
          example: '用高阶曲线穿过每个含噪测量点，训练误差可能极小。换一组数据后，噪声位置变了，曲线的波动可能造成更大的误差。',
          theory: String.raw`可将目标改为 $L_{\rm train}+\lambda\lVert w\rVert_1$ 或 $L_{\rm train}+\lambda\lVert w\rVert_2^2/2$。L1 倾向产生稀疏解；后一项的梯度为 $\lambda w$，抑制大权重。训练时 Dropout 随机屏蔽激活，数据增强用保留任务标签的变换增加样本多样性。早停用验证集选择训练轮次。`,
          demonstration: cases(['欠拟合', '教学示例：训练误差 32%，验证误差 34%。可先检查表达能力与优化是否充分。'], ['过拟合', '教学示例：训练误差 1%，验证误差 26%。应检查模型容量、数据和划分，再尝试正则化。'], ['更好泛化', '教学示例：训练误差 7%，验证误差 9%。仍需保留独立测试集作最终评价。']),
          recall: { question: '训练损失一直下降，验证损失先降后升。应优先保留哪个检查点？', answer: '可选择验证损失最低附近的检查点，最后用未参与选择的测试集评价。' },
        },
        {
          id: 'topic-106', title: '全批量、随机与小批量梯度下降', shortTitle: '全批量、随机与小批量', pages: [106, 107], priority: '选学',
          summary: '每次更新可用全部样本、单个样本或小批量样本，计算开销和梯度波动随之变化。',
          example: '一千条样本全批量处理时，每遍数据更新一次。每次用 20 条且不丢弃样本时，每遍更新 50 次。单样本更新最频繁，每步估计也通常更易波动。',
          theory: String.raw`对批次 $B$，计算 $g_B=|B|^{-1}\sum_{i\in B}\nabla_\theta\ell_i$。均匀抽样时，这个均值是全数据梯度的无偏估计。一次更新可取 $B$ 为全集、单样本或若干样本。比较收敛时还要核对看过的样本数、耗时与硬件吞吐。`,
          demonstration: { lab: 'batch' },
          recall: { question: '103 条样本，每批 20 条，保留最后一个小批次。一遍数据更新几次？', answer: '6 次。前五批各 20 条，最后一批 3 条。' },
        },
        {
          id: 'topic-108', title: '优化器：动量与自适应步长', shortTitle: '动量、Adam 与 AdamW', pages: [108, 117], priority: '拓展',
          summary: '动量积累梯度方向，自适应优化器按各参数的梯度历史调节更新尺度。',
          example: '狭长谷地的陡方向上，梯度容易左右交替；谷底长方向的梯度较小，但方向持续一致。动量可以让一致方向的历史贡献累积。',
          theory: String.raw`动量的一种写法为 $m_t=\beta m_{t-1}+(1-\beta)g_t$，按 $-\eta m_t$ 更新。Nesterov 使用前瞻信息。Adagrad 累加平方梯度，RMSprop 改用平方梯度的指数平均，Adadelta 还利用历史更新尺度。

Adam 同时跟踪 $m_t$ 和 $v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2$，以偏差修正后的 $\hat m_t/(\sqrt{\hat v_t}+\epsilon)$ 决定方向与尺度。AdamW 把权重衰减直接施加到权重，避免衰减量随自适应预条件缩放。`,
          demonstration: cases(['动量', '令 β=0.9，从 m=0 开始。连续两次梯度都为 1，动量依次为 0.10、0.19。'], ['梯度折返', '在同一约定下，梯度依次为 1、−1，动量依次为 0.10、−0.01。'], ['AdamW', '每一步除自适应梯度更新外，还用 −ηλw 直接缩减旧权重。']),
          recall: { question: 'Adam 分别记录哪两种历史量？', answer: '梯度的一阶矩估计，以及逐参数平方梯度的二阶原点矩估计。它们都用指数移动平均。' },
        },
        {
          id: 'topic-118', title: '初始化：控制信号与梯度的尺度', shortTitle: 'Xavier 与 He 初始化', pages: [118, 126], priority: '拓展',
          summary: '随机化打破同层单元的对称性，合适的初始方差减轻信号层层放大或衰减。',
          example: '每层若把幅值乘 2，十层后会放大约 1024 倍；若每层乘 0.5，十层后约为原来的千分之一。深网希望在初始时更平稳地传递信号。',
          theory: String.raw`在零均值、独立性等近似假设下，线性层有 $\mathrm{Var}(z)\approx n_{\rm in}\mathrm{Var}(w)\mathrm{Var}(x)$。Xavier/Glorot 在前向和反向维度之间取折中，常用 $\mathrm{Var}(w)=2/(n_{\rm in}+n_{\rm out})$。ReLU 对称预激活下约保留一半二阶矩，He 初始化常取 $2/n_{\rm in}$。`,
          demonstration: cases(['过小', '设每层把信号二阶矩乘 0.5，过 10 层只剩约 0.00098 倍。'], ['匹配尺度', '乘子接近 1 时，理想化估算下十层后的尺度仍接近初始值。'], ['过大', '设每层把信号二阶矩乘 2，十层后是 1024 倍。']),
          recall: { question: '对于 fan-in 为 100 的 ReLU 层，He 正态初始化的权重标准差约是多少？', answer: String.raw`$\sqrt{2/100}\approx0.1414$。0.02 是方差。` },
        },
        {
          id: 'topic-127', title: '归一化：统一输入尺度', shortTitle: '输入缩放与标准化', pages: [127, 128], priority: '选学',
          summary: '按训练集统计量缩放不同量纲的特征，使它们的数值尺度更可比。',
          example: '将克和厘米同时作为模型输入。克数的原始数值通常更大，优化过程可能对这一维更敏感。可以对每列分别缩放。',
          theory: String.raw`$$
x_{\rm minmax}=\frac{x-x_{\min}}{x_{\max}-x_{\min}},\qquad
x_{\rm std}=\frac{x-\mu}{\sigma}.
$$

用训练数据拟合统计量，随后固定到验证、测试和部署。新数据的 Min–Max 结果可以超出 $[0,1]$。训练特征为常量时分母为零，需事先约定恒定列的处理方式。`,
          demonstration: { lab: 'scaling' },
          recall: { question: '测试集的均值与训练集差异很大。测试时用哪一组均值？', answer: '沿用训练集均值和标准差，保证训练与推断的变换一致，也避免使用测试集拟合处理步骤。' },
        },
      ],
    },
    {
      id: 'cases',
      title: '案例分析',
      sourceAnchor: 'topic-129',
      topics: [
        {
          id: 'topic-130', title: '表格案例：样本、特征和标签', shortTitle: '样本、特征与标签', pages: [130, 135], priority: '选学',
          summary: '把每条记录组织成预测时可用的输入特征和建模时提供的目标标签。',
          example: '预测设备下一周是否故障。每行是一台设备的一次记录，过去一周的温度与振动可作特征，下一周是否故障是标签。',
          theory: String.raw`以 $X\in\mathbb R^{n\times d}$ 存放 $n$ 个样本、$d$ 个数值特征，以 $y\in\{0,1\}^n$ 存放标签。上线时只读当时可得的 $x$。工单事后结论泄漏了目标，编号通常先用作分组或索引。原课的患病预测示例用于识别表格字段的角色。`,
          demonstration: cases(['记录行', '设备 A 的一次观测是一条样本。若一台设备有多行，划分数据时需考虑按设备分组。'], ['输入列', '选择预测时已经可测量的温度和振动。'], ['标签列', '后续是否故障用来监督训练与评价。']),
          recall: { question: '事后维修工单写着「确认故障」。预测下周故障时可以把它作为特征吗？', answer: '如果预测时尚未生成该工单，使用它就会泄漏未来信息。' },
        },
        {
          id: 'topic-136', title: '数据清洗与特征变换', shortTitle: '数据清洗与特征变换', pages: [136, 143], priority: '选学',
          summary: '先解释缺失、异常与量纲，再选择填补、保留、缩放或离散化。',
          example: '一项温度显示为 999°C。它可能是传感器缺失哨兵值，也可能源于华氏度误读或真实极端工况，需查数据字典与记录条件。',
          theory: String.raw`中位数填补可写成 $\tilde x_i=x_i$（有观测时），缺失时取训练列的 $\mathrm{median}(X_{\rm train})$。固定区间离散化将 $x$ 映射为满足 $t_j\le x<t_{j+1}$ 的桶编号。标准化统一中心和尺度，原分布的偏态通常仍在。拟合型处理应只使用训练子集。`,
          demonstration: cases(['缺失', '确认 999 是哨兵值后，将它当作缺失，并用训练集中位数填补。'], ['真实极端值', '如果极端工况是目标任务的一部分，保留数据并检查标签与传感器可信度。'], ['离散化', '按领域阈值把温度划成低、中、高，会减少精度，但方便规则检查。']),
          recall: { question: '先在完整数据上计算填补中位数，再切分训练和测试，会发生什么？', answer: '测试数据参与拟合预处理，影响训练输入，造成数据泄漏。应先切分再在训练集拟合。' },
        },
        {
          id: 'topic-144', title: '训练集、模型参数与任务类型', shortTitle: '数据划分、参数与任务', pages: [144, 150], priority: '必学',
          summary: '训练集拟合参数，验证集选择配置，测试集提供最终的独立评价。',
          example: '有 100 条记录时，可以分 70 条训练、20 条验证和 10 条测试。若多条记录来自同一对象，分组划分常比逐行随机切分更合适；时间预测要留出未来时段。',
          theory: String.raw`可写 $\hat\theta_\lambda=\arg\min_\theta L_{\rm train}(\theta;\lambda)$，用验证表现选择超参数 $\lambda$。分类预测离散类别，回归预测连续目标。判别方法直接学习决策或 $p(y\mid x)$，生成方法建模数据分布（如 $p(x)$ 或联合分布 $p(x,y)$）。有无目标标签决定了监督设定。`,
          demonstration: cases(['训练集 · 70', '优化权重和偏置，并拟合输入预处理的统计量。'], ['验证集 · 20', '比较学习率、批量大小和训练轮次，选择配置。'], ['测试集 · 10', '配置确定后评价。频繁用测试分数调参会削弱独立性。']),
          recall: { question: '网络权重、学习率和批量大小，哪些属于超参数？', answer: '学习率和批量大小属于训练配置；网络权重由训练拟合，是模型参数。' },
        },
        {
          id: 'topic-151', title: '图像定位：数据与标注决定任务', shortTitle: '图像定位与标注', pages: [151, 157], priority: '选学',
          summary: '想让模型输出位置或像素区域，需要在任务定义中明确相应监督信号。',
          example: '同一张工件图片可以标记「有划痕」、给划痕画框，或描出具体像素。三种标注可分别对应分类、检测和分割。',
          theory: String.raw`分类目标可以是 $y\in\{0,1\}$，检测可以输出框 $b=(x_{\min},y_{\min},x_{\max},y_{\max})$ 与类别，分割可用 $M\in\{0,1\}^{H\times W}$ 作二值掩码。监督学习使用标注；半监督可结合有标注与无标注样本；无监督从无任务标签的数据中寻找结构。原课以图像定位说明标注粒度。`,
          demonstration: cases(['图像级标签', '只知道整张图里有划痕，训练信号没有具体位置。'], ['矩形框', '可以直接监督大致位置和范围，框内往往含背景。'], ['像素掩码', '逐像素记录所属区域，监督边界细节，标注成本也更高。']),
          recall: { question: '想输出划痕的准确像素轮廓，三种标签里哪种能直接监督这一目标？', answer: '像素掩码。图像级标签和矩形框也可能用于弱监督，但没有提供完整的像素真值。' },
        },
        {
          id: 'topic-158', title: '从性能提升到评估与部署', shortTitle: '评估、集成与部署', pages: [158, 164], priority: '拓展',
          summary: '用贴合目标的指标选择模型，部署时复用同样的预处理，并监测数据变化。',
          example: '缺陷只占 1% 时，全预测为正常也有 99% 准确率，但会漏掉全部缺陷。评估需结合召回率、误报成本和部署约束。',
          theory: String.raw`召回率为 $\mathrm{TP}/(\mathrm{TP}+\mathrm{FN})$，精确率为 $\mathrm{TP}/(\mathrm{TP}+\mathrm{FP})$，分母为零时需明确报告约定。Bagging 通常用不同的自助样本独立训练基学习器再聚合。Boosting 按序加入基学习器，例如拟合当前损失的负梯度。模型上线后仍需监测输入变化和可获得的真实表现。`,
          demonstration: cases(['Bagging', '从训练集有放回抽样，分别训练多棵树，再平均输出或投票。'], ['Boosting', '先训练一个简单模型，再按当前预测的不足训练下一棵树。'], ['上线核验', '先确认训练和服务的特征变换一致，再监测数据分布、错误案例与业务指标。']),
          recall: { question: '缺陷稀有且漏报代价高，为什么只看准确率不够？', answer: '大量正常样本可以掩盖漏检。至少需要同时考察召回率和误报代价，并根据应用选择阈值。' },
        },
      ],
    },
  ],
};
