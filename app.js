var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//Init app
var app = express();

var server = require('http').Server(app)
var io = require('socket.io')(server);

//Lay duong dan cac router
var index = require('./routes/index');
var farmer = require('./routes/farmer');
var manager = require('./routes/manager');
var admin = require('./routes/admin');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Loger Middleware
app.use(logger('dev'));

//Bodyparser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));
//Set port
app.set('port',process.env.PORT||80);

//Express session
app.use(session({
	secret:'secret',
	saveUninitialized: true,
	resave:true
}));

//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Express validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
    	var namespace = param.split('.')
     	,root    = namespace.shift()
      	, formParam = root;

		while(namespace.length) {
		  formParam += '[' + namespace.shift() + ']';
		}
		return {
		  param : formParam,
		  msg   : msg,
		  value : value
		};
	}
}));

//Connect flash
app.use(flash());

//Global vars
app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

//Dinh vi toi tap tin router
app.use('/', index);
app.use('/nongdan', farmer);
app.use('/quanly',manager);
app.use('/nguoiquantri',admin);

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

//Start server
server.listen(app.get('port'),function(){
	console.log('Server started on http://localhost:' + app.get('port'));
});

module.exports = app;
