/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

/**
 * custom module
 */
const { getRefreshToken } = require("../api/refresh_token.api");

const refreshToken = async (req, res) => {
  const MILLISECONDS = 1000;

  // Call getRefreshToken to get a new access token
  const response = await getRefreshToken(req.cookies.refresh_token);

  if (response && response.status === 200) {
    const { access_token, expires_in } = response.data;

    // Set the access token in cookies with the correct method
    res.cookie("access_token", access_token, {
      maxAge: expires_in * MILLISECONDS,
      httpOnly: true, // Optional: add for security
    });

    res.redirect(req.query.redirect || "/"); // Redirect to specified route or default
  } else {
    res.redirect("/login");
  }
};


module.exports = { refreshToken };
