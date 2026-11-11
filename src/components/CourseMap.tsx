import { ArrowRight, ArrowUpRight, BookOpen, Layers3, ListChecks, Zap } from 'lucide-react';
import { courses, lessonLink, lessons, sourceLink } from '../courses';
import type { Notes } from '../notes';

export function CourseMap({ notes, start }: { notes: Notes; start: (course: string, quick: boolean) => void }) {
  return <div className="wide-page">
    <div className="page-kicker"><Layers3 size={16} /> 模型原理</div>
    <h1>课程地图</h1>
    {courses.map(course => {
      const list = lessons.filter(lesson => lesson.course.id === course.id);
      const core = list.filter(lesson => lesson.topic.priority === '必学');
      return <section key={course.id} className="map-course">
        <h2>第 {course.number} 讲 · {course.title}</h2>
        <p className="page-intro">{course.description}</p>
        <div className="library-actions">
          <section className="utility-card">
            <span className="notes-icon"><Zap size={20} /></span>
            <h3>快速路线</h3>
            <p>{core.length} 个必学小节，串起从分类、前向传播到梯度更新和评估的主线。</p>
            <button className="button primary" onClick={() => start(course.id, true)}>开始快速路线 <ArrowRight size={16} /></button>
          </section>
          <section className="utility-card">
            <span className="notes-icon"><BookOpen size={20} /></span>
            <h3>完整路线</h3>
            <p>{course.modules.length} 个模块、{list.length} 个小节，按原课顺序学习必学、选学与拓展内容。</p>
            <button className="button secondary" onClick={() => start(course.id, false)}>进入完整路线 <ArrowRight size={16} /></button>
          </section>
        </div>
        <div className="section-heading"><h2><ListChecks size={19} /> 章节覆盖</h2><span>{list.length} 个小节</span></div>
        <p className="source-credit">原课来源 · {course.sourceCredit} · <a href={course.source} target="_blank" rel="noreferrer">讲义首页 <ArrowUpRight size={13} /></a>
          {course.roadmapAnchor && <> · <a href={`${course.source}#${course.roadmapAnchor}`} target="_blank" rel="noreferrer">原课路线</a></>}
          {course.closingAnchor && <> · <a href={`${course.source}#${course.closingAnchor}`} target="_blank" rel="noreferrer">原课结语</a></>}
        </p>
        <div className="table-scroll coverage">
          <table aria-label={`${course.title}章节覆盖表`}>
            <thead><tr><th scope="col">模块</th><th scope="col">知识小节</th><th scope="col">优先级</th><th scope="col">学习状态</th><th scope="col">原课页码</th></tr></thead>
            {course.modules.map(module => {
              const members = list.filter(item => item.module.id === module.id);
              return <tbody key={module.id}>{members.map((lesson, i) => <tr key={lesson.key}>
                {i === 0 && <th scope="rowgroup" rowSpan={members.length}><a href={`${course.source}#${module.sourceAnchor}`}
                  target="_blank" rel="noreferrer">{module.title} <ArrowUpRight size={13} /></a></th>}
                <td><a href={lessonLink(lesson)}>{lesson.topic.title}</a></td>
                <td><span className={`priority priority-${lesson.topic.priority}`}>{lesson.topic.priority}</span></td>
                <td>{notes[lesson.key]?.status ?? '未开始'}</td>
                <td><a href={sourceLink(lesson)} target="_blank" rel="noreferrer"
                  aria-label={`打开原课 ${lesson.topic.title}`}>{lesson.topic.pages.join('–')} <ArrowUpRight size={13} /></a></td>
              </tr>)}</tbody>;
            })}
          </table>
        </div>
      </section>;
    })}
  </div>;
}
