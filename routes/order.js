const express = require('express');
const router = express.Router();
const db = require('../db');
const jsonwebtoken = require('jsonwebtoken');

const SECRET = 'NEVER EVER MAKE THIS PUBLIC IN PRODUCTION!';

function ensureLoggedIn(req, res, next) {
  try {
    console.log('inside ensured login');
    const authHeaderValue = req.headers.authorization;
    const token = jsonwebtoken.verify(authHeaderValue, SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

router.get('/:id', async function(req, res, next) {
  try {
    const result = await db.query('select * from orders where order_id = $1', [
      req.params.id
    ]);
    const result2 = await db.query(
      'select * from orderitem o left join product p on o.product_id = p.id where o.order_id= $1',
      [req.params.id]
    );
    var reqJson = result2.rows.map(item => {
      return {
        product: {
          name: item.name,
          image: item.image,
          price: item.price
        },
        qty: item.qty
      };
    });
    result.rows[0]['order_items'] = reqJson;
    console.log(result.rows[0]);
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function(req, res, next) {
  try {
    const result = await db.query(
      'insert into orders (name, email) values($1,$2) returning *',
      [req.body.order.name, req.body.order.email]
    );
    console.log(result.rows[0]);
    var order_id = result.rows[0].order_id;
    //order_items_attributes
    req.body.order.order_items_attributes.forEach(async function(item) {
      await db.query(
        'insert into orderitem (product_id,order_id,qty) values ($1,$2,$3) returning*',
        [item.product_id, order_id, item.qty]
      );
    });

    return res.json({ id: order_id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
// {"name":
// "description":
//  "price":
// "image":
// "created_at":
// "updated_at":
// }
