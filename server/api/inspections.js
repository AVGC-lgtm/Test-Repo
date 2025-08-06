const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get("/unseen", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM inspections WHERE seen = false");
  res.json(rows);
});

router.put("/:id/seen", async (req, res) => {
  await pool.query("UPDATE inspections SET seen = true WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

router.post("/:id/data", async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
  await pool.query(`UPDATE inspections SET ${setClause} WHERE id = $${keys.length + 1}`, [...values, req.params.id]);
  res.json({ success: true });
});

module.exports = router;
