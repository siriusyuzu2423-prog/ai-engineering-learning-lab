# 验收记录

## 课程覆盖

[线上章节覆盖表](https://siriusyuzu2423-prog.github.io/ai-engineering-learning-lab/#/map) 从课程数据生成。它列出 21 个小节的模块、优先级、学习状态、原课页码和直达链接。

已核对原课页面正文、页面锚点和原课结构化目录的页码。4 个模块分别包含 4、4、8、5 个知识小节。原课路线、三个模块分隔页和结语共 5 个链接在课程地图中可访问。快速路线纳入 10 节必学，完整路线另含 7 节选学和 4 节拓展。 [原课页面](https://visionary-laboratory.github.io/ai-engineering-course/model-foundations/lectures/01-neural-networks/)

## 自动化验收

- 单元测试覆盖仿射计算、激活和局部导数、5 个参数梯度的中心差分核验、大步长导致损失上升的例子、课程覆盖、JSON 往返及 Markdown 文件内容。
- Chrome 桌面端测试打开全部 21 节，核对公式、原课锚点和答案展开。检查快速与完整路线、相邻小节、搜索、进度和待复习筛选。
- 神经元实验核对输入、权重、偏置与激活变化。激活实验验证 Sigmoid 数值和 ReLU 折点。训练实验检查前向、损失、链式求导、全部参数的同步更新及新旧损失。
- 笔记测试覆盖即时刷新、不同小节数据隔离、Markdown 和公式预览、外部图片不发请求、单节和 ZIP 下载。JSON 测试覆盖完整恢复、错误格式拒绝、取消和存储写入失败时的备份。
- Chrome 的 Pixel 7 触控视口测试覆盖目录、正文、公式、笔记、刷新、课程地图和知识库的横向溢出。移动端验收使用模拟视口。

本地复验运行 `npm test`、`npm run build`、`npm run test:e2e`。线上复验使用以下命令。

```sh
AIELAB_URL=https://siriusyuzu2423-prog.github.io/ai-engineering-learning-lab/ npm run test:e2e
```

## 已知边界与后续优化

- 笔记绑定浏览器和站点来源。换设备用 JSON 迁移，浏览器配额耗尽时页面提示并允许下载草稿。正式使用时可按实际笔记体量评估 IndexedDB 与多标签并发写入的迁移方案。
- 笔记网页预览支持常用 Markdown、GFM 和 LaTeX。图片显示替代文字，Obsidian 专属语法保留为原文供导出。可在未来增加本地附件或 Wiki 链接解析。
- 课程当前包含第 1 讲。扩展 CNN、RNN、Transformer 时沿用数据结构并为各课程补充实验和自测。
