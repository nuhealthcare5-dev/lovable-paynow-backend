import express from "express";
import Paynow from "paynow";

const app = express();
app.use(express.json());

// ==========================
// ENV CHECK (SAFE LOGGING)
// ==========================
console.log("ENV CHECK:", {
  PAYNOW_INTEGRATION_ID: !!process.env.PAYNOW_INTEGRATION_ID,
  PAYNOW_INTEGRATION_KEY: !!process.env.PAYNOW_INTEGRATION_KEY,
  RELAY_SECRET: !!process.env.RELAY_SECRET,
});

// Stop boot if env vars missing
if (
  !process.env.PAYNOW_INTEGRATION_ID ||
  !process.env.PAYNOW_INTEGRATION_KEY ||
  !process.env.RELAY_SECRET
) {
  console.error("❌ ENV VARS MISSING");
  process.exit(1);
}

// ==========================
// INIT PAYNOW
// ==========================
let paynow;
try {
  paynow = new Paynow(
    process.env.PAYNOW_INTEGRATION_ID,
    process.env.PAYNOW_INTEGRATION_KEY
  );
  console.log("✅ Paynow initialized successfully");
} catch (err) {
  console.error("❌ PAYNOW INIT FAILED", err);
  process.exit(1);
}

// ==========================
// HEALTH CHECK
// ==========================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok
