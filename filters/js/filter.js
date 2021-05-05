/**
 * HSL颜色值转换为RGB.
 * 换算公式改编自 http://en.wikipedia.org/wiki/HSL_color_space.
 * h, s, 和 l 设定在 [0, 1] 之间
 * 返回的 r, g, 和 b 在 [0, 255]之间
 *
 * @param   Number  h       色相
 * @param   Number  s       饱和度
 * @param   Number  l       亮度
 * @return  Array           RGB色值数值
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
/**
 * RGB 颜色值转换为 HSL.
 * 转换公式参考自 http://en.wikipedia.org/wiki/HSL_color_space.
 * r, g, 和 b 需要在 [0, 255] 范围内
 * 返回的 h, s, 和 l 在 [0, 1] 之间
 *
 * @param   Number  r       红色色值
 * @param   Number  g       绿色色值
 * @param   Number  b       蓝色色值
 * @return  Array           HSL各值数组
 */
function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.floor(h * 100), Math.round(s * 100), Math.round(l * 100)];
}

//将(x,y)的坐标转为单维的i
function xyToIFun(width) {
  return function (x, y, z) {
    z = z || 0;
    return (y * width + x) * 4 + z;
  };
}

/**
 * @description 将单维的i转换为(x,y)的坐标，i都是4的整数倍
 * @param       {Number}    width
 * @return      {Function}
 */
function iToXYFun(width) {
  return function (i) {
    const n = i;
    return [n % width, Math.floor(n / width)];
  };
}

/**
 * @description 两点之间的距离
 * @param {Array} p1 p2 两点坐标
 * @return {Number} Math.sqrt
 */
function distance(p1, p2) {
  p2 = p2 || [0, 0];
  if (!Array.isArray(p1) || !Array.isArray(p2)) {
    throw "参数错误";
  }
  const r = p1[0] - p2[0],
    i = p1[1] - p2[1];
  return Math.sqrt(r * r + i * i);
}

