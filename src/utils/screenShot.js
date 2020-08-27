import { BrowserWindow, app, ipcMain } from "electron";
import { fetchGet } from "./request";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer-core";
import findChrome from "./findChrome";
import { mkdirsSync, autoScroll, savePath } from "./utils";

const resolve = path.resolve;

function getSingle(fn) {
  let instance;
  if (Object.prototype.toString.call(fn) === "[object AsyncFunction]") {
    return async () => {
      return instance || (instance = await fn());
    };
  } else {
    return () => {
      return instance || (instance = fn);
    };
  }
}

const getPupInsatnce = async () => {
  const { executablePath } = await findChrome({});
  let browser, window, page;
  if (executablePath) {
    // 已安装chrome
    browser = await puppeteer.launch({
      executablePath: executablePath
    });
    page = await browser.newPage();
  } else {
    // 未安装，使用electron自带Chromium
    const port = app.commandLine.getSwitchValue("remote-debugging-port");
    const { webSocketDebuggerUrl } = await fetchGet(
      `http://127.0.0.1:${port}/json/version`
    );
    browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      defaultViewport: null
    });
    const window = new BrowserWindow({
      fullscreen: true,
      show: true
    });
    const url = "about:blank";
    await window.loadURL(url);
    const pages = await browser.pages();
    page = pages.find(page => page.url() === window.webContents.getURL());
  }
  return {
    browser,
    window,
    page
  };
};

const getSinglePupInsatnce = getSingle(getPupInsatnce);

export class ScreenShot {
  constructor(config) {
    this.brower = config.brower;
    this.page = config.page;
    this.window = config.window;
    this.log = config.logFn;
    this.checkPath();
  }

  checkPath() {
    if (!fs.existsSync(savePath)) {
      mkdirsSync(savePath);
    }
  }

  async go(url) {
    await this.page.goto(url);
    await this.page.setViewport({
      width: 1615,
      height: 800
    });
    await autoScroll(this.page);
  }

  async shot(title) {
    await this.page.screenshot({
      path: resolve(savePath, title + ".jpeg"),
      type: "jpeg",
      quality: 70,
      fullPage: true
    });
    let printPath =
      process.platform === "win32" ? savePath.replace(/\\/g, "/") : savePath;
    this.log(title + ".png 已保存至目录：" + printPath);
  }
}

async function getSceenShotInstance(logFn) {
  const pupInstance = await getSinglePupInsatnce();
  return new ScreenShot({
    logFn,
    ...pupInstance
  });
}

export async function screenShotHandle(logFn, token) {
  let isCanceled = false;
  token.cancel = () => {
    isCanceled = true;
  };
  const screen = await getSceenShotInstance(logFn);
  if (screen.page) {
    logFn("正在加载所有品牌...");
    await screen.go("https://super.fanli.com/#J_brand_area");
    const items = await screen.page.$$eval(".J_brand_mod", els => {
      return els.map(el => {
        return {
          title: el.querySelector(".img").alt.replace(/\s|\//g, "_"),
          link: el.querySelector(".link").href.split("?")[0]
        };
      });
    });
    logFn(`加载完成，共有${items.length}个品牌，准备开始截图`);
    for (let i = 0, item; (item = items[i++]); ) {
      if (!isCanceled) {
        logFn(`正在加载（${i}/${items.length}）：${item.link}`);
        await screen.go(item.link);
        await screen.shot(item.title);
      } else {
        logFn("停止截图");
        return;
      }
    }
    logFn("全部截图完成");
  }
}

export async function screenShotWithStop(logFn) {
  const cancelToken = {};
  ipcMain.once("stopShot", () => {
    cancelToken.cancel();
  });
  screenShotHandle(logFn, cancelToken);
}

export async function singleShotHandle(logFn, url) {
  // https://super.fanli.com/brand-3765
  const screen = await getSceenShotInstance(logFn);
  if (screen.page) {
    logFn(`正在加载：${url}`);
    await screen.go(url);
    const title = await screen.page.title();
    await screen.shot(title.replace(/\s|\//g, "_"));
  }
}
