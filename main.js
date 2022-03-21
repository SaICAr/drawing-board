const canvas1 = document.getElementById('canvas1')
const context1 = canvas1.getContext('2d')
canvas1.width = window.innerWidth
canvas1.height = window.innerHeight

const canvas2 = document.getElementById('canvas2')
const context2 = canvas2.getContext('2d')
canvas2.width = window.innerWidth
canvas2.height = window.innerHeight
context2.lineWidth = 15

const eraser = document.getElementById('eraser')
const pen = document.getElementById('pen')
const brush = document.getElementById('brush')
const clear = document.getElementById('clear')
const save = document.getElementById('save')
const sizeTool = document.getElementById('sizes')
const lineColors = document.querySelector('.line-color').querySelectorAll('li')
const lineSizes = document.querySelector('.line-size').querySelectorAll('li')

// 用户是否在操作
let isDown = false
let eraserEnable = false

eraser.addEventListener('click', () => {
  eraserEnable = true
  eraser.classList.add('active')
  pen.classList.remove('active')
  brush.classList.remove('active')
})

pen.addEventListener('click', () => {
  eraserEnable = false
  pen.classList.add('active')
  eraser.classList.remove('active')
  brush.classList.remove('active')
  document.body.style.cursor = "url('./img/painter.png') 0 32, auto"
  sizeTool.style.display = 'block'
})

brush.addEventListener('click', () => {
  eraserEnable = false
  brush.classList.add('active')
  pen.classList.remove('active')
  eraser.classList.remove('active')
  document.body.style.cursor = "url('./img/brush.png') 0 32, auto"
  sizeTool.style.display = 'none'
})

clear.addEventListener('click', () => {
  context2.clearRect(0, 0, canvas2.width, canvas2.height)
})

save.addEventListener('click', () => {
  let dataURL = canvas2.toDataURL('image/png')
  let link = document.createElement('a')
  link.setAttribute('href', dataURL)
  link.download = '我的作品'
  link.click()
})

// 画画
let beginPoint = {
  x: undefined,
  y: undefined
}
let points = []

listenToUser()
changeLineProperty(lineColors)
changeLineProperty(lineSizes)
drawGrid(canvas1, context1, 30, '#ccc', 5)

function listenToUser() {
  if ('ontouchstart' in document) {
    canvas2.addEventListener('touchstart', (e) => {
      userDown(e)
    })
    canvas2.addEventListener('touchmove', (e) => {
      userMove(e)
    })
    canvas2.addEventListener('touchend', (e) => {
      userUp(e)
    })
  }
  canvas2.addEventListener('mousedown', (e) => {
    userDown(e)
  })
  // onmousemove 在内部有一个响应时间，如果我们画的太快
  // 那么浏览器mousemove可能还没有触发，那么就会造成断层
  // 通过用线将两点连起来的方式，将断层缝合起来，这样看起来
  // 就不会有断连的感觉
  canvas2.addEventListener('mousemove', (e) => {
    userMove(e)
  })
  canvas2.addEventListener('mouseup', (e) => {
    userUp()
  })
}

function userDown(e) {
  sizeTool.classList.add('fade-out')
  isDown = true
  let { x, y } = getPosition(e)
  points.push({ x, y })

  if (eraserEnable) {
    context2.clearRect(x - 5, y - 5, 10, 10)
  } else {
    beginPoint = { x, y }
  }
}
function userMove(e) {
  if (isDown) {
    const { x, y } = getPosition(e)
    points.push({ x, y })

    if (eraserEnable) {
      context2.clearRect(x - 5, y - 5, 10, 10)
    } else {
      if (points.length >= 3) {
        const lastTwoPoints = points.slice(-2)
        const controlPoint = lastTwoPoints[0]
        const endPoint = {
          x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
          y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2
        }
        drawLine(beginPoint, controlPoint, endPoint)
        beginPoint = endPoint
      }
    }
  }
}
function userUp() {
  isDown = false
}

// 画线
function drawLine(beginPoint, controlPoint, endPoint) {
  context2.lineJoin = 'round'
  context2.lineCap = 'round'
  context2.beginPath()
  // 笔的位置
  context2.moveTo(beginPoint.x, beginPoint.y)
  // 利用二次贝塞尔曲线让线更加圆滑
  context2.quadraticCurveTo(
    controlPoint.x,
    controlPoint.y,
    endPoint.x,
    endPoint.y
  )
  context2.stroke()
  context2.closePath()
}
// 画网格
function drawGrid(canvas, context, girdSize, girdColor, girdDensity) {
  const xLines = Math.floor(canvas.width / girdSize) + 1
  const yLines = Math.floor(canvas.height / girdSize) + 1
  context.strokeStyle = girdColor
  context.setLineDash([girdDensity])
  // XLine
  for (let i = 0; i < yLines; i++) {
    context.beginPath()
    context.moveTo(0, i * girdSize)
    context.lineTo(canvas.width, i * girdSize)
    context.stroke()
    context.closePath()
  }

  // yLine
  for (let i = 0; i < xLines; i++) {
    context.beginPath()
    context.moveTo(i * girdSize, 0)
    context.lineTo(i * girdSize, canvas.height)
    context.stroke()
    context.closePath()
  }
}

function getPosition(e) {
  let x = e.clientX
  let y = e.clientY

  if ('ontouchstart' in document) {
    e.preventDefault()
    x = e.touches[0].clientX
    y = e.touches[0].clientY
  }
  return { x, y }
}

function changeLineProperty(properties) {
  properties.forEach((prop) => {
    prop.addEventListener('click', function () {
      if (prop.className.slice(0, 4) === 'size') {
        // 改变画笔的宽度
        const size = window.getComputedStyle(this, null)['height']
        context2.lineWidth = size.slice(0, 2)
      } else {
        // 改变画笔的颜色
        sizeTool.classList.remove('fade-out')
        const color = window.getComputedStyle(this, null)['backgroundColor']
        context2.strokeStyle = color
        context2.fillStyle = color
        lineSizes.forEach((item) => {
          item.style.backgroundColor = color
        })
      }
      this.classList.add('active')
      properties.forEach((item) => {
        if (item !== this) {
          item.classList.remove('active')
        }
      })
    })
  })
}

// // 监听浏览器窗口大小的变化
// window.onresize = function (e) {
//   let pageWidth = document.documentElement.clientWidth
//   let pageHeight = document.documentElement.clientHeight
//   resize(pageWidth, pageHeight)
// }

// // 当窗口发送变化时，将旧画布的内容暂存下来，放到新画布上显示
// function resize(w, h) {
//   let imgData = context2.getImageData(0, 0, canvas2.width, canvas2.height)
//   canvas2.width = w
//   canvas2.height = h
//   context2.putImageData(imgData, 0, 0)
// }
