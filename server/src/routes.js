import passport from 'passport'
import {initData} from './providers'
import * as Users from './connectors/users'
import * as Questions from './connectors/questions'
import TxnUtil from './txn'
import Account from './account'
import {debug} from './utils/logging'
import {ObjectId} from 'mongodb';
import * as Report from './txnsResult'
import * as Pdf from './pdf'

let db;
const LimitTxns = 5000;
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
      debug(`signup user: ${JSON.stringify(req.user)} body: ${JSON.stringify(req.body)} `)
      if (typeof req.user !== 'undefined') {
        throw Error('Unauthorized')
      } else {
        const newDoc = await Users.createUser({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        })
        res.json({status: 'ok'})
        debug(`add a new user `)
      }
    } catch (e) {
      res.status(403).send(e.message)
    }
  })

  app.post('/login', (req, res, next) => {
    Pdf.processPdf();
    debug(`login user: ${JSON.stringify(req.user)} body: ${JSON.stringify(req.body)} `)
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
;
  app.get('/logout', (req, res) => {
    req.logout()
    res.json({status: 'ok'})
  })
  app.get('/accounts', privateRoute, async (req, res) => {
    debug(` accounts list : ${JSON.stringify(req.user)} body: ${JSON.stringify(req.body)} `)
    const email = req.user.username;
    const cursor = db.collection('accounts').find({email:email}).sort({_id: 1})
    let totalCount;
    cursor.count(false).then(result => {
      totalCount = result;
      return cursor.toArray();
    })
    .then(items => {
     res.json(items)
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });

  app.post('/accounts/new', privateRoute, (req, res) => {
    debug(` accounts new : ${JSON.stringify(req.user)} body: ${JSON.stringify(req.body)} `)
    const newAccount = req.body;
    newAccount.email = req.user.username;
    const err = Account.validateAccount(newAccount);
    if (err) {
      res.status(422).json({message: `Invalid request: ${err}`});
      return;
    }

    db.collection('accounts').insertOne(newAccount).then(result => {
        debug('insert result', result.result)
        debug('insert result', result.insertedId)
        let ret = db.collection('accounts').find({_id: result.insertedId}).limit(1).next()
        return ret
      }
    )
    .then(savedAccount => {
      debug('------------------insert saved result', savedAccount)
      // res.json(savedAccount);
      res.json({metadata:1, records: savedAccount});
    })
    .catch(error => {
      debug('insert error ', error)
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });
  app.put('/account/:id', privateRoute, (req, res) => {
    let accountId;
    try {
      accountId = new ObjectId(req.params.id);
    } catch (error) {
      res.status(422).json({message: `Invalid Transaction ID format: ${error}`});
      return;
    }
    const account = req.body;
    account.email = req.user.username;
    delete account._id;
    const err = Account.validateAccount(account);
    if (err) {
      res.status(422).json({message: `Invalid request: ${err}`});
      return;
    }
    db.collection('accounts').updateOne(
      {_id: accountId},{$set:  Account.convertAccount(account)} ).then(() =>
      db.collection('accounts').find({_id: accountId}).limit(1)
      .next()
    )
    .then(savedAccount => {
      res.json(savedAccount);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });

  app.get('/txns', (req, res) => {
    const filter = {};
    if (req.query.accountId) filter.accountId= req.query.accountId;
    // filter.accountId = req.user.curAccountId;
    // if (req.query.symbol) filter.symbol = req.query.symbol;
    //if (req.query.effort_lte || req.query.effort_gte) filter.effort = {};
    //if (req.query.effort_lte) filter.effort.$lte = parseInt(req.query.effort_lte, 10);
    //if (req.query.effort_gte) filter.effort.$gte = parseInt(req.query.effort_gte, 10);
    //if (req.query.search) filter.$text = { $search: req.query.search };

    if (req.query._summary === undefined) {
      const offset = req.query._offset ? parseInt(req.query._offset, 10) : 0;
      let limit = req.query._limit ? parseInt(req.query._limit, 10) : LimitTxns;
      if (limit > LimitTxns) limit = LimitTxns;

      const cursor = db.collection('txns').find(filter).sort({stlmtDate: 1})
      .skip(offset)
      .limit(limit);

      let totalCount;
      cursor.count(false).then(result => {
        totalCount = result;
        return cursor.toArray();
      })
      .then(txns => {
        txns.forEach((item) => {
          debug(`txn : ${TxnUtil.format(item)}`);
        })
        res.json({metadata: {totalCount}, records: txns});
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({message: `Internal Server Error: ${error}`});
      });
    } else {
      db.collection('txns').aggregate([
        {$match: filter},
        {$group: {_id: {owner: '$owner', status: '$status'}, count: {$sum: 1}}},
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
        res.status(500).json({message: `Internal Server Error: ${error}`});
      });
    }
  });
//db.report.insert({ qty:100, symbol:'vips', stlmtDate:'2016-Jan-11',
// years:'2015,2016', disposition:1548.95, acb:1435.01, expense:1.00, gain:22.94, });
//  db.inventory.find( { tags: ["red", "blank"] } )
  // db.txns.find( { symbol: { $in:["VIPS", "SCTY"]} });
  app.get('/report', privateRoute, (req, res) => {
    //req.query.symbol =  { $in:["VIPS", "SCTY"] };
    const filter = {};
    if (req.query.symbol) filter.symbol = req.query.symbol;
    if (req.query.accountId) filter.accountId= req.query.accountId;
    const offset = req.query._offset ? parseInt(req.query._offset, 10) : 0;
    let limit = req.query._limit ? parseInt(req.query._limit, 10) : LimitTxns;
    if (limit > LimitTxns) limit = LimitTxns;

    const cursor = db.collection('txns').find(filter).sort({stlmtDate: 1})
    .skip(offset)
    .limit(limit);


    let totalCount;
    cursor.count(false).then(result => {
      totalCount = result;
      return cursor.toArray();
    })
    .then(txns => {
      let objs = Report.procTxns(txns, 2016, filter.accountId);
      // objs.data.forEach(item => debug(`clc txn: ${JSON.stringify(item)}`));
      // objs.result.forEach(item => debug(`result : ${JSON.stringify(item)}`));
      res.json({metadata:objs.length, records: objs});

    })
    .catch(error => {
      console.log(error);
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });
// acct
  app.post('/txns/new', privateRoute, (req, res) => {
    debug('new ', req.body);
    const newTxn = req.body;
    // newTxn.accountId = req.user.curAccountId;
    const err = TxnUtil.validateTxn(newTxn);
    if (err) {
      res.status(422).json({message: `Invalid request: ${err}`});
      return;
    }

    db.collection('txns').insertOne(TxnUtil.convertTxn(newTxn)).then(result => {
        debug('insert result', result.result)
        debug('insert result', result.insertedId)
        let ret = db.collection('txns').find({_id: result.insertedId}).limit(1).next()
        return ret
      }
    )
    .then(savedTxn => {
      debug('------------------insert saved result', savedTxn)
      res.json({metadata:1, records: savedTxn});
    })
    .catch(error => {
      debug('insert error ', error)
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });
  app.post('/txns/newMany', privateRoute, (req, res) => {
    debug('new ', req.body);
    let txns = req.body;

    let errs = [];
    txns = txns.map((newTxn) => {
      // newTxn.accountId = req.user.curAccountId;
      const err = TxnUtil.validateTxn(newTxn);
      if (err !== null) {
        errs.push(err);
      }
      return TxnUtil.convertTxn(newTxn);
    })
    errs = errs.length ? errs.join('; ') : null;
    if (errs) {
      res.status(422).json({message: `Invalid request: ${errs}`});
      return;
    }
    db.collection('txns').insertMany(txns)
    .then(result => {
        debug('insert result', result.result.ok)
        debug('insert result', result.insertedIds)
        if (result.result.ok === 1) {
          res.json(result.result);

        } else {
          res.status(500).json({message: `Internal Server Error: ${result.result}`});
        }
      }
    ).catch(error => {
      debug('insert error ', error)
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });
  app.get('/txns/:id', privateRoute, (req, res) => {
    debug('get ', req.params.id)
    let txnId;
    try {
      txnId = new ObjectId(req.params.id);
    } catch (error) {
      res.status(422).json({message: `Invalid Transaction ID format: ${error}`});
      return;
    }
    db.collection('txns').find({_id: txnId}).limit(1)
    .next()
    .then(txn => {
      if (!txn) res.status(404).json({message: `No such Transaction: ${txnId}`});
      else res.json(txn);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });
  app.put('/txns/:id', privateRoute, (req, res) => {
    let txnId;
    try {
      txnId = new ObjectId(req.params.id);
    } catch (error) {
      res.status(422).json({message: `Invalid Transaction ID format: ${error}`});
      return;
    }
    const txn = req.body;
    delete txn._id;
    const err = TxnUtil.validateTxn(txn);
    if (err) {
      res.status(422).json({message: `Invalid request: ${err}`});
      return;
    }
     db.collection('txns').updateOne(
      {_id: txnId},{$set:  TxnUtil.convertTxn(txn)} ).then(() =>
      db.collection('txns').find({_id: txnId}).limit(1)
      .next()
    )
    .then(savedTxn => {
      res.json(savedTxn);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });

  app.delete('/txns/:id', privateRoute, (req, res) => {
    let txnId;
    try {
      txnId = new ObjectId(req.params.id);
    } catch (error) {
      res.status(422).json({message: `Invalid Transaction ID format: ${error}`});
      return;
    }

    db.collection('txns').deleteOne({_id: txnId}).then((deleteResult) => {
      if (deleteResult.result.n === 1) res.json({status: 'ok'});
      else res.json({status: 'Warning: object not found'});
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({message: `Internal Server Error: ${error}`});
    });
  });

}

