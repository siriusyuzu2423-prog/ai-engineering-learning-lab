import assert from 'node:assert/strict';
import { test } from 'node:test';
import { strFromU8, unzipSync } from 'fflate';
import { emptyNote, noteArchive, noteMarkdown, parseBackup, serializeBackup, splitTags } from '../src/notes.ts';
import { neuralNetworks } from '../src/courses/neural-networks.ts';
import type { Lesson } from '../src/courses/index.ts';

test('source sections match the reviewed four-module chapter map', () => {
  const expected = [[3, 6, 16, 27], [32, 41, 48, 60], [67, 72, 86, 98, 106, 108, 118, 127], [130, 136, 144, 151, 158]];
  assert.deepEqual(neuralNetworks.modules.map(module => module.topics.map(topic => topic.id)), expected.map(ids => ids.map(id => `topic-${id}`)));
  assert.deepEqual(neuralNetworks.modules.flatMap(module => module.topics)
    .reduce<Record<string, number>>((counts, topic) => ({ ...counts, [topic.priority]: (counts[topic.priority] ?? 0) + 1 }), {}),
    { '必学': 10, '选学': 7, '拓展': 4 });
});

test('backup preserves all note fields and future lesson IDs', () => {
  const note = { ...emptyNote, markdown: '# 标题\n\n$z=2$', question: '为什么？', tags: '#梯度，复习', review: true, status: '已学完' as const };
  const notes = { '01-neural-networks/topic-32': note, '02-cnns/topic-1': { ...note, markdown: '第二条' } };
  const backup = serializeBackup(notes);
  assert.deepEqual(parseBackup(backup), notes);
  assert.throws(() => parseBackup(backup.replace('"version": 1', '"version": 2')));
  assert.throws(() => parseBackup(backup.replace('"review": true', '"review": "true"')));
  assert.throws(() => parseBackup(backup.replace('02-cnns/topic-1', '__proto__')));
});

test('Obsidian export preserves math, questions, valid tags and original source', () => {
  const module = neuralNetworks.modules[0];
  const lesson: Lesson = { course: neuralNetworks, module, topic: module.topics[0], key: '01-neural-networks/topic-3', ordinal: 1 };
  const note = { ...emptyNote, markdown: '## 记忆\n\n$$\nz=2\n$$', question: '试一试', tags: '#梯度，重点/复习 123 梯度' };
  const markdown = noteMarkdown(lesson, note);
  assert.deepEqual(splitTags(note.tags), ['梯度', '重点/复习']);
  assert.match(markdown, /tags:\n  - "ai工程学"\n  - "梯度"\n  - "重点\/复习"/);
  assert.ok(markdown.includes(note.markdown));
  assert.ok(markdown.includes('## 我的疑问\n\n试一试'));
  assert.ok(markdown.includes('/01-neural-networks/#topic-3'));
  const files = Object.values(unzipSync(noteArchive([lesson], { [lesson.key]: note })));
  assert.equal(files.length, 1);
  assert.equal(strFromU8(files[0]), markdown);
});
