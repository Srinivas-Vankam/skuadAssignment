var express = require('express');
var cors = require('cors')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config= require('./config');

//cookie and sessions
var session = require('express-session');

var index = require('./routes/index');
var geoRouter = require('./routes/geoRouter');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connection URL
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    /* other options s*/
  });

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//cookie session
//app.use(cookieParser('12345-67890-09876-54321'));

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false
}));

// Basic auth ---------------------
// function auth(req,res,next){
//   var authHeader = req.headers.authorization;
//   if(!authHeader){
//     var err= new Error('not authorized')
//     res.setHeader('WWW-Authenticate','Basic')
//     err.status = 401;
//     return next(err)
//   }
//   var auth = new Buffer(authHeader.split(' ')[1],'base64').toString().split(':');
//   if(auth[0]=== 'admin'&& auth[1]==='password'){
//     next();
//   }
//   else{
//     var err= new Error('not authorized')
//     res.setHeader('WWW-Authenticate','Basic')
//     err.status = 401;
//     return next(err)
//   }
// }

app.use('/', index);
app.use('/geocount',geoRouter);

// cookie and sessions
// function auth(req,res,next){
//   if(!req.session.user){
//     var authHeader = req.headers.authorization;

//     if(!authHeader){
//       var err= new Error('not authorized')
//       res.setHeader('WWW-Authenticate','Basic')
//       err.status = 401;
//       return next(err)
//     }
//     var auth = new Buffer(authHeader.split(' ')[1],'base64').toString().split(':');
//     if(auth[0]=== 'admin'&& auth[1]==='password'){
//       req.session.user = 'admin'
//       next();
//     }
//     else{
//       if(req.session.user === 'admin'){
//         next()
//       }
//       else{
//         var err= new Error('not authorized')
//         err.status = 401;
//         return next(err)
//       }
//     }
//   }
// }

function auth(req,res,next){
  if(!req.session.user){
      var err= new Error('not authorized')
      err.status = 401;
      return next(err)
  }
  else{
      if(req.session.user === 'authenticated'){
        next()
      }
      else{
        var err= new Error('not authorized')
        err.status = 403;
        return next(err)
      }
    }
}

app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
