const fs = require("fs");
const myFs = require("./libs/fs");
const marked = require("marked");

async function mdToHtml() {
  const html = await myFs.readFile("./public/templates/index.html");
  if (!(html.code == 1 && html.data)) {
    return;
  }
  const md = await myFs.readFile("./README.md");
  if (!(md.code == 1 && md.data)) {
    return;
  }
  const mdString = marked(md.data);
  const content = html.data.replace("{{mdString}}", mdString);
  try {
    fs.writeFileSync("./index.html", content);
  } catch (err) {
    console.error(err);
  }
}

module.exports = mdToHtml;
