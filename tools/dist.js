function generateCoordinates() {
  let arr = []
  arr.push(Math.floor(Math.random() * 100) + 1);
  arr.push(Math.floor(Math.random() * 100) + 1);
  return arr
}

function calculateDist(Arr2D) {
  let dist = Math.sqrt( Math.pow((Arr2D[1][0] - Arr2D[0][0]), 2) + Math.pow((Arr2D[1][1] - Arr2D[0][1]), 2) )
  return Math.round((dist + Number.EPSILON) * 100) / 100
}

function generateProblem(int) {  //Generate number of destinations
  let problem = [];

  for (let i = 0; i < int; i++) {
    problem.push(generateCoordinates());
  }
  return problem
}

// generateProblem() produces a Two dimensional array of co-ordinates with the first co-ordinate being the origin.
// calculateDist() returns the distance between two points.
// Find the shortest distance it takes for our delivery truck to complete all destination.

var problem = generateProblem(4);
console.log(problem);

for (let i in problem) {

}