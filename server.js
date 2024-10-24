const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))

let activeSessions={}
server.get("/newgame", (req,res)=>{
    let setWord = req.query.answer
    let generated="apple"
    let over=false
    if(!setWord||setWord.length!=5){
        setWord=generated
    }
    let newID = uuid.v4()
    let newGame = {
        wordToGuess: setWord,
        guesses:[],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: over,
    }
    activeSessions[newID] = newGame
    res.status(201)
    res.send({sessionID: newID})
})


server.get("/gamestate", (req,res)=>{
    let ID= req.query.sessionID
    if(!ID){
        res.status(400)
        res.send({error: "id is missing"})
    }else{
        if(activeSessions[ID]){
            res.status(200)
            res.send({gameState: activeSessions[ID]})
        }else{
            res.status(404)
            res.send({error: "game doesn't exist"})
        }
    }
})

server.post("/guess", (req, res) => {
    let sessionID = req.body.sessionID;
    let userGuess = req.body.guess;

    if (!sessionID) {
        return res.status(400).json({ error: "Session ID is missing" });
    }

    if (activeSessions[sessionID]) {
        let game = activeSessions[sessionID];
        let guessLetters = userGuess.split("");

        if (guessLetters.length !== 5) {
            return res.status(400).json({ error: "Guess must be exactly 5 letters long" });
        }

        let wordToGuess = game.wordToGuess.split("");
        let guessResults = [];
        game.remainingGuesses--;

        if (userGuess === game.wordToGuess) {
            game.gameOver = true;
            game.rightLetters = guessLetters;
        } else {
            for (let i = 0; i < guessLetters.length; i++) {
                let letter = guessLetters[i].toLowerCase();

                if (!letter.match(/[a-z]/)) {
                    return res.status(400).json({ error: "Guess contains invalid characters" });
                }

                let guessDetail = { value: letter };
                let found = false;

                for (let j = 0; j < wordToGuess.length; j++) {
                    if (wordToGuess[j] === letter) {
                        if (i === j) {
                            if (game.closeLetters.includes(letter)) {
                                let index = game.closeLetters.indexOf(letter);
                                game.closeLetters.splice(index, 1);
                            }
                            game.rightLetters.push(letter);
                            guessDetail.result = "RIGHT";
                        } else {
                            if (!game.closeLetters.includes(letter)) {
                                game.closeLetters.push(letter);
                            }
                            guessDetail.result = "CLOSE";
                        }
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    game.wrongLetters.push(letter);
                    guessDetail.result = "WRONG";
                }

                guessResults.push(guessDetail);
            }
        }

        if (game.remainingGuesses === 0) {
            game.gameOver = true;
        }

        game.guesses.push(guessResults);
        return res.status(201).json({ gameState: game });
    } else {
        return res.status(404).json({ error: "Game does not exist" });
    }
});


//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;