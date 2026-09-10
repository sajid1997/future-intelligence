const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "future_intelligence",
  password: "Virgo$1122",
  port: 5432,
});

module.exports = pool;