import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import './index.css';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Banner from './components/Banner';
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  getApiConfigStatus,
} from './api/client';

// PUBLIC_INTERFACE
function App() {
  // Theme management
  const [theme, setTheme] = useState('light');

  // Notes state
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [savingIds, setSavingIds] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // URL hash based routing: #/note/{id}
  useEffect(() => {
    const onHashChange = () => {
      const match = window.location.hash.match(/#\/note\/(.+)/);
      const id = match ? decodeURIComponent(match[1]) : null;
      setSelectedId(id);
    };
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Initial load of notes
  const load = useCallback(async () => {
    try {
      const cfg = getApiConfigStatus();
      if (cfg.missing) {
        setInfoMsg(cfg.message);
      } else {
        setInfoMsg('');
      }
      const items = await listNotes();
      setNotes(items);
      // If selectedId not present anymore, clear it
      if (selectedId && !items.find((n) => n.id === selectedId)) {
        setSelectedId(null);
        window.location.hash = '';
      }
    } catch (e) {
      setErrorMsg(e.message || 'Failed to load notes');
    }
  }, [selectedId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  const handleSelect = (id) => {
    setSelectedId(id);
    window.location.hash = id ? `#/note/${encodeURIComponent(id)}` : '';
  };

  const onAdd = async () => {
    // Optimistic: create client-side temp note
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, title: 'Untitled', content: '' };
    setNotes((prev) => [optimistic, ...prev]);
    setSavingIds((prev) => [...prev, tempId]);
    try {
      const created = await createNote({ title: optimistic.title, content: optimistic.content });
      setNotes((prev) =>
        prev.map((n) => (n.id === tempId ? created : n))
      );
      handleSelect(created.id);
    } catch (e) {
      // Rollback
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      setErrorMsg(e.message || 'Failed to create note');
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== tempId));
    }
  };

  const onDeleteNote = async (id) => {
    // Optimistic delete
    const snapshot = notes;
    setDeletingIds((prev) => [...prev, id]);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) {
      handleSelect(null);
    }
    try {
      await deleteNote(id);
    } catch (e) {
      // rollback
      setNotes(snapshot);
      setErrorMsg(e.message || 'Failed to delete note');
    } finally {
      setDeletingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const onChangeNote = (updated) => {
    // Update in-memory selected note to reflect typing
    setNotes((prev) => prev.map((n) => (n.id === selectedId ? { ...n, ...updated } : n)));
  };

  const onSaveNote = async (updated) => {
    if (!selectedId) return;
    // Optimistic: already reflected, but mark saving
    setSavingIds((prev) => [...prev, selectedId]);
    try {
      const saved = await updateNote(selectedId, {
        title: updated.title || '',
        content: updated.content || '',
      });
      setNotes((prev) => prev.map((n) => (n.id === selectedId ? saved : n)));
    } catch (e) {
      setErrorMsg(e.message || 'Failed to save note');
    } finally {
      setSavingIds((prev) => prev.filter((x) => x !== selectedId));
    }
  };

  const isSaving = selectedId ? savingIds.includes(selectedId) : false;

  const bannerEl = (
    <>
      {infoMsg ? (
        <Banner
          kind="info"
          message={infoMsg}
          onClose={() => setInfoMsg('')}
        />
      ) : null}
      {errorMsg ? (
        <Banner
          kind="error"
          message={errorMsg}
          onClose={() => setErrorMsg('')}
        />
      ) : null}
    </>
  );

  return (
    <div className="App" style={{ background: 'var(--background, #f9fafb)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid var(--border-color, #e9ecef)', background: 'var(--surface, #ffffff)' }}>
        <h1 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary, #111827)' }}>Simple Notes</h1>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <main style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>
        <Sidebar
          notes={notes}
          selectedId={selectedId}
          onSelect={handleSelect}
          onAdd={onAdd}
          onDelete={onDeleteNote}
          loadingIds={[...savingIds, ...deletingIds]}
        />
        <Editor
          note={selectedNote}
          onChange={onChangeNote}
          onSave={onSaveNote}
          isSaving={isSaving}
          banner={bannerEl}
        />
      </main>
    </div>
  );
}

export default App;
