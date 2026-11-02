
import express from "express";

const app = express();
app.use(express.json());

let books = [];

app.post("/api/books", (req, res) => {

    const { id, title, author, category, quantity } = req.body || {};

    if (
        String(id ?? "").trim() === "" ||
        ![title, author, category].every(
            field => typeof field === "string" && field.trim()
        ) ||
        !Number.isInteger(quantity) || quantity <= 0
    ) {
        return res.status(400).json({
            message: "Invalid or missing book details"
        });
    }

    if (books.some(book => String(book.id) === String(id))) {
        return res.status(409).json({
            message: "Book ID already exists"
        });
    }

    const book = {
        id,
        title,
        author,
        category,
        quantity,
        available: quantity
    };

    books.push(book);

    res.status(201).json({
        message: "Book added successfully",
        book
    });
});
// Task 3
app.get("/api/books", (req, res) => {

    if (books.length === 0) {
        return res.status(200).json({
            message: "No books available"
        });
    }

    res.status(200).json(books);
});

// Task 6
app.get("/api/books/search", (req, res) => {

    const query = req.query.query?.toLowerCase();

    if (!query) {
        return res.status(400).json({
            message: "Search query is required"
        });
    }

    const result = books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
    );

    res.status(200).json(result);
});

// Task 4
app.put("/api/books/:id", (req, res) => {

    const book = books.find(
        b => String(b.id) === req.params.id
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { id, title, author, category, quantity } = req.body || {};

    if (id !== undefined) {
        return res.status(400).json({
            message: "Book ID cannot be changed"
        });
    }

    if (
        [title, author, category].some(
            value => value !== undefined &&
            (typeof value !== "string" || !value.trim())
        ) ||
        (quantity !== undefined &&
            (!Number.isInteger(quantity) ||
             quantity <= 0 ||
             quantity < book.quantity - book.available))
    ) {
        return res.status(400).json({
            message: "Invalid book details"
        });
    }

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (category !== undefined) book.category = category;

    if (quantity !== undefined) {
        const issued = book.quantity - book.available;
        book.quantity = quantity;
        book.available = quantity - issued;
    }

    res.status(200).json({
        message: "Book updated successfully",
        book
    });
});

// Task 5
app.delete("/api/books/:id", (req, res) => {

    const index = books.findIndex(
        book => String(book.id) === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully"
    });
});

// Task 7
app.post("/api/books/:id/issue", (req, res) => {

    const book = books.find(
        b => String(b.id) === req.params.id
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (book.available <= 0) {
        return res.status(409).json({
            message: "No copies available"
        });
    }

    book.available--;

    res.status(200).json({
        message: "Book issued successfully",
        book
    });
});

// Task 7: Return a book
app.post("/api/books/:id/return", (req, res) => {

    const book = books.find(
        b => String(b.id) === req.params.id
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (book.available >= book.quantity) {
        return res.status(409).json({
            message: "All copies are already returned"
        });
    }

    book.available++;

    res.status(200).json({
        message: "Book returned successfully",
        book
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});