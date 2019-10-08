const express = require('express');
const bodyParser = require('body-parser');
const languageSelector = require("./language");
const app = express();

const DEFAULT_PORT = 8080;

const MAX = 100;
const MIN = 1;

const HTTP_CODES = {
    NOT_FOUND: 404,
    OK: 200
};

const GAME_CODES = {
    ERROR: -1,
    OK: 2000,
    WIN: 2000,
    LOWER: 2010,
    BIGGER: 2020,
    OVER: 2030,
    RUNNING: 2040
};

const LAN_KEY =  {
    NOT_STARTED:"NOT_STARTED",
    WIN:"WIN",
    LOWER:"LOWER",
    BIGGER:"BIGGER",
    OVER:"OVER",
    RUNNING:"RUNNING"
};

let pickedNumber = null;
let isOngoing = false;

let winner = undefined;
let uniqueUsers = new Set();


app.set('port', (process.env.PORT || DEFAULT_PORT));


app.use(express.static('public'));
app.use(bodyParser.json());
app.use(languageSelector());


app.get("/start/:user", function (req, response) {
    if (!isOngoing) {
        pickedNumber = Math.floor(Math.random() * (MAX - MIN)) + MIN;
        isOngoing = true;
        uniqueUsers.clear();
        uniqueUsers.add(req.params.user);
    }
    response.json({code: HTTP_CODES.OK, min: MIN, max: MAX, users: uniqueUsers.size});
});

app.post("/guess/:user/:number", (req, res) => {
    uniqueUsers.add(req.params.user);

    let responseObj = {code: GAME_CODES.ERROR, msg: req.language(LAN_KEY.NOT_STARTED)};
  
    if (pickedNumber) {
        if (isOngoing) {
            let guess = parseInt(req.params.number);

            if (guess === pickedNumber) {
                isOngoing = false;
                responseObj = {code: GAME_CODES.WIN, msg: req.language(LAN_KEY.WIN)};
                winner = req.params.user;
            } else if (guess < pickedNumber) {
                responseObj = {code: GAME_CODES.LOWER, msg: req.language(LAN_KEY.LOWER)};
            } else {
                responseObj = {code: GAME_CODES.BIGGER, msg: req.language(LAN_KEY.BIGGER)};
            }
        } else {
            responseObj = {code: GAME_CODES.OVER, msg: req.language(LAN_KEY.OVER), winner: winner, number: pickedNumber};
        }

        responseObj.users = uniqueUsers.size;

        res.json(responseObj);
    } else {
        res.status(HTTP_CODES.NOT_FOUND).json(responseObj);
    }
});

app.listen(app.get('port'), function () {
    console.log('server running', app.get('port'));
});