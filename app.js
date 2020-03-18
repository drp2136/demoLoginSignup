'use strict';
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const Mongoose = require('mongoose');
const path = require('path');
// const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();
// const socketIo = require('socket.io');
// const swaggerUi = require('swagger-ui-express'); // NEW SWAGGER MODULE..

/** Import the router */
const indexRouter = require('./routes/index');

/* SET the APP object */
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// CORS configuration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,access-token, Host");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/health', (req, res) => { res.send({ message: "Yeah, its working fine now..", code: 200 }); });

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  console.log("err======app=====", err);
  if (err.error && err.error.isJoi) {
    res.status(400).json({
      type: err.type, // will be "query" here, but could be "headers", "body", or "params"
      message: err.error.toString()
    });
  } else {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || err.code || 500);
    res.send('error');
  }
});

let DbConnection = async () => {
  try {
    // Prepare connection
    Mongoose.connect(
      encodeURI('mongodb+srv://ranjan:ranjan@cluster0-ztb72.mongodb.net/test?retryWrites=true&w=majority'), {
      // reconnectTries: Number.MAX_VALUE,
      // reconnectInterval: 1000,
      useUnifiedTopology: true, // Deprecating warning.
      useNewUrlParser: true, // For - DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
      useCreateIndex: true, // For - DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead
    });

    // Connect
    let connectPromise = new Promise((resolve, reject) => {
      let db = Mongoose.connection;

      // Wait till connection is successful
      db.once('open', () => {
        console.log("Database connection successful.");
        resolve();
      })

      // Handle connection failure
      db.on('error', (error) => {
        console.error('Database connection error :' + error)
        reject();
      });
    });
    await connectPromise;
  } catch (e) {
    console.log(e);
  }
};
DbConnection();


module.exports = app;
