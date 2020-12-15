/** Canvas 一些基本函数 */
let C = {};
// 获取鼠标在元素上的坐标
C.getOffset = function (ele) {
  let mouse = { x: 0, y: 0 };
  ele.addEventListener("mousemove", function (e) {
    let { x, y } = C.eventWrapper(e);
    mouse.x = x;
    mouse.y = y;
  });
  return mouse;
};
// 坐标系转换，新的标准可以使用e.offsetX,e.offsetY，但是有兼容性问题
C.eventWrapper = function (e) {
  let { pageX, pageY, target } = e;
  let { left, top } = target.getBoundingClientRect();
  return { x: pageX - left, y: pageY - top };
};

// 角度转弧度
C.toRad = function (angle) {
  return (angle * Math.PI) / 180;
};
// 弧度转角度
C.toAngle = function (rad) {
  return (rad * 180) / Math.PI;
};

/** 三角函数 */
C.sin = function (angle) {
  return Math.sin(C.toRad(angle));
};
C.cos = function (angle) {
  return Math.cos(C.toRad(angle));
};
C.tan = function (angle) {
  return Math.tan(C.toRad(angle));
};
/** 反三角函数 */
C.arcsin = function (a, c) {
  return C.toAngle(Math.asin(a / c));
};
C.arccos = function (a, c) {
  return C.toAngle(Math.acos(a / c));
};
C.arctan = function (a, c) {
  return C.toAngle(Math.atan(a / c));
};
