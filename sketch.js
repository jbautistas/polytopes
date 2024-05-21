let angle = 0;

let points = [];
let conections = [];

function setup() {
  createCanvas(600, 400, WEBGL);
  let count = 0;
  const val = 0.5
  const phi = (1 + sqrt(5)) / 2;
  const invphi = 2 / (1 + sqrt(5));

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

  // permutations of (+-phi, +- 1/phi, 0, 0) in pairs (96 vertices)

  const options = [phi, -phi, invphi, -invphi];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        for (let l = 0; l < 4; l++) {
          if ( !(i + j + k + l) % 2 === 0) continue;
          points[count] = [[options[i]], [options[j]], [options[k]], [options[l]]];
          count++;
        }
      }
    }
  }


  let minDistance = 1000;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = distance(points[i], points[j]);
      if (d < minDistance && d !== 0) {
        minDistance = d;
      }
    }
  }
  console.log('minDistance: ', minDistance);

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = distance(points[i], points[j]);
      if (d === minDistance && !conections.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) {
        conections.push([i, j]);
      }
    }
  }

  //// points not connected
  //let notConnected = [];

  //for (let i = 0; i < points.length; i++) {
  //  if (!conections.some(([a, b]) => a === i || b === i)) {
  //    notConnected.push(points[i]);
  //  }
  //}
  //console.log('notConnected: ', notConnected);
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
    stroke(255, 220, 100);
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
  stroke(255);
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