# Library Management System

## Student details

- **Student name:** Adarsh Yadav
- **Roll number:** 2500320100064
- **Branch:** CSE
- **Section:** 11

## Problem statement

Develop a library management REST API using Node.js and Express.js. The application allows users to add, view, update, delete, and search books, and to issue or return book copies.

## Technologies used

- Node.js
- Express.js
- JavaScript
- In-memory JavaScript array for data storage (no database)

## Installation and instructions

1. Install [Node.js](https://nodejs.org/).
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server on port 3000:

   ```bash
   npm start
   ```

The API is available at `http://localhost:3000`. Data is stored in memory and resets when the server stops.

## API endpoints

All request and response bodies use JSON. For POST and PUT requests, send the `Content-Type: application/json` header.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/books` | Add a book. Requires `title`, `author`, `genre`, `publishedYear`, and `totalCopies`. |
| `GET` | `/api/books` | Retrieve all books; returns an empty collection message when there are no books. |
| `GET` | `/api/books/:id` | Retrieve one book by its numeric ID. |
| `PUT` | `/api/books/:id` | Update one or more provided book fields. |
| `DELETE` | `/api/books/:id` | Delete a book if none of its copies are issued. |
| `GET` | `/api/books/search?query=term` | Search book titles, authors, and genres (case-insensitive). |
| `POST` | `/api/books/:id/issue` | Issue one copy, or a requested number of copies using `{ "copies": 2 }`. |
| `POST` | `/api/books/:id/return` | Return one issued copy, or a requested number using `{ "copies": 2 }`. |

### Example: add a book

```json
{
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy",
  "publishedYear": 1937,
  "totalCopies": 5
}
```

Each book includes `issuedCopies` and `availableCopies`. Invalid input returns `400`, missing books return `404`, and unavailable copies or invalid issue/return operations return `409`.