const bgCanvas = document.getElementById("background-canvas");
const gameCanvas = document.getElementById("game-canvas");
const nextShapeCanvas = document.getElementById('next-shape-canvas');
const scoreBox = document.getElementById('score-box')

let score = 0;
const fps = 1;
const pixelSize = 40;
const rows = 15;
const cols = 20;
const canvasWidth = cols * pixelSize;
const canvasHeight = rows * pixelSize;

const colors = ['white', 'red', 'royalblue', 'lightgreen', 'yellow', 'orange', 'crimson', 'pink', 'sky']
const shapes = [
  [[0,0], [1,0], [1,1]],
  [[0,0], [1,0], [0,1], [1,1]],
  [[0,0], [0,1], [0,2], [0,3]],
  [[1,0], [0,1], [1,1], [2,1]],
  [[0,0]],
  [[0,0], [1,0], [1,1], [2,1]],
  [[0,0], [0,1], [0,2]],
  [[0,0], [0,2], [1,0], [1,1], [1,2]],
  [[0,0], [1,0], [1,1], [1,2]]
]

bgCanvas.width = canvasWidth;
bgCanvas.height = canvasHeight;

gameCanvas.width = canvasWidth;
gameCanvas.height = canvasHeight;

nextShapeCanvas.width = 400;
nextShapeCanvas.height = 300;


const bgCtx = bgCanvas.getContext("2d");
const gameCtx = gameCanvas.getContext("2d");
const nextShapeCtx = nextShapeCanvas.getContext('2d');


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

    this.pos.y += this.size


    if (this.hasColied(gameMatrix)) {
      this.pos.y -= this.size;
      this.hasMoving = false;

      for (let [x, y] of this.shape) {
        gameMatrix[py + y][px + x] = this.colorIndex;
      }
    }
  }

  moveLeft(gameMatrix) {
    this.pos.x -= this.size;

    if(this.hasColied(gameMatrix)) this.pos.x += this.size;
  }

  moveRight(gameMatrix) {
    this.pos.x += this.size;
    if(this.hasColied(gameMatrix)) this.pos.x -= this.size;
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
  

  hasColied(gameMatrix) {
    const px = Math.floor(this.pos.x / this.size);
    const py = Math.floor(this.pos.y / this.size);

    return (
      this.pos.x < 0 ||
      this.pos.x + this.eages.x + this.size > this.canvas.w ||
      this.pos.y + this.eages.y + this.size > this.canvas.h ||
      this.shape.some(([x, y]) => (
        gameMatrix[py + y][px + x] !== 0
      ))
    )
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
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const colorIndex = Math.floor(Math.random() * (colors.length - 1)) + 1
  const xe = Math.max(...shape.map(e => e[0]))
  return new Shape({
    pos: {x: pixelSize * Math.floor(cols / 2 - xe), y: 0},
    size: pixelSize, shape, canvasHeight, canvasWidth, 
    colorIndex, color: colors[colorIndex]
  })
}


function cleanFullRows() {
  for(let row=0; row<rows; row++) {
    if(gameMatrix[row].some(e => e === 0)) continue;
    
    scoreBox.innerHTML = ++score;
    gameMatrix[row].fill(0);
    for(let i=row; i>0; i--) {
      [gameMatrix[i], gameMatrix[i-1]] = [gameMatrix[i-1], gameMatrix[i]]
    }
  }
}



bgCanvas.style.backgroundColor = 'white';
let shape = [createShape(), createShape()];
drawGameMatrix()
drawGrid();
nextShapeCtx.translate(-200, shape[0].eages.y / 2)
shape[1].show(nextShapeCtx)
console.log(nextShapeCtx)

function animation() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  if(!shape[0].hasMoving) {
    shape.shift()
    shape.push(createShape());
    nextShapeCtx.clearRect(0, 0, 1000, 1000);
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCanvas.style.backgroundColor = 'white'
    drawGrid();
    cleanFullRows();
    drawGameMatrix();
    shape[1].show(nextShapeCtx)
  }

  shape[0].show(gameCtx);
  shape[0].update(gameMatrix);

  setTimeout(() => {
    requestAnimationFrame(animation);
  }, 1000 / fps)
}

requestAnimationFrame(animation)



function handleKeyUpEvent({key}) {  
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  switch ( key ) {
    case 'a':      
    case 'ArrowLeft':
      shape[0].moveLeft(gameMatrix);
      break;
    
    case 'd':
    case 'ArrowRight':
      shape[0].moveRight(gameMatrix);
      break;
      
    case 's':
    case 'ArrowDown':
      shape[0].update(gameMatrix);
      break;
  }

  shape[0].show(gameCtx)
}


window.addEventListener('keyup', handleKeyUpEvent)