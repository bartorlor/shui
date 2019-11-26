import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import dotenv from 'dotenv';
import express from 'express'
import passport from 'passport'
import session from 'express-session'
import SourceMapSupport from 'source-map-support';
import cors from 'cors'
import uuid from 'uuid/v4'
var path = require('path');
var serveStatic = require('serve-static');
import './auth'
import {MongoClient} from 'mongodb';
import * as log from './utils/logging.js';
import {default as routes, setDb} from './routes'
import Nav from '../browser/components/NavMenu.vue'

const PORT = process.env.PORT || 3000
const SECRET = process.env.SECRET || 'TR7_9cDZ5Re-@lT3Z1|58F'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080'

SourceMapSupport.install();
dotenv.config();
const enableHMR = (process.env.ENABLE_HMR || 'true') === 'true';

const corsOptions = {
  origin: CLIENT_ORIGIN,
  credentials: true,
}
let db;

const url = process.env.DB_URL || 'mongodb://localhost/tax';
  console.log('url: ', url)
  console.log('port: ', PORT)
MongoClient.connect(url, {useNewUrlParser: true}).then(connection => {
  db = connection.db('tax')
  const app = express()

  app.use(cors(corsOptions))

  app.use(cookieParser(SECRET))

  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  log.debug(` >>> to2  ${__dirname}  /dist`)
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
    if (enableHMR && (process.env.NODE_ENV !== 'production')) {
      console.log('Adding dev middlware, enabling HMR');
      /* eslint "global-require": "off" */
      /* eslint "import/no-extraneous-dependencies": "off" */
      const webpack = require('webpack');
      const devMiddleware = require('webpack-dev-middleware');
      const hotMiddleware = require('webpack-hot-middleware');

      const config = require('../webpack.config.js')[0];
      config.entry.app.push('webpack-hot-middleware/client');
      config.plugins = config.plugins || [];
      config.plugins.push(new webpack.HotModuleReplacementPlugin());

      const compiler = webpack(config);
      app.use(devMiddleware(compiler));
      app.use(hotMiddleware(compiler));
    }
  app.use(express.static('public'));


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
