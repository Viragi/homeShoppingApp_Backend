const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgressql://localhost/productlist'
});
client.connect();
module.exports = client;
