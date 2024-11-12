/**
 * @license Apache-2.0
 * @copyright Adedapo 2024
 */

"use strict";

/**
 * node modules
 */
const router = require('express').Router();

/**
 * custom modules
 */
const { album, albumDetail } = require('../controllers/album.controller');

router.get(['/', '/page/:page'], album);

router.get(['/:albumId', '/:albumId/page/:page'], albumDetail)

module.exports = router;