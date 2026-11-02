const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Data is intentionally kept in memory and resets when the server restarts.
const books = [];
let nextBookId = 1;

function findBook(id) {
  return books.find((book) => book.id === Number(id));
}

function validateBook(body, partial = false) {
  const fields = ["title", "author", "genre", "publishedYear", "totalCopies"];
  const updates = {};

  for (const field of fields) {
    if (partial && body[field] === undefined) continue;

    if (field === "publishedYear" || field === "totalCopies") {
      const value = Number(body[field]);
      const minimum = field === "publishedYear" ? 0 : 1;
      if (!Number.isInteger(value) || value < minimum) {
        const range = field === "publishedYear" ? "a non-negative" : "a positive";
        return { error: `${field} must be ${range} whole number.` };
      }
      updates[field] = value;
    } else {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        return { error: `${field} must be a non-empty string.` };
      }
      updates[field] = body[field].trim();
    }
  }

  if (partial && Object.keys(updates).length === 0) {
    return { error: "Provide at least one valid book field to update." };
  }
  return { updates };
}

app.post("/api/books", (req, res) => {
  const { updates, error } = validateBook(req.body);
  if (error) return res.status(400).json({ error });

  const book = {
    id: nextBookId++,
    ...updates,
    issuedCopies: 0,
    availableCopies: updates.totalCopies
  };
  books.push(book);
  return res.status(201).json(book);
});

app.get("/api/books", (req, res) => {
  if (books.length === 0) {
    return res.status(200).json({ message: "No books found.", books: [] });
  }
  return res.status(200).json(books);
});

app.get("/api/books/search", (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query.trim().toLowerCase() : "";
  if (!query) {
    return res.status(400).json({ error: "Provide a search term with ?query=." });
  }

  const results = books.filter((book) =>
    [book.title, book.author, book.genre].some((value) => value.toLowerCase().includes(query))
  );
  return res.status(200).json({ query, count: results.length, books: results });
});

app.get("/api/books/:id", (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found." });
  return res.status(200).json(book);
});

app.put("/api/books/:id", (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found." });

  const { updates, error } = validateBook(req.body, true);
  if (error) return res.status(400).json({ error });
  if (updates.totalCopies !== undefined && updates.totalCopies < book.issuedCopies) {
    return res.status(400).json({ error: "totalCopies cannot be less than the number of issued copies." });
  }

  Object.assign(book, updates);
  book.availableCopies = book.totalCopies - book.issuedCopies;
  return res.status(200).json(book);
});

app.delete("/api/books/:id", (req, res) => {
  const index = books.findIndex((book) => book.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Book not found." });
  if (books[index].issuedCopies > 0) {
    return res.status(409).json({ error: "Return all issued copies before deleting this book." });
  }

  const [deletedBook] = books.splice(index, 1);
  return res.status(200).json({ message: "Book deleted successfully.", book: deletedBook });
});

app.post("/api/books/:id/issue", (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found." });
  const requestedCopies = req.body.copies === undefined ? 1 : Number(req.body.copies);
  if (!Number.isInteger(requestedCopies) || requestedCopies < 1) {
    return res.status(400).json({ error: "copies must be a positive whole number." });
  }
  if (requestedCopies > book.availableCopies) {
    return res.status(409).json({ error: `Only ${book.availableCopies} copies are available.` });
  }

  book.issuedCopies += requestedCopies;
  book.availableCopies -= requestedCopies;
  return res.status(200).json({ message: "Book issued successfully.", book });
});

app.post("/api/books/:id/return", (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found." });
  const requestedCopies = req.body.copies === undefined ? 1 : Number(req.body.copies);
  if (!Number.isInteger(requestedCopies) || requestedCopies < 1) {
    return res.status(400).json({ error: "copies must be a positive whole number." });
  }
  if (requestedCopies > book.issuedCopies) {
    return res.status(409).json({ error: `Only ${book.issuedCopies} copies are currently issued.` });
  }

  book.issuedCopies -= requestedCopies;
  book.availableCopies += requestedCopies;
  return res.status(200).json({ message: "Book returned successfully.", book });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Library Management System API is running at http://localhost:${PORT}`);
});