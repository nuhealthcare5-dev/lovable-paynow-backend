import express from "express";

const app = express();
app.use(express.json());

// 🔍 Health check (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Paynow Relay",
    time: new Date().toISOString()
  });
});

// Example Paynow relay endpoint
app.post("/paynow/init", async (req, res) => {
  try {
    // payment logic here
    res.json({ success: true });
  } catch (err) {
    console.error("Paynow error:", err);
    res.status(500).json({
      error: "Payment relay failed",
      message: err.message
    });
  }
});

// 🚨 THIS LINE FIXES RAILWAY
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚆 Paynow relay running on port ${PORT}`);
});
