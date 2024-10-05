const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const knapsack = (weights, values, capacity) => {
  const n = weights.length;
  const dp = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          values[i - 1] + dp[i - 1][w - weights[i - 1]]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  return dp[n][capacity];
};

app.post("/solve", (req, res) => {
  const { weights, values, capacity } = req.body;

  if (
    !Array.isArray(weights) ||
    !Array.isArray(values) ||
    typeof capacity !== "number"
  ) {
    return res.status(400).json({
      error:
        "Invalid input format. Please provide arrays for weights and values, and a number for capacity.",
    });
  }

  if (weights.length !== values.length) {
    return res
      .status(400)
      .json({ error: "Weights and values must have the same length." });
  }

  for (let weight of weights) {
    if (typeof weight !== "number" || weight < 0) {
      return res
        .status(400)
        .json({ error: "Weights must be non-negative numbers." });
    }
  }

  for (let value of values) {
    if (typeof value !== "number" || value < 0) {
      return res
        .status(400)
        .json({ error: "Values must be non-negative numbers." });
    }
  }

  if (capacity < 0) {
    return res
      .status(400)
      .json({ error: "Capacity must be a non-negative number." });
  }

  const result = knapsack(weights, values, capacity);
  res.json({ result });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
