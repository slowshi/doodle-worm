const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 20;
const numRows = canvas.height / tileSize;
const numCols = canvas.width / tileSize;

let snake = [
  { x: 3 * tileSize, y: 3 * tileSize },
  { x: 2 * tileSize, y: 3 * tileSize },
  { x: 1 * tileSize, y: 3 * tileSize }
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

function drawSnake() {
  const colorStops = [
    { color: 'rgba(128,177,255,1)', position: 0 },
    { color: 'rgba(255,164,212,1)', position: 0.25 },
    { color: 'rgba(255,233,138,1)', position: 0.5 },
    { color: 'rgba(121,232,179,1)', position: 0.75 },
    { color: 'rgba(128,177,255,1)', position: 1 },
  ];

  for (let i = 0; i < snake.length; i++) {
    const part = snake[i];
    let gradient;
    let horizontal;

    if (i === 0) { // Head
      const nextPart = snake[i + 1];
      horizontal = part.x !== nextPart.x;
    } else {
      const prevPart = snake[i - 1];
      horizontal = part.y === prevPart.y;
    }

    if (horizontal) {
      gradient = ctx.createLinearGradient(part.x, part.y, part.x + tileSize, part.y);
    } else {
      gradient = ctx.createLinearGradient(part.x, part.y, part.x, part.y + tileSize);
    }

    for (const stop of colorStops) {
      const adjustedPosition = (stop.position + i / (snake.length - 1)) % 1;
      gradient.addColorStop(adjustedPosition, stop.color);
    }

    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    if (i === 0) { // Head
      ctx.beginPath();
      const nextPart = snake[i+1]
      if(nextPart.x > part.x) {
        ctx.moveTo(part.x + tileSize, part.y + tileSize)
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 0.5*Math.PI, 1.5*Math.PI);
        ctx.lineTo(part.x + tileSize, part.y)
      } else if(nextPart.x < part.x) {
        ctx.moveTo(part.x, part.y)
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1.5*Math.PI, 0.5*Math.PI);
        ctx.lineTo(part.x, part.y + tileSize)
      } else if(nextPart.y > part.y) {
        ctx.moveTo(part.x, part.y + tileSize)
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1*Math.PI, 2*Math.PI);
        ctx.lineTo(part.x + tileSize, part.y + tileSize)
      } else if(nextPart.y < part.y) {
        ctx.moveTo(part.x + tileSize, part.y)
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 2*Math.PI, 3*Math.PI);
        ctx.lineTo(part.x, part.y)
      }
      ctx.fill();
      ctx.stroke();
    } else if (i === snake.length - 1) { // Tail
      const prevPart = snake[i - 1];
      ctx.beginPath();
      if(prevPart.x > part.x) {
        ctx.moveTo(part.x + tileSize, part.y + tileSize)
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 0.5*Math.PI, 1.5*Math.PI);
        ctx.lineTo(part.x + tileSize, part.y)
      } else if(prevPart.x < part.x) {
        ctx.moveTo(part.x, part.y)
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1.5*Math.PI, 0.5*Math.PI);
        ctx.lineTo(part.x, part.y + tileSize)
      } else if(prevPart.y > part.y) {
        ctx.moveTo(part.x, part.y + tileSize)
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 1*Math.PI, 2*Math.PI);
        ctx.lineTo(part.x + tileSize, part.y + tileSize)
      } else if(prevPart.y < part.y) {
        ctx.moveTo(part.x + tileSize, part.y)
        ctx.arc(part.x + tileSize / 2, part.y + tileSize / 2, tileSize / 2, 2*Math.PI, 3*Math.PI);
        ctx.lineTo(part.x, part.y)
      }
      ctx.fill();
      ctx.stroke();
    } else { // Body
      ctx.beginPath();
      // ctx.fillRect(part.x, part.y, tileSize, tileSize);
      const nextPart = snake[i+1]
      const prevPart = snake[i-1]
      const prevOnLeft = prevPart.x < part.x
      const prevOnRight = prevPart.x > part.x
      const prevOnTop = prevPart.y < part.y
      const prevOnBot = prevPart.y > part.y
      const nextOnLeft = nextPart.x < part.x
      const nextOnRight = nextPart.x > part.x
      const nextOnTop = nextPart.y < part.y
      const nextOnBot = nextPart.y > part.y
      const leftBorder = (ctx, part, tileSize)=> {
        ctx.moveTo(part.x, part.y);
        ctx.lineTo(part.x, part.y + tileSize);
        ctx.stroke();
      }
      const rightBorder = (ctx, part, tileSize)=> {
        ctx.moveTo(part.x + tileSize, part.y);
        ctx.lineTo(part.x + tileSize, part.y + tileSize);
        ctx.stroke();

      }
      const topBorder = (ctx, part, tileSize)=> {
        ctx.moveTo(part.x, part.y);
        ctx.lineTo(part.x + tileSize, part.y);
        ctx.stroke();
      }
      const bottomBorder = (ctx, part, tileSize)=> {
        ctx.moveTo(part.x, part.y + tileSize);
        ctx.lineTo(part.x + tileSize, part.y + tileSize);
        ctx.stroke();
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
      if(nextOnLeft && prevOnBot || nextOnBot && prevOnLeft) {
        topRightElbow(ctx, part, tileSize)
      } else if(nextOnLeft && prevOnTop || nextOnTop && prevOnLeft) {
        bottomRightElbow(ctx, part, tileSize)
      } else if(nextOnRight && prevOnBot || nextOnBot && prevOnRight){
        topLeftElbow(ctx, part, tileSize)
      } else if(nextOnRight && prevOnTop|| nextOnTop && prevOnRight) {
        bottomLeftElbow(ctx, part, tileSize)
      } else if(!nextOnRight && !nextOnLeft && !prevOnRight && !prevOnLeft) {
        ctx.fillRect(part.x, part.y, tileSize, tileSize)
        leftBorder(ctx, part, tileSize)
        rightBorder(ctx, part, tileSize)
      } else if (!nextOnTop && !nextOnBot && !prevOnTop && !prevOnBot) {
        ctx.fillRect(part.x, part.y, tileSize, tileSize)
        topBorder(ctx, part, tileSize)
        bottomBorder(ctx, part, tileSize)
      }

      ctx.closePath()
    }
  }
}


function drawFood() {
  ctx.fillStyle = "#D1B6B6";
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.fillRect(food.x, food.y, tileSize, tileSize);
  ctx.strokeRect(food.x, food.y, tileSize, tileSize);
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
