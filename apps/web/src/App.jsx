import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:4000/api";

export default function App() {
  const [passages, setPassages] = useState([]);
  const [devotionals, setDevotionals] = useState([]);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/passages`)
      .then((res) => res.json())
      .then(setPassages);

    fetch(`${API_URL}/devotionals`)
      .then((res) => res.json())
      .then(setDevotionals);
  }, []);

  const filteredPassages = useMemo(() => {
    if (!query) return passages;
    return passages.filter((passage) =>
      `${passage.book} ${passage.text}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [passages, query]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const updateNote = (id, value) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="topbar">
        <h1>Bible Verse App</h1>
        <button onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section>
            <h2>Search</h2>
            <input
              type="text"
              placeholder="Search scripture..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </section>

          <section>
            <h2>Daily Devotionals</h2>
            {devotionals.map((devotional, idx) => (
              <div className="card" key={idx}>
                <strong>{devotional.title}</strong>
                <p>{devotional.text}</p>
              </div>
            ))}
          </section>
        </aside>

        <section className="content">
          <h2>Read</h2>
          {filteredPassages.map((passage) => (
            <article key={passage.id} className="passage">
              <div className="passage-header">
                <strong>
                  {passage.book} {passage.chapter}:{passage.verse}
                </strong>
                <button onClick={() => toggleFavorite(passage.id)}>
                  {favorites.includes(passage.id) ? "★ Saved" : "☆ Save"}
                </button>
              </div>

              <p className="verse-text">{passage.text}</p>

              <div className="note-box">
                <label htmlFor={`note-${passage.id}`}>Notes</label>
                <textarea
                  id={`note-${passage.id}`}
                  rows="3"
                  value={notes[passage.id] || ""}
                  onChange={(e) => updateNote(passage.id, e.target.value)}
                  placeholder="Write your thoughts..."
                />
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
