console.log('22');
const puppeteer = require('puppeteer-core');
console.log('22');
let page = null;
let browser = null;
async function init() {
console.log('22');
  try {
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'
    });
console.log('22');
console.log('22');
    page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.setCacheEnableed([false]);
    await page.setViewport({
      width: 640,
      height: 480,
      deviceScaleFactor: 1,
    });
    console.log(`Msg 1 ${page}`);
  } catch (er) {
    console.log(`Msg Error; ${error.stack}`);
    console.log(`Msg Error; ${error.message}`);
  }
  // await browser.close();
}
async function login() {
  try {
    await page.goto('http://localhost:3000');
    await page.waitFor(1000);
    await page.click('a[href$="login"]');
    console.log(`Msg 1 ${page}`);
    await page.waitFor(1000);
    let el = await page.$('input[name=email]');
    await el.type('test@g.ca', { delay: 100 });
    console.log(`Msg 1 ${page}`);
    // await el.press('Enter');
    el = await page.$('input[name=email]');
    await el.type('password', { delay: 100 });
    console.log(`Msg 1 ${page}`);
    await page.click('button[type=submit]');
    console.log(`Msg 1 ${page}`);
  } catch (er) {
    console.log(`Msg Error; ${error.stack}`);
    console.log(`Msg Error; ${error.message}`);
  }
  // await browser.close();
}
async function signin() {
  try {
    await page.goto('http://localhost:3000');
    await page.waitFor(2000);
    console.log(`Msg 1 ${page}`);
    await page.click('a[href$="login"]');
    await page.waitFor(2000);
    await page.click('button[type=button]'); //signin
    console.log(`Msg 1 ${page}`);
    await page.waitFor(2000);
    let el = await page.$('input[name=email]');
    console.log(`Msg 1 ${page}`);
    await el.type('test@g.ca', { delay: 100 });
    await el.press('Enter');
    console.log(`Msg 1 ${page}`);
    el = await page.$('input[name=password]');
    await el.type('password', { delay: 100 });
    el = await page.$('input[name=verify-password]');
    console.log(`Msg 1 ${page}`);
    await el.type('password', { delay: 100 });
    await page.click('button[type=submit]');
  } catch (er) {
    console.log(`Msg Error; ${error.stack}`);
    console.log(`Msg Error; ${error.message}`);
  }
  // await browser.close();
}

async function main(){
  await init();
  // await login();
  await signin();
}
main();