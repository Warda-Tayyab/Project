const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session');
let users = [];

// Check if a username already exists
const isValid = (username) => {
    return users.some((user) => user.username === username);
}

// Check if the username and password are valid (for login)
const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in: Username and password are required." });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: '1h' });
        // Store access token and username in session
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({ username, password });
            return res.status(201).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(409).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(400).json({ message: "Unable to register user." });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // ISBN can include hyphens
    const review = req.body.review;

    console.log("Received ISBN for review:", isbn); // Debugging

    if (req.session && req.session.authorization) {
        const username = req.session.authorization.username;

        if (books[isbn]) { // Check if the book exists
            books[isbn].reviews[username] = review;
            return res.status(200).json({ message: "Review successfully added/updated", book: books[isbn] });
        } else {
            console.log("Book not found in the database.");
            return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
        }
    } else {
        return res.status(403).json({ message: "User not authenticated." });
    }
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // ISBN can include hyphens

    console.log("Received ISBN for deletion:", isbn); // Debugging

    if (req.session && req.session.authorization) {
        const username = req.session.authorization.username;

        if (books[isbn]) {
            if (books[isbn].reviews[username]) {
                delete books[isbn].reviews[username];
                return res.status(200).json({ message: "Review successfully deleted", book: books[isbn] });
            } else {
                return res.status(404).json({ message: "No review found for this user on the specified book." });
            }
        } else {
            console.log("Book not found in the database.");
            return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
        }
    } else {
        return res.status(403).json({ message: "User not authenticated." });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
