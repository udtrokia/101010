const DOMAIN = 'http://odditypark.com'
const CLIENT_ID = '908381806969-c38r3v6otndeli259f07lv588l6k0u3v.apps.googleusercontent.com';
const CLIENT_SECRET = 'E11xsFZtW566weeJ4KkcEFx9';

/* GOOGLE API */
// db.close();
// Google login credentials, used when the user contacts
// Google, to tell them where he is trying to login to, and show
// that this domain is registered for this service. 
// Google will respond with a key we can use to retrieve profile
// information, packed into a redirect response that redirects to
// server162.site:[port]/auth/redirect
// 908381806969-c38r3v6otndeli259f07lv588l6k0u3v.apps.googleusercontent.com
// E11xsFZtW566weeJ4KkcEFx9
// const googleLoginData = {
//     clientID: '472036695689-s9n5kubr2kuqftbvk0ujl67i324njo3p.apps.googleusercontent.com',
//     clientSecret: 'W-edC3ifbkX9nxSDoNheWPca',
//     callbackURL: '/auth/redirect'
// };
const googleLoginData = {
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: `${DOMAIN}/auth/redirect`
};


/* MOCK CARDS */
let cards = [{
  seen: 0,
  correct: 0,
  answer: 'starting',
  riddle: 'What 8 letter word can have a letter taken away and it still makes a word. Take another letter away and it still makes a word. Keep on doing that until you have one letter left. What is the word?'
}, {
  seen: 0,
  correct: 0,
  answer: 'Racecar',
  riddle: 'What 7 letter word is spelled the same way backwards and forewards?'
}, {
  correct: 0,
  answer: 'NOON',
  riddle: 'What 4-letter word can be written forward, backward or upside down, and can still be read from left to right?'
}, {
  seen: 0,
  correct: 0,
  answer: 'SWIMS',
  riddle: 'What 5 letter word typed in all capital letters can be read the same upside down?'
}, {
  seen: 0,
  correct: 0,
  answer: 'Alphabet',
  riddle: 'What word contains all of the twenty six letters?'
}, {
  seen: 0,
  correct: 0,
  answer: 'Ton',
  riddle: 'Foward I am heavy, but backward I am not. What am I?',
}, {
  seen: 0,
  correct: 0,
  answer: 'Dozens',
  riddle: 'I am six letters. When you take one away I am twelve. What am I?'
}, {
  seen: 0,
  correct: 0,
  answer: 'Queue',
  riddle: 'What English word retains the same pronunciation, even after you take away four of its five letters?'
}, {
  seen: 0,
  correct: 0,
  answer: 'Heroine',
  riddle: 'There is a word in the English language in which the first two letters signify a male, the first three letters signify a female, the first four signify a great man, and the whole word, a great woman. What is the word?'
}];


// modules
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');

const GoogleStrategy = require('passport-google-oauth20');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('flipcard.db', createTable);

function insertCard(card) {
  // console.log(card)
  db.run(`INSERT INTO card (answer, riddle, seen, correct) VALUES ('${card.answer}', '${card.riddle}', '${card.seen}', '${card.correct}')`, err => {});
}

function createTable() {
  db.run("CREATE TABLE IF NOT EXISTS user(google_id text primary key, first_name text, last_name text, seen number, correct number)");
  db.run("CREATE TABLE IF NOT EXISTS card(answer text primary key, riddle text, seen number, correct number)", (err) => {
    cards.map(e => insertCard(e));
  });
  
}

function updateUser(id, arg) {
  db.all(`SELECT google_id FROM user where google_id = '${id}'`, (err, rows) => {
    if (rows.length === 0) {
      db.run(`INSERT INTO user (first_name, last_name, google_id) VALUES ('${arg.first_name}', '${arg.last_name}', '${id}')`);
    }
  });
}

// Strategy configuration. 
// Tell passport we will be using login with Google, and
// give it our data for registering us with Google.
// The gotProfile callback is for the server's HTTPS request
// to Google for the user's profile information.
// It will get used much later in the pipeline. 
passport.use( new GoogleStrategy(googleLoginData, gotProfile) );


// Let's build a server pipeline!

// app is the object that implements the express server
const app = express();

// pipeline stage that just echos url, for debugging
app.use('/', printURL);

// Check validity of cookies at the beginning of pipeline
// Will get cookies out of request, decrypt and check if 
// session is still going on. 
app.use(cookieSession({
  maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
  // meaningless random string used by encryption
  keys: ['hanger waldo mercy dance']  
}));

// Initializes request object for further handling by passport
app.use(passport.initialize()); 

// If there is a valid cookie, will call deserializeUser()
app.use(passport.session()); 

