/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

/**
 * custom module
 */
const { getData, musixmatchApi } = require("../config/axios.config");

/**
 * Recommedations are generated based on the avilable information for a given seed entity and matche against similar artists and tracks. if there is sufficient information about the provided seeds, a list of tracks will be returned together with pool size details
 *
 * @param {Object} req - server request object
 * @param {Object} seeds - object of artist or track seed string
 * @param {number} itemLimit - the maximum number of items to return. default: 30
 * @returns {Object}
 */
const getRecommendedTrack = async (req, trackSeed, itemLimit) => {
  const {
    data: { tracks: recommendedTracks },
  } = await getData(
    `/recommendations?seed_tracks=${trackSeed}&limit=${itemLimit}`,
    req.cookies.access_token
  );

  return recommendedTracks;
};

/**
 * Get Spotify catalog information for a single track identified by its unique Spotify ID
 *
 * @param {Object} req - server request object
 * @returns {Object}
 */
const getDetail = async (req) => {
  const { trackId } = req.params;

  const { data: trackDetail } = await getData(
    `/tracks/${trackId}`,
    req.cookies.access_token
  );

  return trackDetail;
};

/**
 * Retrieves lyrics for a given track and artist using the Musixmatch API.
 *
 * @param {string} trackName - The name of the track.
 * @param {string} artistName - The name of the artist.
 * @param {string|null} [isrc=null] - The International Standard Recording Code (ISRC) of
 * the track, if available.
 * @returns {string|null} - The lyrics of the specified track and artist, or null if unavailable.
 */
const getLyrics = async (trackName, artistName, isrc = null) => {
  try {
    const response = await musixmatchApi("matcher.lyrics.get?", {
      q_track: trackName.toLowerCase(),
      q_artist: artistName.toLowerCase(),
      track_isrc: isrc,
    });

    // Check if response is valid and has the expected structure
    if (response && response.message && response.message.body) {
      const { lyrics } = response.message.body;
      return lyrics || "Lyrics not found.";
    } else {
      console.error("Unexpected response structure:", response);
      return null;
    }
  } catch (error) {
    console.error("Error fetching lyrics:", error.message || error);
    return null; // Return null or an appropriate fallback value
  }
};


module.exports = {
  getRecommendedTrack,
  getDetail,
  getLyrics,
};
