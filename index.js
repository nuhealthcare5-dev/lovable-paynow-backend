import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Railway Paynow Proxy is running");
});

/**
 * CREATE PAYMENT
 * Lovable / Supabase → Railway → VPS → Paynow
 */
app.post("/create-payment", async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.PAYNOW_RELAY_URL}/create-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-relay-secret": process.env.RELAY_SECRET
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (err) {
    console.error("VPS relay error:", err);
    res.status(500).json({
      success: false,
      error: "VPS relay unreachable"
    });
  }
});

/**
 * CHECK PAYMENT STATUS
 */
app.post("/check-payment", async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.PAYNOW_RELAY_URL}/check-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-relay-secret": process.env.RELAY_SECRET
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (err) {
    console.error("VPS relay error:", err);
    res.status(500).json({
      error: "VPS relay unreachable"
    });
  }
});

// Railway port binding (IMPORTANT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚆 Railway Paynow proxy running on port ${PORT}`);
});
