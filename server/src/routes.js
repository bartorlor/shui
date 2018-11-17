import passport from 'passport'
import {initData} from './providers'
import * as Users from './connectors/users'
import * as Questions from './connectors/questions'
import * as Tickets from './connectors/tickets'

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
  insert()
  insertMany()
}

function insert() {
  let newtxn = {id: 1, name: 'sean',}
  collection.insertOne(newtxn).then(result =>
    collection.find({_id: result.insertedId}).limit(1)
    .next()
  )
  .then(savedtxn => {
    console.log('first txn:', savedtxn)
  })
  .catch(error => {
    console.log(error);
  })
}

function insertMany() {
  collection.insertMany([
    {item: "card", qty: 15},
    {item: "envelope", qty: 20},
    {item: "stamps", qty: 30}
  ]).then(result => {
    collection.find({_id: result.insertedIds}).limit(1).next()
    console.log('1 ', result)
  })
  .then(savedtxns => {
    console.log('new txns:', savedtxns)
  })
  .catch(error => {
    console.log(error);
  })
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

  app.get('/tickets', privateRoute, async (req, res) => {
    const result = await Tickets.getAll({
      user: req.user,
    })
    res.json(result)
  })

  app.post('/tickets/new', privateRoute, async (req, res) => {
    const result = await Tickets.create({
      user: req.user,
    }, req.body)
    res.json(result)
  })

  app.get('/ticket/:id', privateRoute, async (req, res) => {
    const result = await Tickets.getById({
      user: req.user,
    }, req.params.id)
    res.json(result)
  })
//app.get('/txns', (req, res) => {
  //const filter = {};
  //if (req.query.symbol) filter.symbol = req.query.symbol;
  ////if (req.query.effort_lte || req.query.effort_gte) filter.effort = {};
  ////if (req.query.effort_lte) filter.effort.$lte = parseInt(req.query.effort_lte, 10);
  ////if (req.query.effort_gte) filter.effort.$gte = parseInt(req.query.effort_gte, 10);
  ////if (req.query.search) filter.$text = { $search: req.query.search };

  //if (req.query._summary === undefined) {
    //const offset = req.query._offset ? parseInt(req.query._offset, 10) : 0;
    //let limit = req.query._limit ? parseInt(req.query._limit, 10) : 20;
    //if (limit > 50) limit = 50;

    //const cursor = db.collection('txns').find(filter).sort({ _id: 1 })
    //.skip(offset)
    //.limit(limit);

    //let totalCount;
    //cursor.count(false).then(result => {
      //totalCount = result;
      //return cursor.toArray();
    //})
    //.then(txns => {
      //res.json({ metadata: { totalCount }, records: txns });
    //})
    //.catch(error => {
      //console.log(error);
      //res.status(500).json({ message: `Internal Server Error: ${error}` });
    //});
  //} else {
    //db.collection('txns').aggregate([
      //{ $match: filter },
      //{ $group: { _id: { owner: '$owner', status: '$status' }, count: { $sum: 1 } } },
    //]).toArray()
    //.then(results => {
      //const stats = {};
      //results.forEach(result => {
        //if (!stats[result._id.owner]) stats[result._id.owner] = {};
        //stats[result._id.owner][result._id.status] = result.count;
      //});
      //res.json(stats);
    //})
    //.catch(error => {
      //console.log(error);
      //res.status(500).json({ message: `Internal Server Error: ${error}` });
    //});
  //}
//});
// acct
app.post('/txns', (req, res) => {
  const newtxn = req.body;

  const err = txn.validatetxn(newtxn);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('txns').insertOne(txn.cleanuptxn(newtxn)).then(result =>
    db.collection('txns').find({ _id: result.insertedId }).limit(1)
    .next()
  )
  .then(savedtxn => {
    res.json(savedtxn);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});
app.get('/txns/:id', (req, res) => {
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
app.put('/txns/:id', (req, res) => {
  let txnId;
  try {
    txnId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid Transaction ID format: ${error}` });
    return;
  }

  const txn = req.body;
  delete txn._id;

  const err = txn.validatetxn(txn);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('txns').updateOne({ _id: txnId }, txn.converttxn(txn)).then(() =>
    db.collection('txns').find({ _id: txnId }).limit(1)
    .next()
  )
  .then(savedtxn => {
    res.json(savedtxn);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.delete('/txns/:id', (req, res) => {
  let txnId;
  try {
    txnId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid Transaction ID format: ${error}` });
    return;
  }

  db.collection('txns').deleteOne({ _id: txnId }).then((deleteResult) => {
    if (deleteResult.result.n === 1) res.json({ status: 'OK' });
    else res.json({ status: 'Warning: object not found' });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});




}

