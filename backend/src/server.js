require("dotenv").config();

const pool = require("./db");
const express = require("express");
const cors = require("cors");

const { askAI, generateForecast } = require("./services/ai");

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Future Intelligence Backend is running"
  });
});


// =========================
// CREATE RESEARCH QUERY
// =========================

app.post("/api/queries", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const queryResult = await pool.query(
      `
      INSERT INTO research_queries (question)
      VALUES ($1)
      RETURNING *
      `,
      [question]
    );

    const query = queryResult.rows[0];

    const forecast = await generateForecast(question);

    const predictionResult = await pool.query(
      `
      INSERT INTO predictions
      (
        query_id,
        prediction,
        probability,
        confidence,
        time_horizon
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        query.query_id,
        forecast.prediction,
        forecast.probability,
        forecast.confidence,
        forecast.time_horizon
      ]
    );

    res.json({
      query: query,
      prediction: predictionResult.rows[0]
    });

  } catch (error) {
    console.error(
      "Error creating forecast:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
});


// =========================
// GET ALL RESEARCH QUERIES
// =========================

app.get("/api/queries", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM research_queries
      ORDER BY query_id DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error(
      "Error fetching queries:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
});


// =========================
// CREATE PREDICTION
// =========================

app.post("/api/predictions", async (req, res) => {
  try {
    const {
      query_id,
      prediction,
      probability,
      confidence,
      time_horizon
    } = req.body;

    if (!query_id || !prediction) {
      return res.status(400).json({
        error: "query_id and prediction are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO predictions
      (
        query_id,
        prediction,
        probability,
        confidence,
        time_horizon
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        query_id,
        prediction,
        probability,
        confidence,
        time_horizon
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(
      "Error saving prediction:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
});


// =========================
// GET PREDICTIONS
// =========================

app.get("/api/predictions/:queryId", async (req, res) => {
  try {
    const { queryId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM predictions
      WHERE query_id = $1
      ORDER BY prediction_id DESC
      `,
      [queryId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(
      "Error fetching predictions:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
});


// =========================
// AI TEST
// =========================

app.post("/api/ai/test", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const answer = await askAI(prompt);

    res.json({
      answer: answer
    });

  } catch (error) {
    console.error(
      "AI Error:",
      error.message
    );

    res.status(500).json({
      error: error.message
    });
  }
});


// =========================
// DATABASE CONNECTION
// =========================

pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error(
      "Database connection failed:",
      err.message
    );
  } else {
    console.log(
      "Database connected successfully!"
    );
  }
});


// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});