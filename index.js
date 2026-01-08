import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Paynow Relay Server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Relay running on port ${PORT}`);
});