// Public static files
app.get('/*',express.static('public'));

// next, handler for url that starts login with Google.
// The app (in public/login.html) redirects to here (not an AJAX request!)
// Kicks off login process by telling Browser to redirect to
// Google. The object { scope: ['profile'] } says to ask Google
// for their user profile information.
app.get('/auth/google', passport.authenticate('google',{ scope: ['profile'] }));
// passport.authenticate sends off the 302 response
// with fancy redirect URL containing request for profile, and
// client ID string to identify this app. 

// Google redirects here after user successfully logs in
// This route has three handler functions, one run after the other. 
app.get('/auth/redirect',
  // for educational purposes
  function (req, res, next) {
    console.log("at auth/redirect");
    next();
  },
  // This will issue Server's own HTTPS request to Google
  // to access the user's profile information with the 
  // temporary key we got in the request. 
  passport.authenticate('google'),
  // then it will run the "gotProfile" callback function,
  // set up the cookie, call serialize, whose "done" 
  // will come back here to send back the response
  // ...with a cookie in it for the Browser! 
  function (req, res) {
    console.log('Logged in and using cookies!')
    res.redirect('/user/review.html');
  });

// static files in /user are only available after login
app.get('/user/*',
  isAuthenticated, // only pass on to following function if
  // user is logged in 
  // serving files that start with /user from here gets them from ./
  express.static('.') 
); 

// next, all queries (like translate or store or get...
app.get('/query', function (req, res) { res.send('HTTP query!') });

app.get('/userinfo', isAuthenticated, function(req, res) {
  res.json(req.user)
})

app.get('/cards', isAuthenticated, (req, res) => {
  db.all('SELECT * FROM card', (err, rows) => {
    res.send(rows)
  })
})

app.get('/update_seen', isAuthenticated, (req, res) => {
  let query = req.query;
  db.run(`UPDATE card SET seen = ${+ query.seen + 1} WHERE answer = '${query.answer}'`, (err, ret) => {
    console.log(err);
  })
})

app.get('/update_correct', isAuthenticated, (req, res) => {
  let query = req.query;
  db.run(`UPDATE card SET correct = ${+ query.correct + 1} WHERE answer = '${query.answer}'`, (err, ret) => {
    console.log(err);
  })  
})


// finally, not found...applies to everything
app.use( fileNotFound );

// Pipeline is ready. Start listening!  
app.listen(3000, '0.0.0.0');


// middleware functions

// print the url of incoming HTTP request
function printURL (req, res, next) {
  console.log(req.url);
  next();
}

// function to check whether user is logged when trying to access
// personal data
function isAuthenticated(req, res, next) {
  if (req.user) {
    console.log("Req.session:",req.session);
    console.log("Req.user:",req.user);
    next();
  } else {
    res.redirect('/login.html');  // send response telling
    // Browser to go to login page
  }
}


// function for end of server pipeline
function fileNotFound(req, res) {
  let url = req.url;
  res.type('text/plain');
  res.status(404);
  res.send('Cannot find '+url);
}

// Some functions Passport calls, that we can use to specialize.
// This is where we get to write our own code, not just boilerplate. 
// The callback "done" at the end of each one resumes Passport's
// internal process. 

// function called during login, the second time passport.authenticate
// is called (in /auth/redirect/),
// once we actually have the profile data from Google. 
function gotProfile(accessToken, refreshToken, profile, done) {
  console.log("Google profile",profile);

  updateUser(profile.id, {
    first_name: profile.name.givenName,
    last_name: profile.name.familyName
  })
  // here is a good place to check if user is in DB,
  // and to store him in DB if not already there. 
  // Second arg to "done" will be passed into serializeUser,
  // should be key to get user out of database.

  let dbRowID = profile.id;  // temporary! Should be the real unique
  // key for db Row for this user in DB table.
  // Note: cannot be zero, has to be something that evaluates to
  // True.  

  done(null, dbRowID); 
}

// Part of Server's sesssion set-up.  
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie. 
passport.serializeUser((dbRowID, done) => {
  console.log("SerializeUser. Input is",dbRowID);
  done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie. 
// Where we should lookup user database info. 
// Whatever we pass in the "done" callback becomes req.user
// and can be used by subsequent middleware.
passport.deserializeUser((dbRowID, done) => {
  console.log("deserializeUser. Input is:", dbRowID);
  // here is a good place to look up user data in database using
  // dbRowID. Put whatever you want into an object. It ends up
  // as the property "user" of the "req" object.
  let userData = {};
  db.all(`SELECT * FROM user WHERE google_id = '${dbRowID}'`, (err, rows) => {
    if (rows[0]) { userData = rows[0];} 
    done(null, userData);
  })
});
