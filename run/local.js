#!/usr/bin/env node

const puppeteer = require('puppeteer-core');
let page = null;
let browser = null;
async function init() {
  try {
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'
    });
    page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.setCacheEnableed([false]);
    await page.setViewport({
      width: 640,
      height: 480,
      deviceScaleFactor: 1,
    });
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
    await page.waitFor(1000);
    let el = await page.$('input[name=email]');
    await el.type('test@g.ca', {
      delay,
      100
    });
    // await el.press('Enter');
    el = await page.$('input[name=email]');
    await el.type('password', {
      delay,
      100
    });
    await page.click('button[type=submit]');
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
    await page.click('a[href$="login"]');
    await page.waitFor(2000);
    await page.click('button[type=button]'); //signin
    await page.waitFor(2000);
    let el = await page.$('input[name=email]');
    await el.type('test@g.ca', { delay, 100 });
    await el.press('Enter');
    el = await page.$('input[name=password]');
    await el.type('password', {
      delay,
      100
    });
    el = await page.$('input[name=verify-password]');
    await el.type('password', {
      delay,
      100
    });
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
