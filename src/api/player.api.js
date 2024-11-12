/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

/**
 * custom module
 */
const { getData } = require("../config/axios.config");
const apiConfig = require("../config/api.config");

/**
 * Get tracks from the current user's recently played tracks
 *
 * @param {Object} req - server request object
 * @param {number} itemLimit - the maximum number of items to return. default:30
 * @returns {Object}
 */
const getRecentlyPlayed = async (req, itemLimit = apiConfig.DEFAULT_LIMIT) => {
  const { data: recentlyPlayed } = await getData(`/me/player/recently-played?limit=${itemLimit}`,
    req.cookies.access_token
  );

  return recentlyPlayed;
};

module.exports = { getRecentlyPlayed };
