/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


global.isProduction = process.env.NODE_ENV === 'production';

__webpack_require__(2).config();

const feedparser = __webpack_require__(3);
const pMap = __webpack_require__(4);
const _ = __webpack_require__(0);
const RSS = __webpack_require__(5);
const AWS = __webpack_require__(6);
const ms = __webpack_require__(7);
const Promise = __webpack_require__(8);

const { getPageJsCodeAsString } = __webpack_require__(9);
const { logger } = __webpack_require__(10);

const s3 = new AWS.S3({
  accessKeyId: process.env.twitServAccessKeyId,
  secretAccessKey: process.env.twitServSecretAccessKey,
  region: process.env.region
});

const twitYTChannelFeeds = ['https://www.youtube.com/feeds/videos.xml?channel_id=UCLxT-YVIAR4F3dRHped9Dkg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsGdWQMkl4Yv4fLBQ3aCC1Q', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCCNV2nHyBoSSekgFrVFuaXg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7UTd0UR2WJc4TUSWLywRJQ', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCnVDIyVmcIVxb34i0LiD-3w', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCCeXyDcdHfS6-EjwxrRl2eg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7DLT1zdSVGvnW11y4kqDng', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCNbqa_9xihC8yaV2o6dlsUg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCFP9Euhwi3GqbQmWS-M-0hA', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCWAAgw0UiWLZqyA6eJzhbug', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC47TUHNrZUyaHYNgzX8Mjpg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0KrqQ-3pCob4piS1wVC5dQ', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCM4IHEg4jh7X_dJhzw_O4Gw', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCqEwfZ2F0EVaEfWH1xWUXYQ', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCagoIYmo_gO1iVaCeeSikEg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCWoyADQ1Ri8BqqnKWOK4TIw', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC1WHdBv9P5tYEGfy-btvYfA'];

const feedOptions = {
  title: 'Latest Twit.tv Episodes',
  description: 'The Latest Twit.tv Full Length Videos.',
  feed_url: 'https://s3-us-west-2.amazonaws.com/latest-twit-tv-episodes/feed.xml',
  site_url: 'https://latest-twit-tv-episodes.github.io/'
};

const sortChannelsVideosByDate = function (channels) {
  return channels.map(function (channelVideos) {
    return [...channelVideos.sort(function (videoA, videoB) {
      return videoB.pubDate - videoA.pubDate;
    })];
  });
};

const getVideoDetails = function (channelVideos) {
  return channelVideos.map(function (video) {
    return {
      pubDate: new Date(video.pubDate).getTime(),
      videoTitle: video.title,
      videoId: video.guid.split('yt:video:')[1],
      description: video['media:group']['media:description']['#']
    };
  });
};

const mapChannelsVideoData = function (channels) {
  return channels.map(getVideoDetails);
};

const mapChannelsMostRecent4 = function (channels) {
  return channels.map(function (channelVideos) {
    return _.take(channelVideos, 4);
  });
};

const sortFlattenedVideosByDate = function (videos) {
  return [...videos.sort(function (videoA, videoB) {
    return videoB.pubDate - videoA.pubDate;
  })];
};

const runIn3Hours = function (func) {
  return setTimeout(func, ms('3h'));
};

function getPrettyTimeAndDate() {
  const date = new Date();
  const dayMonthYear = date.toDateString();
  const hourIn24 = date.getHours();
  const hourMinutes = date.getMinutes();

  return `${hourIn24}:${hourMinutes} - ${dayMonthYear}`;
}

function createRssFeed(videos) {
  const feed = new RSS(feedOptions);

  videos.forEach(function ({ pubDate, videoTitle, videoId, description }) {
    return feed.item({
      title: videoTitle,
      description,
      url: `https://latest-twit-tv-episodes.github.io/`,
      guid: videoId,
      date: pubDate
    });
  });

  return [feed.xml(), videos];
}

function publishToS3([feedString, JSstring]) {
  return Promise.all([s3.putObject({
    Body: Buffer.from(JSstring),
    Bucket: 'latest-twit-tv-episodes',
    Key: 'main.js'
  }).promise(), s3.putObject({
    Body: Buffer.from(feedString),
    Bucket: 'latest-twit-tv-episodes',
    Key: 'feed.xml'
  }).promise()]);
}

function init() {
  logger.info('latesttwitvids init()', getPrettyTimeAndDate());

  Promise.resolve(pMap(twitYTChannelFeeds, feedparser.parse, { concurrency: 3 })).then(mapChannelsVideoData).then(sortChannelsVideosByDate).then(mapChannelsMostRecent4).then(_.flatten).then(sortFlattenedVideosByDate).then(createRssFeed).then(getPageJsCodeAsString).then(publishToS3).then(function () {
    return logger.info('successfully pushed to S3', getPrettyTimeAndDate());
  }).catch(function (err) {
    return logger.error(err, { err });
  }).finally(function () {
    return runIn3Hours(init);
  });
}

init();

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("feedparser-promised");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("p-map");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("rss");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("ms");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const _ = __webpack_require__(0);

const simplifyVideoData = function (videos) {
      return videos.map(function (item) {
            return _.omit(item, ['pubDate', 'description']);
      });
};

function getPageJsCodeAsString([rssFeedString, videos]) {
      return [rssFeedString, `
    var youtubeVidIdsSortedByDate = ${JSON.stringify(simplifyVideoData(videos))}

    var row = document.querySelector('#portfolio .container .row')

    youtubeVidIdsSortedByDate.forEach(video => {
      var newPortfolioItem = document.createElement('div')
      newPortfolioItem.setAttribute('class', 'portfolio-item')

      var videoTitle = document.createElement('h3')
      videoTitle.textContent = video.videoTitle

      var embedContainer = document.createElement('div')
      embedContainer.setAttribute('class', 'embed-responsive embed-responsive-16by9')

      var iframeSrc = '//www.youtube.com/embed/'+ video.videoId +'?rel=0'

      var iframe = document.createElement('iframe')
      iframe.setAttribute('class', 'embed-responsive-item lazyload')
      iframe.setAttribute('data-src', iframeSrc)

      newPortfolioItem.appendChild(videoTitle)

      embedContainer.appendChild(iframe)

      newPortfolioItem.appendChild(embedContainer)

      row.appendChild(newPortfolioItem)
    })

    `];
}

module.exports = {
      getPageJsCodeAsString
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const winston = __webpack_require__(11);
const RollbarTransport = __webpack_require__(12).default;

/*****
* We are using winston for logging as there is no way to log to the console in dev without logging
* to rollbar online as well when using the rollbar npm module on its own.
*
* https://github.com/winstonjs/winston
* Winston log levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
* So can use logger.error(), logger.warn(), logger.info(), logger.verbose(), logger.debug()
*
* Important note about error logging with winston-rollbar-transport:
* https://github.com/binded/winston-rollbar-transport#error-handling
*/

const transports = [new winston.transports.Console({
  handleExceptions: true,
  humanReadableUnhandledException: true,
  json: true,
  level: global.isProduction ? 'info' : 'debug'
}), new RollbarTransport({
  rollbarAccessToken: process.env.rollbarAccessToken,
  rollbarConfig: {
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: global.isProduction ? 'production' : 'development'
  },
  handleExceptions: true,
  humanReadableUnhandledException: true,
  level: 'info'
})];

/*****
* We don't log to rollbar in dev.
*/
if (!global.isProduction) {
  transports.pop();
}

const logger = new winston.Logger({ transports, exitOnError: false });

/*****
* It's important to handle uncaught exceptions so can know why it crashed.
*/
logger.handleExceptions(transports);

module.exports = {
  logger
};

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("winston");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("winston-rollbar-transport");

/***/ })
/******/ ]);