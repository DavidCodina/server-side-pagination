const express   = require('express');
const app       = express();
const mongoose  = require('mongoose');
const User      = require('./users');


/* =============================================================================

============================================================================= */


mongoose
  .connect('mongodb+srv://<YOUR_USER>:<YOUR_PASSWORD>@cluster0.b6hw0.mongodb.net/pagination?retryWrites=true&w=majority', {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
    useCreateIndex:     true
  }
);


mongoose.connection.on('connected', () => {
  console.log('Connected to mongo instance!');
});


mongoose.connection.on('error', err => {
  console.error('Error connecting to mongo :(', err);
});



// If no users, then add users.
mongoose.connection.once('open', async () => {
  if (await User.countDocuments().exec() > 0){ return; }

  Promise.all([
    User.create({ name: 'User 1' }),
    User.create({ name: 'User 2' }),
    User.create({ name: 'User 3' }),
    User.create({ name: 'User 4' }),
    User.create({ name: 'User 5' }),
    User.create({ name: 'User 6' }),
    User.create({ name: 'User 7' }),
    User.create({ name: 'User 8' }),
    User.create({ name: 'User 9' }),
    User.create({ name: 'User 10' }),
    User.create({ name: 'User 11' }),
    User.create({ name: 'User 12' })
  ]).then(() => console.log('Added Users'))
});


/* =============================================================================

============================================================================= */


function paginatedResults(model){
  return async (req, res, next) => {
    const data     = {};
    let page       = req.query.page;
    let limit      = req.query.limit;
    let startIndex = 0;
    let endIndex   = parseInt(limit);


    /* ========================
      check for missing params
    ======================== */


    // Regardless of whether or not page is specified, if limit is not specified return all results.
    if (typeof limit === 'undefined'){
      try {
        data.results = await model.find().exec();
        res.paginatedData = data;
        return next();
      } catch(err){
        return res.status(500).json({ message: err.message })
      }

    }

    // If page is not specified, but limit is defined as n, return the first n results.
    else if (typeof page === 'undefined'){
      try {
        data.results      = await model.find().limit(parseInt(limit)).exec();
        res.paginatedData = data;
        return next();
      } catch(err){
        res.status(500).json({ message: err.message })
      }
    }


    /* ========================

    ======================== */


    page        = parseInt(page);
    limit       = parseInt(limit);
    startIndex  = (page - 1) * limit;
    endIndex    = page * limit;


    if (endIndex < await model.countDocuments().exec()){
      data.next = { page: page + 1, limit: limit }
    }

    if (startIndex > 0){
      data.previous = { page: page - 1, limit: limit }
    }


    try {
      data.results = await model.find().limit(limit).skip(startIndex).exec();
      res.paginatedData = data;
      next();
    } catch(err){
      res.status(500).json({ message: err.message })
    }
  } // End of (req, res, next) => { ... }
}


/* =============================================================================

============================================================================= */


app.get('/users', paginatedResults(User), (req, res) => {
  res.json(res.paginatedData);
});


/* =============================================================================

============================================================================= */


app.listen(3000, () => { console.log("Listening on port 3000."); });
