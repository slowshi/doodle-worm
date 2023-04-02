const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 40;
const numRows = canvas.height / tileSize;
const numCols = canvas.width / tileSize;

let snake = [
  { x: 3 * tileSize, y: 3 * tileSize },
  { x: 2 * tileSize, y: 3 * tileSize },
  { x: 1 * tileSize, y: 3 * tileSize },
];
// console.log(snake)
let dx = tileSize;
let dy = 0;

let food = createFood();

function update() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x === food.x && head.y === food.y) {
    food = createFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);

  if (snakeCollision() || borderCollision(head)) {
    resetGame();
  }

  setTimeout(update, 100);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawSnake();
  drawFood();

  requestAnimationFrame(draw);
}
function interpolateColorStops(colorStops, position) {
  const numStops = colorStops.length;
  let color1, color2;

  for (let i = 0; i < numStops - 1; i++) {
    if (position <= colorStops[i + 1].position) {
      color1 = colorStops[i].color;
      color2 = colorStops[i + 1].color;
      const ratio = (position - colorStops[i].position) / (colorStops[i + 1].position - colorStops[i].position);
      const r = Math.round(parseInt(color1.substring(5, 8)) * (1 - ratio) + parseInt(color2.substring(5, 8)) * ratio);
      const g = Math.round(parseInt(color1.substring(9, 12)) * (1 - ratio) + parseInt(color2.substring(9, 12)) * ratio);
      const b = Math.round(parseInt(color1.substring(13, 16)) * (1 - ratio) + parseInt(color2.substring(13, 16)) * ratio);
      return `${r},${g},${b}`;
      // break;
    }
  }

}

