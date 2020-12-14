const fs = require("fs");

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject({ code: 0, err });
        return;
      }
      resolve({ code: 1, data });
    });
  });
}

module.exports = { readFile };
