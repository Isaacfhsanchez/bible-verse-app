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

export default function App() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
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

  const currentBook = books.find((book) => book.id === selectedBookId) || books[0];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bible Verse App</Text>

      <TextInput
        style={styles.input}
        value={query}
        placeholder="Search scripture..."
        onChangeText={handleSearch}
      />

      {query.trim() && results.length > 0 && (
        <View style={styles.searchResults}>
          {results.slice(0, 5).map((result, index) => (
            <TouchableOpacity
              key={`${result.bookId}-${result.chapter}-${result.verse}-${index}`}
              onPress={() => {
                setSelectedBookId(result.bookId);
                setSelectedChapter(result.chapter);
                setQuery("");
                setResults([]);
              }}
            >
              <Text style={styles.searchItem}>
                {result.book} {result.chapter}:{result.verse} — {result.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.selectorRow}>
        <Text>Book</Text>
        <View style={styles.pickerBox}>
          {books.map((book) => (
            <TouchableOpacity
              key={book.id}
              onPress={() => {
                setSelectedBookId(book.id);
                setSelectedChapter(book.chapters[0].chapter);
              }}
              style={[
                styles.bookButton,
                selectedBookId === book.id && styles.bookButtonActive
              ]}
            >
              <Text>{book.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.selectorRow}>
        <Text>Chapter</Text>
        <View style={styles.pickerBox}>
          {(currentBook?.chapters || []).map((entry) => (
            <TouchableOpacity
              key={entry.chapter}
              onPress={() => setSelectedChapter(entry.chapter)}
              style={[
                styles.chapterButton,
                selectedChapter === entry.chapter && styles.chapterButtonActive
              ]}
            >
              <Text>{entry.chapter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.list}>
        {(verses || []).map((verse) => (
          <View key={verse.number} style={styles.card}>
            <Text style={styles.book}>{currentBook?.name} {selectedChapter}:{verse.number}</Text>
            <Text style={styles.text}>{verse.text}</Text>
            <Button title="Save" onPress={() => {}} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#edf2ff"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: "#dfe7fb",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12
  },
  selectorRow: {
    marginTop: 12,
    marginBottom: 8
  },
  pickerBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8
  },
  bookButton: {
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#dfe7fb",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  bookButtonActive: {
    backgroundColor: "#3f6ef5",
    borderColor: "#3f6ef5"
  },
  chapterButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe7fb",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  chapterButtonActive: {
    backgroundColor: "#7aa3ff"
  },
  searchResults: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  searchItem: {
    marginBottom: 8,
    lineHeight: 20
  },
  list: {
    flex: 1,
    marginTop: 8
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dfe7fb"
  },
  book: {
    fontWeight: "700",
    marginBottom: 8
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10
  }
});
