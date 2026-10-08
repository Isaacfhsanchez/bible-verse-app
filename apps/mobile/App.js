import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("read");

  useEffect(() => {
    const loadState = async () => {
      const savedFavorites = await AsyncStorage.getItem("bible-favorites");
      const savedNotes = await AsyncStorage.getItem("bible-notes");
      const savedHistory = await AsyncStorage.getItem("bible-history");

      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    };

    loadState();

    fetch("http://localhost:4000/api/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        const firstBook = data[0];
        setSelectedBookId(firstBook.id);
        setSelectedChapter(firstBook.chapters[0].chapter);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => AsyncStorage.setItem("bible-favorites", JSON.stringify(favorites)), [favorites]);
  useEffect(() => AsyncStorage.setItem("bible-notes", JSON.stringify(notes)), [notes]);
  useEffect(() => AsyncStorage.setItem("bible-history", JSON.stringify(history)), [history]);

  useEffect(() => {
    if (!selectedBookId) return;
    fetch(`http://localhost:4000/api/books/${selectedBookId}/${selectedChapter}`)
      .then((res) => res.json())
      .then((data) => setVerses(data.verses || []))
      .catch((err) => console.error(err));
  }, [selectedBookId, selectedChapter]);

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    const res = await fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setResults(data);
  };

  const addToHistory = (bookName, chapter, verse) => {
    const item = { book: bookName, chapter, verse };
    setHistory((prev) => [item, ...prev.filter((entry) => !(entry.book === bookName && entry.chapter === chapter && entry.verse === verse))].slice(0, 8));
  };

  const toggleFavorite = (refKey) => {
    setFavorites((prev) =>
      prev.includes(refKey) ? prev.filter((item) => item !== refKey) : [...prev, refKey]
    );
  };

  const updateNote = (refKey, value) => {
    setNotes((prev) => ({ ...prev, [refKey]: value }));
  };

  const currentBook = books.find((book) => book.id === selectedBookId) || books[0];
  const favoriteEntries = favorites.map((refKey) => {
    const [bookId, chapter, verseNumber] = refKey.split("-");
    const targetBook = books.find((book) => book.id === bookId);
    const selectedChapterData = targetBook?.chapters.find((item) => Number(item.chapter) === Number(chapter));
    const verse = selectedChapterData?.verses.find((item) => Number(item.number) === Number(verseNumber));
    return { refKey, book: targetBook?.name || "Book", chapter: Number(chapter), verse: Number(verseNumber), text: verse?.text || "" };
  });

  const noteEntries = Object.entries(notes).map(([key, value]) => {
    const [bookId, chapter, verseNumber] = key.split("-");
    const targetBook = books.find((book) => book.id === bookId);
    return { key, book: targetBook?.name || "Book", chapter: Number(chapter), verse: Number(verseNumber), value };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bible Verse App</Text>

      <TextInput style={styles.input} value={query} placeholder="Search scripture..." onChangeText={handleSearch} />

      {query.trim() && results.length > 0 && (
        <View style={styles.searchResults}>
          {results.slice(0, 5).map((result, index) => (
            <TouchableOpacity key={`${result.bookId}-${result.chapter}-${result.verse}-${index}`} onPress={() => {
              setSelectedBookId(result.bookId);
              setSelectedChapter(result.chapter);
              setQuery("");
              setResults([]);
            }}>
              <Text style={styles.searchItem}>{result.book} {result.chapter}:{result.verse} — {result.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.tabRow}>
        <Button title="Read" onPress={() => setTab("read")} />
        <Button title="Favorites" onPress={() => setTab("favorites")} />
        <Button title="Notes" onPress={() => setTab("notes")} />
        <Button title="History" onPress={() => setTab("history")} />
      </View>

      {tab === "read" && (
        <>
          <View style={styles.selectorRow}>
            <Text>Book</Text>
            <View style={styles.pickerBox}>
              {books.map((book) => (
                <TouchableOpacity key={book.id} onPress={() => { setSelectedBookId(book.id); setSelectedChapter(book.chapters[0].chapter); }} style={[styles.bookButton, selectedBookId === book.id && styles.bookButtonActive]}>
                  <Text>{book.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.selectorRow}>
            <Text>Chapter</Text>
            <View style={styles.pickerBox}>
              {(currentBook?.chapters || []).map((entry) => (
                <TouchableOpacity key={entry.chapter} onPress={() => setSelectedChapter(entry.chapter)} style={[styles.chapterButton, selectedChapter === entry.chapter && styles.chapterButtonActive]}>
                  <Text>{entry.chapter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView style={styles.list}>
            {(verses || []).map((verse) => {
              const refKey = `${selectedBookId}-${selectedChapter}-${verse.number}`;
              const saved = favorites.includes(refKey);

              return (
                <View key={verse.number} style={styles.card}>
                  <View style={styles.headerRow}>
                    <Text style={styles.book}>{currentBook?.name} {selectedChapter}:{verse.number}</Text>
                    <Button title={saved ? "★ Saved" : "☆ Save"} onPress={() => toggleFavorite(refKey)} />
                  </View>

                  <Text style={styles.text}>{verse.text}</Text>

                  <TextInput
                    style={styles.noteInput}
                    value={notes[refKey] || ""}
                    placeholder="Write your reflection..."
                    onChangeText={(value) => updateNote(refKey, value)}
                    multiline
                  />

                  <View style={styles.actionRow}>
                    <Button title="Mark read" onPress={() => addToHistory(currentBook?.name, selectedChapter, verse.number)} />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      {tab === "favorites" && (
        <ScrollView style={styles.list}>
          {favoriteEntries.length === 0 ? <Text>No favorites yet.</Text> : favoriteEntries.map((entry) => (
            <View key={entry.refKey} style={styles.card}>
              <Text style={styles.book}>{entry.book} {entry.chapter}:{entry.verse}</Text>
              <Text style={styles.text}>{entry.text}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {tab === "notes" && (
        <ScrollView style={styles.list}>
          {noteEntries.length === 0 ? <Text>No notes yet.</Text> : noteEntries.map((entry) => (
            <View key={entry.key} style={styles.card}>
              <Text style={styles.book}>{entry.book} {entry.chapter}:{entry.verse}</Text>
              <Text style={styles.text}>{entry.value || "No note saved."}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {tab === "history" && (
        <ScrollView style={styles.list}>
          {history.length === 0 ? <Text>No history yet.</Text> : history.map((entry, index) => (
            <View key={`${entry.book}-${entry.chapter}-${entry.verse}-${index}`} style={styles.card}>
              <Text style={styles.book}>{entry.book} {entry.chapter}:{entry.verse}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#edf2ff" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#dfe7fb", borderRadius: 10, backgroundColor: "#fff", padding: 12, marginBottom: 12 },
  selectorRow: { marginTop: 12, marginBottom: 8 },
  pickerBox: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 8 },
  bookButton: { backgroundColor: "#fff", borderRadius: 999, borderWidth: 1, borderColor: "#dfe7fb", paddingHorizontal: 12, paddingVertical: 8 },
  bookButtonActive: { backgroundColor: "#3f6ef5", borderColor: "#3f6ef5" },
  chapterButton: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#dfe7fb", paddingHorizontal: 10, paddingVertical: 8 },
  chapterButtonActive: { backgroundColor: "#7aa3ff" },
  searchResults: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12 },
  searchItem: { marginBottom: 8, lineHeight: 20 },
  tabRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 12 },
  list: { flex: 1, marginTop: 8 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#dfe7fb" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  book: { fontWeight: "700", marginBottom: 8 },
  text: { fontSize: 16, lineHeight: 24, marginBottom: 10 },
  noteInput: { borderWidth: 1, borderColor: "#dfe7fb", borderRadius: 10, backgroundColor: "#f8faff", padding: 10, minHeight: 62, textAlignVertical: "top" },
  actionRow: { marginTop: 10 }
});
