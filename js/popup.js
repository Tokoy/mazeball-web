document.body.style.width = '500px';
var currentHeight;
var gridContainer = document.querySelector('.grid-container');
var scoreContainer = document.querySelector('.score-container');
var buttonContainer = document.querySelector('.button-container');
var levelItems = document.getElementById('level');
var clickCountElement  = document.getElementById('clickCount');
var clickCount = 0;
var gridRows = 10;
var gridColumns = 10;
var gridnumber;
var ballItemRow = 0;
var ballItemColumn;
var ballItemIndex;
var goatItemRow ;
var goatItemColumn ;
var goatItemIndex ;
var gridItems;
var level = 1;
var bombIndices = [];
let timeRemaining = 15 * 1000; 
let intervalId; 
var startTime = new Date();
var endTime;
var countdownDisplay = document.getElementById('time');
var option1 = document.getElementById('option1');
var option2 = document.getElementById('option2');
var rank = document.getElementById('rank');
var bar = document.getElementById('bar');
var btnrty = document.getElementById('btnrty');
var github = document.getElementById('github');

//INIT THE GAME
init();
startCountdown();

//startCountdown
function startCountdown() {
  intervalId = setInterval(updateCountdown, 10); // update countdown every 10 seconds
}

//updateCountdown
function updateCountdown() {
  timeRemaining -= 10; // reduce time remaining

  if (timeRemaining <= 0) {
    clearInterval(intervalId); // clear the interval
    countdownDisplay.textContent = "00:00:000";
    gameover();
  }

  const minutes = Math.floor(timeRemaining / 1000 / 60);
  const seconds = Math.floor((timeRemaining / 1000) % 60);
  const milliseconds = Math.floor((timeRemaining % 1000) / 10);

  // timeformat，update interval
  countdownDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

//addTime
function addTime(){
  timeRemaining += 5 * 1000;
}

//pauseTime
function pauseTime(){
  clearInterval(intervalId)
}

//resetTime
function resetTime(){
  clearInterval(intervalId);
  timeRemaining = 15 * 1000;
  countdownDisplay.textContent = '00:15:000';
}

// Generate grid items
function generateGrid() {
  gridItems = [];
  for (var i = 0; i < gridnumber; i++) {
    var gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridContainer.appendChild(gridItem);
  }
  // get all grid item to gridItems array
  gridItems = document.querySelectorAll('.grid-item');
}

function generatePlayer(){
  do{
  ballItemColumn = Math.floor(Math.random() * gridColumns);
  ballItemIndex = getIndex(ballItemRow,ballItemColumn);
  }while(bombIndices.includes(ballItemIndex)); 

  do{
  goatItemRow  = gridRows - 1;
  goatItemColumn = Math.floor(Math.random() * gridColumns);
  goatItemIndex = getIndex(goatItemRow,goatItemColumn)
  }while(bombIndices.includes(goatItemIndex)); 
  
  checkspace(ballItemIndex);
  checkspace(goatItemIndex);
  gridItems[ballItemIndex].classList.add('ball-item');
  gridItems[goatItemIndex].classList.add('goat-item');
}

function checkspace(itemindex){
    var row = Math.floor(itemindex / gridColumns); 
    var col = itemindex % gridColumns;

    for (var i = row - 1; i <= row + 1; i++) {
      for (var j = col - 1; j <= col + 1; j++) {
        if (i >= 0 && i < gridRows && j >= 0 && j < gridColumns) {
          var removeindex = i * gridColumns  + j; 
          bombIndices = bombIndices.filter(item => item !== removeindex);
          gridItems[removeindex].classList.remove('boom-item'); 
        }
      }
    }
}

function getIndex(row, column) {
  return row * 10 + column;
}

function generateMaze(rows, cols, density = 0.2, complexity = 0.2) {
  let maze = [];
  bombIndices = [];
  let pathGrid = Array(rows).fill(null).map(() => Array(cols).fill(false));

  function isInMaze(x, y) {
      return x >= 0 && x < rows && y >= 0 && y < cols;
  }

  function carve(x, y) {
      pathGrid[x][y] = true;
      let directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      directions.sort(() => Math.random() - 0.5);

      for (let [dx, dy] of directions) {
          let nx = x + dx, ny = y + dy;
          if (isInMaze(nx, ny) && !pathGrid[nx][ny]) {
              pathGrid[nx][ny] = true;
              carve(nx, ny);
          }
      }
  }

  let startX = Math.floor(rows / 2);
  let startY = Math.floor(cols / 2);
  carve(startX, startY);

  // 检查起始位置和目标位置之间是否存在可行路径
  function hasPath(startX, startY, targetX, targetY) {
    let visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
    let queue = [[startX, startY]];
    visited[startX][startY] = true;

    while (queue.length > 0) {
      let [x, y] = queue.shift();

      if (x === targetX && y === targetY) {
        return true; // 存在可行路径
      }

      let directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (let [dx, dy] of directions) {
        let nx = x + dx, ny = y + dy;
        if (isInMaze(nx, ny) && !visited[nx][ny] && !pathGrid[nx][ny]) {
          visited[nx][ny] = true;
          queue.push([nx, ny]);
        }
      }
    }

    return false; // 不存在可行路径
  }

  for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
          if ((Math.random() < density && !pathGrid[x][y]) || (Math.random() < complexity && pathGrid[x][y])) {
            if (!hasPath(startX, startY, x, y))  {
              var ind = getIndex(x,y);
              gridItems[ind].classList.add('boom-item'); 
              maze.push(ind);
              bombIndices.push(ind);
            }
          }
      }
  }

  return maze;
}

function checkGameOver(index){
  if (index == goatItemIndex) {
    level ++;
    gridRows ++;
    addTime();
    adjustHeight();
    init();
  }else if (bombIndices.includes(index)) {
    pauseTime();
    gameover();
  }
}

function gameover(){
  while (gridContainer.firstChild) {
    gridContainer.removeChild(gridContainer.firstChild);
  }
  endTime = new Date();
  showScore();
  buttonContainer.style.display = '';
}

function init(){
  buttonContainer.style.display = 'none';
  btnrty.addEventListener("click", function() {
    startTime = new Date();
    clickCount = 0;
    level = 1;
    gridRows = 10;
    buttonContainer.style.display = 'none';
    resetTime();
    init();
    startCountdown();
  });
  // remove all items in gridContainer
  while (gridContainer.firstChild) {
    gridContainer.removeChild(gridContainer.firstChild);
  }
  while (scoreContainer.firstChild) {
    scoreContainer.removeChild(scoreContainer.firstChild);
  }
  gridnumber = gridRows*gridColumns;
  levelItems.textContent = level.toString();
  clickCountElement.textContent = clickCount.toString();
  generateGrid();
  generateMaze(gridRows,gridColumns);
  generatePlayer();
}

function adjustHeight(){
  currentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  var newHeight = currentHeight + 20;
  document.body.style.height = newHeight + "px";
  document.documentElement.style.height = newHeight + "px";
}

function showScore(){
  var score = level*level*10-clickCount;
  var scoreText = document.createTextNode("Your Score is " + score);
  scoreContainer.appendChild(scoreText);
}
var touchStartX, touchStartY;

// 触摸开始事件监听器
gridContainer.addEventListener('touchstart', function(event) {
  // 获取起始触摸点的坐标
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
});

// 触摸结束事件监听器
gridContainer.addEventListener('touchend', function(event) {
  // 获取结束触摸点的坐标
  var touchEndX = event.changedTouches[0].clientX;
  var touchEndY = event.changedTouches[0].clientY;

  // 计算触摸滑动的距离和方向
  var deltaX = touchEndX - touchStartX;
  var deltaY = touchEndY - touchStartY;
  var absDeltaX = Math.abs(deltaX);
  var absDeltaY = Math.abs(deltaY);

  // 判断滑动方向
  if (absDeltaX > absDeltaY) {
    // 水平滑动
    if (deltaX > 0) {
      // 向右滑动
      move('d');
    } else {
      // 向左滑动
      move('a');
    }
  } else {
    // 垂直滑动
    if (deltaY > 0) {
      // 向下滑动
      move('s');
    } else {
      // 向上滑动
      move('w');
    }
  }
});

// 上下左右移动函数
function move(direction) {
  var ballItemColumn = ballItemIndex % gridColumns;
  var ballItemRow = Math.floor(ballItemIndex / gridColumns);
  gridItems[ballItemIndex].classList.remove('ball-item');
  // 根据按键代码确定移动方向
  switch (direction) {
    case 'w': // 上移
      if (ballItemRow > 0) {
        ballItemIndex -= gridColumns;
      }
      break;
    case 's': // 下移
      if (ballItemRow < gridRows - 1) {
        ballItemIndex += gridColumns;
      }
      break;
    case 'a': // 左移
      if (ballItemColumn > 0) {
        ballItemIndex -= 1;
      }
      break;
    case 'd': // 右移
      if (ballItemColumn < gridColumns - 1) {
        ballItemIndex += 1;
      }
      break;
  }

  // 移动黑色方块
  gridItems[ballItemIndex].classList.add('ball-item');

  // 更新点击次数
  clickCount++;
  clickCountElement.textContent = clickCount.toString();

  // 检查游戏是否结束
  checkGameOver(ballItemIndex);
}

