/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

/**
 * custom module
 */
const axiosConfig = require("../config/axios.config");

/**
 * Refresh token is a security credential that allows application to obtain new access tokens without requering users to reauthorize the application
 *
 * @param {string} refreshToken - the refresh token returened from the authorization token request
 * @returns {Object}
 */
const getRefreshToken = async (refreshToken) => {
  try {
    const response = await axiosConfig.token.post("/token", {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return response;
  } catch (err) {
    console.error("Error refreshing token:", err.message);
    return { status: 500, data: { error: "Token refresh failed" } }; // Return a fallback response
  }
};

