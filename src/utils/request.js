import http from "http";

export const fetchGet = (url, config = {}) => {
  return new Promise((resolve, reject) => {
    http.get(url, config, res => {
      if (res.statusCode === 200) {
        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", chunk => {
          rawData += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(rawData));
          } catch (e) {
            reject(e);
          }
        });
      } else {
        reject(res);
      }
    });
  });
};
