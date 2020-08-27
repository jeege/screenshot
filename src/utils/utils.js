import os from "os";
import path from "path";
import fs from "fs";

export const formatTime = (time, formatStr) => {
  const t = new Date(time);
  const obj = {
    YYYY: t.getFullYear(),
    MM: `${t.getMonth() + 1}`.padStart(2, "0"),
    DD: `${t.getDate() + 1}`.padStart(2, "0"),
    HH: `${t.getHours()}`.padStart(2, "0"),
    mm: `${t.getMinutes()}`.padStart(2, "0"),
    ss: `${t.getSeconds()}`.padStart(2, "0")
  };
  return formatStr.replace(/YYYY|MM|DD|HH|mm|ss/gi, val => {
    return obj[val];
  });
};

export const mkdirsSync = dirname => {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
};

export const autoScroll = async page => {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totleHeight = 0;
      const distance = 800;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totleHeight += distance;
        if (totleHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
};

export const savePath = path.resolve(
  os.homedir(),
  "Downloads",
  formatTime(Date.now(), "YYYY-MM-DD")
);
