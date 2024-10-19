const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const userPromise = new Promise((resolve, reject) => {
        if (isValid(username)) {
            reject({ status: 409, message: "User already exists." });
        } else {
            users.push({ username, password });
            resolve({ status: 200, message: "User successfully registered. You can now login." });
        }
    });

    userPromise
        .then(response => res.status(response.status).json({ message: response.message }))
        .catch(error => res.status(error.status).json({ message: error.message }));
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    const booksPromise = new Promise((resolve) => {
        resolve(books);
    });

    booksPromise
        .then(bookList => res.status(200).json(bookList));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    const findBookByISBN = new Promise((resolve, reject) => {
        const foundBook = Object.values(books).find(book => book.isbn === isbn);
        if (foundBook) {
            resolve(foundBook);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found.` });
        }
    });

    findBookByISBN
        .then(book => res.status(200).json(book))
        .catch(error => res.status(error.status).json({ message: error.message }));
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;

    const findBooksByAuthor = new Promise((resolve, reject) => {
        let booksByAuthor = Object.values(books).filter(book => book.author === author);
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject({ status: 404, message: `No books found by author ${author}.` });
        }
    });

    findBooksByAuthor
        .then(booksByAuthor => res.status(200).json(booksByAuthor))
        .catch(error => res.status(error.status).json({ message: error.message }));
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase().trim();

    const findBooksByTitle = new Promise((resolve, reject) => {
        let booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject({ status: 404, message: `No books found with title containing "${req.params.title}".` });
        }
    });

    findBooksByTitle
        .then(booksByTitle => res.status(200).json(booksByTitle))
        .catch(error => res.status(error.status).json({ message: error.message }));
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    const findReviewsByISBN = new Promise((resolve, reject) => {
        const foundBook = Object.values(books).find(book => book.isbn === isbn);
        if (foundBook) {
            resolve(foundBook.reviews);
        } else {
            reject({ status: 404, message: `No reviews found for book with ISBN ${isbn}.` });
        }
    });

    findReviewsByISBN
        .then(reviews => res.status(200).json(reviews))
        .catch(error => res.status(error.status).json({ message: error.message }));
});

module.exports.general = public_users;
