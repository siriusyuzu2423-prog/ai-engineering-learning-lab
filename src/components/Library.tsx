import { useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, DatabaseBackup, Download, FileArchive, NotebookPen, Upload } from 'lucide-react';
import { lessonLink, lessons } from '../courses';
import type { Lesson } from '../courses';
import { downloadFile, noteArchive, parseBackup, serializeBackup, splitTags } from '../notes';
import type { Notes } from '../notes';

export function Library({ notes, active, restore }: { notes: Notes; active: Lesson; restore: (notes: Notes) => void }) {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [incoming, setIncoming] = useState<{ name: string; notes: Notes } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const rows = lessons.filter(lesson => notes[lesson.key]);
  const chapter = rows.filter(lesson => lesson.course.id === active.course.id && lesson.module.id === active.module.id);
  const backup = () => downloadFile('ai-engineering-lab-backup.json', serializeBackup(notes), 'application/json');
  function exportArchive(scope: Lesson[], filename: string) {
    downloadFile(filename, noteArchive(scope, notes), 'application/zip');
  }
  async function read(file: File) {
    setError('');
    setMessage('');
    try {
      setIncoming({ name: file.name, notes: parseBackup(await file.text()) });
      dialog.current?.showModal();
    } catch {
      setError('无法导入。请选择本站导出的有效 JSON 备份。');
    }
  }
  function confirmRestore() {
    if (!incoming) return;
    try {
      restore(incoming.notes);
      dialog.current?.close();
      setMessage(`已恢复 ${Object.keys(incoming.notes).length} 条学习记录。`);
    } catch {
      setError('浏览器存储写入失败。请检查存储空间或浏览器权限，再尝试恢复。');
      dialog.current?.close();
    }
  }

  return <div className="wide-page">
    <div className="page-kicker"><NotebookPen size={16} /> 我的学习资料</div>
    <h1>知识库</h1>
    <p className="page-intro">查看随堂笔记和复习标记，或把笔记带到 Obsidian。</p>
    <div className="library-actions">
      <section className="utility-card">
        <span className="notes-icon"><FileArchive size={20} /></span>
        <h2>Markdown 导出</h2>
        <p>ZIP 内每个小节一个 Markdown 文件，保留标题、标签、公式和原课链接。当前章节为「{active.module.title}」。</p>
        <div className="utility-buttons">
          <button className="button secondary" disabled={!chapter.length} onClick={() => exportArchive(chapter, `notes-${active.course.id}-${active.module.id}.zip`)}>
            <Download size={16} /> 导出当前章节
          </button>
          <button className="button primary" disabled={!rows.length} onClick={() => exportArchive(rows, 'ai-engineering-markdown-notes.zip')}>
            <Download size={16} /> 导出全部 Markdown
          </button>
        </div>
      </section>
      <section className="utility-card">
        <span className="notes-icon"><DatabaseBackup size={20} /></span>
        <h2>JSON 备份与恢复</h2>
        <p>备份含笔记、疑问、标签、学习状态和复习标记。换浏览器或清理站点数据前可先下载备份。</p>
        <div className="utility-buttons">
          <button className="button secondary" onClick={backup}><Download size={16} /> 下载 JSON 备份</button>
          <button className="button secondary" onClick={() => fileInput.current?.click()}><Upload size={16} /> 导入 JSON</button>
          <input type="file" hidden ref={fileInput} accept=".json,application/json" aria-label="选择 JSON 备份" onChange={event => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) void read(file);
          }} />
        </div>
      </section>
    </div>
    {error && <p className="alert" role="alert">{error}</p>}
    {message && <p className="success-message" role="status">{message}</p>}
    <div className="section-heading"><h2>学习记录</h2><span>{rows.length} 节 · {rows.filter(item => notes[item.key].review).length} 待复习</span></div>
    <div className="library-list">
      {rows.length === 0 && <p className="empty-state">写下第一条笔记或标记学习状态后，这里会出现你的学习记录。</p>}
      {rows.map(lesson => {
        const note = notes[lesson.key];
        return <a className="library-row" href={lessonLink(lesson)} key={lesson.key}>
          <span><strong>{lesson.topic.title}</strong><small>{lesson.course.title} / {lesson.module.title}</small></span>
          <span className="library-tags">{splitTags(note.tags).slice(0, 4).map(tag => <span key={tag}>#{tag}</span>)}</span>
          <span className="library-status">{note.review && <Bookmark aria-label="待复习" size={15} />}{note.status}<ArrowUpRight size={15} /></span>
        </a>;
      })}
    </div>
    <dialog ref={dialog} className="restore-dialog" onClose={() => setIncoming(null)}>
      <h2>恢复本地学习记录</h2>
      {incoming && <p><strong>{incoming.name}</strong> 包含 {Object.keys(incoming.notes).length} 条记录。恢复会替换此浏览器中的全部学习记录。</p>}
      <div className="utility-buttons">
        <button className="button secondary" onClick={backup}>先下载现有备份</button>
        <button className="button quiet" autoFocus onClick={() => dialog.current?.close()}>取消</button>
        <button className="button primary" onClick={confirmRestore}>恢复并替换</button>
      </div>
    </dialog>
  </div>;
}
