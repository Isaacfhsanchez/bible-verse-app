import express from "express";
import cors from "cors";
import { passages, devotionals } from "./data/bible.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Bible API is running" });
});

app.get("/api/passages", (_req, res) => {
  res.json(passages);
});

app.get("/api/passages/search", (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();

  if (!q) {
    return res.json(passages);
  }

  const filtered = passages.filter((passage) => {
    return (
      passage.book.toLowerCase().includes(q) ||
      passage.text.toLowerCase().includes(q) ||
      String(passage.chapter).includes(q)
    );
  });

  res.json(filtered);
});

app.get("/api/devotionals", (_req, res) => {
  res.json(devotionals);
});

app.listen(PORT, () => {
  console.log(`Bible server running on http://localhost:${PORT}`);
});