class Filter {
  /**
   * @param {} imgData 画布像素数据
   */
  constructor(imgData) {
    this.imgData = this.clone(imgData);
    // 原数据存储
    this.originalData = this.clone(imgData);
  }
  /** 拷贝数据，防止污染 */
  clone(imgData) {
    const imageData = new ImageData(imgData.width, imgData.height);
    imageData.data.set(imgData.data);
    return imageData;
  }
  // 还原
  reduction() {
    this.imgData = this.clone(this.originalData);
    return this.clone(this.originalData);
  }
  /** 亮度
   * @param {Number} brightness 值为<=0全黑，默认1，大于1更亮
   * @return {} imgData
   */
  brightness(brightness = 1) {
    const data = this.imgData.data;
    const colorDataArrLen = data.length;
    for (let i = 0; i < colorDataArrLen; i += 4) {
      for (var j = 0; j < 3; j++) {
        data[i + j] *= brightness;
      }
    }
    return this.imgData;
  }
  /** 对比度
   * @param {Number} contrast 0默认，-1时呈灰色
   * @return {} imgData
   */
  contrast(contrast = 1) {
    const data = this.imgData.data;
    const colorDataArrLen = data.length;
    for (let i = 0; i < colorDataArrLen; i += 4) {
      for (var j = 0; j < 3; j++) {
        data[i + j] += (data[i + j] - 127.5) * contrast;
      }
    }
    return this.imgData;
  }
  /**
   * 高斯模糊
   * @param {Number} radius 取样区域半径, 正数, 可选, 默认为 3.0
   * @param {Number} sigma 标准方差, 可选, 默认取值为 radius / 3
   * @return {} imgData
   */
  blur(radius = 3, sigma) {
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;
    let gaussMatrix = [],
      gaussSum = 0,
      x,
      y,
      r,
      g,
      b,
      a,
      i,
      j,
      k,
      len;
    radius = Number(radius) * 6;
    sigma = Number(sigma || radius / 3);

    a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
    b = -1 / (2 * sigma * sigma);
    //生成高斯矩阵
    for (i = 0, x = -radius; x <= radius; x++, i++) {
      g = a * Math.exp(b * x * x);
      gaussMatrix[i] = g;
      gaussSum += g;
    }
    //归一化, 保证高斯矩阵的值在[0,1]之间
    for (i = 0, len = gaussMatrix.length; i < len; i++) {
      gaussMatrix[i] /= gaussSum;
    }
    //x 方向一维高斯运算
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        r = g = b = a = 0;
        gaussSum = 0;
        for (j = -radius; j <= radius; j++) {
          k = x + j;
          if (k >= 0 && k < width) {
            //确保 k 没超出 x 的范围
            //r,g,b 四个一组
            i = (y * width + k) * 4;
            r += data[i] * gaussMatrix[j + radius];
            g += data[i + 1] * gaussMatrix[j + radius];
            b += data[i + 2] * gaussMatrix[j + radius];
            gaussSum += gaussMatrix[j + radius];
          }
        }
        i = (y * width + x) * 4;
        // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
        data[i] = r / gaussSum;
        data[i + 1] = g / gaussSum;
        data[i + 2] = b / gaussSum;
      }
    }
    //y 方向一维高斯运算
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        r = g = b = a = 0;
        gaussSum = 0;
        for (j = -radius; j <= radius; j++) {
          k = y + j;
          if (k >= 0 && k < height) {
            //确保 k 没超出 y 的范围
            i = (k * width + x) * 4;
            r += data[i] * gaussMatrix[j + radius];
            g += data[i + 1] * gaussMatrix[j + radius];
            b += data[i + 2] * gaussMatrix[j + radius];
            gaussSum += gaussMatrix[j + radius];
          }
        }
        i = (y * width + x) * 4;
        data[i] = r / gaussSum;
        data[i + 1] = g / gaussSum;
        data[i + 2] = b / gaussSum;
      }
    }
    //end
    return this.imgData;
  }
  /** 灰度处理0-1
   * @param {Number} gray 0-1
   * @return {} imgData
   */
  grayscale(num) {
    num = Number(num);
    if (num <= 0) {
      return this.imgData;
    }
    const data = this.imgData.data;
    for (let i = 0, n = data.length; i < n; i += 4) {
      const gray = Math.floor(
        0.2125 * data[i] + 0.7154 * data[i + 1] + 0.0721 * data[i + 2]
      );
      data[i] = Math.round(gray + (data[i] - gray) * (1 - num));
      data[i + 1] = Math.round(gray + (data[i + 1] - gray) * (1 - num));
      data[i + 2] = Math.round(gray + (data[i + 2] - gray) * (1 - num));
    }
    return this.imgData;
  }
  /** 平均灰度处理
   * @return {} imgData
   */
  grayaverage() {
    const data = this.imgData.data;
    for (let i = 0, n = data.length; i < n; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i + 2] = data[i + 1] = data[i] = gray;
    }
    return this.imgData;
  }
  /** 加权平均灰度一般处理
   * @return {} imgData
   */
  graycommon() {
    const data = this.imgData.data;
    for (let i = 0, n = data.length; i < n; i += 4) {
      const gray = parseInt(
        0.299 * data[i] + 0.578 * data[i + 1] + 0.114 * data[i + 2]
      );
      data[i + 2] = data[i + 1] = data[i] = gray;
    }
    return this.imgData;
  }
  /** 灰度去饱和
   * @return {} imgData
   */
  graydesat() {
    const data = this.imgData.data;
    for (let i = 0, n = data.length; i < n; i += 4) {
      const gray =
        (Math.max(data[i], data[i + 1], data[i + 2]),
        Math.min(data[i], data[i + 1], data[i + 2])) / 2;
      data[i + 2] = data[i + 1] = data[i] = gray;
    }
    return this.imgData;
  }
  /** 灰度最大
   * @return {} imgData
   */
  graymax() {
    const data = this.imgData.data;
    for (let i = 0, n = data.length; i < n; i += 4) {
      const gray = Math.max(data[i], data[i + 1], data[i + 2]);
      data[i + 2] = data[i + 1] = data[i] = gray;
    }
    return this.imgData;
  }
  /** 灰度最小
   * @return {} imgData
   */
  graymin() {
    const data = this.imgData.data;
    for (let i = 0, n = data.length; i < n; i += 4) {
      const gray = Math.min(data[i], data[i + 1], data[i + 2]);
      data[i + 2] = data[i + 1] = data[i] = gray;
    }
    return this.imgData;
  }
  /** 灰度单一通道
   * @param {String} color red/green/blue
   * @return {} imgData
   */
  graysingle(color) {
    if (!["red", "green", "blue"].includes(color)) {
      // 参数错误
      return this.imgData;
    }
    const data = this.imgData.data;
    for (let i = 0, n = data.length; i < n; i += 4) {
      const gray =
        color === "red"
          ? data[i]
          : color === "green"
          ? data[i + 1]
          : data[i + 2];
      data[i + 2] = data[i + 1] = data[i] = gray;
    }
    return this.imgData;
  }
  /** 单色滤镜
   * @param {String} color red/green/blue
   * @return {} imgData
   */
  singlecolor(color) {
    if (!["red", "green", "blue"].includes(color)) {
      // 参数错误
      return this.imgData;
    }
    const data = this.imgData.data;
    for (let i = 0, n = data.length; i < n; i += 4) {
      switch (color) {
        case "red":
          data[i + 1] = data[i + 2] = 0;
          break;
        case "green":
          data[i] = data[i + 2] = 0;
          break;
        default:
          data[i] = data[i + 1] = 0;
          break;
      }
    }
    return this.imgData;
  }
  /** 灰度阴影
   * @param {Number} num
   * @return {} imgData
   */
  grayshadow(num) {
    const data = this.imgData.data;
    const ConversionFactor = 255 / (num - 1);
    for (let i = 0, n = data.length; i < n; i += 4) {
      const AverageValue = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const gray =
        Math.round(AverageValue / ConversionFactor + 0.5) * ConversionFactor;
      data[i + 2] = data[i + 1] = data[i] = gray;
    }
    return this.imgData;
  }
  /** 色相旋转，反色
   * @param {Number} num 0 - 1之间 0默认无反色
   * @return {} imgData
   */
  invert(num) {
    num = Math.min(Number(num), 1);
    num = Math.max(Number(num), 0);
    if (num <= 0) {
      return this.imgData;
    }
    const data = this.imgData.data;

    for (var i = 0, n = data.length; i < n; i += 4) {
      data[i] = (255 - data[i]) * num;
      data[i + 1] = (255 - data[i + 1]) * num;
      data[i + 2] = (255 - data[i + 2]) * num;
    }

    return this.imgData;
  }
  /** 透明度
   * @param {Number} num 0 - 1之间 默认值为1
   * @return {} imgData
   */
  opacity(num) {
    num = Math.min(Number(num), 1);
    num = Math.max(Number(num), 0);
    if (num >= 1) {
      return this.imgData;
    }
    const data = this.imgData.data;

    for (var i = 0, n = data.length; i < n; i += 4) {
      //   data[i] = (255 - data[i]) * num;
      //   data[i + 1] = (255 - data[i + 1]) * num;
      data[i + 3] *= num;
    }
    return this.imgData;
  }

  /** 饱和度
   * @param {Number} num 值为 0 则是完全不饱和，默认值为 1 则图像无变化。其他值是效果的线性乘数。超过 1 则有更高的饱和度
   * @return {} imgData
   */
  saturate(num = 1) {
    num = Number(num);
    const data = this.imgData.data;
    for (let i = 0, len = data.length; i < len; i += 4) {
      const hslarr = rgbToHsl(data[i], data[i + 1], data[i + 2]); //将canvas图像一个像素转成hsl
      // const h = Math.round(hslarr[0]) / 100; //色调，处理成0-1之前数据
      // let s = Math.round(hslarr[1]) / 100; //饱和度
      // const l = Math.round(hslarr[2]) / 100; //亮度
      const h = hslarr[0] / 100;
      let s = hslarr[1] / 100;
      const l = hslarr[2] / 100;
      // if (s <= 0.95) {
      //   //处理饱和度，色调，亮度类似
      //   s = s + 0.05;
      // }
      s += s * (num - 1);
      const rgbarr = hslToRgb(h, s, l); //把处理后的hsl转成rgb
      data[i] = rgbarr[0];
      data[i + 1] = rgbarr[1];
      data[i + 2] = rgbarr[2];
    }
    return this.imgData;
  }
  /** 棕褐色
   * @return {} imgData
   */
  sepia() {
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const xyTFun = xyToIFun(width);
        const j = xyTFun(x, y, 0);
        const r = data[j],
          g = data[j + 1],
          b = data[j + 2];
        const newR = r * 0.393 + g * 0.769 + b * 0.189;
        const newG = r * 0.349 + g * 0.686 + b * 0.168;
        const newB = r * 0.272 + g * 0.534 + b * 0.131;
        data[j] = newR;
        data[j + 1] = newG;
        data[j + 2] = newB;
      }
    }
    return this.imgData;
  }
  /** 腐蚀
   * @return {} imgData
   */
  corrode(num) {
    const R = parseInt(num) || 3;
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;

    //区块
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const randomI = parseInt(Math.random() * R * 2) - R; //区块随机代表
        const randomJ = parseInt(Math.random() * R * 2) - R; //区块随机代表
        const realI = y * width + x;
        const realJ = (y + randomI) * width + x + randomJ;

        for (let j = 0; j < 3; j++) {
          data[realI * 4 + j] = data[realJ * 4 + j];
        }
      }
    }
    return this.imgData;
  }
  /**喷点
   * @return {} imgData
   */
  dotted(R = 1, r = 1) {
    //矩形半径
    R = Number(R);

    //内小圆半径
    r = Number(r);

    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;
    const xLength = R * 2 + 1;

    //构造距离模板
    const disTmlMatrix = [];

    const r2 = r * r;
    for (let x = -R; x < R; x++) {
      for (let y = -R; y < R; y++) {
        if (x * x + y * y > r2) {
          disTmlMatrix.push([x, y]);
        }
      }
    }

    const xyTFun = xyToIFun(width);

    //将大于距离外面的透明度置为0
    for (let x = 0, n = parseInt(width / xLength); x < n; x++) {
      for (let y = 0, m = parseInt(height / xLength); y < m; y++) {
        const middleX = parseInt((x + 0.5) * xLength);
        const middleY = parseInt((y + 0.5) * xLength);

        for (let i = 0; i < disTmlMatrix.length; i++) {
          let dotX = middleX + disTmlMatrix[i][0];
          let dotY = middleY + disTmlMatrix[i][1];

          data[xyTFun(dotX, dotY, 3)] = 225;
          data[xyTFun(dotX, dotY, 2)] = 225;
          data[xyTFun(dotX, dotY, 0)] = 225;
          data[xyTFun(dotX, dotY, 1)] = 225;
        }
      }
    }
    return this.imgData;
  }

  /**马赛克
   * @param {Number} num 马赛克方块大小，默认3
   * @return {} imgData
   */
  mosaic(num) {
    const R = parseInt(num) || 3;
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;
    const xLength = R * 2 + 1;
    const iToXy = iToXYFun(width)

    for (let x = 0, n = parseInt(width / xLength); x < n; x++) {
      for (let y = 0, m = parseInt(height / xLength); y < m; y++) {
        const average = [],
          sum = [0, 0, 0];
        for (let i = 0; i < xLength; i++) {
          for (let j = 0; j < xLength; j++) {
            const realI = (y * xLength + i) * width + x * xLength + j;
            sum[0] += data[realI * 4];
            sum[1] += data[realI * 4 + 1];
            sum[2] += data[realI * 4 + 2];
          }
        }
        average[0] = sum[0] / (xLength * xLength);
        average[1] = sum[1] / (xLength * xLength);
        average[2] = sum[2] / (xLength * xLength);

        for (let i = 0; i < xLength; i++) {
          for (let j = 0; j < xLength; j++) {
            const realI = (y * xLength + i) * width + x * xLength + j;
            data[realI * 4] = average[0];
            data[realI * 4 + 1] = average[1];
            data[realI * 4 + 2] = average[2];
          }
        }
      }
    }
    return this.imgData;
  }

  /**马赛克
   * @param {Number} num 马赛克方块大小，默认3
   * @return {} imgData
   */
  mosaicP(num) {
    const R = parseInt(num) || 3;
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;
    const xLength = R * 2 + 1;
    const iToXy = iToXYFun(width)

    for (let x = 0, n = parseInt(width / xLength); x < n; x++) {
      for (let y = 0, m = parseInt(height / xLength); y < m; y++) {
        const ww = x * xLength, hh = y * xLength;
        if (ww > 50 && ww < 100 && hh > 50 && hh < 100) {
          continue;
        }
        const average = [],
          sum = [0, 0, 0];
        for (let i = 0; i < xLength; i++) {
          for (let j = 0; j < xLength; j++) {
            const realI = (y * xLength + i) * width + x * xLength + j;
            sum[0] += data[realI * 4];
            sum[1] += data[realI * 4 + 1];
            sum[2] += data[realI * 4 + 2];
          }
        }
        average[0] = sum[0] / (xLength * xLength);
        average[1] = sum[1] / (xLength * xLength);
        average[2] = sum[2] / (xLength * xLength);

        for (let i = 0; i < xLength; i++) {
          for (let j = 0; j < xLength; j++) {
            const realI = (y * xLength + i) * width + x * xLength + j;
            data[realI * 4] = average[0];
            data[realI * 4 + 1] = average[1];
            data[realI * 4 + 2] = average[2];
          }
        }
      }
    }
    return this.imgData;
  }/**马赛克
   * @param {Number} num 马赛克方块大小，默认3
   * @return {} imgData
   */
  mosaicX(num) {
    const R = parseInt(num) || 3;
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;
    const xLength = R * 2 + 1;
    const iToXy = iToXYFun(width)

    for (let x = parseInt(50 / xLength), n = parseInt(100 / xLength); x < n; x++) {
      for (let y = parseInt(50 / xLength), m = parseInt(100 / xLength); y < m; y++) {
        const average = [],
          sum = [0, 0, 0];
        for (let i = 0; i < xLength; i++) {
          for (let j = 0; j < xLength; j++) {
            const realI = (y * xLength + i) * width + x * xLength + j;
            sum[0] += data[realI * 4];
            sum[1] += data[realI * 4 + 1];
            sum[2] += data[realI * 4 + 2];
          }
        }
        average[0] = sum[0] / (xLength * xLength);
        average[1] = sum[1] / (xLength * xLength);
        average[2] = sum[2] / (xLength * xLength);

        for (let i = 0; i < xLength; i++) {
          for (let j = 0; j < xLength; j++) {
            const realI = (y * xLength + i) * width + x * xLength + j;
            data[realI * 4] = average[0];
            data[realI * 4 + 1] = average[1];
            data[realI * 4 + 2] = average[2];
          }
        }
      }
    }
    return this.imgData;
  }

  /**锐化
   * @param {Number} num 锐化程度
   * @return {} imgData
   */
  sharp(num) {
    const lamta = parseFloat(num) || 1;
    const data = this.imgData.data;
    const width = this.imgData.width;

    for (let i = 0, n = data.length; i < n; i += 4) {
      const ii = i / 4;
      const row = parseInt(ii / width);
      const col = ii % width;
      if (row == 0 || col == 0) continue;

      const A = ((row - 1) * width + (col - 1)) * 4;
      const B = ((row - 1) * width + col) * 4;
      const E = (ii - 1) * 4;

      for (let j = 0; j < 3; j++) {
        const delta =
          data[i + j] - (data[B + j] + data[E + j] + data[A + j]) / 3;
        data[i + j] += delta * lamta;
      }
    }
    return this.imgData;
  }

  /**色调分离
   * @param {Number} num 灰度阶数 默认20
   * @return {} imgData
   */
  posterize(num) {
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;

    //灰度阶数
    //由原来的255阶映射为现在的阶数
    let step = Number(num) || 20;

    step = step < 1 ? 1 : step > 255 ? 255 : step;
    const level = Math.floor(255 / step);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const xyTFun = xyToIFun(width);
        const j = xyTFun(x, y, 0);
        data[j] = Math.floor(data[j] / level) * level;
        data[j + 1] = Math.floor(data[j + 1] / level) * level;
        data[j + 2] = Math.floor(data[j + 2] / level) * level;
      }
    }
    return this.imgData;
  }

  /**油画
   * @param {Number} num 默认16
   * @return {} imgData
   */
  oilPainting(num) {
    const R = parseInt(num) || 16;
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;

    //区块
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const realI = y * width + x;
        let gray = 0;
        for (let j = 0; j < 3; j++) {
          gray += data[realI * 4 + j];
        }
        gray = gray / 3;
        const every = parseInt(gray / R) * R;
        for (let j = 0; j < 3; j++) {
          data[realI * 4 + j] = every;
        }
      }
    }
    return this.imgData;
  }

  /**杂色
   * @param {Number} num 默认100
   * @return {} imgData
   */
  noise(num) {
    const R = parseInt(num) || 100;
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;

    //区块
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const realI = y * width + x;
        for (let j = 0; j < 3; j++) {
          const rand = parseInt(Math.random() * R * 2) - R;
          data[realI * 4 + j] += rand;
        }
      }
    }

    return this.imgData;
  }
  /** 浮雕效果
   * @return {} imgData
   */
  embossment() {
    const data = this.imgData.data;
    const width = this.imgData.width;

    const outData = [];
    for (let i = 0, n = data.length; i < n; i += 4) {
      const ii = i / 4;
      const row = parseInt(ii / width);
      const col = ii % width;
      const A = ((row - 1) * width + (col - 1)) * 4;
      const G = (row + 1) * width * 4 + (col + 1) * 4;

      if (row == 0 || col == 0) continue;
      for (let j = 0; j < 3; j++) {
        outData[i + j] = data[A + j] - data[G + j] + 127.5;
      }
      outData[i + 4] = data[i + 4];
    }

    for (let i = 0, n = data.length; i < n; i++) {
      data[i] = outData[i] || data[i];
    }

    return this.imgData;
  }

  /** 暗角
   * @param {Number} R 暗角级别，1-10，默认3
   * @param {Number} lastLevel 暗角最终的级别 0-255
   */
  darkCorner(R = 3, lastLevel = 30) {
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;

    // 中心点，这里的中心点是像素中心
    const middleX = (width * 2) / 3;
    const middleY = (height * 1) / 2;
    // 距离中心点最长距离
    const maxDistance = distance([middleX, middleY]);
    // 开始产生暗角的距离
    const startDistance = maxDistance * (1 - R / 10);

    const f = function (x, p0, p1, p2, p3) {
      // 基于三次贝塞尔曲线
      return (
        p0 * Math.pow(1 - x, 3) +
        3 * p1 * x * Math.pow(1 - x, 2) +
        3 * p2 * x * x * (1 - x) +
        p3 * Math.pow(x, 3)
      );
    };
    // 计算当前点应增加的暗度
    function calDark(x, y, p) {
      //计算距中心点距离
      const thedistance = distance([x, y], [middleX, middleY]);
      let currBilv =
        (thedistance - startDistance) / (maxDistance - startDistance);
      if (currBilv < 0) currBilv = 0;

      //应该增加暗度
      return (f(currBilv, 0, 0.02, 0.3, 1) * p * lastLevel) / 255;
    }

    // 区块
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const realI = y * width + x;
        for (let j = 0; j < 3; j++) {
          const dDarkness = calDark(x, y, data[realI * 4 + j]);
          data[realI * 4 + j] -= dDarkness;
        }
      }
    }

    return this.imgData;
  }
  /**伽马校正，调整图像的整体亮度
   * @param {Number} num -100到100 默认10
   */
  gamma(num = 10) {
    const data = this.imgData.data;
    const width = this.imgData.width;
    const height = this.imgData.height;

    const gamma = Number(num);
    const normalizedArg = ((gamma + 100) / 200) * 2;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const xyTFun = xyToIFun(width);
        const j = xyTFun(x, y, 0);
        data[j] = Math.pow(data[j], normalizedArg);
        data[j + 1] = Math.pow(data[j + 1], normalizedArg);
        data[j + 2] = Math.pow(data[j + 2], normalizedArg);
      }
    }

    return this.imgData;
  }
}
