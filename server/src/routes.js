import passport from 'passport'
import {initData} from './providers'
import * as Users from './connectors/users'
import * as Questions from './connectors/questions'
import * as Tickets from './connectors/tickets'
import txn from './txn'
import {debug }from './utils/logging'
import { ObjectId } from 'mongodb';

let db;
initData()


function privateRoute(req, res, next) {
  if (!req.user) {
    res.status(403).send('Unauthorized')
  } else {
    next()
  }
}

function sendUserInfo(req, res) {
  res.json({
    _id: req.user._id,
    username: req.user.username,
  })
}

let collection

export function setDb(newDb) {
  db = newDb;
  collection = db.collection('txns')


  console.log('db:', db)
}

export default function (app) {
  app.get('/questions', async (req, res) => {
    const result = await Questions.getAll()
    setTimeout(() => {
      res.json(result)
    }, 1500)
  })

  app.post('/signup', async (req, res) => {
    try {
      if (req.user) {
        throw Error('Unauthorized')
      } else {
        const newDoc = await Users.createUser({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        })
        res.json({status: 'ok'})
      }
    } catch (e) {
      res.status(403).send(e.message)
    }
  })

  app.post('/login', (req, res, next) => {
    if (req.user) {
      res.status(403).send('Unauthorized')
    } else {
      next()
    }
  }, passport.authenticate('local', {
    failWithError: true,
  }), (req, res) => {
    sendUserInfo(req, res)
  }, (err, req, res, next) => {
    res.status(403).send(err)
  })

  app.get('/user', (req, res) => {
    if (!req.user) {
      res.send('null')
    } else {
      sendUserInfo(req, res)
    }
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.json({status: 'ok'})
  })

  app.get('/report', privateRoute, async (req, res) => {
    const result = await Tickets.getAll({
      user: req.user,
    })
    res.json(result)
  })

  app.post('/accounts/new', privateRoute, async (req, res) => {
    const result = await Tickets.create({
      user: req.user,
    }, req.body)
    res.json(result)
  })

  app.get('/account/:id', privateRoute, async (req, res) => {
    const result = await Tickets.getById({
      user: req.user,
    }, req.params.id)
    res.json(result)
  })
app.get('/txns', (req, res) => {
  const filter = {};
  if (req.query.symbol) filter.symbol = req.query.symbol;
  //if (req.query.effort_lte || req.query.effort_gte) filter.effort = {};
  //if (req.query.effort_lte) filter.effort.$lte = parseInt(req.query.effort_lte, 10);
  //if (req.query.effort_gte) filter.effort.$gte = parseInt(req.query.effort_gte, 10);
  //if (req.query.search) filter.$text = { $search: req.query.search };

  if (req.query._summary === undefined) {
    const offset = req.query._offset ? parseInt(req.query._offset, 10) : 0;
    let limit = req.query._limit ? parseInt(req.query._limit, 10) : 50;
    if (limit > 50) limit = 50;

    const cursor = db.collection('txns').find(filter).sort({ _id: 1 })
    .skip(offset)
    .limit(limit);

    let totalCount;
    cursor.count(false).then(result => {
      totalCount = result;
      return cursor.toArray();
    })
    .then(txns => {
      res.json({ metadata: { totalCount }, records: txns });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
  } else {
    db.collection('txns').aggregate([
      { $match: filter },
      { $group: { _id: { owner: '$owner', status: '$status' }, count: { $sum: 1 } } },
    ]).toArray()
    .then(results => {
      const stats = {};
      results.forEach(result => {
        if (!stats[result._id.owner]) stats[result._id.owner] = {};
        stats[result._id.owner][result._id.status] = result.count;
      });
      res.json(stats);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
  }
});
// acct
app.post('/txns/new', privateRoute, (req, res) => {
  debug('new ', req.body);
  const newTxn = req.body;
  const err = txn.validateTxn(newTxn);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('txns').insertOne(txn.cleanupTxn(newTxn)).then(result => {
      debug('insert result', result.result)
      debug('insert result', result.insertedId)
      // let ret = db.collection('txns').find().toArray()
    // debug('ret: ',ret)
    //db.collection('txns').find({_id:'5bf376243a58e9036908469c'}).limit(1)
      let ret = db.collection('txns').find({ _id: result.insertedId }).limit(1).next()
    return ret
    }
  )
  .then(savedTxn => {
      debug('------------------insert saved result', savedTxn)
    res.json(savedTxn);
  })
  .catch(error => {
    debug('insert error ', error)
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});
app.get('/txn/:id',privateRoute ,(req, res) => {
      debug('get ', req.params.id)
  let txnId;
  try {
    txnId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid Transaction ID format: ${error}` });
    return;
  }

  db.collection('txns').find({ _id: txnId }).limit(1)
  .next()
  .then(txn => {
    if (!txn) res.status(404).json({ message: `No such Transaction: ${txnId}` });
    else res.json(txn);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});
app.put('/txn/:id',privateRoute,  (req, res) => {
  let txnId;
  try {
    txnId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid Transaction ID format: ${error}` });
    return;
  }

  const txn = req.body;
  delete txn._id;

  const err = txn.validateTxn(txn);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('txns').updateOne({ _id: txnId }, txn.convertTxn(txn)).then(() =>
    db.collection('txns').find({ _id: txnId }).limit(1)
    .next()
  )
  .then(savedTxn => {
    res.json(savedTxn);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.delete('/txns/:id', privateRoute, (req, res) => {
  let txnId;
  try {
    txnId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid Transaction ID format: ${error}` });
    return;
  }

  db.collection('txns').deleteOne({ _id: txnId }).then((deleteResult) => {
    if (deleteResult.result.n === 1) res.json({ status: 'ok' });
    else res.json({ status: 'Warning: object not found' });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

}

