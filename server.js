const express = require("express");
const uuid = require("uuid");
const server = express();

server.use(express.json());
server.use(express.static("public"));
let activeSessions = {};
async function chooseWordAPI() {

}

server.get("/newgame", (req, res) => {
  let setWord = req.query.answer;
  const defaultWord = "apple" ;
  const isGameOver = false;

  setWord = setWord && setWord.length === 5 ? setWord : defaultWord;

  const sessionId = uuid.v4();
  activeSessions[sessionId] = {
    wordToGuess: setWord,
    guesses: [],
    wrongLetters: [],
    closeLetters: [],
    rightLetters: [],
    remainingGuesses: 6,
    gameOver: isGameOver,
  };

  res.status(201).send({ sessionID: sessionId });
});

server.get("/gamestate", (req, res) => {
  const sessionId = req.query.sessionID;

  if (!sessionId) {
    res.status(400).send({ error: "id is missing" });
  } else if (activeSessions[sessionId]) {
    res.status(200).send({ gameState: activeSessions[sessionId] });
  } else {
    res.status(404).send({ error: "game doesn't exist" });
  }
});

server.post("/guess", (req, res) => {
    const ID = req.body.sessionID;
    const guess = req.body.guess;

    if (!ID) {
        res.status(400).send({ error: "id is missing" });
        return;
    }

    const game = activeSessions[ID];
    if (!game) {
        res.status(404).send({ error: "game doesn't exist" });
        return;
    }

    const guessCheck = guess.split("");
    if (guessCheck.length !== 5) {
        res.status(400).send({ error: "guess is not 5 letters long" });
        return;
    }

    const word = game.wordToGuess.split("");
    const guessArr = [];
    game.remainingGuesses -= 1;

    if (guess === game.wordToGuess) {
        game.gameOver = true;
        game.rightLetters = guessCheck;
    } else {
        for (let i = 0; i < guessCheck.length; i++) {
            const guessLetter = guessCheck[i].toLowerCase();

            if (guessLetter.toLowerCase() === guessLetter.toUpperCase()) {
                res.status(400).send({ error: "guess contains a number or a special character" });
                return;
            }

            const guessObj = { value: guessLetter };
            let included = false;

            for (let j = 0; j < word.length; j++) {
                if (word[j] === guessLetter) {
                    if (j === i) {
                        if (game.closeLetters.includes(guessLetter)) {
                            game.closeLetters.splice(game.closeLetters.indexOf(guessLetter), 1);
                        }
                        if (game.rightLetters.includes(guessLetter)) {
                            game.rightLetters.splice(game.rightLetters.indexOf(guessLetter), 1);
                        }
                        game.rightLetters.push(guessLetter);
                        guessObj.result = "RIGHT";
                    } else {
                        if (!game.closeLetters.includes(guessLetter)) {
                            game.closeLetters.push(guessLetter);
                        }
                        guessObj.result = "CLOSE";
                    }
                    included = true;
                    break;
                }
            }

            if (!included) {
                game.wrongLetters.push(guessLetter);
                guessObj.result = "WRONG";
            }

            guessArr.push(guessObj);
        }
    }

    if (game.remainingGuesses === 0) {
        game.gameOver = true;
    }

    game.guesses.push(guessArr);
    res.status(201).send({ gameState: game });
});


  
  // Do not remove this line. This allows the test suite to start multiple instances of your server on different ports
  module.exports = server;
  