import express from "express";
import Paynow from "paynow";

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Paynow Relay Server is running");
});

// Warn if env vars missing
if (!process.env.PAYNOW_INTEGRATION_ID || !process.env.PAYNOW_INTEGRATION_KEY) {
  console.error("❌ Paynow credentials missing");
}

// Initialize Paynow
const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID,
  process.env.PAYNOW_INTEGRATION_KEY,
  "https://your-lovable-app.com/payment-success",
  "https://lovable-paynow-backend-production.up.railway.app/paynow-webhook"
);

// CREATE PAYMENT
app.post("/create-payment", async (req, res) => {
  try {
    const { email, amount, currency, reference } = req.body;

    if (!email || !amount || !reference) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payment = paynow.createPayment(reference, email);

    // Currency handling
    if (currency === "USD") {
      payment.add("Subscription", amount, "USD");
    } else {
      payment.add("Subscription", amount);
    }

    const response = await paynow.send(payment);

    if (response.success) {
      return res.json({
        success: true,
        redirectUrl: response.redirectUrl,
        pollUrl: response.pollUrl
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.error
      });
    }

  } catch (err) {
    console.error("Paynow relay error:", err);
    res.status(500).json({
      success: false,
      error: "Paynow relay failed"
    });
  }
});

// CHECK PAYMENT STATUS
app.post("/check-payment", async (req, res) => {
  try {
    const { pollUrl } = req.body;

    if (!pollUrl) {
      return res.status(400).json({ error: "pollUrl required" });
    }

    const status = await paynow.pollTransaction(pollUrl);
    res.json(status);

  } catch (err) {
    console.error("Poll error:", err);
    res.status(500).json({ error: "Status check failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚆 Paynow relay running on port ${PORT}`);
});
