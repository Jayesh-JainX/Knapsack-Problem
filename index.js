const express = require("express");
const path = require("path");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

app.use(cors());
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

const greedyKnapsack = (weights, values, capacity) => {
  const n = weights.length;
  const items = Array.from({ length: n }, (_, i) => ({
    weight: weights[i],
    value: values[i],
    ratio: values[i] / weights[i],
  }));

  items.sort((a, b) => b.ratio - a.ratio);

  let totalValue = 0;
  for (let item of items) {
    if (capacity >= item.weight) {
      capacity -= item.weight;
      totalValue += item.value;
    } else {
      totalValue += item.value * (capacity / item.weight);
      break;
    }
  }
  return totalValue;
};

app.post(
  "/solve",
  [
    body("weights").isArray().withMessage("Weights must be an array"),
    body("values").isArray().withMessage("Values must be an array"),
    body("capacity").isNumeric().withMessage("Capacity must be a number"),
    body("method")
      .isIn(["dynamic", "greedy"])
      .withMessage("Method must be either 'dynamic' or 'greedy'"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { weights, values, capacity, method } = req.body;

    if (weights.length !== values.length) {
      return res
        .status(400)
        .json({ error: "Weights and values must have the same length." });
    }

    if (weights.some((weight) => typeof weight !== "number" || weight < 0)) {
      return res
        .status(400)
        .json({ error: "Weights must be non-negative numbers." });
    }

    if (values.some((value) => typeof value !== "number" || value < 0)) {
      return res
        .status(400)
        .json({ error: "Values must be non-negative numbers." });
    }

    if (capacity < 0) {
      return res
        .status(400)
        .json({ error: "Capacity must be a non-negative number." });
    }

    let result;
    if (method === "dynamic") {
      result = knapsack(weights, values, capacity);
    } else if (method === "greedy") {
      result = greedyKnapsack(weights, values, capacity);
    }

    res.json({ result });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
