import { neuralNetworks } from './neural-networks';
import type { Course, Module, Topic } from './types';

export const courses: readonly Course[] = [neuralNetworks];

export interface Lesson {
  course: Course;
  module: Module;
  topic: Topic;
  key: string;
  ordinal: number;
}

export const lessons = courses.flatMap(course => {
  let ordinal = 0;
  return course.modules.flatMap(module => module.topics.map(topic => ({
    course, module, topic, key: `${course.id}/${topic.id}`, ordinal: ++ordinal,
  })));
});

export const sourceLink = ({ course, topic }: Lesson) => `${course.source}#${topic.id}`;
export const lessonLink = (lesson: Lesson) => `#/learn/${lesson.key}`;
