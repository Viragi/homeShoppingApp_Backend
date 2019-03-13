const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async function(req, res, next) {
  try {
    if (req.query.sortby == 'undefined') {
      const result = await db.query('select * from product');
      return res.json(result.rows);
    } else if (req.query.sortby == 'price') {
      const result = await db.query('select * from product order by price');
      return res.json(result.rows);
    } else if (req.query.sortby == 'popularity') {
      const result = await db.query(
        'select product.*, COALESCE(sum(qty),0) as totalqty from product left join orderitem on product.id = orderitem.product_id group by product.id order by totalqty desc'
      );
      console.log(result);
      return res.json(result.rows);
    }
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function(req, res, next) {
  try {
    const result = await db.query(
      'insert into product (name, description, price, image, created_at,updated_at) values($1,$2,$3,$4,$5,$6) returning *',
      [
        req.body.name,
        req.body.description,
        req.body.price,
        req.body.image,
        new Date(),
        new Date()
      ]
    );
    return res.json(result.rows);
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

// {
// 	"name": "ankit",
// 	"email": "ankit@yahoo.com",
// 	"order_items_attributes":[
// 		{"product_id":2,"qty":2},
// 		{"product_id":4,"qty":1}
// 	]
// }
