// jbautistas@unal.edu.co
// Juan Sebastian Bautista Suarez
// data taken from: https://mathworld.wolfram.com/600-Cell.html

let angle = 0;

let points = [];
let conections = [];

function setup() {
  createCanvas(600, 400, WEBGL);
  let count = 0;
  const val = 0.5
  const phi = (1 + sqrt(5)) / 4; // phi /2
  const invphi = 1 / (1 + sqrt(5)); // phi**-1 / 2

  // permutations of (+-0.5, +-0.5, +- 0.5, +-0.5) (16 vertices)
  for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        for (let w = -1; w <= 1; w += 2) {
          points[count] = [[val*x], [val*y], [val*z], [val*w]];
          count++;
        }
      }
    }
  }

  // permutations of (+-1, 0, 0, 0) in every position (8 vertices)
  for (let i = 0; i < 4; i++) {
    for (let j = -1; j <= 1; j+=2) {
      const zeros = [[0], [0], [0], [0]];
      zeros[i] = [j];
      points[count] = zeros;
      count++;
    }
  }

  // even permutations of 1/2*(+-phi, +-1, +- 1/phi, 0) in pairs (96 vertices)

  let permutations = generateSignedCombinations([phi, val, invphi, 0])
  
  // clean duplicates
  let uniquePermutations = [];
  for (let i = 0; i < permutations.length; i++) {
    let isUnique = true;
    for (let j = 0; j < uniquePermutations.length; j++) {
      if (distance(permutations[i], uniquePermutations[j]) === 0) {
        isUnique = false;
        break;
      }
    }
    if (isUnique) {
      uniquePermutations.push(permutations[i]);
    }
  }


  // get even permutations
  for (let i = 0; i < uniquePermutations.length; i++){
    const temp = getEvenPermutations(uniquePermutations[i]);
    for (let j = 0; j < temp.length; j++) {
      points[count] = [[temp[j][0]], [temp[j][1]], [temp[j][2]], [temp[j][3]]];
      count++;
    }
  }

  // connect points with distance 1
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = distance(points[i], points[j]);
      if (d === (1) && !conections.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) {
        conections.push([i, j]);
      }
    }
  }

  // points not connected
  let notConnected = [];

  for (let i = 0; i < points.length; i++) {
    if (!conections.some(([a, b]) => a === i || b === i)) {
      notConnected.push(points[i]);
    }
  }
  console.log('notConnected: ', notConnected);
}

function draw() {
  background(128);
  orbitControl();
  
  rotateX(-PI/2);

  const rotationXY = [
    [cos(angle), -sin(angle), 0, 0],
    [sin(angle), cos(angle), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  
  const rotationZW = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, cos(angle), -sin(angle)],
    [0, 0, sin(angle), cos(angle)],
  ];

  let projected = [];

  for (let i = 0; i < points.length; i++) {
    let rotated = matmul(rotationXY, points[i]);
    rotated = matmul(rotationZW, rotated);

    // Orthographic projection
    // const projection = [
    //   [1, 0, 0, 0],
    //   [0, 1, 0, 0],
    //   [0, 0, 1, 0],
    // ];
    
    // Perspective
    let distance = 2;
    let w = 1 / (distance - rotated[3]);
    const projection = [
      [w, 0, 0, 0],
      [0, w, 0, 0],
      [0, 0, w, 0],
    ];
    
    let projected3d = matmul(projection, rotated);
    projected[i] = [height/2 * projected3d[0],
                    height/2 * projected3d[1],
                    height/2 * projected3d[2]];
  }

  for (let i = 0; i < projected.length; i++) {
    strokeWeight(10);
    stroke(10);
    const v = projected[i];
    point(v[0], v[1], v[2]);
  }

  for (let i = 0; i < conections.length; i++) {
    connect(conections[i][0], conections[i][1], projected)
  }

  angle += 0.02;
}

function connect(i, j, points) {
  const a = points[i];
  const b = points[j];
  strokeWeight(1);
  stroke(200);
  line(a[0], a[1], a[2], b[0], b[1], b[2]);
}

function matmul(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions are not compatible for multiplication.");
  }

  // Create an empty result matrix
  const result = new Array(rowsA).fill()
    .map(() => new Array(colsB).fill(0));
  

  // Perform matrix multiplication
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matrixA[i][k] * matrixB[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return round(sqrt(sum), 1);
}

// Función para generar todas las permutaciones de un array
function permute(arr) {
  let result = [];

  if (arr.length === 0) return [[]];

  for (let i = 0; i < arr.length; i++) {
    const currentNum = arr[i];
    const remainingNums = arr.slice(0, i).concat(arr.slice(i + 1));
    const remainingNumsPermuted = permute(remainingNums);

    for (let perm of remainingNumsPermuted) {
      result.push([currentNum].concat(perm));
    }
  }

  return result;
}

function countInversions(arr) {
  let inversions = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        inversions++;
      }
    }
  }
  return inversions;
}

function isEvenPermutation(arr) {
  return countInversions(arr) % 2 === 0;
}

function getEvenPermutations(elements) {
  const allPermutations = permute(elements);
  return allPermutations.filter(isEvenPermutation);
}

function generateSignedCombinations(elements) {
  const signedCombinations = [];
  const signs = [1, -1];

  function generateCombinations(index, currentCombination) {
    if (index === elements.length) {
      signedCombinations.push(currentCombination.slice());
      return;
    }

    for (let sign of signs) {
      currentCombination[index] = elements[index] * sign;
      generateCombinations(index + 1, currentCombination);
    }
  }

  generateCombinations(0, new Array(elements.length));
  return signedCombinations;
}