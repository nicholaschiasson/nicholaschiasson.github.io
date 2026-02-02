(async function main() {
  const { Universe } = wasm_bindgen;
  const { memory } = await wasm_bindgen();

  const DEAD_COLOR = "rgba(255, 255, 255, 0.2)";
  const ALIVE_COLOR = "rgb(0, 0, 0)";
  const INTERVAL_MS = 100;

  let screenWidth = screen.width;
  let screenHeight = screen.height;
  switch (screen.orientation.type) {
    case "landscape-secondary":
    case "portrait-secondary":
      screenWidth = screen.height;
      screenHeight = screen.width;
      break;
  }

  const universe = Universe.new(screenWidth / 32, screenHeight / 32);
  const width = universe.width();
  const height = universe.height();

  const canvas = document.getElementById("game-of-life-canvas");

  let cellWidth = 1;
  let cellHeight = 1;
  let previousTime = 0;
  let elapsedTime = 0;

  const ctx = canvas.getContext("2d");
  ctx.globalAlpha = 0.5;

  const renderLoop = (time) => {
    elapsedTime += time - previousTime;

    let shouldDraw = false;

    while (elapsedTime >= INTERVAL_MS) {
      shouldDraw = true;
      elapsedTime -= INTERVAL_MS;
      universe.tick();
    }

    if (shouldDraw) {
      drawCells();
    }

    previousTime = time;
    requestAnimationFrame(renderLoop);
  };

  const getIndex = (row, column) => {
    return row * width + column;
  };

  const bitIsSet = (n, arr) => {
    const byte = Math.floor(n / 8);
    const mask = 1 << (n % 8);
    return (arr[byte] & mask) === mask;
  };

  const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height) / 8);

    ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        if (!bitIsSet(idx, cells)) {
          continue;
        }

        ctx.beginPath();
        ctx.roundRect(col * cellWidth, row * cellHeight, cellWidth + 1, cellHeight + 1, 100);
        ctx.fill();
      }
    }

    ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        if (bitIsSet(idx, cells)) {
          continue;
        }

        ctx.beginPath();
        ctx.roundRect(col * cellWidth, row * cellHeight, cellWidth + 1, cellHeight + 1, 100);
        ctx.fill();
      }
    }
  };

  const setSize = () => {
    canvas.width = visualViewport.width;
    canvas.height = visualViewport.height;
    cellWidth = canvas.width / width;
    cellHeight = canvas.height / height;
    drawCells();
  };

  addEventListener("resize", setSize);

  setSize();
  requestAnimationFrame(renderLoop);
})();
