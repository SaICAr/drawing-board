const canvas1 = document.getElementById('canvas1')
const context1 = canvas1.getContext('2d')
canvas1.width = window.innerWidth
canvas1.height = window.innerHeight

const canvas2 = document.getElementById('canvas2')
const context2 = canvas2.getContext('2d')
canvas2.width = window.innerWidth
canvas2.height = window.innerHeight
context2.lineWidth = 10

const eraser = document.getElementById('eraser')
const pen = document.getElementById('pen')
const brush = document.getElementById('brush')
const clear = document.getElementById('clear')
const save = document.getElementById('save')
const colorTool = document.getElementById('colors')
const sizeTool = document.getElementById('sizes')
const eraserTool = document.getElementById('erasers')
const lineColors = document.querySelector('.line-color').querySelectorAll('li')
const lineSizes = document.querySelector('.line-size').querySelectorAll('li')
const erasers = document.querySelector('.eraser-list').querySelectorAll('li')

// 用户是否在操作
let isDown = false
let eraserEnable = false
let lineWidth = context2.lineWidth
let eraserSize = null

eraser.addEventListener('click', () => {
  eraserSize = 16
  eraserEnable = true
  eraser.classList.add('active')
  pen.classList.remove('active')
  brush.classList.remove('active')
  document.body.style.cursor = "url('./img/eraser32.ico') 16 16, auto"
  colorTool.style.display = 'none'
  sizeTool.style.display = 'none'
  eraserTool.style.display = 'block'
})

pen.addEventListener('click', () => {
  context2.lineWidth = lineWidth
  eraserEnable = false
  pen.classList.add('active')
  eraser.classList.remove('active')
  brush.classList.remove('active')
  document.body.style.cursor = "url('./img/painter.png') 0 32, auto"
  sizeTool.style.display = 'block'
  colorTool.style.display = 'block'
  eraserTool.style.display = 'none'
})

brush.addEventListener('click', () => {
  eraserEnable = false
  brush.classList.add('active')
  pen.classList.remove('active')
  eraser.classList.remove('active')
  document.body.style.cursor = "url('./img/brush.png') 0 32, auto"
  sizeTool.style.display = 'none'
  colorTool.style.display = 'block'
  eraserTool.style.display = 'none'
  context2.lineWidth = 60
})

clear.addEventListener('click', () => {
  context2.clearRect(0, 0, canvas2.width, canvas2.height)
})

save.addEventListener('click', () => {
  let dataURL = canvas2.toDataURL('image/png')
  let link = document.createElement('a')
  link.setAttribute('href', dataURL)
  link.target = '_blank'
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
changeLineProperty(erasers)
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
    clearArc(x, y, eraserSize / 2, context2)
  } else {
    beginPoint = { x, y }
  }
}

function userMove(e) {
  if (isDown) {
    const { x, y } = getPosition(e)
    points.push({ x, y })

    if (eraserEnable) {
      clearArc(x, y, eraserSize / 2, context2)
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
    prop.addEventListener('click', function (e) {
      if (prop.className.slice(0, 6) === 'eraser') {
        eraserSize = this.className.slice(6, 8)
        document.body.style.cursor = `url('./img/eraser${eraserSize}.ico') ${
          eraserSize / 2
        } ${eraserSize / 2}, auto`
      } else {
        if (prop.className.slice(0, 4) === 'size') {
          // 改变画笔的宽度
          const size = window.getComputedStyle(this, null)['height']
          context2.lineWidth = size.slice(0, 2)
          lineWidth = context2.lineWidth
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
      }
    })
  })
}

function clearArc(x, y, r, context) {
  // (x,y)为要清除的圆的圆心，r为半径，cxt为context
  // 利用的方法是将圆形切成很多个平行的矩形，然后从中间到圆的两端进行逐渐递减的操作
  let stepClear = 1
  clearArc(x, y, r)

  function clearArc(x, y, radius) {
    var calcWidth = radius - stepClear
    var calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth)

    var posX = x - calcWidth
    var posY = y - calcHeight

    var widthX = 2 * calcWidth
    var heightY = 2 * calcHeight

    if (stepClear <= radius) {
      context.clearRect(posX, posY, widthX, heightY)
      stepClear += 1
      clearArc(x, y, radius)
    }
  }
}
