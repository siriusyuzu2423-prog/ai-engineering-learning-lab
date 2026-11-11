import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Brain, Check, ChevronDown, Circle, CodeXml, Eye, Lightbulb, ListTree, NotebookPen, Search, Zap } from 'lucide-react';
import { courses, lessonLink, lessons, sourceLink } from '../courses';
import type { Lesson } from '../courses';
import type { Note, Notes } from '../notes';
import { Markdown } from './Markdown';
import { Lab } from './Labs';

export function Sidebar({ active, notes, quick, setQuick, selectCourse }: {
  active: Lesson; notes: Notes; quick: boolean; setQuick: (quick: boolean) => void; selectCourse: (course: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [reviewOnly, setReviewOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const available = lessons.filter(lesson => lesson.course.id === active.course.id);
  const route = quick ? available.filter(lesson => lesson.topic.priority === '必学') : available;
  const query = search.trim().toLocaleLowerCase();
  const reviewCount = available.filter(lesson => notes[lesson.key]?.review).length;
  const done = route.filter(lesson => notes[lesson.key]?.status === '已学完').length;
  const matching = (query || reviewOnly ? available : route).filter(({ topic, module, key }) => {
    const indexed = [topic.title, topic.shortTitle, module.title, topic.summary, topic.theory, notes[key]?.tags].join(' ').toLocaleLowerCase();
    return (!reviewOnly || notes[key]?.review) && query.split(/\s+/).every(word => indexed.includes(word));
  });
  return <aside className="study-sidebar" aria-label="课程导航">
    <div className="sidebar-controls">
      <div className="sidebar-title"><ListTree size={17} /><h2>课程目录</h2></div>
      {courses.length > 1 && <label className="note-field">课程<select value={active.course.id} onChange={event => selectCourse(event.target.value)}>
        {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
      </select></label>}
      <div className="search-box"><Search size={16} /><input type="search" value={search} placeholder="搜索章节或概念"
        aria-label="搜索章节或概念" onChange={event => setSearch(event.target.value)} /></div>
      <div className="route-switch" role="group" aria-label="学习路线">
        <button aria-pressed={!quick} onClick={() => setQuick(false)}>完整路线</button>
        <button aria-pressed={quick} onClick={() => setQuick(true)}><Zap size={13} />快速路线</button>
      </div>
      <div className="progress-card">
        <div><strong>学习进度</strong><span><b>{done}</b> / {route.length} 节</span></div>
        <progress aria-label="学习进度" value={done} max={route.length} />
      </div>
      <button className="review-filter" aria-pressed={reviewOnly} onClick={() => setReviewOnly(!reviewOnly)}>
        <Bookmark size={15} /> <span>待复习</span> <b>{reviewCount}</b>
      </button>
    </div>
    <nav className="chapters" aria-label="知识小节">
      {matching.length === 0 && <p className="empty-state">{reviewOnly && !query ? '还没有标记为待复习的小节。' : '没有匹配的小节。'}</p>}
      {active.course.modules.map((module, i) => {
        const items = matching.filter(item => item.module.id === module.id);
        if (!items.length) return null;
        const id = `${active.course.id}-${module.id}`;
        const open = query || reviewOnly || !(collapsed[id] ?? (i > 1 && active.module.id !== module.id));
        return <section key={id} className="chapter">
          <button className="chapter-toggle" aria-expanded={Boolean(open)} aria-controls={id}
            onClick={() => setCollapsed(old => ({ ...old, [id]: Boolean(open) }))} disabled={Boolean(query) || reviewOnly}>
            <span className="chapter-number">{String(i + 1).padStart(2, '0')}</span>
            <strong>{module.title}</strong><ChevronDown className={open ? 'chevron expanded' : 'chevron'} size={15} />
          </button>
          <ul id={id} hidden={!open}>{items.map(item => {
            const note = notes[item.key];
            return <li key={item.key}><a href={lessonLink(item)} aria-current={active.key === item.key ? 'page' : undefined} onClick={() => {
              setCollapsed(old => ({ ...old, [id]: false }));
              if (active.key === item.key) window.dispatchEvent(new Event('lesson-reselect'));
            }}>
              {note?.status === '已学完' ? <Check className="topic-done" size={14} aria-label="已学完" /> : <Circle className="topic-circle" size={10} aria-label={note?.status ?? '未开始'} />}
              <span>{item.topic.shortTitle}</span>{note?.review && <Bookmark className="topic-bookmark" size={13} aria-label="待复习" />}
            </a></li>;
          })}</ul>
        </section>;
      })}
    </nav>
    <div className="sidebar-footer"><a href={active.course.source} target="_blank" rel="noreferrer">原课程讲义 <ArrowUpRight size={15} /></a></div>
  </aside>;
}

export function Study({ lesson, note, quick, toggleDone, openNotes }: {
  lesson: Lesson; note: Note; quick: boolean; toggleDone: () => void; openNotes: () => void;
}) {
  const { course, topic, module, ordinal } = lesson;
  const all = lessons.filter(item => item.course.id === course.id);
  const route = quick ? all.filter(item => item.topic.priority === '必学' || item.key === lesson.key) : all;
  const current = route.findIndex(item => item.key === lesson.key);
  const [reveal, setReveal] = useState(false);
  return <article className="lesson" aria-labelledby="topic-heading">
    <div className="breadcrumbs"><a href="#/map">第 {course.number} 讲</a><span>/</span><span>{module.title}</span></div>
    <div className="lesson-meta">
      <span className={`priority priority-${topic.priority}`}>{topic.priority}</span>
      <span className="lesson-count">{String(ordinal).padStart(2, '0')} / {all.length}</span>
      <a className="source-link" href={sourceLink(lesson)} target="_blank" rel="noreferrer">原课小节 <ArrowUpRight size={14} /></a>
    </div>
    <h1 id="topic-heading">{topic.title}</h1>
    <div className="summary-card">
      <span className="summary-icon"><Lightbulb size={21} /></span>
      <div><h2>一句话理解</h2><p>{topic.summary}</p></div>
    </div>
    <section className="text-section">
      <h2><span className="section-icon"><Eye size={17} /></span>直观例子</h2>
      <Markdown text={topic.example} />
    </section>
    <section className="text-section theory">
      <h2><span className="section-icon"><CodeXml size={17} /></span>数学与原理</h2>
      <Markdown text={topic.theory} />
    </section>
    <Lab demo={topic.demonstration} />
    <section className="recall">
      <h2><Brain size={20} /> 主动回忆</h2>
      <Markdown text={topic.recall.question} />
      <button className="button secondary" aria-expanded={reveal} aria-controls="recall-answer" onClick={() => setReveal(!reveal)}>
        {reveal ? '收起参考答案' : '显示参考答案'}
      </button>
      <div id="recall-answer" hidden={!reveal} className="answer"><Markdown text={topic.recall.answer} /></div>
    </section>
    <div className="lesson-actions">
      <button className="button primary" aria-pressed={note.status === '已学完'} onClick={toggleDone}>
        <Check size={17} /> {note.status === '已学完' ? '已学完 · 取消标记' : '标记为已学完'}
      </button>
      <button className="button secondary" onClick={openNotes}><NotebookPen size={16} /> 我的笔记</button>
    </div>
    <nav className="lesson-pagination" aria-label="相邻小节">
      {route[current - 1] ? <a href={lessonLink(route[current - 1])}><ArrowLeft size={17} /><span><small>上一节</small>{route[current - 1].topic.shortTitle}</span></a> : <span />}
      {route[current + 1] ? <a href={lessonLink(route[current + 1])}><span><small>下一节</small>{route[current + 1].topic.shortTitle}</span><ArrowRight size={17} /></a>
        : <a href="#/map"><span><small>课程地图</small>查看章节覆盖</span><ArrowRight size={17} /></a>}
    </nav>
    <p className="source-credit">原课来源 · {course.sourceCredit}</p>
  </article>;
}
