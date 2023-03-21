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
  cookie: { maxAge: 86400000 }, // max age 30 seconds
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

// END OF FOR SESSIONS AND PASSPORT


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


// ADDED TO WORK ON LUIE'S LAPTOP
// app.listen(3000, () => {
//   console.log('Server is running on Port 3000');
// });