var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var validationRouter = require('./routes/validation_controller');
var blockRouter = require('./routes/blockchain_controller');
var starsRouter = require('./routes/star_controller');
var usersRouter = require('./routes/users');
var mvcGatewayRouter = require('./routes/mvc_gateway');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// app.set('port', process.env.PORT || 8000);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// Using custom URLs to be consistent
app.use('/validation', validationRouter);
app.use('/block', blockRouter);
app.use('/stars', starsRouter);
app.use('/users', usersRouter);
app.use('/gateway', mvcGatewayRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  console.log('Invoking error handler');
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.send({
    'code': '500',
    'status': 'Internal Server Error',
    'message': `${err}`
  });
});

module.exports = app;
