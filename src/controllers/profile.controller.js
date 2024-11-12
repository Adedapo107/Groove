/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

/**
 * custom modules
 */
const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const apiConfig = require("../config/api.config");
const { msToTimeCode } = require("../utils/helpers.util");


const profile = async (req, res) => {

  // current user profile
  const currentProfile = await userApi.getProfile(req);

  // recently played tracks
  const recentlyPlayed = await playerApi.getRecentlyPlayed(req);
  const recentlyPlayedTracks = recentlyPlayed.items.map(({ track }) => track);

  // current user top tracks
  const userTopTracks = await userApi.getTopTracks(req, 6);

    // current user top artist
  const userTopArtist = await userApi.getTopArtist(req, apiConfig.LOW_LIMIT);

    // current user followed artist
  const userFollowedArtist = await userApi.getFollowedArtist(req);


  res.render("./pages/profile", {
    currentProfile,
    recentlyPlayedTracks,
    userTopArtist,
    userTopTracks,
    userFollowedArtist,
    msToTimeCode
  });
};

const topArtist = async (req, res) => {

  // current user profile
  const currentProfile = await userApi.getProfile(req);

  // recently played tracks
  const recentlyPlayed = await playerApi.getRecentlyPlayed(req);
  const recentlyPlayedTracks = recentlyPlayed.items.map(({ track }) => track);

    // current user top artist
  const userTopArtist = await userApi.getTopArtist(req);


  res.render("./pages/user_top_artist", {
    currentProfile,
    recentlyPlayedTracks,
    artists: userTopArtist,
    title: 'Your top artists'
  });
};


const topTrack = async (req, res) => {

  // current user profile
  const currentProfile = await userApi.getProfile(req);

  // recently played tracks
  const recentlyPlayed = await playerApi.getRecentlyPlayed(req);
  const recentlyPlayedTracks = recentlyPlayed.items.map(({ track }) => track);

  // current user top tracks
  const userTopTracks = await userApi.getTopTracks(req, 50);


  res.render("./pages/user_top_track", {
    currentProfile,
    recentlyPlayedTracks,
    tracks: userTopTracks,
    title: 'Your top tracks',
    msToTimeCode
  });
};

module.exports = {
    profile,
    topArtist,
    topTrack
}