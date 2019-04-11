import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import express from 'express'
import passport from 'passport'
import session from 'express-session'
import cors from 'cors'
import uuid from 'uuid/v4'
var path = require('path');
var serveStatic = require('serve-static');
import './auth'
import {MongoClient} from 'mongodb';
import * as log from './utils/logging.js';

import {default as routes, setDb} from './routes'

const PORT = process.env.PORT || 3000
const SECRET = process.env.SECRET || 'TR7_9cDZ5Re-@lT3Z1|58F'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080'

 process.env.NODE_ENV === 'production';
const corsOptions = {
  origin: CLIENT_ORIGIN,
  credentials: true,
}
let db;
MongoClient.connect('mongodb://localhost/tax', {useNewUrlParser: true}).then(connection => {
  console.log('connection: ', connection)
  db = connection.db('tax')
  const app = express()

  app.use(cors(corsOptions))

  app.use(cookieParser(SECRET))

  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  log.debug(` >>> to2  ${__dirname}  /dist`)
  app.use(serveStatic(__dirname + "/../dist"));
  //app.use(express.static(__dirname + "/../dist"));
  app.use(session({
    genid: () => uuid(),
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 3 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    },
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  routes(app)
  setDb(db)
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
    console.log(` ${process.env.NODE_ENV}`)
  })
}).catch(error => {
  console.log('ERROR:', error);
})
