var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var recipesRouter = require('./routes/recipes');
var usersRouter = require('./routes/users')

var app = express();
const cors = require('cors');
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// FOR SESSIONS AND PASSPORT

// install and require express-session to handle generating session ids and signing session ids with cookies
var session = require('express-session');

// install and require passport for authentication and passport local for username and passport strategy
const passport = require('passport');
const local = require('./strategies/local');

// use a store for sessions
const store = new session.MemoryStore();

// register session middleware
// pass in object
// takes in secret (used to sign the session id cookie)
// and cookie property
app.use(session({
  secret: 'some secret',
  cookie: { maxAge: 30000 }, // max age 30 seconds
  saveUninitialized: false, // necessary for log in system, otherwise a new session id will be generated every time a request is made to server
  store // set up a new store
}));

app.use((req, res, next) => {
  console.log(store); // print out store every time a request is made
  console.log(`'${req.method}'-'${req.url}'`);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// app.use('/auth', authRoute);


// Every time user makes a request, want to validate cookie and make sure the cookie actually exists
// next is a function to be invoked
function validateCookie(req, res, next) {
  // get the cookie
  const{cookies} = req;
  console.log(cookies);
  if ( 'session_id' in cookies ) {
      // i.e. client sent a cookie to the server
      console.log( 'session id exists' );
      // need to ensure cookie is actually valid otherwise vulnerability e.g. to act as other accounts
      if ( cookies.session_id === '123456') next();
      else res.status(403).send({msg: "Not authenticated"});
  }   
  else res.status(403).send({msg: "Not authenticated"});
}

// Creates a cookie which lives on the client side
// mount validate middleware function to sign in route
// sign in route should be a post request
app.get('/signin', (req, res) => {
  res.cookie('session_id', '123456');
  res.status(200).json({msg: 'Logged In.'})
});

// Visit 'protected' route
app.get('/protected', validateCookie, (req, res) => {
  res.status(200).json({msg: 'You are authorised'});
});

app.post('/loginTest', (req, res) => {
  console.log(req.sessionID)
  const { username, password } = req.body;
  if (username && password) {
      if (req.session.authenticated) {
          res.json(req.session);
      } else {
          if (password == '123')  {
              req.session.authenticated = true;
              req.session.user = {
                  username, password
              };
              res.json(req.session);
          } else {
              res.status(403).json({msg: 'Bad Credentials'});
          }
      }
  } else res.status(403).json({msg: 'Bad Credentials'});
});

// whenever log in, send back cookie
// cookie = unique id that server generates
// generate unique session id to be saved on server - shouldn't be easy to guess or cookies could just be sent to server as if logging in
// every time a request is made to the app., check session id is valid
// cookie sent back, stored on client, can be sent back to server to access protected routes

// sessions allow maintenace of the state of http requests 
// sessions live on server
// cookies live on client side

// main use of sessions: don't want to save any sensitive data like passwords as a cookie on the client
// should be saved on db so session knows which user is making request
// so sessions are more secure because they are stored on the server rather than having everything stored on client


// END OF SESSIONS AND PASSPORT


// SQL STUFF -------------------------------------------------
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
//------------------------------------------------------------

app.use('/', indexRouter);
app.use('/recipes', recipesRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
