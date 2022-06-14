const textResource = {
  allCellsDead: "Все клетки мертвы",
  evolutionOver: "Эволюция остановилась",
  stopSim: "Остановить симуляцию",
  simStarted: "Симуляция началась",
  startSim: "Начать симуляцию",
  simOver: "Симуляция завершена",
};

const DEFAULT_GRID_SIZE = 100;
const MIN_GRID_SIZE = 10;
const SIM_INTERVAL = 500;
const LIVING_CELLS_DENSITY = 0.1;

let gridSize = DEFAULT_GRID_SIZE;
let intervalId;
let currentGeneration;
let deathCounter = 0;
let generationCounter = 0;
let allCellsDead = false;
let simulationStarted = false;
let configurationPermanent = false;

const button = document.getElementById("simulate-button");
const gridSizeInput = document.getElementById("grid-size-input");
const grid = document.getElementById("grid");
const statusString = document.getElementById("simulation-status");
const deathIndicator = document.getElementById("death-indicator");
const generationIndicator = document.getElementById("generation-indicator");

const renderGrid = (gridSize) => {
  const cellsContainer = document.createElement("div");
  cellsContainer.className = "cells-container";
  cellsContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `${i},${j}`;
      cellsContainer.append(cell);
    }
  }

  grid.append(cellsContainer);
};

const repaintCellState = (i, j, paint) => {
  const cell = document.getElementById(`${i},${j}`);

  if (paint) {
    cell.classList.add("cell-alive");
  } else {
    cell.classList.remove("cell-alive");
  }
};

const simulateFirstGeneration = (gridSize) => {
  const firstGeneration = new Array(gridSize);

  for (let i = 0; i < gridSize; i++) {
    firstGeneration[i] = new Array(gridSize);

    for (let j = 0; j < gridSize; j++) {
      if (Math.random() <= LIVING_CELLS_DENSITY) {
        firstGeneration[i][j] = true;
        repaintCellState(i, j, true);
      } else {
        firstGeneration[i][j] = false;
      }
    }
  }

  currentGeneration = firstGeneration;
  intervalId = setInterval(simulateNextGeneration, SIM_INTERVAL);
};

const simulateNextGeneration = () => {
  if (allCellsDead) {
    terminateSimulation();
    statusString.innerText = textResource.allCellsDead;
    return;
  }

  if (configurationPermanent) {
    terminateSimulation();
    statusString.innerText = textResource.evolutionOver;
    return;
  }

  const prevGeneration = currentGeneration;
  const length = prevGeneration.length;
  const nextGeneration = new Array(length);
  let noLivingCells = true;
  let noChanges = true;

  for (let i = 0; i < length; i++) {
    nextGeneration[i] = new Array(length);

    for (let j = 0; j < length; j++) {
      let numLivingNeighbours = 0;
      const cell = prevGeneration[i][j];

      const topAspect = i === 0 ? length - 1 : i - 1;
      const bottomAspect = i === length - 1 ? 0 : i + 1;
      const leftAspect = j === 0 ? length - 1 : j - 1;
      const rightAspect = j === length - 1 ? 0 : j + 1;

      // all 8 neighbours
      if (prevGeneration[topAspect][leftAspect]) numLivingNeighbours++;
      if (prevGeneration[topAspect][j]) numLivingNeighbours++;
      if (prevGeneration[topAspect][rightAspect]) numLivingNeighbours++;
      if (prevGeneration[bottomAspect][leftAspect]) numLivingNeighbours++;
      if (prevGeneration[bottomAspect][j]) numLivingNeighbours++;
      if (prevGeneration[bottomAspect][rightAspect]) numLivingNeighbours++;
      if (prevGeneration[i][leftAspect]) numLivingNeighbours++;
      if (prevGeneration[i][rightAspect]) numLivingNeighbours++;

      if (!cell && numLivingNeighbours >= 3) {
        // birth of a cell
        nextGeneration[i][j] = true;
        repaintCellState(i, j, true);
        if (noLivingCells) noLivingCells = false;
        if (noChanges) noChanges = false;
      } else if (cell && (numLivingNeighbours < 2 || numLivingNeighbours > 3)) {
        // death of a cell
        nextGeneration[i][j] = false;
        repaintCellState(i, j, false);
        deathCounter++;
        if (noChanges) noChanges = false;
      } else {
        // state preserves
        nextGeneration[i][j] = cell;
        if (cell && noLivingCells) noLivingCells = false;
      }
    }
  }

  generationCounter++;
  currentGeneration = nextGeneration;
  allCellsDead = noLivingCells;
  configurationPermanent = noChanges;

  deathIndicator.innerText = deathCounter;
  generationIndicator.innerText = generationCounter;
};

const resetGrid = () => {
  const cellsContainer = grid.querySelector(".cells-container");
  cellsContainer.remove();
};

const clearGrid = () => {
  for (let i = 0; i < currentGeneration.length; i++) {
    for (let j = 0; j < currentGeneration.length; j++) {
      if (currentGeneration[i][j]) {
        repaintCellState(i, j, false);
      }
    }
  }
};

const updateGridSize = (evt) => {
  resetGrid();

  const targetValue = evt.target.value;

  if (!targetValue || targetValue < MIN_GRID_SIZE) {
    gridSize = MIN_GRID_SIZE;
    gridSizeInput.value = MIN_GRID_SIZE;
  } else {
    gridSize = targetValue;
  }

  renderGrid(gridSize);
};

const manageSimulation = () => {
  if (!simulationStarted) {
    startSimulation();
  } else {
    terminateSimulation();
  }
};

const startSimulation = () => {
  gridSizeInput.disabled = true;

  simulateFirstGeneration(gridSize);
  button.innerText = textResource.stopSim;
  statusString.innerText = textResource.simStarted;
  simulationStarted = true;
};

const terminateSimulation = () => {
  clearInterval(intervalId);
  clearGrid();
  deathCounter = 0;
  generationCounter = 0;
  allCellsDead = false;
  configurationPermanent = false;
  simulationStarted = false;
  button.innerText = textResource.startSim;
  statusString.innerText = textResource.simOver;
  deathIndicator.innerText = 0;
  generationIndicator.innerText = 0;
  gridSizeInput.disabled = false;
};

const init = () => {
  gridSizeInput.value = gridSize;
  gridSizeInput.onchange = updateGridSize;
  button.onclick = manageSimulation;
  renderGrid(gridSize);
};

init();
