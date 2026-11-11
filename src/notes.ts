import { strToU8, zipSync } from 'fflate';
import type { Lesson } from './courses';

export const STORAGE_KEY = 'ai-engineering-learning-lab/notes-v1';
export const statuses = ['未开始', '学习中', '已学完'] as const;
export type Status = typeof statuses[number];

export interface Note {
  markdown: string;
  question: string;
  tags: string;
  review: boolean;
  status: Status;
  updatedAt: string;
}

export type Notes = Record<string, Note>;
export const emptyNote: Note = { markdown: '', question: '', tags: '', review: false, status: '未开始', updatedAt: '' };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function parseBackup(text: string): Notes {
  const data: unknown = JSON.parse(text);
  if (!isObject(data) || data.format !== 'ai-engineering-learning-lab' || data.version !== 1 || !isObject(data.notes)) {
    throw new Error('无法识别这个备份版本。请选择本站导出的 JSON 文件。');
  }
  const notes: Notes = {};
  for (const [key, item] of Object.entries(data.notes)) {
    if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(key) || !isObject(item) ||
        typeof item.markdown !== 'string' || typeof item.question !== 'string' || typeof item.tags !== 'string' ||
        typeof item.review !== 'boolean' || typeof item.updatedAt !== 'string' ||
        (item.updatedAt !== '' && !Number.isFinite(Date.parse(item.updatedAt))) ||
        (item.status !== '未开始' && item.status !== '学习中' && item.status !== '已学完')) {
      throw new Error('备份中有无法读取的笔记记录，恢复已取消。');
    }
    const { markdown, question, tags, review, status, updatedAt } = item;
    notes[key] = { markdown, question, tags, review, status, updatedAt };
  }
  return notes;
}

export function serializeBackup(notes: Notes) {
  return JSON.stringify({ format: 'ai-engineering-learning-lab', version: 1, exportedAt: new Date().toISOString(), notes }, null, 2);
}

export function readNotes(storage: Storage): Notes {
  const saved = storage.getItem(STORAGE_KEY);
  return saved === null ? {} : parseBackup(saved);
}

export function saveNotes(storage: Storage, notes: Notes) {
  storage.setItem(STORAGE_KEY, serializeBackup(notes));
}

export function splitTags(raw: string) {
  return [...new Set(raw.split(/[\s,，、]+/u).map(tag => tag.replace(/^#/, ''))
    .filter(tag => /^[\p{L}\p{N}_/-]+$/u.test(tag) && /[\p{L}_-]/u.test(tag)))];
}

export function noteMarkdown(lesson: Lesson, note: Note) {
  const tags = ['ai工程学', ...splitTags(note.tags).filter(tag => tag !== 'ai工程学')];
  const title = lesson.topic.title;
  const source = `${lesson.course.source}#${lesson.topic.id}`;
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `course: ${JSON.stringify(lesson.course.title)}`,
    `module: ${JSON.stringify(lesson.module.title)}`,
    `source: ${JSON.stringify(source)}`,
    `status: ${JSON.stringify(note.status)}`,
    `review: ${note.review}`,
    ...(note.updatedAt ? [`updated: ${JSON.stringify(note.updatedAt)}`] : []),
    'tags:',
    ...tags.map(tag => `  - ${JSON.stringify(tag)}`),
    '---', '', `# ${title}`, '',
    note.markdown,
    ...(note.question.trim() ? ['', '## 我的疑问', '', note.question] : []),
    '', '## 课程来源', '', `[${lesson.course.sourceCredit} · 原课小节](${source})`, '',
  ].join('\n');
}

export function noteFilename(lesson: Lesson) {
  return `${String(lesson.ordinal).padStart(2, '0')} ${lesson.topic.title.replace(/[<>:"/\\|?*]/g, ' ')}.md`;
}

export function noteArchive(lessons: readonly Lesson[], notes: Notes) {
  return zipSync(Object.fromEntries(lessons
    .filter(lesson => notes[lesson.key])
    .map(lesson => [`${lesson.course.id}/${lesson.module.id}/${noteFilename(lesson)}`,
      strToU8(noteMarkdown(lesson, notes[lesson.key]))])));
}

export function downloadFile(filename: string, body: string | Uint8Array, type: string) {
  const data = typeof body === 'string' ? body : Uint8Array.from(body).buffer;
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
