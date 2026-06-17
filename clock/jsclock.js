const board = document.querySelector("#game-board");
const gridSizeX = 6.5; // Tamaño de paso horizontal en % del ancho
const gridSizeY = 6.5 * (9 / 16); // Tamaño de paso vertical en % del alto

let snake = [{x: 52, y: 52}]; // Cuerpo de la serpiente
let apples = []; // Guardará las posiciones de las manzanas activas
let direction = {x: gridSizeX, y: 0};
let lastTime = 0;
let lastHour = -1; // Nos ayuda a saber si la hora cambió para recalcular manzanas

// ACTUALIZADO: Ahora genera posiciones 100% aleatorias pero alineadas a la cuadrícula
function updateApplesPositions(currentHrs) {
  apples = [];
  
  // 1. Generar posiciones X válidas en la cuadrícula donde quepa la manzana (ancho max 85%)
  const validX = [];
  for (let x = 0; x <= 85; x += gridSizeX) {
    validX.push(Number(x.toFixed(4))); // Evitamos problemas de precisión decimal
  }
  
  // 2. Generar posiciones Y válidas alineadas con los pasos de la serpiente (alto max ~93%)
  const validY = [];
  // Buscamos hacia atrás desde el centro (52)
  for (let y = 52; y >= 0; y -= gridSizeY) {
    validY.push(Number(y.toFixed(4)));
  }
  // Buscamos hacia adelante desde el centro (52)
  for (let y = 52 + gridSizeY; y <= 93; y += gridSizeY) {
    validY.push(Number(y.toFixed(4)));
  }

  // 3. Seleccionar posiciones al azar sin que se repitan o tapen a la serpiente
  for (let i = 0; i < currentHrs; i++) {
    const randomX = validX[Math.floor(Math.random() * validX.length)];
    const randomY = validY[Math.floor(Math.random() * validY.length)];
    
    // Validaciones de seguridad
    const yaExisteManzana = apples.some(a => a.x === randomX && a.y === randomY);
    const encimaDeCabeza = (Math.abs(randomX - snake[0].x) < 1 && Math.abs(randomY - snake[0].y) < 1);

    if (!yaExisteManzana && !encimaDeCabeza) {
      apples.push({ x: randomX, y: randomY });
    } else {
      i--; // Si la posición no era segura, repetimos este intento del bucle
    }
  }
}

// Detecta si una coordenada tentativa chocará con alguna manzana
function hitsApple(nextX, nextY) {
  // Margen de tolerancia pequeño debido a que las manzanas/serpiente usan decimales por el (9/16)
  return apples.some(apple => {
    return Math.abs(apple.x - nextX) < 1 && Math.abs(apple.y - nextY) < 1;
  });
}

function update() {
  const now = new Date();
  const hrs = now.getHours() % 12 || 12;
  const mins = now.getMinutes();
  const secs = now.getSeconds();

  // Si cambia la hora, recalculamos las posiciones de las manzanas de inmediato
  if (hrs !== lastHour) {
    updateApplesPositions(hrs);
    lastHour = hrs;
  }

  // 1. Calcular nueva posición tentativa de la cabeza
  let nextX = snake[0].x + direction.x;
  let nextY = snake[0].y + direction.y;

  // 2. Sistema de evasión inteligente considerando el ancho (gridSizeX) y alto (gridSizeY) de la cabeza
  if (nextX + gridSizeX > 100 || nextX < 0 || nextY + gridSizeY > 100 || nextY < 0 || hitsApple(nextX, nextY)) {
    evadeObstacles();
    // Recalculamos la posición con la nueva dirección segura
    nextX = snake[0].x + direction.x;
    nextY = snake[0].y + direction.y;
  }

  let newHead = { x: nextX, y: nextY };

  // 3. Comprobar colisión con el cuerpo
  const hitSelf = snake.some((part, index) => index !== 0 && part.x === newHead.x && part.y === newHead.y);
  
  if (hitSelf) {
    snake = [newHead];
  } else {
    snake.unshift(newHead);
  }

  // 4. Ajustar largo del cuerpo según los minutos
  while (snake.length > mins + 1) {
    snake.pop();
  }

  // 5. Cambiar dirección aleatoria cada 3 segundos si el camino está libre
  if (secs % 3 === 0 && secs !== lastTime) {
    changeDirectionRandomly();
    lastTime = secs;
  }

  render(mins);
}

// Función para cambios de dirección casuales en espacio abierto (esquivando manzanas también)
function changeDirectionRandomly() {
  const dirs = [
    {x: gridSizeX, y: 0},  // Derecha
    {x: -gridSizeX, y: 0}, // Izquierda
    {x: 0, y: gridSizeY},  // Abajo
    {x: 0, y: -gridSizeY}  // Arriba
  ];
  
  const safeDirs = dirs.filter(d => {
    const isOpposite = (d.x === -direction.x && d.y === -direction.y);
    const nextX = snake[0].x + d.x;
    const nextY = snake[0].y + d.y;
    
    const hitsWall = (nextX + gridSizeX > 100 || nextX < 0 || nextY + gridSizeY > 100 || nextY < 0);
    const touchesApple = hitsApple(nextX, nextY);
    
    return !isOpposite && !hitsWall && !touchesApple;
  });

  if (safeDirs.length > 0) {
    direction = safeDirs[Math.floor(Math.random() * safeDirs.length)];
  }
}

// Función de maniobra evasiva extrema frente a muros o manzanas cuidando los límites reales
function evadeObstacles() {
  const dirs = [
    {x: gridSizeX, y: 0},
    {x: -gridSizeX, y: 0},
    {x: 0, y: gridSizeY},
    {x: 0, y: -gridSizeY}
  ];

  const emergencyDirs = dirs.filter(d => {
    const isOpposite = (d.x === -direction.x && d.y === -direction.y);
    const nextX = snake[0].x + d.x;
    const nextY = snake[0].y + d.y;
    
    const hitsWall = (nextX + gridSizeX > 100 || nextX < 0 || nextY + gridSizeY > 100 || nextY < 0);
    const touchesApple = hitsApple(nextX, nextY);
    
    return !isOpposite && !hitsWall && !touchesApple;
  });

  if (emergencyDirs.length > 0) {
    direction = emergencyDirs[Math.floor(Math.random() * emergencyDirs.length)];
  } else {
    // Si está completamente atrapada por muros/manzanas, va en reversa como último recurso
    direction = {x: -direction.x, y: -direction.y};
  }
}

function render(currentMins) {
  board.querySelectorAll('.snake-part, .apple').forEach(el => el.remove());

  // Dibujar Manzanas desde nuestro Array Global
  apples.forEach(applePos => {
    const apple = document.createElement('div');
    apple.className = 'apple';
    apple.style.left = applePos.x + "%";
    apple.style.top = applePos.y + "%";
    board.appendChild(apple);
  });

  // Dibujar Serpiente
  snake.forEach((part, index) => {
    const el = document.createElement('div');
    
    if (index === 0) {
      el.className = 'snake-part snake-head';
      el.textContent = String(currentMins).padStart(2, '0'); 
    } else {
      const patternNumber = index % 5; 
      el.className = `snake-part pattern-${patternNumber}`;
    }
    
    el.style.left = part.x + "%";
    el.style.top = part.y + "%";
    
    board.appendChild(el);
  });
}

setInterval(update, 1000);
update();
