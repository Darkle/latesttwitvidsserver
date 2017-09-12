global.isProduction = process.env.NODE_ENV === 'production'

path = require('path')

require('dotenv').config({path: path.join(__dirname, '.env')})

feedparser = require('feedparser-promised')
pMap = require('p-map')
_ = require('lodash')
RSS = require('rss')
AWS = require('aws-sdk')
ms = require('ms')
Promise = require('bluebird')

{ getPageJsCodeAsString } = require('./pageJs.lsc.js')
{ logger } = require('./logger.lsc.js')

s3 = new AWS.S3({
  accessKeyId: process.env.twitServAccessKeyId,
  secretAccessKey: process.env.twitServSecretAccessKey,
  region: process.env.region
})

twitYTChannelFeeds = [
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCLxT-YVIAR4F3dRHped9Dkg',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCsGdWQMkl4Yv4fLBQ3aCC1Q',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCCNV2nHyBoSSekgFrVFuaXg',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC7UTd0UR2WJc4TUSWLywRJQ',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCnVDIyVmcIVxb34i0LiD-3w',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCCeXyDcdHfS6-EjwxrRl2eg',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC7DLT1zdSVGvnW11y4kqDng',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCNbqa_9xihC8yaV2o6dlsUg',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCFP9Euhwi3GqbQmWS-M-0hA',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCWAAgw0UiWLZqyA6eJzhbug',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC47TUHNrZUyaHYNgzX8Mjpg',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC0KrqQ-3pCob4piS1wVC5dQ',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCM4IHEg4jh7X_dJhzw_O4Gw',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCqEwfZ2F0EVaEfWH1xWUXYQ',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCagoIYmo_gO1iVaCeeSikEg',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCWoyADQ1Ri8BqqnKWOK4TIw',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC1WHdBv9P5tYEGfy-btvYfA'
]

feedOptions = {
  title: 'Latest Twit.tv Episodes',
  description: 'The Latest Twit.tv Full Length Videos.',
  feed_url: 'https://s3-us-west-2.amazonaws.com/latest-twit-tv-episodes/feed.xml',
  site_url: 'https://latest-twit-tv-episodes.github.io/'
}

sortChannelsVideosByDate = channels -> channels.map(channelVideos ->
  [...channelVideos.sort((videoA, videoB) -> (videoB.pubDate - videoA.pubDate))]
)

getVideoDetails = channelVideos -> channelVideos.map(video ->
  ({
    pubDate: new Date(video.pubDate).getTime(),
    videoTitle: video.title,
    videoId: video.guid.split('yt:video:')[1],
    description: video['media:group']['media:description']['#']
  })
)

mapChannelsVideoData = channels -> channels.map(getVideoDetails)

mapChannelsMostRecent4 = channels -> channels.map(channelVideos -> _.take(channelVideos, 4))

sortFlattenedVideosByDate = videos -> [...videos.sort((videoA, videoB) -> (videoB.pubDate - videoA.pubDate))]

runIn3Hours = func -> setTimeout(func, ms('3h'))

getPrettyTimeAndDate() ->
  date = new Date()
  dayMonthYear = date.toDateString()
  hourIn24 = date.getHours()
  hourMinutes = date.getMinutes()

  `${ hourIn24 }:${ hourMinutes } - ${ dayMonthYear }`


createRssFeed(videos) ->
  feed = new RSS(feedOptions)

  videos.forEach(({pubDate, videoTitle, videoId, description}) ->
    feed.item({
      title: videoTitle,
      description,
      url: `https://latest-twit-tv-episodes.github.io/`,
      guid: videoId,
      date: pubDate
    })
  )

  [feed.xml(), videos]


publishToS3([feedString, JSstring]) ->
  Promise.all([
    s3.putObject({
      Body: Buffer.from(JSstring),
      Bucket: 'latest-twit-tv-episodes',
      Key: 'main.js'
    }).promise(),
    s3.putObject({
      Body: Buffer.from(feedString),
      Bucket: 'latest-twit-tv-episodes',
      Key: 'feed.xml'
    }).promise()
  ])



init():void ->
  logger.info('latesttwitvids init()', getPrettyTimeAndDate())

  Promise.resolve(pMap(
    twitYTChannelFeeds,
    feedparser.parse,
    {concurrency: 3}
  ))
    .then(mapChannelsVideoData)
    .then(sortChannelsVideosByDate)
    .then(mapChannelsMostRecent4)
    .then(_.flatten)
    .then(sortFlattenedVideosByDate)
    .then(createRssFeed)
    .then(getPageJsCodeAsString)
    .then(publishToS3)
    .then(() -> {
      logger.info('successfully pushed to S3', getPrettyTimeAndDate())
    })
    .catch(err -> {
      logger.error(err, { err })
    })
    .finally(() -> {
      runIn3Hours(init)
    })



init()
