/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

/**
 * custom module
 */
import { cookies, transferPlayback, play } from "./client_player.api.js";
import { addEventOnElems, msToTimeCode } from "../utils.js";

const /** {Array<HTMLElement>} */ $players = document.querySelectorAll(
    "[data-player]"
  );
const /** {HTMLElement} */ $playerNextBtn = document.querySelector(
    "[data-player-next-btn]"
  );
const /** {HTMLElement} */ $playerPrevBtn = document.querySelector(
    "[data-player-prev-btn]"
  );

const updatePlayerInfo = (playerState, $player) => {
  const $trackBanner = $player.querySelector("[data-track-banner]");
  const $trackName = $player.querySelector("[data-track-name]");
  const $trackArtist = $player.querySelector("[data-track-artist]");

  const {
    track_window: {
      current_track: {
        album: { images: trackImages },
        artists: trackArtists,
        name: trackName,
      },
    },
  } = playerState;

  const { url = "/images/track-banner.png", width, height } =
  (trackImages && trackImages.find((item) => item.width > 200 && item.width < 400)) || {};

  const artistNames = trackArtists.map(({ name }) => name).join(", ");

  $trackBanner.src = url;
  $trackBanner.width = width;
  $trackBanner.height = height;
  $trackBanner.alt = trackName;
  $trackName.textContent = trackName;
  $trackArtist.textContent = artistNames;
  $player.classList.remove("hide");
  $player.classList.remove("disabled");
};

let /** {Array<HTMLElement> | undefined} */ $lastActivePlayBtns = [];

const updateCardPlayBtnState = (playerState) => {
  const {
    paused,
    context: { uri },
    track_window: {
      current_track: { uri: trackUri },
    },
  } = playerState;

  const /** {Array<HTMLElement>} */ $cardPlayBtns = document.querySelectorAll(
      `[data-uri="${uri}"]`
    );

  const /** {Array<HTMLElement>} */ $trackPlayBtns = document.querySelectorAll(
      `[data-track-uri="${trackUri}"]`
    );

  const /** {Array<HTMLElement>} */ $currentActivePlayBtns = [
      ...$cardPlayBtns,
      ...$trackPlayBtns,
    ];

    $currentActivePlayBtns.forEach(($playBtn) => {
      $playBtn.classList.toggle("active", !paused);
      $playBtn.dataset.playBtn = paused ? "play" : "paused";
    
    // Toggle visibility of play/pause icons
    const playIcon = $playBtn.querySelector(".play-icon");
    const pauseIcon = $playBtn.querySelector(".pause-icon");

    if (playIcon && pauseIcon) {
      playIcon.style.display = paused ? "inline-block" : "none";
      pauseIcon.style.display = paused ? "none" : "inline-block";
    }
    });
};

const updatePlayerBtnState = (playerState, $players) => {
  const /** {HTMLElement} */ $playerControlPlay = $players.querySelector(
      "[data-player-control-play]"
    );

  const { paused } = playerState;

  $playerControlPlay.classList[paused ? "remove" : "add"]("active");
  $playerControlPlay.dataset.playBtn = paused ? "play" : "pause";
};

const /** {string} */ documentTitle = document.title;

const updateDocumentTitle = (playerState) => {
  //set document title when playing
  const {
    paused,
    track_window: {
      current_track: { artists: trackArtists, name: trackName },
    },
  } = playerState;

  const /** {string} */ artistNameStr = trackArtists
      .map(({ name }) => name)
      .join(", ");

  document.title = paused
    ? documentTitle
    : `${trackName} • ${artistNameStr} | Groove`;
};

const /** {HTMLElement} */ $playerLgProgress = document.querySelector(
    "[data-player-progress-lg]"
  );
const /** {HTMLElement} */ $playerSmProgress = document.querySelector(
    "[data-player-progress-sm]"
  );
const /** {HTMLElement} */ $playerLgProgressPos = document.querySelector(
    "[data-progress-pos]"
  );
const /** {HTMLElement} */ $playerLgProgressDuration = document.querySelector(
    "[data-progress-duration]"
  );
let /** {NodeJS.Timeout | undefined} */ lastProgressInterval;

const updatePlayerProgress = (playerState) => {
  const { position, duration, paused } = playerState;

  //progress initial value
  let currentPosition = position;
  $playerLgProgress.max = duration;
  $playerSmProgress.max = duration;
  $playerLgProgress.value = currentPosition;
  $playerSmProgress.value = currentPosition;
  $playerLgProgressDuration.textContent = msToTimeCode(duration);
  $playerLgProgressPos.textContent = msToTimeCode(currentPosition);

  lastProgressInterval && clearInterval(lastProgressInterval);

  if (!paused) {
    const currentProgressInterval = setInterval(() => {
      currentPosition += 1000;
      $playerLgProgress.value = currentPosition;
      $playerSmProgress.value = currentPosition;
      $playerLgProgressPos.textContent = msToTimeCode(currentPosition);
    }, 1000);
    lastProgressInterval = currentProgressInterval;
  }
};

