# AI Engineering Learning Lab

[打开学习网站](https://siriusyuzu2423-prog.github.io/ai-engineering-learning-lab/) · [章节覆盖表](https://siriusyuzu2423-prog.github.io/ai-engineering-learning-lab/#/map) · [验收记录](docs/qa.md)

基于上海创智学院《AI 工程学》第 1 讲的学习工作区。4 个模块、21 个知识小节。完整路线按原课顺序，快速路线包括 10 个必学小节。教学讲解和示例为重新编写，每节保留原课锚点。 [原课程讲义](https://visionary-laboratory.github.io/ai-engineering-course/model-foundations/lectures/01-neural-networks/)

## 笔记与备份

- 在每节右侧编辑与预览 Markdown，手机使用底部的「笔记」。学习状态、标签、复习标记和个人疑问会即时保存。
- 「导出本节 Markdown」下载独立文件。「知识库」可导出当前模块或全部已记录小节。解压后把 Markdown 文件复制到 Obsidian vault，公式使用 `$…$` 和 `$$…$$`，标签写在 YAML 属性中。
- 「下载 JSON 备份」保存完整学习记录。「导入 JSON」先验证文件，然后由用户确认替换本浏览器的全部学习记录。
- 笔记保存在当前浏览器、当前站点的 localStorage。换设备、换浏览器、换站点或清除站点数据前先下载 JSON。页面预览支持常用 Markdown、GFM 和公式，图片显示替代文字，导出的原始 Markdown 保留用户输入。

## 本地运行

使用 Node.js 24。安装后运行开发服务。

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run test:e2e
```

端到端测试使用本机 Google Chrome，默认启动生产预览。设置环境变量 `AIELAB_URL` 可针对线上站点运行同一套测试。设置 `AIELAB_SCREENSHOTS` 可保存截图，请使用项目外目录保存带笔记的截图。

## 部署

工作流 [deploy.yml](.github/workflows/deploy.yml) 在推送到 `main` 时执行单元测试、编译并发布 `dist/`，也支持手动触发。首次部署到另一个仓库时，在 Settings → Pages → Source 中选择 GitHub Actions，然后推送 `main` 或在 Actions 中运行工作流。Vite 使用相对资源路径，课程用 `#/learn/<course-id>/<topic-id>`，深链接刷新由同一入口处理。 [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## 维护与扩展

1. 在 `src/courses/` 新增实现 `Course` 类型的课程文件，定义模块、稳定的小节 ID、来源锚点、学习优先级、示例、公式、演示及自测。
2. 在 `src/courses/index.ts` 将新课程注册进 `courses`。课程地图、搜索、进度、路由与 Markdown 导出从同一份数据派生。
3. 需要新实验时，在 `src/courses/types.ts` 增加实验 ID，在 `src/components/Labs.tsx` 注册组件。将可独立验证的数值逻辑放在 `src/math.ts` 或对应课程模块。
4. 发布后保留课程 ID 和小节 ID。笔记以 `course-id/topic-id` 存储，ID 变更需要同步迁移本地记录与 JSON 备份。当前备份格式为版本 1。
