const getIPAdress = require("./libs/utils");
// 引入express中间件
const express = require("express");
// 创建web服务器
const app = express();

const mdToHtml = require("./md");
mdToHtml();

// 指定启动服务器到哪个文件夹
app.use('/example', express.static("./"));

// 启动服务器监听80端口
// const port = 3000;
const server = app.listen(9000, () => {
  const port = server.address().port
  console.log("web server runnin at:");
  console.log(`Local:   http://localhost:${port}/example`);
  console.log(`Network: http://${getIPAdress.myHost}:${port}/example`);
});
