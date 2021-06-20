function drawText(ctx, name, size) {
  const width = size[0];
  ctx.save(); // 暂存状态
  //   ctx.translate(-0.5 * width, -0.5 * size[0]);
  ctx.fillStyle = "#000";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.fillText(name, 0.5 * size[0], 40);
  ctx.restore(); // 恢复状态
}

// 绘制正方形
function drawSquare() {
  const canvas = document.querySelector("#square");
  const canvasSize = [canvas.width, canvas.height];
  const ctx = canvas.getContext("2d");
  drawText(ctx, "正方形", canvasSize);
  const rectSize = [100, 100];
  ctx.save(); // 暂存状态
  ctx.translate(-0.5 * rectSize[0], -0.5 * rectSize[1]);
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.rect(0.5 * canvasSize[0], 0.5 * canvasSize[1], ...rectSize);
  ctx.fill();
  ctx.restore(); // 恢复状态
}

// 绘制长方形
function drawRectangle() {
  const canvas = document.querySelector("#rectangle");
  const canvasSize = [canvas.width, canvas.height];
  const ctx = canvas.getContext("2d");
  drawText(ctx, "长方形", canvasSize);
  const rectSize = [200, 100];
  ctx.save(); // 暂存状态
  ctx.translate(-0.5 * rectSize[0], -0.5 * rectSize[1]);
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.rect(0.5 * canvasSize[0], 0.5 * canvasSize[1], ...rectSize);
  ctx.fill();
  ctx.restore(); // 恢复状态
}

// 绘制三角形
function drawTriangle() {
  const canvas = document.querySelector("#triangle");
  const canvasSize = [canvas.width, canvas.height];
  const width_2 = 0.5 * canvasSize[0];
  const height_2 = 0.5 * canvasSize[1];
  const ctx = canvas.getContext("2d");
  drawText(ctx, "三角形", canvasSize);
  const rectSize = [120, 80]; // 等腰三角形，底120，高80，腰100
  ctx.save(); // 暂存状态
  ctx.translate(-0.5 * rectSize[0], -0.5 * rectSize[1]);
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.lineTo(width_2 + rectSize[0] / 2, height_2);
  ctx.lineTo(width_2 + rectSize[0], height_2 + rectSize[1]);
  ctx.lineTo(width_2, height_2 + rectSize[1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore(); // 恢复状态
}

// 绘制椭圆
function drawEllipse() {
  const canvas = document.querySelector("#ellipse");
  const canvasSize = [canvas.width, canvas.height];
  const width_2 = 0.5 * canvasSize[0];
  const height_2 = 0.5 * canvasSize[1];
  const ctx = canvas.getContext("2d");
  drawText(ctx, "椭圆", canvasSize);
  const rectSize = [100, 50];
  ctx.save(); // 暂存状态
  //   ctx.translate(-0.5 * rectSize[0], -0.5 * rectSize[1]);
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.ellipse(width_2, height_2, ...rectSize, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore(); // 恢复状态
}

// 绘制椭圆
function drawCir() {
  const canvas = document.querySelector("#circular");
  const canvasSize = [canvas.width, canvas.height];
  const width_2 = 0.5 * canvasSize[0];
  const height_2 = 0.5 * canvasSize[1];
  const ctx = canvas.getContext("2d");
  drawText(ctx, "圆", canvasSize);
  const r = 50;
  ctx.save(); // 暂存状态
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(width_2, height_2, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore(); // 恢复状态
}

// 画五角星，具体可见https://www.jianshu.com/p/28c43ae084d0
function drawFiveStar() {
  const canvas = document.querySelector("#five-star");
  const canvasSize = [canvas.width, canvas.height];

  const width_2 = 0.5 * canvasSize[0];
  const height_2 = 0.5 * canvasSize[1];

  const ctx = canvas.getContext("2d");
  drawText(ctx, "五角星", canvasSize);

  ctx.translate(width_2, height_2);
  ctx.rotate(0);
  ctx.scale(50, 50);

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  for (let i = 0; i < 5; i++) {
    const x1 = Math.cos(((54 + i * 72) / 180) * Math.PI);
    const y1 = Math.sin(((54 + i * 72) / 180) * Math.PI);
    const x2 = Math.cos(((18 + i * 72) / 180) * Math.PI) * 0.5;
    const y2 = Math.sin(((18 + i * 72) / 180) * Math.PI) * 0.5;
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y1);
  }
  ctx.closePath();

  ctx.stroke();
  ctx.restore(); // 恢复状态
}

(function () {
  drawSquare();
  drawRectangle();
  drawTriangle();
  drawEllipse();
  drawCir();
  drawFiveStar();
})();
