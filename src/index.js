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
const urls = ['https://qiita.com/']
const promises = urls.map((url) => {
  return (async () => {
    try {
      const $ = await rp.get(url, options)
      const elm = $('script[data-component-name="HomeArticleTrendFeed"]')[0]['children']
      return elm
    } catch(e) {
      console.error('Error: ', e)
    }
  })()
})

Promise.all(promise).then((result) => {
    const domain = "https://qiita.com/"
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
    let now = new Date()
    now.setTime(now.getTime() + (9 * 60 * 60 * 1000))

    nodeList.map(function (node, index) {
      const diffDate = Math.round(
        (now - new Date(node.node.createdAt))  / (24 * 60 * 60 * 1000)
      )
      const title = `*<${node.node.linkUrl}|${index + 1}. ${(node.isNewArrival ? ':new: ' : '') + node.node.title}>*`
      const author = `_<${domain}${node.node.author.urlName}|${node.node.author.urlName}>_`

      if (index < 10) {
        blocks.push(
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${title}\n:pencil: written by ${author}\n:+1: ${node.node.likesCount} LGTMs\n:alarm_clock: posted ${diffDate} days ago`
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
  const payload = { name: 'Qiita トレンド', channel: 'DTEN4T79S', blocks }
  const response = await axios.post(process.env.WEB_HOOK_URL, JSON.stringify(payload))
    .then(()  => {
      // Todo
    })
    .catch((e) => {
      console.log(e)
    })
  return response
}
