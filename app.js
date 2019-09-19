var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose=require('mongoose')
var jwt=require('jsonwebtoken')
var key=require('./src/routes/key')
var User=require('./src/models/user')
var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/users');
var recomendationsRouter = require('./src/routes/recomendations');

var app = express();
app.locals.moment=require('moment')
app.locals.moment.locale('es', {
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
  weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sábado'.split('_'),
  weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_'),
});
//connection to Mongo
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mymiracle'
mongoose.connect(url, { useNewUrlParser: true })
  .then(db => console.log(' DB connected'))
  .catch(err => console.log(err.message))
//con
// view engine setup
app.set('views', path.join(__dirname,'src', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/version', (req, res) => {
  res.json({ version: 4 });
});

//middleWare jwt
app.use(function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1]
    jwt.verify(token, key.tokenKey, function (err, payload) {
      if (payload) {
        User.findById(payload.userId).then(
          (doc) => {
            req.user = doc;
            next()
          }
        )
      } else {
        next()
      }
    })
  } catch (e) {
    console.log(e.message)
    next()
  }
})
//middleWarejwt

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/recomendations', recomendationsRouter);

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
