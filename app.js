const express = require('express');
const mustache = require('mustache-express');
const session = require('express-session');
// const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const fs = require('fs');
// const parseurl = require('parseurl')
const path = require('path');
const app = express();
const port = 3000;
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
// const User = require('./users.js');

app.engine('mustache', mustache());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(express.static(__dirname+'/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(expressValidator());

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

app.get('/', function(req, res){
  req.session.word = words[Math.floor(Math.random() * words.length)];
  req.session.tries = 8;
  tries = req.session.tries;
  theWord = req.session.word;
  wordObjectString = wordSmith(req.session.word, "").join(" ");
  res.render('index', {tries, theWord, wordObjectString});
})

app.get('/index', function(req,res) {
  // req.session.tries = tries;
  wordObjectString = wordSmith(req.session.word, letter).join(" ");
  res.render('index', {tries, theWord, wordObjectString, wrongGuessedLetters});
})

app.post('/guess', function(req, res){
  letter = req.body.guessedLetter;
  res.redirect('/index');
})

function wordSmith(word, char){
  // also returns wrongGuessedchars as a comma seperated string ("r,e,p,q")
  let theWordArray = Array.from(word);
  let theModWordArray = [];
  if(char!=""){
    if(theWordArray.includes(char)){
      correctGuessedLetters.push(char);
    }else{
      wrongGuessedLetters.push(" "+char);
      console.log(wrongGuessedLetters);
      char = "";
      tries -= 1;
    }
  }
  // make that letter display
  // for letters in correctGuessedLetters{check against each index in theWordArray}
  theWordArray.forEach(function callback(currentValue, index, array) {
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
