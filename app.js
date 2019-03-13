const express = require('express');
const app = express();
const bodyParser = require('body-Parser');
const morgan = require('morgan');
const productRoute = require('./routes/product.js');
const usersRoute = require('./routes/User.js');
const orderRoute = require('./routes/order.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use(function(req, res, next) {
  if (req.hostname == 'localhost') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
  }
  next();
});

app.use('/products', productRoute);
app.use('/SignUp', usersRoute);
app.use('/login', usersRoute);
app.use('/order', orderRoute);

app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    errors: err
  });
});

app.listen(3000, function() {
  console.log('server starting on port 3000');
});
