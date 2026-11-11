import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BookOpen, CloudOff, Layers3, ListTree, NotebookPen } from 'lucide-react';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/instrument-sans';
import 'katex/dist/katex.min.css';
import './styles.css';
import { lessonLink, lessons } from './courses';
import { CourseMap } from './components/CourseMap';
import { Study, Sidebar } from './components/Study';
import { NotesPanel } from './components/NotesPanel';
import { Library } from './components/Library';
import { downloadFile, emptyNote, serializeBackup } from './notes';
import { useNotes } from './useNotes';

type MobilePanel = 'directory' | 'lesson' | 'notes';
const initialLesson = lessons[0];

function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [recent, setRecent] = useState(() => lessons.find(item => lessonLink(item) === window.location.hash) ?? initialLesson);
  const [quick, setQuick] = useState(false);
  const [panel, setPanel] = useState<MobilePanel>('lesson');
  const scrollPositions = useRef<Partial<Record<MobilePanel, number>>>({});
  const main = useRef<HTMLElement>(null);
  const notesContainer = useRef<HTMLDivElement>(null);
  const store = useNotes();

  const page = hash === '#/map' ? 'map' : hash === '#/library' ? 'library' : 'learn';
  const active = lessons.find(item => lessonLink(item) === hash) ?? recent;
  const invalidRoute = page === 'learn' && hash !== '' && hash !== '#/learn' && lessonLink(active) !== hash;
  const note = store.notes[active.key] ?? emptyNote;

  useEffect(() => {
    function onHashChange() {
      const next = window.location.hash;
      scrollPositions.current = {};
      setHash(next);
      setPanel('lesson');
      const selected = lessons.find(item => lessonLink(item) === next);
      if (selected) setRecent(selected);
    }
    function reselect() { setPanel('lesson'); }
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('lesson-reselect', reselect);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('lesson-reselect', reselect);
    };
  }, []);

  useEffect(() => {
    main.current?.scrollTo(0, 0);
    notesContainer.current?.scrollTo(0, 0);
  }, [hash]);

  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositions.current[panel] ?? 0);
  }, [hash, panel]);

  function switchPanel(next: MobilePanel) {
    if (window.matchMedia('(max-width: 860px)').matches) scrollPositions.current[panel] = window.scrollY;
    setPanel(next);
  }

  function start(course: string, useQuick: boolean) {
    setQuick(useQuick);
    const next = lessons.find(item => item.course.id === course && (!useQuick || item.topic.priority === '必学'));
    if (next) window.location.hash = lessonLink(next);
  }

  function changeQuick(value: boolean) {
    setQuick(value);
    if (value && active.topic.priority !== '必学') {
      const route = lessons.filter(item => item.course.id === active.course.id && item.topic.priority === '必学');
      const next = route.find(item => item.ordinal >= active.ordinal) ?? route.at(-1);
      if (next) window.location.hash = lessonLink(next);
    }
  }

  function openNotes() {
    switchPanel('notes');
    requestAnimationFrame(() => notesContainer.current?.querySelector('textarea')?.focus({ preventScroll: true }));
  }

  return <>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); main.current?.focus(); }}>跳至正文</a>
    <header className="topbar">
      <a className="brand" href={lessonLink(recent)}>
        <img src={`${import.meta.env.BASE_URL}mark.svg`} alt="" width="38" height="38" />
        <span><strong>AI Engineering</strong><small>Learning Lab</small></span>
      </a>
      <nav className="top-nav" aria-label="主导航">
        <a href={lessonLink(recent)} aria-current={page === 'learn' ? 'page' : undefined}><BookOpen size={16} />学习</a>
        <a href="#/map" aria-current={page === 'map' ? 'page' : undefined}><Layers3 size={16} />课程地图</a>
        <a href="#/library" aria-current={page === 'library' ? 'page' : undefined}><NotebookPen size={16} />知识库</a>
      </nav>
      <span className="local-pill"><CloudOff size={15} /> 本地保存</span>
    </header>
    {store.issue && <div className="storage-alert" role="alert"><span>{store.issue}</span>
      <button className="button quiet" onClick={store.retry}>重试</button>
      <button className="button secondary" onClick={() => downloadFile('ai-engineering-lab-recovery.json', serializeBackup(store.notes), 'application/json')}>下载 JSON</button>
    </div>}
    {page === 'learn' ? <>
      <div className={`workspace show-${panel}`}>
        <div className="sidebar-slot">
          <Sidebar active={active} notes={store.notes} quick={quick} setQuick={changeQuick} selectCourse={course => start(course, false)} />
        </div>
        <main className="study-main" ref={main} id="main-content" tabIndex={-1}>
          {invalidRoute && <p className="route-alert">找不到链接中的小节，已打开最近的小节。<a href="#/map">查看课程地图 <ArrowUpRight size={13} /></a></p>}
          <Study key={active.key} lesson={active} quick={quick} note={note} openNotes={openNotes}
            toggleDone={() => store.update(active.key, { status: note.status === '已学完' ? '学习中' : '已学完' })} />
        </main>
        <div className="notes-slot" ref={notesContainer}>
          <NotesPanel key={active.key} lesson={active} note={note} issue={store.issue} update={patch => store.update(active.key, patch)} />
        </div>
      </div>
      <nav className="mobile-panels" aria-label="学习工作区">
        <button aria-pressed={panel === 'directory'} onClick={() => switchPanel('directory')}><ListTree size={19} />目录</button>
        <button aria-pressed={panel === 'lesson'} onClick={() => switchPanel('lesson')}><BookOpen size={19} />正文</button>
        <button aria-pressed={panel === 'notes'} onClick={() => switchPanel('notes')}><NotebookPen size={19} />笔记</button>
      </nav>
    </> : <main className="wide-main" ref={main} id="main-content" tabIndex={-1}>
      {page === 'map' ? <CourseMap notes={store.notes} start={start} /> : <Library notes={store.notes} active={active} restore={store.restore} />}
    </main>}
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
