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

// ---------- DATE FORMAT ----------
function formatDate(date) {
  if (!date) return null;

  const d = new Date(date);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// ---------- APPLY FORMAT ----------
function formatDatesInRows(rows) {
  return rows.map(row => {
    const formatted = {};

    for (let key in row) {
      if (row[key] instanceof Date) {
        formatted[key] = formatDate(row[key]);
      } else {
        formatted[key] = row[key];
      }
    }

    return formatted;
  });
}

// ---------- API ----------
app.get("/sheet", async (req, res) => {
  try {

    // 👇 Remove ONLY image column automatically
    const checklist = await pool.query(`
SELECT 
task_id,
department,
given_by,
name,
task_description,
enable_reminder,
require_attachment,
frequency,
remark,
status,
admin_done,
delay,
planned_date,
created_at,
task_start_date,
submission_date
FROM checklist
ORDER BY task_id
`);

    const delegation = await pool.query("SELECT * FROM delegation");
    const users = await pool.query("SELECT * FROM users");
    const holiday_list = await pool.query("SELECT * FROM holiday_list");

    res.json({
      checklist: formatDatesInRows(checklist),
      delegation: formatDatesInRows(delegation.rows),
      users: formatDatesInRows(users.rows),
      holiday_list: formatDatesInRows(holiday_list.rows)
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

app.listen(3000, () => console.log("API Running"));