import express from "express";
import paynowPkg from "paynow";

const { Paynow } = paynowPkg;

const app = express();
app.use(express.json());

/* ===============================
   BASIC HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("✅ Paynow Relay Server is running");
});

/* ===============================
   ENV VALIDATION (DO NOT CRASH)
================================ */
if (!process.env.PAYNOW_INTEGRATION_ID || !process.env.PAYNOW_INTEGRATION_KEY) {
  console.error("❌ PAYNOW credentials are missing in Railway variables");
}

/* ===============================
   INITIALIZE PAYNOW
================================ */
const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID,
  process.env.PAYNOW_INTEGRATION_KEY
);

/* ===============================
   CREATE PAYMENT
   POST /create-payment
================================ */
app.post("/create-payment", async (req, res) => {
  try {
    const { email, amount, reference } = req.body;

    if (!email || !amount || !reference) {
      return res.status(400).json({
        success: false,
        error: "email, amount and reference are required"
      });
    }

    // Create Paynow payment
    const payment = paynow.createPayment(reference, email);
    payment.add("Subscription", amount);

    // Send payment request to Paynow
    const response = await paynow.send(payment);

    if (!response.success) {
      return res.status(400).json({
        success: false,
        error: response.error || "Payment creation failed"
      });
    }

    // ✅ IMPORTANT: return redirectUrl + pollUrl
    return res.json({
      success: true,
      redirectUrl: response.redirectUrl,
      pollUrl: response.pollUrl
    });

  } catch (err) {
    console.error("🔥 Create payment error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Paynow relay error"
    });
  }
});

/* ===============================
   CHECK PAYMENT STATUS
   POST /check-payment
================================ */
app.post("/check-payment", async (req, res) => {
  try {
    const { pollUrl } = req.body;

    if (!pollUrl) {
      return res.status(400).json({
        success: false,
        error: "pollUrl is required"
      });
    }

    const status = await paynow.pollTransaction(pollUrl);

    return res.json({
      success: true,
      status
    });

  } catch (err) {
    console.error("🔥 Poll payment error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to check payment status"
    });
  }
});

/* ===============================
   START SERVER (RAILWAY SAFE)
================================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚆 Paynow relay running on port ${PORT}`);
});
