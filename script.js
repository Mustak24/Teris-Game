const bgCanvas = document.getElementById("background-canvas");
const gameCanvas = document.getElementById("game-canvas");

const fps = 2
const pixelSize = 40;
const rows = 15;
const cols = 20;
const canvasWidth = cols * pixelSize;
const canvasHeight = rows * pixelSize;

const colors = ['white', 'red', 'royalblue', 'lightgreen', 'yellow', 'orange']
const shapes = [
  [[0,0], [1,0], [1,1], [2,1], [2, 2]],
  [[0,0], [1,0], [0,1], [1,1]],
  [[0,0], [0,1], [0,2], [0,3]],
  [[1,0], [0,1], [1,1], [2,1]]
]

bgCanvas.width = canvasWidth;
bgCanvas.height = canvasHeight;

gameCanvas.width = canvasWidth;
gameCanvas.height = canvasHeight;

const bgCtx = bgCanvas.getContext("2d");
const gameCtx = gameCanvas.getContext("2d");

const gameMatrix = Array.from({length: rows}, _ => Array.from({length: cols}, _ => 0));

class Shape {
  constructor({ pos, size, canvasWidth, canvasHeight, shape, colorIndex, color }) {
    this.pos = pos;
    this.size = size;
    this.shape = shape;  
    this.color = color;
    this.colorIndex = colorIndex;
    this.canvas = { w: canvasWidth, h: canvasHeight }; 

    this.eages = {
      x: Math.max(...shape.map((e) => e[0])) * size,
      y: Math.max(...shape.map((e) => e[1])) * size,
    };

    this.hasMoving = true;
  }

  show(ctx) {
    if(!ctx) return;

    ctx.fillStyle = this.color;
    for (let [x, y] of this.shape) {
      ctx.beginPath()
      ctx.rect(
        this.pos.x + this.size * x,
        this.pos.y + this.size * y,
        this.size,
        this.size
      );
      ctx.fill()
    }
  }

  update(gameMatrix) {
    const px = Math.floor(this.pos.x / this.size);
    const py = Math.floor(this.pos.y / this.size);

    const bottomEages = this.getBottomEages();
    const hasColied =
      py * this.size + this.eages.y + this.size >= this.canvas.h ||
      bottomEages.some(([x, y]) => gameMatrix[y + py + 1][px + x] !== 0);

    if (hasColied) {
      this.hasMoving = false;

      for (let [x, y] of this.shape) {
        gameMatrix[py + y][px + x] = this.colorIndex;
      }

      return;
    }

    this.pos.y += this.size;
  }

  moveLeft(gameMatrix) {
    const px = Math.floor(this.pos.x / this.size);
    const py = Math.floor(this.pos.y / this.size);

    const leftEages = this.getLeftEages();
    const hasColied =
      px <= 0 || leftEages.some(([x, y]) => gameMatrix[py + y][px + x - 1] !== 0);

    if (!hasColied) this.pos.x -= this.size;
  }

  moveRight(gameMatrix) {
    const px = Math.floor(this.pos.x / this.size);
    const py = Math.floor(this.pos.y / this.size);

    const rightEages = this.getRightEages();
    const hasColied =
      px * this.size + this.eages.x + this.size >= this.canvas.w ||
      rightEages.some(([x, y]) => gameMatrix[py + y][px + x + 1] !== 0);

    if (!hasColied) this.pos.x += this.size;
  }

  getBottomEages() {
    const dic = new Map();
    for (let [x, y] of this.shape) {
      if (!dic.has(x)) dic.set(x, y);
      else if (dic.get(x) < y) dic.set(x, y);
    }

    return Array.from(dic);
  }

  getLeftEages() {
    const dic = new Map();
    for (let [x, y] of this.shape) {
      if (!dic.has(y)) dic.set(y, x);
      else if (dic.get(y) > x) dic.set(y, x);
    }

    return Array.from(dic);
  }

  getRightEages() {
    const dic = new Map();
    for (let [x, y] of this.shape) {
      if (!dic.has(y)) dic.set(y, x);
      else if (dic.get(y) < x) dic.set(y, x);
    }

    return Array.from(dic);
  }
}


function drawGrid() {
  bgCtx.lineWidth = 1;
  bgCtx.strokeStyle = 'black'

  for(let i=0; i<cols; i++) {
    bgCtx.beginPath();
    bgCtx.moveTo(i * pixelSize, 0)
    bgCtx.lineTo(i * pixelSize, rows * pixelSize)
    bgCtx.stroke()
  }
  
  for(let i=0; i<rows; i++) {
    bgCtx.beginPath();
    bgCtx.moveTo(0, i * pixelSize)
    bgCtx.lineTo(cols * pixelSize, i * pixelSize)
    bgCtx.stroke()
  }
}


function drawGameMatrix() {
  for(let y=0; y<rows; y++){
    for(let x=0; x<cols; x++) {
      if(gameMatrix[y][x] === 0) continue;
      
      bgCtx.fillStyle = colors[gameMatrix[y][x]];
      bgCtx.beginPath();
      bgCtx.rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      bgCtx.fill();
    }
  }
}


function createShape() {
  const randomIndex = Math.floor(Math.random() * shapes.length)
  const shape = shapes[randomIndex];
  const xe = Math.max(...shape.map(e => e[0]))
  return new Shape({
    pos: {x: pixelSize * Math.floor(cols / 2 - xe), y: 0},
    size: pixelSize, shape, canvasHeight, canvasWidth, 
    colorIndex: randomIndex + 1, color: colors[randomIndex + 1]
  })
}


function cleanFullRows() {
  for(let row=0; row<rows; row++) {
    if(gameMatrix[row].some(e => e === 0)) continue;
    
    gameMatrix[row].fill(0);
    for(let i=row; i>0; i--) {
      [gameMatrix[i], gameMatrix[i-1]] = [gameMatrix[i-1], gameMatrix[i]]
    }
  }
}



bgCanvas.style.backgroundColor = 'white';
let shape = createShape();
drawGameMatrix()
drawGrid()

function animation() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  if(!shape.hasMoving) {
    shape = createShape();
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCanvas.style.backgroundColor = 'white'
    drawGrid();
    cleanFullRows();
    drawGameMatrix();
  }

  shape.show(gameCtx);
  shape.update(gameMatrix);

  setTimeout(() => {
    requestAnimationFrame(animation);
  }, 1000 / fps)
}

requestAnimationFrame(animation)



function handleKeyUpEvent({key}) {  
  
  switch ( key ) {
    case 'a':      
    case 'ArrowLeft':
      shape.moveLeft(gameMatrix);
      break;
    
    case 'd':
    case 'ArrowRight':
      shape.moveRight(gameMatrix);
      break;
      
    case 's':
    case 'ArrowDown':
      shape.update(gameMatrix);
      break;
  }

  shape.show()
}


window.addEventListener('keyup', handleKeyUpEvent)