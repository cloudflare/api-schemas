const fetch = require('node-fetch');
const puppeteer = require('puppeteer');

(async () => {
  const crawler = {
    url: process.env.ALGOLIA_CRAWLER_URL,
    id: process.env.ALGOLIA_CRAWLER_ID,
    userId: process.env.ALGOLIA_CRAWLER_USER_ID,
    apiKey: process.env.ALGOLIA_CRAWLER_API_KEY,
  }

  const updateUrls = async (urls) => {
    const updateResponse = await fetch(`${crawler.url}/${crawler.id}/config`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${crawler.userId}:${crawler.apiKey}`).toString("base64")}`
      },
      body: JSON.stringify({
        extraUrls: urls
      })
    });

    console.log("Updating config")

    const updateJson = await updateResponse.json();
    if (!updateResponse.ok) console.log(updateJson);

    const runResponse = await fetch(`${crawler.url}/${crawler.id}/reindex`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${crawler.userId}:${crawler.apiKey}`).toString("base64")}`
      },
    });
    if (!runResponse.ok) console.log(runResponse);

    console.log("Running crawler")

    return {
      updateOk: updateResponse.ok,
      runOk: runResponse.ok,
    }
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  const url = 'https://developers.cloudflare.com/api?_expand=true&schema_url=https://raw.githubusercontent.com/cloudflare/api-schemas/json/openapi.yaml'

  console.log('Navigating to url: ', url)
  await page.goto(url);

  console.log("Waiting for page to render...")
  await page.waitForSelector('text/Cloudflare API Schema')

  // Wait for text from an expanded sidebar item
  await page.waitForSelector('text/List Accounts')

  const links = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    return links.map(link => link.href);
  });

  const filteredLinks = links.filter(link => {
    return link.startsWith('https://developers.cloudflare.com/api/')
  })

  const uniqLinks = [...new Set(filteredLinks)];

  console.log(`Got ${uniqLinks.length} links`)

  const resp = await updateUrls(uniqLinks);
  console.log(resp)

  await browser.close();
})()
