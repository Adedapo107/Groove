/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

/**
 * custom module
 */
const { getData } = require("../config/axios.config");
const { getUrlQuery } = require("../utils/helpers.util");

/**
 * Get a list of new album releases featured in Spotify
 *
 * @param {Object} req - server request object
 * @param {number} itemLimit - the maximum number of items to return. default: 30
 * @returns {Object}
 */
const getNewRelease = async (req, itemLimit) => {
  const { limit, offset, page } = getUrlQuery(req.params, itemLimit);

  const { data: { albums: newRelease } } = await getData(
    `/browse/new-releases?limit=${limit}&offset=${offset}`,
    req.cookies.access_token
  );

  return { baseUrl: req.baseUrl, page, ...newRelease }
};

/**
 * Get Spotify catalog information for a single album.
 * 
 * @param {Object} req - server request object
 * @returns {Object}
 */
const getDetail = async (req) => {
  const { albumId } = req.params;

  const { data: albumDetail } = await getData(`/albums/${albumId}`, req.cookies.access_token);

  return albumDetail
}

module.exports = {
    getNewRelease,
    getDetail
} 