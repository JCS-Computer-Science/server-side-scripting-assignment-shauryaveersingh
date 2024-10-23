const express = require("express");
const uuid = require("uuid");
const server = express();
server.use(express.json());

let activeSessions = {};

// Utility function to get a random word (placeholder logic for now)
const getRandomWord = () => {
    const words = ["apple", "phase", "grape", "plane", "bread"];
    return words[Math.floor(Math.random() * words.length)];
};

// Helper to initialize a new game state
const initializeGameState = (wordToGuess) => {
    const word = wordToGuess || getRandomWord();
    return {
        wordToGuess: word,
        guesses: [],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
    };
};



// Do not remove this line. This allows the test suite to start
// multiple instances of your server on different ports
module.exports = server;
