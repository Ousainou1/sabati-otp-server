
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Use Render PORT
const PORT = process.env.PORT || 3000;

// ✅ Africa’s Talking credentials from Render ENV
const AT_USERNAME = process.env.AT_USERNAME;
const AT_API_KEY = process.env.AT_API_KEY;

// Temporary in-memory OTP store
const otpStore = new Map();

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Sabati OTP server is running ✅");
});

// ✅ Send OTP
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);

  const message = Your Sabati verification code is: ${otp};

  try {
    const response = await axios.post(
      "https://api.africastalking.com/version1/messaging",
      new URLSearchParams({
        username: AT_USERNAME,
        to: phone,
        message: message,
        from: "2171"
      }),
      {
        headers: {
          apiKey: AT_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        }
      }
    );

    res.json({ success: true, message: "OTP sent successfully ✅" });
  } catch (error) {
    console.error("SMS Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Verify OTP
app.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  const savedOtp = otpStore.get(phone);

  if (savedOtp === otp) {
    otpStore.delete(phone);
    res.json({ success: true, message: "OTP verified ✅" });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP ❌" });
  }
});

// ✅ Start server (VERY IMPORTANT)
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
