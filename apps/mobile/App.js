import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button
} from "react-native";

export default function App() {
  const [passages, setPassages] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/passages")
      .then((res) => res.json())
      .then(setPassages)
      .catch((err) => console.log(err));
  }, []);

  const filtered = passages.filter((item) =>
    `${item.book} ${item.text}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bible Verse App</Text>

      <TextInput
        style={styles.input}
        value={query}
        placeholder="Search scripture..."
        onChangeText={setQuery}
      />

      <ScrollView style={styles.list}>
        {filtered.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.book}>
              {item.book} {item.chapter}:{item.verse}
            </Text>
            <Text style={styles.text}>{item.text}</Text>
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
    backgroundColor: "#f5f7fb",
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: "#dfe3eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 16
  },
  list: {
    flex: 1
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8
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
