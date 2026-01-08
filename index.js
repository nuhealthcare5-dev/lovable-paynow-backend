import express from "express";
import cors from "cors";
import { Paynow } from "paynow";

const app = express();
app.use(cors());
app.use(express.json());

/* 🔐 SECURITY MIDDLEWARE */
app.use((req, res, next) => {
  const secret = req.headers["x-relay-secret"];
  if (secret !== process.env.PAYNOW_RELAY_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

/* 💳 CREATE PAYMENT */
app.post("/paynow/create-payment", async (req, res) => {
  const { amount, email, currency } = req.body;

  try {
    const paynow = new Paynow(
      process.env.PAYNOW_INTEGRATION_ID,
      process.env.PAYNOW_INTEGRATION_KEY
    );

    paynow.resultUrl = `${process.env.RAILWAY_STATIC_URL}/paynow/result`;
    paynow.returnUrl = `${process.env.RAILWAY_STATIC_URL}/paynow/return`;

    const payment = paynow.createPayment("Lovable Order", email);

    payment.add("Service Payment", amount);

    const response = await paynow.send(payment, currency);

    if (response.success) {
      return res.json({
        success: true,
        redirectUrl: response.redirectUrl,
        pollUrl: response.pollUrl
      });
    }

    res.status(400).json({ success: false, error: response.error });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 🔁 POLL PAYMENT STATUS */
app.post("/paynow/poll", async (req, res) => {
  const { pollUrl } = req.body;

  try {
    const paynow = new Paynow(
      process.env.PAYNOW_INTEGRATION_ID,
      process.env.PAYNOW_INTEGRATION_KEY
    );

    const status = await paynow.pollTransaction(pollUrl);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 🚀 START SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Paynow relay running on port ${PORT}`);
});
