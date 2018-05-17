import { PaperSize, Orientation } from "penplot";
import { polylinesToSVG } from "penplot/util/svg";
import { clipPolylinesToBox } from "penplot/util/geom";
import Random from "random-js";

const random = new Random();

export const orientation = Orientation.PORTRAIT;
export const dimensions = PaperSize.LETTER;

// Configs
const squarePerLine = 4;
const squareSize = 4;
const randomPoints = 10;
const marginOut = 1.5;
const marginPerSquare = 0.85;
const debug = false;
let pos = { x: marginOut, y: marginOut };

export default function createPlot(context, dimensions) {
  const [width, height] = dimensions;
  console.log(dimensions);
  let lines = [];
  let dots = [];

  let counter = 1;
  let randomDots = _generateRandomDots(0);
  let shape;
  for (let i = 1; i <= 20; i++) {
    console.log(`Frame ${i}`);

    // Create Frames
    let frameSquare = _createFrameLines();
    if (i % 6 == 0) lines.push(frameSquare);

    //Random Dots Lines
    if (i == 1) {
      shape = randomDots;
      shape[randomDots.length] = shape[0];
    } else {
      shape = _translateDotsX(shape, 1);
      shape = random.shuffle(shape);
      shape[shape.length] = shape[0]
    }

    lines.push(shape);
    dots.push(shape);

    // Reset Positions
    pos.x = pos.x + squareSize + marginPerSquare;
    counter = counter + 1;
    if (counter > 4) {
      shape = _translateDotsX(shape, -4);
      shape = _translateDotsY(shape, 1);
      pos.y = pos.y + squareSize + 1;
      pos.x = marginOut;
      counter = 1;
    }
  }

  // Clip all the lines to a margin
  const box = [marginOut, marginOut, width - marginOut, height - marginOut];
  lines = clipPolylinesToBox(lines, box);

  return {
    print,
    draw,
    background: "white",
    animate: false,
    clear: true
  };

  function draw() {
    lines.forEach(points => {
      context.beginPath();
      points.forEach(p => context.lineTo(p[0], p[1]));
      context.stroke();
    });

    if (debug) {
      dots.forEach(points => {
        context.beginPath();
        points.forEach(p => context.arc(p[0], p[1], 0.08, 0, Math.PI * 2));
        context.strokeStyle = "red";
        context.stroke();
      });
    }
  }

  function print() {
    return polylinesToSVG(lines, {
      dimensions
    });
  }
}

/* ---------
Helpers
------ */

function _createFrameLines() {
  return [
    [pos.x, pos.y],
    [pos.x + squareSize, pos.y],
    [pos.x + squareSize, pos.y + squareSize],
    [pos.x, pos.y + squareSize],
    [pos.x, pos.y]
  ];
}

function _translateDotsY(array, c) {
  console.log(array);
  return array.map(dot => {
    return [dot[0], dot[1] + 0.2 + (squareSize + marginPerSquare) * c];
  });
}

function _translateDotsX(array, c) {
  console.log(array);
  return array.map(dot => {
    return [dot[0] + (squareSize + marginPerSquare) * c, dot[1]];
  });
}

// TODO: Create form with parameters
function _generateRandomDots(i) {
  // Margin points
  let minX = pos.x + 0.6;
  let maxX = pos.x + squareSize - 0.6;
  let minY = pos.y + 0.6;
  let maxY = pos.y + squareSize - 0.6;

  //Generate Dots
  let dots = new Array(randomPoints + i)
    .fill(0)
    //.map(() => [random.real(minX, maxX) + 0.6, random.real(minY, maxY) + 0.6]);
    .map(() => [
      Math.floor(Math.random() * (maxX - minX)) + minX,
      Math.floor(Math.random() * (maxY - minY)) + minY
    ]);

  return dots;
}
