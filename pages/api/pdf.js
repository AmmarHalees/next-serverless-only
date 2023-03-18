/* eslint-disable import/no-anonymous-default-export */

import edgeChromium from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'
const LOCAL_CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

let BaseUrl = "https://www.nuclue.com";
const path = "/en/resume/print/";
const viewport = { width: 2480, height: 3508 };
const pdf_settings = {
  format: "a4",
  printBackground: true,
  margin: {
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
  },
  scale: 1,
};
export default async function (req, res) {
  try {
    const executablePath = await edgeChromium.executablePath || LOCAL_CHROME_EXECUTABLE

    // Edge executable will return an empty string locally.
    // borweser launch
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars", "--disable-web-security"],
      ignoreHTTPSErrors: true,
      executablePath,
      args: edgeChromium.args,
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions'],
    })
    // get req params 
    let url = BaseUrl + path + req.query.id;
    // page goto
    const page = await browser.newPage()
    await page.goto(url,
      {
        waitUntil: 'networkidle0',
        timeout: 0
      })

    await page.emulateMediaType("screen");
    await page.setViewport(viewport);

    const pdfBuffer = await page.pdf(pdf_settings);

    // send pdf binary as buffer stream
    res.send(pdfBuffer);
    await browser.close();

  }
  catch (error) {
    res.send({
      error: error
    });

    console.log(error);
  }

}