function generateGradientStops(n) {
  const colorStops = [
    { color: 'rgba(128,177,255,1)', position: 0 },
    { color: 'rgba(121,232,179,1)', position: 0.25 },
    { color: 'rgba(255,233,138,1)', position: 0.5 },
    { color: 'rgba(255,164,212,1)', position: 0.75 },
    { color: 'rgba(128,177,255,1)', position: 1 },
  ];

  const stepSize = 1 / (n - 1);
  const newColorStops = [];

  for (let i = 0; i < n; i++) {
    const position = i * stepSize;
    const color = `rgba(${interpolateColorStops(colorStops, position)})`;
    newColorStops.push({ color, position });
  }

  return newColorStops;
}
function drawSnake() {
  const colorStops = generateGradientStops(11 * snake.length);
  const parts = 1 / snake.length;
  for (let i = 0; i < snake.length; i++) {
    const part = snake[i];
    let gradient;
    let horizontal;
    const isHead = i === 0;
    const isTail = i === snake.length - 1;
    let nextPart
    let nextOnLeft
    let nextOnRight
    let nextOnTop
    let nextOnBot
    if(i < snake.length-1) {
      nextPart = snake[i+1]
      nextOnLeft = nextPart.x < part.x
      nextOnRight = nextPart.x > part.x
      nextOnTop = nextPart.y < part.y
      nextOnBot = nextPart.y > part.y
    }

    let prevPart
    let prevOnLeft
    let prevOnRight
    let prevOnTop
    let prevOnBot
    if(i > 0) {
      prevPart = snake[i-1]
      prevOnLeft = prevPart.x < part.x
      prevOnRight = prevPart.x > part.x
      prevOnTop = prevPart.y < part.y
      prevOnBot = prevPart.y > part.y
    }

    if (i === 0) { // Head
      horizontal = part.x !== nextPart.x;
    } else {
      horizontal = part.y === prevPart.y;
    }

    const leftEnd = (ctx, part, tileSize)=> {
      ctx.moveTo(part.x + tileSize, part.y + tileSize)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 0.5*Math.PI, 1.5*Math.PI);
      ctx.lineTo(part.x + tileSize, part.y)
    }
    const rightEnd = (ctx, part, tileSize)=> {
      ctx.moveTo(part.x, part.y)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1.5*Math.PI, 0.5*Math.PI);
      ctx.lineTo(part.x, part.y + tileSize)
    }
    const topEnd = (ctx, part, tileSize)=> {
      ctx.moveTo(part.x, part.y + tileSize)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1*Math.PI, 2*Math.PI);
      ctx.lineTo(part.x + tileSize, part.y + tileSize)
    }
    const botEnd = (ctx, part, tileSize)=> {
      ctx.moveTo(part.x + tileSize, part.y)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 2*Math.PI, 3*Math.PI);
      ctx.lineTo(part.x, part.y)
    }
    const topLeftElbow = (ctx, part, tileSize)=> {
      ctx.moveTo(part.x, part.y + tileSize)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1*Math.PI, 1.5*Math.PI);
      ctx.lineTo(part.x + tileSize, part.y)
      ctx.lineTo(part.x + tileSize, part.y + tileSize)
      ctx.lineTo(part.x, part.y + tileSize)
      ctx.fill();
      ctx.closePath()

      ctx.beginPath()
      ctx.moveTo(part.x, part.y + tileSize)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1*Math.PI, 1.5*Math.PI);
      ctx.lineTo(part.x + tileSize, part.y)
      ctx.stroke()
      ctx.closePath()
    }

    const topRightElbow = (ctx, part, tileSize)=> {
      ctx.moveTo(part.x, part.y)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1.5*Math.PI, 2*Math.PI);
      ctx.lineTo(part.x + tileSize, part.y + tileSize)
      ctx.lineTo(part.x, part.y + tileSize)
      ctx.lineTo(part.x, part.y)
      ctx.fill();
      ctx.closePath()

      ctx.beginPath()
      ctx.moveTo(part.x, part.y)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1.5*Math.PI, 2*Math.PI);
      ctx.lineTo(part.x + tileSize, part.y + tileSize)
      ctx.stroke()
      ctx.closePath()
    }

    const bottomRightElbow = (ctx, part, tileSize)=> {
      ctx.moveTo(part.x + tileSize, part.y)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 2*Math.PI, .5*Math.PI);
      ctx.lineTo(part.x, part.y + tileSize)
      ctx.lineTo(part.x, part.y)
      ctx.lineTo(part.x + tileSize, part.y)
      ctx.fill();
      ctx.closePath()

      ctx.beginPath()
      ctx.moveTo(part.x + tileSize, part.y)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 2*Math.PI, .5*Math.PI);
      ctx.lineTo(part.x, part.y + tileSize)
      ctx.stroke()
      ctx.closePath()
    }

    const bottomLeftElbow = (ctx, part, tileSize)=> {
      ctx.moveTo(part.x + tileSize, part.y + tileSize)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, .5*Math.PI, 1*Math.PI);
      ctx.lineTo(part.x, part.y)
      ctx.lineTo(part.x + tileSize, part.y)
      ctx.lineTo(part.x + tileSize, part.y + tileSize)
      ctx.fill();
      ctx.closePath()

      ctx.beginPath()
      ctx.moveTo(part.x + tileSize, part.y + tileSize)
      ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, .5*Math.PI, 1*Math.PI);
      ctx.lineTo(part.x, part.y)
      ctx.stroke()
      ctx.closePath()
    }

    const drawHorizontal = (ctx, part, tileSize)=> {
      ctx.fillRect(part.x, part.y, tileSize, tileSize)
      ctx.moveTo(part.x, part.y);
      ctx.lineTo(part.x + tileSize, part.y);
      ctx.stroke();
      ctx.moveTo(part.x, part.y + tileSize);
      ctx.lineTo(part.x + tileSize, part.y + tileSize);
      ctx.stroke();
    }

    const drawVertical = (ctx, part, tileSize)=> {
      ctx.fillRect(part.x, part.y, tileSize, tileSize)
      ctx.moveTo(part.x, part.y);
      ctx.lineTo(part.x, part.y + tileSize);
      ctx.stroke();
      ctx.moveTo(part.x + tileSize, part.y);
      ctx.lineTo(part.x + tileSize, part.y + tileSize);
      ctx.stroke();
    }
    const colorGradient = (ctx, part, tileSize) => {
      if (horizontal) {
        if(isHead) {
          if(nextOnLeft) {
            gradient = ctx.createLinearGradient(part.x + tileSize, part.y, part.x, part.y);
          } else {
            gradient = ctx.createLinearGradient(part.x, part.y, part.x + tileSize, part.y);
          }
        } else {
          if(prevOnRight) {
            gradient = ctx.createLinearGradient(part.x + tileSize, part.y, part.x, part.y);
          } else {
            gradient = ctx.createLinearGradient(part.x, part.y, part.x + tileSize, part.y);
          }
        }
      } else {
        if(isHead) {
          if(nextOnTop) {

            gradient = ctx.createLinearGradient(part.x, part.y + tileSize, part.x, part.y);
          } else {

            gradient = ctx.createLinearGradient(part.x, part.y, part.x, part.y + tileSize);
          }
        } else {
          if(prevOnBot) {
            gradient = ctx.createLinearGradient(part.x, part.y + tileSize, part.x, part.y);

          } else {
            gradient = ctx.createLinearGradient(part.x, part.y, part.x, part.y + tileSize);

          }
        }
      }
      const colorSlice = colorStops.slice(i * 11, i*11 + 11)
      colorSlice.forEach((stop, index)=> {
        const adjustedPosition = (index)/(colorSlice.length -1)
        gradient.addColorStop(adjustedPosition, stop.color);
      })

      ctx.fillStyle = gradient;
    }
    colorGradient(ctx, part, tileSize)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    if (isHead || isTail) { // Head
      ctx.beginPath();
      if((isHead && nextOnRight) || (isTail && prevOnRight)) {
        leftEnd(ctx, part, tileSize)
      } else if((isHead && nextOnLeft) || (isTail && prevOnLeft)) {
        rightEnd(ctx, part, tileSize)
      } else if((isHead && nextOnBot) || (isTail && prevOnBot)) {
        topEnd(ctx, part, tileSize)
      } else if((isHead && nextOnTop) || (isTail && prevOnTop)) {
        botEnd(ctx, part, tileSize)
      }
      ctx.fill();
      ctx.stroke();
      ctx.closePath()
    } else { // Body
      ctx.beginPath();
      if(nextOnLeft && prevOnBot || nextOnBot && prevOnLeft) {
        topRightElbow(ctx, part, tileSize)
      } else if(nextOnLeft && prevOnTop || nextOnTop && prevOnLeft) {
        bottomRightElbow(ctx, part, tileSize)
      } else if(nextOnRight && prevOnBot || nextOnBot && prevOnRight){
        topLeftElbow(ctx, part, tileSize)
      } else if(nextOnRight && prevOnTop|| nextOnTop && prevOnRight) {
        bottomLeftElbow(ctx, part, tileSize)
      } else if(!nextOnRight && !nextOnLeft && !prevOnRight && !prevOnLeft) {
        drawVertical(ctx, part, tileSize)
      } else if (!nextOnTop && !nextOnBot && !prevOnTop && !prevOnBot) {
        drawHorizontal(ctx, part, tileSize)
      }
      ctx.closePath()
    }
  }
  ctx.closePath()
}


