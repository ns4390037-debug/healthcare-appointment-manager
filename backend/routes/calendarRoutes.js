const express = require("express");

const router = express.Router();

const {
  getGoogleAuthUrl,
  getGoogleTokens
} = require("../services/calendarService");

// Step 1: Redirect user to Google authorization
router.get("/connect", (req, res) => {
  const authUrl = getGoogleAuthUrl();

  res.redirect(authUrl);
});

// Step 2: Google callback
router.get("/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send(
        "Google authorization code not received"
      );
    }

    const tokens = await getGoogleTokens(code);

    console.log(
      "GOOGLE_REFRESH_TOKEN:",
      tokens.refresh_token
    );

    res.send(`
      <h2>Google Calendar Connected Successfully 🎉</h2>
      <p>You can close this page and check your backend terminal.</p>
    `);
  } catch (error) {
    console.error(
      "Google Calendar authorization failed:",
      error.message
    );

    res.status(500).send(
      "Failed to connect Google Calendar"
    );
  }
});

module.exports = router;