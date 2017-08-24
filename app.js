const express = require('express');
const mustache = require('mustache-express');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

app.engine('mustache', mustache());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(express.static(__dirname+'/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

let wrongGuessedLetters = [];
let correctGuessedLetters = [];
let tries = 0;
let theWord = "";
let wordObjectString = "";
let letter = "";
let message = "";
let difficulty = "";

app.get('/', function(req, res){
  // want to get difficulty selection (in a post?) - sets word length: 4-6, 6-8, 8+
  // '/' should be a setup page
  res.redirect('/index');
})

app.get('/index', function(req, res){
  correctGuessedLetters = [];
  wrongGuessedLetters = [];
  letter = "";
  message = "";
  res.render('index')
})

app.post('/setup', function(req, res){
  difficulty = req.body.gameDiff
  req.session.tries = 8;
  tries = req.session.tries;
  req.session.word = genWordByLength(difficulty);
  res.redirect('game');
})

app.get('/game', function(req,res) {
  if(req.session.tries===undefined){
    res.redirect('/index');
  }else{
  wordObjectString = wordSmith(req.session.word, letter).join(" ");
  res.render('game', {tries, theWord, wordObjectString, wrongGuessedLetters, message});
  }
})

app.post('/guess', function(req, res){
  // use validation to check for one letter - return error
  letter = req.body.guessedLetter;
  res.redirect('/game');
})

function genWordByLength(difficulty){
  let sizeMin = 0;
  let sizeMax = 0;
  if(difficulty==="easy"){
    sizeMin = 4;
    sizeMax = 6;
  }
  if(difficulty==="normal"){
    sizeMin = 6;
    sizeMax = 8;
  }
  if(difficulty==="hard"){
    sizeMin = 8;
    sizeMax = 40;
  }
  theWord = words[Math.floor(Math.random() * words.length)];
  while(theWord.length<sizeMin||theWord.length>sizeMax){
    theWord = words[Math.floor(Math.random() * words.length)];
  }
  return theWord;
}

function wordSmith(word, char){
  let theWordArray = Array.from(word);
  let theModWordArray = [];
  if(char!=""){
    if(theWordArray.includes(char)){
      correctGuessedLetters.push(char);
    }else{
      if(wrongGuessedLetters.includes(" "+char)){
        message = "You already tried that letter. You are wasting tries, you idiot!";
      }
      else{
        message = "";
      }
      wrongGuessedLetters.push(" "+char);
      char = "";
      tries -= 1;
    }
  }

  theWordArray.forEach(function(currentValue) {
    if(correctGuessedLetters.includes(currentValue)){
      theModWordArray.push(currentValue);
    }
    else{
      theModWordArray.push("_");
    }
  });
  return theModWordArray;
}

  app.listen(port, function() {
    console.log('Example listening on port 3000')
  })