// 键盘按下事件监听器
document.addEventListener('keydown', function(event) {
  // 获取按键代码
  var key = event.key.toLowerCase();

  // 根据按键执行相应的移动操作
  if (key === 'w' || key === 's' || key === 'a' || key === 'd') {
    event.preventDefault(); // 阻止默认的按键行为
    move(key);
  }
});

//right click
gridContainer.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // Prevent default right-click menu

  // Calculate new black item index for downward movement
  var newRow = Math.floor((ballItemIndex)/ 10) + 1;
  // is last item
  if(newRow != gridRows){
    // Remove current black item
    gridItems[ballItemIndex].classList.remove('ball-item');
    var newballItemIndex = (newRow * gridColumns) + (ballItemIndex % gridColumns);
    // Update black item index and apply new style
    ballItemIndex = newballItemIndex;
    gridItems[ballItemIndex].classList.add('ball-item');
  }
  // add clickcount
  clickCount++;
  // update click display
  clickCountElement.textContent = clickCount.toString();
  //check gameover
  checkGameOver(ballItemIndex);
});

//left click
gridContainer.addEventListener('click', function(e) {

  var clickedItemIndex = Array.from(gridItems).indexOf(e.target);

  if (clickedItemIndex !== -1) {
    // Remove current black item
    gridItems[ballItemIndex].classList.remove('ball-item');

    // Calculate the column position of the black item
    var ballItemColumn = ballItemIndex % gridColumns;

    // Calculate the column position of the clicked item
    var clickedItemColumn = clickedItemIndex % gridColumns;

    // Determine the direction based on the column positions
    if (clickedItemColumn < ballItemColumn) {
      // Move black item to the left
      if (ballItemColumn === 0) {
        ballItemIndex = ballItemIndex + gridColumns - 1;
      } else {
        ballItemIndex = ballItemIndex - 1;
      }
    } else if (clickedItemColumn > ballItemColumn) {
      // Move black item to the right
      if (ballItemColumn === gridColumns - 1) {
        ballItemIndex = ballItemIndex - gridColumns + 1;
      } else {
        ballItemIndex = ballItemIndex + 1;
      }
    }

    // Apply new style to the black item
    gridItems[ballItemIndex].classList.add('ball-item');

    clickCount++;
    // update click count
    clickCountElement.textContent = clickCount.toString();
    //check gameover
    checkGameOver(ballItemIndex);
  }
});

option1.addEventListener('click', function() {
  option1.classList.add('active');
  option2.classList.remove('active');

  bar.style.display = '';
  scoreContainer.style.display = '';
  buttonContainer.style.display = '';
  github.style.display = 'none';
  rank.style.display = 'none';
});

option2.addEventListener('click', function() {
  option1.classList.remove('active');
  option2.classList.add('active');
  
  bar.style.display = 'none';
  scoreContainer.style.display = 'none';
  buttonContainer.style.display = 'none';
  github.style.display = '';
  rank.style.display = '';
  while (gridContainer.firstChild) {
    gridContainer.removeChild(gridContainer.firstChild);
  }
  pauseTime();
  getData();
});

function getData() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://game.ikeno.top/json', true);
  xhr.onreadystatechange = function() {
    handleResponse(xhr);
  };
  xhr.send();
}

function createTable(data) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // table header
  const headerRow = document.createElement('tr');
  const headers = ['No.', 'Region', 'Level', 'Click', 'Score', 'Time/s'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.textAlign = 'left';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  data.forEach((item, index) => {
    const dataRow = document.createElement('tr');
    const { region, level, click, time } = item.data;
    const score = item.score;

    // id
    const indexCell = document.createElement('td');
    indexCell.textContent = index + 1;
    dataRow.appendChild(indexCell);

    [region, level, click, score, time].forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      dataRow.appendChild(td);
    });
    
    tbody.appendChild(dataRow);
  });
  table.appendChild(tbody);
  table.style.width = '100%';
  return table;
}

function handleResponse(xhr) {
  if (xhr.readyState === 4 && xhr.status === 200) {
    var dataObj = JSON.parse(xhr.responseText);
    while (rank.firstChild) {
      rank.removeChild(rank.firstChild);
    }
    rank.appendChild(createTable(dataObj));
  }
}

