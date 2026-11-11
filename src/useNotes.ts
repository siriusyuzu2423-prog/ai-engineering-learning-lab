import { useEffect, useRef, useState } from 'react';
import { emptyNote, readNotes, saveNotes, STORAGE_KEY } from './notes';
import type { Note, Notes } from './notes';

type NotePatch = Partial<Omit<Note, 'updatedAt'>> & Pick<Note, 'updatedAt'>;
type Pending = Record<string, NotePatch>;

function merge(notes: Notes, pending: Pending) {
  return { ...notes, ...Object.fromEntries(Object.entries(pending).map(([key, patch]) =>
    [key, { ...(notes[key] ?? emptyNote), ...patch }])) };
}

function initial(): { notes: Notes; issue: string } {
  try {
    return { notes: readNotes(window.localStorage), issue: '' };
  } catch {
    return { notes: {}, issue: '无法读取本地笔记。可尝试重新保存，或从有效的 JSON 备份恢复。' };
  }
}

export function useNotes() {
  const [state, setState] = useState(initial);
  const current = useRef(state.notes);
  const pending = useRef<Pending>({});

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        current.current = merge(readNotes(window.localStorage), pending.current);
        setState(old => ({ ...old, notes: current.current }));
      } catch {
        setState(old => ({ ...old, issue: '无法读取本地笔记。可先下载 JSON，保留此页可读取的笔记。' }));
      }
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function persist() {
    try {
      const latest = merge(readNotes(window.localStorage), pending.current);
      saveNotes(window.localStorage, latest);
      pending.current = {};
      current.current = latest;
      setState({ notes: latest, issue: '' });
    } catch {
      current.current = merge(current.current, pending.current);
      setState({ notes: current.current, issue: '笔记未写入浏览器。请先下载 JSON 备份，或重试保存。' });
    }
  }

  function update(key: string, patch: Partial<Omit<Note, 'updatedAt'>>) {
    pending.current[key] = { ...pending.current[key], ...patch, updatedAt: new Date().toISOString() };
    persist();
  }

  function restore(notes: Notes) {
    saveNotes(window.localStorage, notes);
    pending.current = {};
    current.current = notes;
    setState({ notes, issue: '' });
  }

  return { ...state, update, restore, retry: persist };
}
