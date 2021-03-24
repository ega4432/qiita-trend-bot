'use strict'
const rp = require('request-promise')
const cheerio = require('cheerio')
const axios = require('axios')

require('dotenv').config()
const env = process.env
const options = {
  transform: (body) => {
    return cheerio.load(body)
  }
}
const urls = [process.env.QIITA_WEB_URL]
const promises = urls.map((url) => {
  return (async () => {
    try {
      const $ = await rp.get(url, options)
      return $('script[data-component-name="HomeArticleTrendFeed"]')[0]['children']
    } catch(e) {
      console.error('Error: ', e)
    }
  })()
})

Promise.all(promises).then((result) => {
    const domain = process.env.QIITA_WEB_URL
    const list = JSON.parse(result[0][0].data)
    const nodeList = list.trend.edges
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "最近人気の記事ベスト10をお知らせします"
        }
      },
      {
        type: "divider"
      }
    ]

    nodeList.map(function (node, index) {
      const createdAt = new Date(node.node.publishedAt)
      const title = `*<${node.node.linkUrl}|${node.isNewArrival ? ':new:' : ''} ${index + 1}. ${node.node.title}>*`
      const author = `<${domain}/${node.node.author.urlName}|${node.node.author.urlName}>`

      if (index < 10) {
        blocks.push(
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${title}\n:art: _Written by ${author}_\n:+1: _${node.node.likesCount} LGTMs_\n:alarm_clock: _Posted ${createdAt.toLocaleString('ja')}_`
            },
            accessory: {
              type: "image",
              image_url: node.node.author.profileImageUrl,
              alt_text: node.node.author.urlName
            }
          },
          {
            type: "divider"
          }
        )
      }
    })

    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${domain}|Show more articles>*`
        }
      }
    )

    postSlack(blocks)
})

async function postSlack(blocks) {
  const payload = { name: 'Qiita トレンド', channel: process.env.CHANNEL_ID, blocks }
  const response = await axios.post(process.env.WEB_HOOK_URL, JSON.stringify(payload))
    .then(()  => {
      console.log('notification has been successfully.')
    })
    .catch((e) => {
      console.log(e)
    })
  return response
}
