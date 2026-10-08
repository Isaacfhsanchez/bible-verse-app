import express from "express";
import cors from "cors";
import { books, devotionals, verseOfTheDay } from "./data/bible.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const readHistory = [];
const favorites = [];
const userNotes = {};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Bible API is running" });
});

app.get("/api/books", (_req, res) => {
  res.json(books);
});

app.get("/api/books/:id/:chapter", (req, res) => {
  const { id, chapter } = req.params;
  const book = books.find((item) => item.id === id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  const selectedChapter = book.chapters.find((entry) => Number(entry.chapter) === Number(chapter));

  if (!selectedChapter) {
    return res.status(404).json({ error: "Chapter not found" });
  }

  res.json({
    book: book.name,
    chapter: selectedChapter.chapter,
    verses: selectedChapter.verses
  });
});

app.get("/api/search", (req, res) => {
  const query = (req.query.q || "").toString().trim().toLowerCase();

  if (!query) {
    return res.json([]);
  }

  const results = [];

  books.forEach((book) => {
    book.chapters.forEach((chapterEntry) => {
      chapterEntry.verses.forEach((verse) => {
        if (
          book.name.toLowerCase().includes(query) ||
          verse.text.toLowerCase().includes(query) ||
          String(verse.number).includes(query)
        ) {
          results.push({
            book: book.name,
            bookId: book.id,
            chapter: chapterEntry.chapter,
            verse: verse.number,
            text: verse.text
          });
        }
      });
    });
  });

  res.json(results.slice(0, 25));
});

app.get("/api/devotionals", (_req, res) => {
  res.json(devotionals);
});

app.get("/api/verse-of-day", (_req, res) => {
  res.json(verseOfTheDay);
});

app.post("/api/read-history", (req, res) => {
  const entry = req.body;

  if (!entry || !entry.book || !entry.chapter || !entry.verse) {
    return res.status(400).json({ error: "Invalid read history payload" });
  }

  readHistory.unshift({ ...entry, timestamp: new Date().toISOString() });
  res.json(readHistory.slice(0, 10));
});

app.get("/api/read-history", (_req, res) => {
  res.json(readHistory.slice(0, 10));
});

app.post("/api/favorites", (req, res) => {
  const item = req.body;
  if (!item?.refKey) return res.status(400).json({ error: "Missing refKey" });

  if (!favorites.includes(item.refKey)) {
    favorites.push(item.refKey);
  }

  res.json(favorites);
});

app.get("/api/favorites", (_req, res) => {
  res.json(favorites);
});

app.post("/api/notes", (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: "Missing note key" });

  userNotes[key] = value;
  res.json(userNotes);
});

app.get("/api/notes", (_req, res) => {
  res.json(userNotes);
});

app.listen(PORT, () => {
  console.log(`Bible server running on http://localhost:${PORT}`);
});
