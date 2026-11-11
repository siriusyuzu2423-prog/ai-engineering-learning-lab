import { mkdir, readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Download, Page } from '@playwright/test';
import { strFromU8, unzipSync } from 'fflate';

const link = (anchor: number) => `./#/learn/01-neural-networks/topic-${anchor}`;
const heading = (page: Page) => page.locator('h1');
const storageKey = 'ai-engineering-learning-lab/notes-v1';
const capture = process.env.AIELAB_SCREENSHOTS;
const sampleNote = '## 我的小结\n\n对输入做加权求和。\n\n$$\nz=w_1x_1+w_2x_2+b\n$$';
const read = async (download: Download) => readFile((await download.path())!);

async function screenshot(page: Page, name: string) {
  if (!capture) return;
  await mkdir(capture, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${capture}/${name}.png`, animations: 'disabled' });
}

test('loads the static app without console errors and visits all 21 topic links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto('./', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(heading(page)).toHaveText('从芒果识别理解机器学习');
  await expect(page.locator('.katex-display')).toBeVisible();
  await expect(page.getByTestId('mango-score')).toHaveText('0.236');
  await page.getByRole('slider', { name: /黄色程度/ }).press('Home');
  await expect(page.getByTestId('mango-score')).toHaveText('-0.466');
  await page.getByRole('slider', { name: /黄色程度/ }).press('End');
  await screenshot(page, 'desktop-learning');
  await page.getByRole('link', { name: '课程地图', exact: true }).click();
  const table = page.getByRole('table', { name: '人工神经网络基础章节覆盖表' });
  await expect(table.locator('tbody')).toHaveCount(4);
  const links = table.locator('a[href^="#/learn/"]');
  await expect(links).toHaveCount(21);
  await screenshot(page, 'coverage');
  const entries = await links.evaluateAll(elements => elements.map(node => ({ href: node.getAttribute('href'), title: node.textContent })));
  for (const entry of entries) {
    await page.goto(`./${entry.href}`);
    await expect(heading(page)).toHaveText(entry.title!);
    await expect(page.getByRole('link', { name: '原课小节' })).toHaveAttribute('href', new RegExp(entry.href!.split('/').at(-1)! + '$'));
    await expect(page.getByRole('heading', { name: '一句话理解' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '数学与原理' })).toBeVisible();
    await page.getByRole('button', { name: '显示参考答案' }).click();
    await expect(page.locator('#recall-answer')).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);
    await page.getByRole('button', { name: '收起参考答案' }).click();
    await expect(page.locator('#recall-answer')).toBeHidden();
  }
  expect(errors).toEqual([]);
});

test('quick route, next and previous, search, progress, and review filter', async ({ page }) => {
  await page.goto('./#/map');
  await page.getByRole('button', { name: '开始快速路线' }).click();
  await expect(page.locator('progress')).toHaveAttribute('max', '10');
  await page.getByRole('link', { name: /下一节/ }).click();
  await expect(heading(page)).toHaveText('神经元与线性分类器');
  await page.getByRole('link', { name: /上一节/ }).click();
  await expect(heading(page)).toHaveText('从芒果识别理解机器学习');
  await page.getByRole('button', { name: '标记为已学完' }).click();
  await expect(page.locator('progress')).toHaveAttribute('value', '1');
  await page.getByRole('button', { name: '标记复习' }).click();
  await page.getByRole('button', { name: '待复习 1' }).click();
  await expect(page.getByRole('navigation', { name: '知识小节' }).getByRole('link')).toHaveCount(1);
  await page.getByRole('button', { name: '待复习 1' }).click();
  await page.getByRole('searchbox').fill('AdamW');
  await expect(page.getByRole('link', { name: /动量、Adam/ })).toBeVisible();
  await page.getByRole('link', { name: /动量、Adam/ }).click();
  await expect(heading(page)).toHaveText('优化器：动量与自适应步长');
  await page.getByRole('button', { name: '梯度折返' }).click();
  await expect(page.getByText(/梯度依次为 1、−1/)).toBeVisible();
  await page.getByRole('link', { name: '课程地图', exact: true }).click();
  await page.getByRole('button', { name: '进入完整路线' }).click();
  await expect(page.locator('progress')).toHaveAttribute('max', '21');
});

test('neuron responds to inputs, weights, bias and activation changes', async ({ page }) => {
  await page.goto(link(32));
  const value = page.getByTestId('neuron-output');
  await expect(value).toHaveText('0.500');
  await page.getByRole('slider', { name: '输入 x₁' }).press('End');
  await expect(value).toHaveText('2.100');
  await page.getByRole('slider', { name: '权重 w₁' }).press('Home');
  await expect(value).toHaveText('0.000');
  await page.getByLabel('激活函数', { exact: true }).selectOption('identity');
  await expect(value).toHaveText('-9.300');
  await page.getByRole('slider', { name: '偏置 b' }).press('End');
  await expect(value).toHaveText('-6.800');
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(value).toHaveText('0.500');
});

test('activation compares values, gradients and the ReLU kink', async ({ page }) => {
  await page.goto(link(48));
  const row = page.getByRole('row', { name: /^Sigmoid/ });
  await expect(row).toContainText('0.731');
  await expect(row).toContainText('0.197');
  const input = page.getByRole('slider', { name: '输入 z' });
  await input.fill('0');
  await expect(page.getByRole('row', { name: /^ReLU/ })).toContainText('不可导');
  await expect(row).toContainText('0.250');
  await page.getByLabel('突出显示').selectOption('sigmoid');
  await page.getByRole('button', { name: '梯度曲线' }).click();
  await expect(page.getByRole('img', { name: /纵轴是局部导数/ })).toBeVisible();
  await page.locator('.lab').scrollIntoViewIfNeeded();
  await screenshot(page, 'activation');
});

test('training computes loss and chain rule then applies a simultaneous update', async ({ page }) => {
  await page.goto(link(86));
  await expect(page.getByTestId('prediction')).toHaveText('0.51998');
  await page.getByRole('button', { name: '下一步', exact: true }).click();
  await expect(page.getByTestId('loss')).toHaveText('0.11521');
  await page.getByRole('button', { name: '下一步', exact: true }).click();
  await expect(page.getByTestId('gradient-w1')).toHaveText('-0.09576');
  await expect(page.getByTestId('gradient-w2')).toHaveText('-0.19153');
  await expect(page.getByTestId('gradient-c')).toHaveText('-0.48002');
  await page.getByRole('button', { name: '下一步', exact: true }).click();
  const nextLoss = await page.getByTestId('updated-loss').innerText();
  expect(Number(nextLoss)).toBeLessThan(0.11521);
  await page.locator('.lab').scrollIntoViewIfNeeded();
  await screenshot(page, 'backpropagation');
  await page.getByRole('button', { name: '应用更新' }).click();
  await expect(page.getByText('已更新 1 步')).toBeVisible();
  await page.getByRole('button', { name: '2. 计算损失' }).click();
  await expect(page.getByTestId('loss')).toHaveText(nextLoss);
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(page.getByTestId('prediction')).toHaveText('0.51998');
  await page.getByText('调整样本、学习率与参数').click();
  const parameter = page.getByRole('spinbutton', { name: '参数 c' });
  await parameter.fill('1');
  await parameter.press('Enter');
  await expect(page.getByTestId('prediction')).toHaveText('1.41998');
});

test('notes persist on immediate refresh, remain separate, and preview locally', async ({ page }) => {
  const outside: string[] = [];
  await page.goto(link(32));
  const siteOrigin = new URL(page.url()).origin;
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.origin !== siteOrigin) outside.push(url.href);
  });
  const note = page.getByRole('textbox', { name: 'Markdown 笔记' });
  await note.fill(sampleNote + '\n\n![示意图](https://example.invalid/private-image.png)');
  await page.getByRole('textbox', { name: '标签' }).fill('神经元 复习');
  await page.getByRole('textbox', { name: '我的疑问' }).fill('偏置怎么改变边界？');
  await page.getByLabel('学习状态').selectOption('学习中');
  await page.getByRole('button', { name: '标记复习' }).click();
  await page.reload();
  await expect(note).toHaveValue(new RegExp('我的小结'));
  await expect(page.getByRole('textbox', { name: '标签' })).toHaveValue('神经元 复习');
  await expect(page.getByRole('textbox', { name: '我的疑问' })).toHaveValue('偏置怎么改变边界？');
  await expect(page.getByLabel('学习状态')).toHaveValue('学习中');
  await expect(page.getByRole('button', { name: '已标记复习' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.locator('.note-preview .katex-display')).toBeVisible();
  await expect(page.locator('.note-preview img')).toHaveCount(0);
  expect(outside).toEqual([]);
  await screenshot(page, 'markdown-preview');
  await page.goto(link(67));
  await expect(note).toBeEmpty();
  await page.getByRole('button', { name: '插入笔记模板' }).click();
  await expect(note).toHaveValue(/用自己的话解释/);
  await note.fill('第二个小节的独立笔记');
  await page.goto(link(32));
  await expect(note).toHaveValue(/我的小结/);
});

test('single, chapter and full Markdown exports, JSON cancel, rejection and restore', async ({ page }) => {
  await page.goto(link(32));
  await page.getByRole('textbox', { name: 'Markdown 笔记' }).fill(sampleNote);
  await page.getByRole('textbox', { name: '标签' }).fill('神经元，复习/反传');
  await page.getByRole('textbox', { name: '我的疑问' }).fill('检查更新方向。');
  await page.getByLabel('学习状态').selectOption('已学完');
  await page.getByRole('button', { name: '标记复习' }).click();
  const [one] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '导出本节 Markdown' }).click()]);
  const markdown = (await read(one)).toString('utf8');
  expect(markdown).toContain(sampleNote);
  expect(markdown).toContain('  - "复习/反传"');
  expect(markdown).toContain('## 我的疑问\n\n检查更新方向。');
  if (capture) await one.saveAs(`${capture}/../obsidian-fixture/神经元验收笔记.md`);
  await page.goto(link(67));
  await page.getByRole('textbox', { name: 'Markdown 笔记' }).fill('训练笔记');
  await page.goto('./#/library');
  const [chapter] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '导出当前章节' }).click()]);
  const chapterFiles = Object.entries(unzipSync(await read(chapter)));
  expect(chapterFiles).toHaveLength(1);
  expect(chapterFiles[0][0]).toContain('/training/');
  expect(strFromU8(chapterFiles[0][1])).toContain('训练笔记');
  const [all] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '导出全部 Markdown' }).click()]);
  expect(Object.keys(unzipSync(await read(all)))).toHaveLength(2);
  const [backup] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '下载 JSON 备份', exact: true }).click()]);
  const buffer = await read(backup);
  const expected = JSON.parse(buffer.toString()).notes;
  const file = page.locator('input[type=file]');
  await file.setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":999}') });
  await expect(page.getByRole('alert')).toContainText('无法导入');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).notes, storageKey)).toEqual(expected);
  await page.goto(link(32));
  await page.getByRole('textbox', { name: 'Markdown 笔记' }).fill('用于验证恢复的临时文字');
  await page.goto('./#/library');
  await file.setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer });
  await page.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).notes['01-neural-networks/topic-32'].markdown, storageKey)).toBe('用于验证恢复的临时文字');
  await page.evaluate(key => localStorage.removeItem(key), storageKey);
  await page.reload();
  await expect(page.getByText('写下第一条笔记', { exact: false })).toBeVisible();
  await file.setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer });
  await page.getByRole('button', { name: '恢复并替换' }).click();
  await expect(page.getByRole('status')).toContainText('已恢复 2 条学习记录');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).notes, storageKey)).toEqual(expected);
  await page.reload();
  await expect(page.getByText('2 节 · 1 待复习')).toBeVisible();
  await screenshot(page, 'knowledge-library');
});

test('reports unavailable storage and preserves the draft for recovery export', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('storage full', 'QuotaExceededError'); };
  });
  await page.goto(link(32));
  await page.getByRole('textbox', { name: 'Markdown 笔记' }).fill('仍可备份的草稿');
  await expect(page.getByRole('alert')).toContainText('笔记未写入浏览器');
  const [backup] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '下载 JSON', exact: true }).click()]);
  expect(JSON.parse((await read(backup)).toString()).notes['01-neural-networks/topic-32'].markdown).toBe('仍可备份的草稿');
});

test('@mobile Chrome touch viewport navigates, reads formulas, edits and retains notes', async ({ page }) => {
  await page.goto('./');
  await expect(heading(page)).toBeVisible();
  await screenshot(page, 'mobile-learning');
  const work = page.getByRole('navigation', { name: '学习工作区' });
  await work.getByRole('button', { name: '目录' }).tap();
  await expect(page.getByRole('searchbox')).toBeVisible();
  await page.getByRole('link', { name: /神经元与线性分类器/ }).tap();
  await expect(heading(page)).toHaveText('神经元与线性分类器');
  await expect(page.locator('.katex-display')).toBeVisible();
  await work.getByRole('button', { name: '笔记' }).tap();
  await page.getByRole('textbox', { name: 'Markdown 笔记' }).fill('移动端记录 $z=2$');
  await page.reload();
  await work.getByRole('button', { name: '笔记' }).tap();
  await expect(page.getByRole('textbox', { name: 'Markdown 笔记' })).toHaveValue('移动端记录 $z=2$');
  await page.getByRole('button', { name: '预览', exact: true }).tap();
  await expect(page.locator('.note-preview .katex')).toBeVisible();
  await screenshot(page, 'mobile-notes');
  await page.getByRole('link', { name: '课程地图', exact: true }).tap();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: '知识库', exact: true }).tap();
  await expect(page.getByText('1 节 · 0 待复习')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
