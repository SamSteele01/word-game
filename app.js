const express = require('express');
const mustache = require('mustache-express');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const issymbol = require('issymbol');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const image = "/hangman-stick-figure.png";
const image2 = "/hang-man.jpg";

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
let endGameMessage ="";
let endGameWin = [];
let endGameLose = [];

app.get('/', function(req, res){
  res.redirect('index');
})

app.get('/index', function(req, res){
  correctGuessedLetters = [];
  wrongGuessedLetters = [];
  letter = "";
  message = "";

  res.render('index', {image})
})

app.post('/setup', function(req, res){
  difficulty = req.body.gameDiff
  // get style - select file of pictures
  req.session.tries = 8;
  tries = req.session.tries;
  req.session.word = genWordByLength(difficulty);
  res.redirect('game');
})

// check for a win or lose - delay on redirect
app.get('/game', function(req,res) {
  if(req.session.tries===undefined){
    res.redirect('index');
  }else{
    if(tries===0){
      endGameMessage = "You lose."
      endGameLose.push("something")
      res.redirect('end');
    }else{
      wordObjectString = wordSmith(req.session.word, letter).join(" ");
      if(!wordObjectString.includes("_")){
        endGameMessage = "You win!!"
        endGameWin.push('eh');
        res.redirect('end');
      }else{
        // want to display "tries" as array of images
      res.render('game', {tries, theWord, wordObjectString, wrongGuessedLetters, message});
      }
    }
  }
})

app.post('/guess', function(req, res){
  // use validation to check for one letter, not numbers or symbols - return error
  letter = req.body.guessedLetter;
  req.checkBody('guessedLetter', 'Must be only one letter').len(1,1);
  req.checkBody('guessedLetter', 'Must be a letter').isAlpha();
  // req.checkBody('letter', 'Must not be a number').isNaN();
  // req.checkBody('letter', 'Must not be a symbol').issymbol();not
  req.getValidationResult().then(function(result){
    console.log(result.isEmpty);
    console.log(result.array);
    console.log(result.mapped);
    console.log(result.throw);
    message = result.throw;
  })
  res.redirect('game');
})

app.get('/end', function(req, res){
  if(endGameMessage===undefined||endGameMessage===""){
    res.redirect('index');
  }else{
    res.render('end', {endGameMessage, endGameWin, endGameLose, tries, difficulty, theWord, image2});
  }
})

let name = "";
app.post('/name', function(req, res){
  name = req.body.name;
  endGameMessage = "High scores page comming soon!"
  // need to make .json file to hold high scores & pictures
  res.redirect('end');
 })

 app.post('/restart', function(req, res){
    res.redirect('index');
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
    sizeMax = 12;
  }
  if(difficulty==="xhard"){
    sizeMin = 12;
    sizeMax = 20;
  }
  if(difficulty==="nightmare"){
    sizeMin = 20;
    sizeMax = 40;
  }
  // want xhard and nightmare modes
  theWord = words[Math.floor(Math.random() * words.length)];
  while(theWord.length<=sizeMin||theWord.length>=sizeMax){
    theWord = words[Math.floor(Math.random() * words.length)];
  }
  return theWord;
}

function wordSmith(word, char){
  let theWordArray = Array.from(word);
  let theModWordArray = [];
  if(char!=""){
    if(theWordArray.includes(char)&&!correctGuessedLetters.includes(char)){
      correctGuessedLetters.push(char);
      message = "";
    }else{
      if(wrongGuessedLetters.includes(" "+char)||correctGuessedLetters.includes(char)){
        message = "You already tried that letter, you idiot!";
      }
      else{
        message = "";
        wrongGuessedLetters.push(" "+char);
        char = "";
        tries -= 1;
      }
    }
    console.log(correctGuessedLetters.length);
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
