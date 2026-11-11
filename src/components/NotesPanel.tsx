import { useState } from 'react';
import { Bookmark, BookOpen, CloudOff, Download, FilePlus2, NotebookPen } from 'lucide-react';
import type { Lesson } from '../courses';
import { downloadFile, noteFilename, noteMarkdown, statuses } from '../notes';
import type { Note, Status } from '../notes';
import { Markdown } from './Markdown';

const template = '## 用自己的话解释\n\n\n## 例子或公式\n\n\n## 下一次复习\n\n';

export function NotesPanel({ lesson, note, issue, update }: {
  lesson: Lesson; note: Note; issue: string; update: (patch: Partial<Note>) => void;
}) {
  const [preview, setPreview] = useState(false);
  return <aside className="notes-panel" aria-label="随堂笔记">
    <header className="notes-header">
      <div className="notes-heading"><span className="notes-icon"><NotebookPen size={19} /></span><h2>随堂笔记</h2></div>
      <span className={issue ? 'save-status save-error' : 'save-status'} role="status">
        <i />{issue ? '未写入本地' : note.updatedAt ? '已保存' : '本地保存'}
      </span>
    </header>
    <p className="notes-context" title={lesson.topic.title}>{lesson.topic.shortTitle}</p>
    <div className="note-modes" role="group" aria-label="笔记模式">
      <button type="button" aria-pressed={!preview} onClick={() => setPreview(false)}><NotebookPen size={15} /> 编辑</button>
      <button type="button" aria-pressed={preview} onClick={() => setPreview(true)}><BookOpen size={15} /> 预览</button>
    </div>
    {preview
      ? <div className="note-preview" aria-label="Markdown 预览">
          {note.markdown ? <Markdown text={note.markdown} /> : <p className="muted">在编辑区写点内容，预览会显示在这里。</p>}
        </div>
      : <div className="note-editor">
          <textarea aria-label="Markdown 笔记" value={note.markdown}
            placeholder={'写下你对这一节的理解…\n\n支持 Markdown 和 $LaTeX$'}
            spellCheck={false} onChange={event => update({ markdown: event.target.value })} />
          <button className="button quiet template-button" onClick={() => update({ markdown: note.markdown ? note.markdown + '\n\n' + template : template })}>
            <FilePlus2 size={15} /> 插入笔记模板
          </button>
        </div>}
    <div className="note-details">
      <div className="note-status-row">
        <label className="note-field">学习状态
          <select value={note.status} onChange={event => update({ status: event.target.value as Status })}>
            {statuses.map(status => <option key={status}>{status}</option>)}
          </select>
        </label>
        <button className="button review-button" aria-pressed={note.review} onClick={() => update({ review: !note.review })}>
          <Bookmark size={15} fill={note.review ? 'currentColor' : 'none'} />{note.review ? '已标记复习' : '标记复习'}
        </button>
      </div>
      <label className="note-field">标签
        <input value={note.tags} placeholder="用空格或逗号分隔" onChange={event => update({ tags: event.target.value })} />
      </label>
      <label className="note-field">我的疑问
        <textarea rows={2} value={note.question} placeholder="记下一个还没想通的问题" onChange={event => update({ question: event.target.value })} />
      </label>
    </div>
    <div className="notes-footer">
      <button className="button secondary" onClick={() => downloadFile(noteFilename(lesson), noteMarkdown(lesson, note), 'text/markdown;charset=utf-8')}>
        <Download size={16} /> 导出本节 Markdown
      </button>
      <p><CloudOff size={15} /> 笔记仅存于当前浏览器，无跨设备同步。</p>
    </div>
  </aside>;
}