function drawFood() {
  ctx.fillStyle = "#D1B6B6";
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath()
  // ctx.moveTo(food.x, food.y)
  const tileRadius = tileSize/2
  ctx.arc(food.x + tileRadius, food.y + tileRadius, tileRadius, 0, 2 * Math.PI);
  ctx.fill()
  ctx.stroke()
  // ctx.fillRect(food.x, food.y, tileSize, tileSize);
  // ctx.strokeRect(food.x, food.y, tileSize, tileSize);
}

function createFood() {
  const x = Math.floor(Math.random() * numCols) * tileSize;
  const y = Math.floor(Math.random() * numRows) * tileSize;
  return { x, y };
}

function snakeCollision() {
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true;
    }
  }
  return false;
}

function borderCollision(head) {
  return (
    head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height
  );
}

function resetGame() {
  snake = [
    { x: 3 * tileSize, y: 3 * tileSize },
    { x: 2 * tileSize, y: 3 * tileSize },
    { x: 1 * tileSize, y: 3 * tileSize }
  ];
  dx = tileSize;
  dy = 0;
  food = createFood();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -tileSize;
  } else if (e.key === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = tileSize;
  } else if (e.key === "ArrowLeft" && dx === 0) {
    dx = -tileSize;
    dy = 0;
  } else if (e.key === "ArrowRight" && dx === 0) {
    dx = tileSize;
    dy = 0;
  }
});

update();
draw();
