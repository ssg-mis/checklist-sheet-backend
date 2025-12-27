const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

app.get("/sheet", async (req, res) => {
  try {
    const checklist = await pool.query("SELECT * FROM checklist");
    const delegation = await pool.query("SELECT * FROM delegation");

    res.json({
      checklist: checklist.rows,
      delegation: delegation.rows
    });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.listen(3000, () => console.log("API Running"));
