const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const SECRET = 'SECRETPATH!';
router.post('/', async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.user.password, 10);
    const result = await db.query(
      'INSERT INTO users (name, password,email ) VALUES ($1,$2,$3) RETURNING *',
      [req.body.user.name, hashedPassword, req.body.user.email]
    );
    return res.json(result.rows[0]);
  } catch (e) {
    return next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    // try to find the user first
    const foundUser = await db.query(
      'SELECT * FROM users WHERE name=$1 LIMIT 1',
      [req.body.user.name]
    );
    console.log(foundUser.rows);
    if (foundUser.rows.length === 0) {
      return res.json({ message: 'Invalid Username' });
    }
    // if the user exists, let's compare their hashed password to a new hash from req.body.password
    const hashedPassword = await bcrypt.compare(
      req.body.user.password,
      foundUser.rows[0].password
    );
    // bcrypt.compare returns a boolean to us, if it is false the passwords did not match!
    if (hashedPassword === false) {
      return res.json({ message: 'Invalid Password' });
    }

    const token = jsonwebtoken.sign({ name: foundUser.rows[0].id }, SECRET);

    return res.json({ message: 'Logged In!', token });
  } catch (e) {
    return res.json(e);
  }
});

module.exports = router;
