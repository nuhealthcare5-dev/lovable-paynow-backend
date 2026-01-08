import express from "express";

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Paynow Relay Server is running");
});

// ✅ CREATE PAYMENT (THIS FIXES THE 404)
app.post("/create-payment", async (req, res) => {
  try {
    // TODO: Paynow initiate logic
    res.json({ success: true, message: "Payment created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create payment failed" });
  }
});

// ✅ CHECK PAYMENT STATUS
app.post("/check-payment", async (req, res) => {
  try {
    // TODO: Paynow status logic
    res.json({ status: "paid" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Status check failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Relay running on port ${PORT}`);
});
