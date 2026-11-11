export type Priority = '必学' | '选学' | '拓展';
export type LabId = 'neuron' | 'activation' | 'training' | 'mango' | 'xor' | 'scaling' | 'batch';
export type Demonstration =
  | { lab: LabId }
  | { cases: readonly (readonly [label: string, observation: string])[] };

export interface Topic {
  id: string;
  title: string;
  shortTitle: string;
  pages: readonly [number, number];
  priority: Priority;
  summary: string;
  example: string;
  theory: string;
  demonstration: Demonstration;
  recall: { question: string; answer: string };
}

export interface Module {
  id: string;
  title: string;
  sourceAnchor: string;
  topics: readonly Topic[];
}

export interface Course {
  id: string;
  number: string;
  title: string;
  description: string;
  source: string;
  sourceCredit: string;
  roadmapAnchor?: string;
  closingAnchor?: string;
  modules: readonly Module[];
}
