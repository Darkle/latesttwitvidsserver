
_ = require('lodash')

simplifyVideoData = videos -> videos.map(item -> _.omit(item, ['pubDate', 'description']))

getPageJsCodeAsString([rssFeedString, videos]) ->

  [
    rssFeedString,
    `
    var youtubeVidIdsSortedByDate = ${ JSON.stringify(simplifyVideoData(videos)) }

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

    `
  ]


module.exports = {
  getPageJsCodeAsString
}
