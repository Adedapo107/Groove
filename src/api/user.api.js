"use strict";

/**
 * custom module
 */
const { getData } = require("../config/axios.config");
const { getUrlQuery } = require("../utils/helpers.util");

/**
 * Get detailed profile information about the current user
 *
 * @param {Object} req - server request object
 * @returns {Object|null} - The user's profile data or null if an error occurs
 */
const getProfile = async (req) => {
  try {
    const response = await getData("/me", req.cookies.access_token);

    // Check if response and response.data are valid
    if (response && response.data) {
      const { data: currentProfile } = response;
      return currentProfile;
    } else {
      console.error("Error: No data returned from /me endpoint");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

/**
 * Get the current user's top artists based on calculated affinity.
 *
 * @param {Object} req - server request object
 * @param {number} itemLimit - the maximum number of items to return. default: 30
 * @returns {Object}
 */
const getTopArtist = async (req, itemLimit) => {
  const { limit, offset, page } = getUrlQuery(req.params, itemLimit);

  const { data: topArtist } = await getData(
    `/me/top/artists?limit=${limit}&offset=${offset}`,
    req.cookies.access_token
  );

  const baseUrl = `${req.baseUrl}/top/artist`;

  return { baseUrl, page, ...topArtist }
};


/**
 * Get the current user's top tracks based on calculated affinity.
 *
 * @param {Object} req - server request object
 * @param {number} itemLimit - the maximum number of items to return. default: 30
 * @returns {Object}
 */
const getTopTracks = async (req, itemLimit) => {
  const { limit, offset, page } = getUrlQuery(req.params, itemLimit);

  const { data: topTracks } = await getData(
    `/me/top/tracks?limit=${limit}&offset=${offset}`,
    req.cookies.access_token
  );

  const baseUrl = `${req.baseUrl}/top/track`;

  return { baseUrl, page, ...topTracks }
};


/**
 * Get the current user's followed artists.
 *
 * @param {Object} req - server request object
 * @param {number} itemLimit - the maximum number of items to return. default: 30
 * @returns {Object}
 */
const getFollowedArtist = async (req, itemLimit) => {    
  const { data: { artists: followedArtist} } = await getData(
    '/me/following?type=artist', req.cookies.access_token
  );

  return followedArtist;
};


module.exports = {
  getProfile,
  getTopArtist,
  getTopTracks,
  getFollowedArtist
};
