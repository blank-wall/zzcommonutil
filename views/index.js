// @ts-nocheck
"use strict";
function MainPaint () {
  this.canvas = document.getElementById('canvas')
  this.ctx = this.canvas.getContext('2d')
  this.baseW = this.canvas.clientWidth
  this.bgConfig = []
  //截图
  this.clipcanvas = document.getElementById('clipcanvas')
  this.clipctx = this.clipcanvas.getContext('2d')

  this.clipcanvas.width = this.canvas.clientWidth;
  this.clipcanvas.height = this.canvas.clientHeight;
  this.start = null
  this.clipArea = {} //裁剪范围

  // 点击
  this.keyCode = null
}

// 绘画初始
MainPaint.prototype.paintRect = function () {
  window.addEventListener('message', async (event) => {
    const message = event.data
    try {
      let img = await this.getImageObj(message.imageSrc)
      let rate = this.compress(img, this.baseW)
      this.bgConfig = [img, 0, 0, img.width, img.height, 0, 0, rate.w, rate.h]
      await this.drawn()
      setInterval(async () => {
        img = await this.getImageObj(message.imageSrc + '?' + new Date().getTime())
        rate = this.compress(img, this.baseW)
        this.bgConfig = [img, 0, 0, img.width, img.height, 0, 0, rate.w, rate.h]
        await this.drawn()
      }, 5000)
    } catch (e) {
      console.error(e)
    }
  })

  this.clipcanvas.addEventListener('mousedown', (e) => {
    if (this.keyCode) {
      this.start = {
        x: e.offsetX,
        y: e.offsetY,
      }
    }
  })

  this.clipcanvas.addEventListener('mousemove', (e) => {
    if (this.start) {
      this.fill(
        this.start.x,
        this.start.y,
        e.offsetX - this.start.x,
        e.offsetY - this.start.y
      )
    }
  })

  document.addEventListener('mouseup', () => {
    if (this.start && this.clipArea && this.keyCode) {
      this.start = null
      this.exportImg(this.clipArea)
      this.clipctx.clearRect(
        0,
        0,
        this.clipcanvas.width,
        this.clipcanvas.height
      )
    }
  })

  document.addEventListener("keydown", (event) => {
    if (event.keyCode === 17) {
      this.keyCode = 17
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.keyCode === 17) {
      this.keyCode = null
    }
  });

  this.clipcanvas.addEventListener("click", () => {
    console.log('zzclick');
    const element = window.event;
    console.log('zzz', element);
    this.copyCoordinate(element);
  });
}

// 加载绘画
MainPaint.prototype.drawn = function () {
  this.ctx.clearRect(
    0,
    0,
    this.canvas.clientWidth,
    this.canvas.clientHeight
  )
  if (this.bgConfig) {
    this.ctx.drawImage(...this.bgConfig)
  }
}

//图片压缩,获取等比缩放后的结果
MainPaint.prototype.compress = function (img, base) {
  let w = img.width
  let h = img.height
  // if (img.width > img.height) {
  //   if (img.width > base) {
  //     //要将宽度缩放
  //     w = base
  //     h = (w / img.width) * img.height // 新的 宽比 高 = 旧的宽比高  h / w = img.heigth/img.width  ;
  //   }
  // } else {
  //   if (img.height > base) {
  //     h = base
  //     w = (h / img.height) * img.width
  //   }
  // }
  // console.log(w, h, img.width, img.height);
  return { w, h }
}

// 加载图片
MainPaint.prototype.getImageObj = function (url) {
  const img = new Image()
  img.src = url
  return new Promise((resolve, reject) => {
    img.onload = function () {
      resolve(img)
    }
    img.onerror = function (e) {
      reject(e)
    }
  })
}

// 截图绘画处理
MainPaint.prototype.fill = function (x, y, w, h) {
  this.clipctx.clearRect(
    0,
    0,
    this.clipcanvas.width,
    this.clipcanvas.height
  )
  this.clipctx.beginPath()
  this.clipctx.fillStyle = 'rgba(0,0,0,0)'
  this.clipctx.strokeStyle = 'blue'
  //遮罩层
  this.clipctx.globalCompositeOperation = 'source-over'
  this.clipctx.fillRect(
    0,
    0,
    this.clipcanvas.width,
    this.clipcanvas.height
  )
  //画框
  this.clipctx.globalCompositeOperation = 'destination-out'
  this.clipctx.fillRect(x, y, w, h)
  //描边
  this.clipctx.globalCompositeOperation = 'source-over'
  this.clipctx.moveTo(x, y)
  this.clipctx.lineTo(x + w, y)
  this.clipctx.lineTo(x + w, y + h)
  this.clipctx.lineTo(x, y + h)
  this.clipctx.lineTo(x, y)
  this.clipctx.stroke()
  this.clipctx.closePath()
  this.clipArea = { x, y, w, h }
}

// 开始截图
MainPaint.prototype.startClip = function (area) {
  if (!area) return
  var canvas = document.createElement('canvas')
  canvas.width = area.w
  canvas.height = area.h
  var data = this.ctx.getImageData(area.x, area.y, area.w, area.h)
  var context = canvas.getContext('2d')
  context.putImageData(data, 0, 0)
  return canvas.toDataURL('image/png')
}

// 截图处理
MainPaint.prototype.exportImg = function (clipArea) {
  var url = this.startClip(clipArea)
  console.log('url', url);
  // var dlLink = document.createElement('a');
  // dlLink.download = "image";
  // dlLink.href = url;
  // dlLink.click();
  // console.log('dlLink', dlLink);
}

// 获取元素坐标
MainPaint.prototype.getCoordinate = function (element) {
  const x = element.offsetX;
  const y = element.offsetY;
  return { x, y };
};

// 点击复制坐标到粘贴板
MainPaint.prototype.copyCoordinate = function (element) {
  const { x, y } = this.getCoordinate(element);
  const str = `zzCommonFunc.clickRelativeLocation(${x}, ${y})`;
  const input = document.createElement('input');
  input.value = str;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
};

var MP = new MainPaint()
MP.paintRect()
