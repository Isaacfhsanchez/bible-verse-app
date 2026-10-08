import express from "express";
import cors from "cors";
import { books, devotionals } from "./data/bible.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

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

  res.json({ book: book.name, chapter: selectedChapter.chapter, verses: selectedChapter.verses });
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

app.listen(PORT, () => {
  console.log(`Bible server running on http://localhost:${PORT}`);
});
