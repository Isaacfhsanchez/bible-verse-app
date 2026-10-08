import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:4000/api";

function getStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [translation, setTranslation] = useState("ESV");
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [devotionals, setDevotionals] = useState([]);
  const [verseOfDay, setVerseOfDay] = useState(null);
  const [favorites, setFavorites] = useState(() => getStoredValue("bible-favorites", []));
  const [notes, setNotes] = useState(() => getStoredValue("bible-notes", {}));
  const [history, setHistory] = useState(() => getStoredValue("bible-history", []));
  const [darkMode, setDarkMode] = useState(() => getStoredValue("bible-dark-mode", false));
  const [activeTab, setActiveTab] = useState("read");

  useEffect(() => {
    fetch(`${API_URL}/books`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        const firstBook = data[0];
        if (firstBook) {
          setSelectedBookId(firstBook.id);
          setSelectedChapter(firstBook.chapters[0].chapter);
        }
      })
      .catch((error) => console.error("Failed to load books:", error));

    fetch(`${API_URL}/devotionals`)
      .then((res) => res.json())
      .then(setDevotionals)
      .catch((error) => console.error("Failed to load devotionals:", error));

    fetch(`${API_URL}/verse-of-day`)
      .then((res) => res.json())
      .then(setVerseOfDay)
      .catch((error) => console.error("Failed to load verse of the day:", error));
  }, []);

  useEffect(() => localStorage.setItem("bible-favorites", JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem("bible-notes", JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem("bible-history", JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem("bible-dark-mode", JSON.stringify(darkMode)), [darkMode]);

  const selectedBook = books.find((book) => book.id === selectedBookId) || books[0];
  const availableChapters = selectedBook?.chapters || [];
  const chapterEntry = availableChapters.find((entry) => Number(entry.chapter) === Number(selectedChapter)) || availableChapters[0];
  const chapterVerses = chapterEntry?.verses || [];

  const handleSearch = async (value) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const markRead = (bookName, chapterNumber, verseNumber) => {
    const entry = { book: bookName, chapter: chapterNumber, verse: verseNumber };
    setHistory((prev) => [entry, ...prev.filter((item) => !(item.book === bookName && item.chapter === chapterNumber && item.verse === verseNumber))].slice(0, 8));
  };

  const toggleFavorite = (refKey) => {
    setFavorites((prev) =>
      prev.includes(refKey) ? prev.filter((item) => item !== refKey) : [...prev, refKey]
    );
  };

  const updateNote = (refKey, value) => {
    setNotes((prev) => ({ ...prev, [refKey]: value }));
  };

  const displayedVerses = useMemo(() => {
    if (query.trim() && results.length > 0) {
      return results.map((result) => ({
        key: `${result.bookId}-${result.chapter}-${result.verse}`,
        chapter: result.chapter,
        verse: result.verse,
        text: result.text,
        book: result.book,
        bookId: result.bookId
      }));
    }

    return chapterVerses.map((verse) => ({
      key: `${selectedBookId}-${chapterEntry?.chapter}-${verse.number}`,
      chapter: chapterEntry?.chapter,
      verse: verse.number,
      text: verse.text,
      book: selectedBook?.name,
      bookId: selectedBookId
    }));
  }, [query, results, chapterVerses, chapterEntry, selectedBookId, selectedBook]);

  const favoriteVerseItems = useMemo(() => {
    return favorites.map((refKey) => {
      const [bookId, chapter, verseNumber] = refKey.split("-");
      const targetBook = books.find((book) => book.id === bookId);
      const verses = targetBook?.chapters.find((entry) => Number(entry.chapter) === Number(chapter))?.verses || [];
      const verse = verses.find((item) => Number(item.number) === Number(verseNumber));
      return {
        refKey,
        book: targetBook?.name || "Book",
        chapter: Number(chapter),
        verse: Number(verseNumber),
        text: verse?.text || ""
      };
    });
  }, [favorites, books]);

  const noteEntries = Object.entries(notes).map(([key, value]) => {
    const [bookId, chapter, verseNumber] = key.split("-");
    const targetBook = books.find((book) => book.id === bookId);
    return {
      key,
      book: targetBook?.name || "Book",
      chapter: Number(chapter),
      verse: Number(verseNumber),
      value
    };
  });

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Daily reading</p>
          <h1>Bible Verse App</h1>
        </div>

        <div className="header-actions">
          <select value={translation} onChange={(e) => setTranslation(e.target.value)}>
            <option value="ESV">ESV</option>
            <option value="NIV">NIV</option>
            <option value="KJV">KJV</option>
          </select>
          <button onClick={() => setDarkMode((prev) => !prev)}>{darkMode ? "Light" : "Dark"}</button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>Search</h2>
            <input type="text" placeholder="Search by book or keyword..." value={query} onChange={(e) => handleSearch(e.target.value)} />
          </section>

          <section className="panel">
            <h2>Books</h2>
            <div className="book-list">
              {books.map((book) => (
                <button
                  key={book.id}
                  className={book.id === selectedBookId ? "book-pill active" : "book-pill"}
                  onClick={() => {
                    setSelectedBookId(book.id);
                    setSelectedChapter(book.chapters[0].chapter);
                    setQuery("");
                    setResults([]);
                  }}
                >
                  {book.name}
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Verse of the Day</h2>
            {verseOfDay && (
              <div className="devotional-item">
                <strong>{verseOfDay.book} {verseOfDay.chapter}:{verseOfDay.verse}</strong>
                <p>{verseOfDay.text}</p>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Daily Devotionals</h2>
            {devotionals.map((item, index) => (
              <div key={index} className="devotional-item">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            ))}
          </section>
        </aside>

        <section className="reader-panel">
          <div className="tab-row">
            <button className={activeTab === "read" ? "tab active" : "tab"} onClick={() => setActiveTab("read")}>Read</button>
            <button className={activeTab === "favorites" ? "tab active" : "tab"} onClick={() => setActiveTab("favorites")}>Favorites</button>
            <button className={activeTab === "notes" ? "tab active" : "tab"} onClick={() => setActiveTab("notes")}>Notes</button>
            <button className={activeTab === "dashboard" ? "tab active" : "tab"} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          </div>

          {activeTab === "read" && (
            <>
              <div className="chapter-toolbar">
                <div className="chapter-selects">
                  <label>
                    Book
                    <select value={selectedBookId} onChange={(e) => {
                      const nextBook = books.find((book) => book.id === e.target.value);
                      setSelectedBookId(e.target.value);
                      setSelectedChapter(nextBook?.chapters[0]?.chapter || 1);
                      setQuery("");
                      setResults([]);
                    }}>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>{book.name}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Chapter
                    <select value={selectedChapter} onChange={(e) => setSelectedChapter(Number(e.target.value))}>
                      {availableChapters.map((entry) => (
                        <option key={entry.chapter} value={entry.chapter}>{entry.chapter}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {selectedBook && (
                <article className="panel chapter-card">
                  <div className="chapter-heading">
                    <div>
                      <p className="eyebrow">{translation}</p>
                      <h2>{selectedBook.name} {chapterEntry?.chapter}</h2>
                    </div>
                  </div>

                  <div className="verse-list">
                    {displayedVerses.map((verse) => {
                      const refKey = `${verse.bookId}-${verse.chapter}-${verse.verse}`;
                      const saved = favorites.includes(refKey);

                      return (
                        <div key={refKey} className="verse-item" onClick={() => markRead(verse.book, verse.chapter, verse.verse)}>
                          <div className="verse-meta">
                            <span className="verse-number">{verse.verse}</span>
                            <button className="save-button" onClick={() => toggleFavorite(refKey)}>
                              {saved ? "★ Saved" : "☆ Save"}
                            </button>
                          </div>

                          <p className="verse-text">{verse.text}</p>

                          <div className="note-box">
                            <label htmlFor={`note-${refKey}`}>My notes</label>
                            <textarea
                              id={`note-${refKey}`}
                              rows="2"
                              value={notes[refKey] || ""}
                              placeholder="Write your reflections..."
                              onChange={(e) => updateNote(refKey, e.target.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              )}
            </>
          )}

          {activeTab === "favorites" && (
            <section className="panel">
              <h2>Saved Verses</h2>
              {favoriteVerseItems.length === 0 ? <p>No favorites yet.</p> : favoriteVerseItems.map((verse) => (
                <div key={verse.refKey} className="list-item">
                  <strong>{verse.book} {verse.chapter}:{verse.verse}</strong>
                  <p>{verse.text}</p>
                </div>
              ))}
            </section>
          )}

          {activeTab === "notes" && (
            <section className="panel">
              <h2>My Notes</h2>
              {noteEntries.length === 0 ? <p>No notes yet.</p> : noteEntries.map((note) => (
                <div key={note.key} className="list-item">
                  <strong>{note.book} {note.chapter}:{note.verse}</strong>
                  <p>{note.value || "No note yet."}</p>
                </div>
              ))}
            </section>
          )}

          {activeTab === "dashboard" && (
            <section className="panel dashboard-panel">
              <h2>Reading Dashboard</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <span>Favorites</span>
                  <strong>{favorites.length}</strong>
                </div>
                <div className="stat-card">
                  <span>Notes</span>
                  <strong>{noteEntries.length}</strong>
                </div>
                <div className="stat-card">
                  <span>History</span>
                  <strong>{history.length}</strong>
                </div>
              </div>

              <div className="history-list">
                <h3>Reading History</h3>
                {history.length === 0 ? <p>No recent reads.</p> : history.map((entry, index) => (
                  <div key={`${entry.book}-${entry.chapter}-${entry.verse}-${index}`} className="history-item">
                    {entry.book} {entry.chapter}:{entry.verse}
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