/**
 * when any changes occur in player this function will be execute
 * e.g. change track/volume/play/pause/seek/next/previous
 *
 * @param {object} playerState - currently playing track object
 */

const playerStateChange = (playerState) => {
  const { track_window } = playerState

  // update player ui
  $players.forEach((player) => {
    updatePlayerInfo(playerState, player);
    updatePlayerBtnState(playerState, player);
  });
  updateCardPlayBtnState(playerState);
  updateDocumentTitle(playerState);
  updatePlayerProgress(playerState);

  const { next_tracks, previous_tracks } = playerState.track_window;
  $playerNextBtn.disabled = !next_tracks.length;
  $playerPrevBtn.disabled = !previous_tracks.length;
};

/**
 * Toggle play
 */
const togglePlay = async function (player) {
  const deviceId = localStorage.getItem("device_id");
  const {
    context: { uri: currentUri },
    track_window: {
      current_track: { uri: currentTrackUri }
    }
  } = await player.getCurrentState();

  const { uri: btnUri, trackUri: btnTrackUri, playBtn } = this.dataset;

  if (!playBtn) return;

  if (playBtn === "play") {
    const lastPlayed = currentUri === btnUri || currentTrackUri === btnTrackUri;

    if ((!btnUri && !btnTrackUri) || lastPlayed) {
      return await player.resume();
    }
    const reqBody =  {} 

    btnUri ? reqBody.context_uri = btnUri : null;
    btnTrackUri ? reqBody.uris = [btnTrackUri] : null;

    await play(deviceId, reqBody);

  } else {
    await player.pause();
  }

   // Update the play/pause button after action
   const newPlayerState = await player.getCurrentState();
   if (newPlayerState) {
     playerStateChange(newPlayerState);
   }
};

const /** {HTMLElement} */ $volumeProgress = document.querySelector(
    "[data-volume-progress]"
  );
const /** {HTMLElement} */ $volumeBtnIcon = document.querySelector(
    "[data-volume-btn] .icon"
  );

/**
 * Set the volume icon based on the specified volume level.
 *
 * @param {number} volume - The volume level as a percentage (0 to 100).
 */
const setVolumeIcon = function (volume) {
  // The name of the volume icon to be displayed.
  const volumeIcon =
    volume > 66
      ? "volume_up"
      : volume > 33
      ? "volume_down"
      : volume > 0
      ? "volume_mute"
      : "volume_off";

  $volumeBtnIcon.textContent = volumeIcon;
};

/**
 * Updates the volume of a media player and associated UI elements.
 *
 * @param {object} player - spotify player instance.
 * @returns {void}
 */
const updatePlayerVolume = async function (player) {
  const /** {number} */ volumePrecent = this.value;

  // setting player volume icon
  setVolumeIcon(volumePrecent);

  // set volume to player
  await player.setVolume(volumePrecent / 100);

  // store volume to localStorage
  localStorage.setItem("volume", volumePrecent);
};

window.onSpotifyWebPlaybackSDKReady = () => {
  const /** {number} */ volume = localStorage.getItem("volume") ?? 100;

  /**
   * Create spotify player instance
   */
  const player = new Spotify.Player({
    name: "Groove Web Player",
    getOAuthToken: (callback) => {
      callback(cookies.get("access_token"));
    },
    volume: volume / 100,
  });

  // Player is ready
  player.addListener("ready", async ({ device_id }) => {

    // store device_id in localStorage
    localStorage.setItem("device_id", device_id);

    // transfer playback to current device
    await transferPlayback(device_id);

    const /** {Array<HTMLElement>} */ $playBtns = document.querySelectorAll(
        "[data-play-btn]"
      );

    addEventOnElems($playBtns, "click", function () {
      togglePlay.call(this, player);
    });

    //skip to next track
    $playerNextBtn.addEventListener("click", async () => {
      await player.nextTrack();
    });

    //skip to previous track
    $playerPrevBtn.addEventListener("click", async () => {
      await player.previousTrack();
    });

    // control player seek
    $playerLgProgress.addEventListener("input", async (event) => {
      await player.seek(event.target.value);
    });

    // control player volume
    $volumeProgress.addEventListener(
      "input",
      updatePlayerVolume.bind($volumeProgress, player)
    );
  });

  // call event when any changes occur in player
  player.addListener("player_state_changed", playerStateChange);

  // set player volume and initial visually
  player.getVolume().then((volume) => {
    const volumePrecent = volume * 100;
    $volumeProgress.value = volumePrecent;
    setVolumeIcon(volumePrecent);
  });

  // Connect player
  player.connect();
};
