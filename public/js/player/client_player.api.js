/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

const cookies = new Map(
  document.cookie.split("; ").map((item) => item.split("="))
);
const BASE_URL = "https://api.spotify.com/v1";
const headers = {
  Authorization: `Bearer ${cookies.get("access_token")}`,
  "Content-Type": "application/json",
};

/**
 *
 * @param {string} device_id - current device id,
 * @param {Boolean} play - if true then playback happens on new device otherwise keep the current playback state.
 */
const transferPlayback = async (deviceId, play = false) => {
  try {
    const reqBody = { device_ids: [deviceId], play };

    await fetch(`${BASE_URL}/me/player`, {
      method: "PUT",
      headers,
      body: JSON.stringify(reqBody),
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * This function put a request to spotify server for play track
 *
 * @param {string} deviceId  - current device id
 * @param {object} reqBody  - and object for PUT request
 */
const play = async (deviceId, reqBody) => {
  try {
    const response = await fetch(
      `${BASE_URL}/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(reqBody),
      }
    );
    return response;
  } catch (err) {
    console.log(err);
  }
};

export { cookies, transferPlayback, play };
