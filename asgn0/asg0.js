// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('asmt0-canvas');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  //instantiate a vector v1
  var v1 = new Vector3([0, 0, 0]);

  //Part 2: call drawVector function
  drawVector(v1, "red");
}

//Part 2:drawVector Function
function drawVector(v, color) {
  var canvas = document.getElementById('asmt0-canvas');
  var ctx = canvas.getContext('2d');
  
  //color
  ctx.strokeStyle = color;
  
  //center
  var cenX = 200;
  var cenY = 200;

  //scale by 20
  var coord_x = v.elements[0] * 20;
  var coord_y = v.elements[1] * 20;
  
  //draw
  ctx.beginPath();
  ctx.moveTo(cenX, cenY); // move to center!
  ctx.lineTo(cenX + coord_x, cenY - coord_y); // draw out

  ctx.stroke();
}

// Part 3 and 4: input for vector1 and vector2 drawing and user interface
function handleDrawEvent() 
{
  var canvas = document.getElementById('asmt0-canvas');
  var ctx = canvas.getContext('2d');

  //clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, 400, 400);

  //v1 inputs
  var x1 = parseFloat(document.getElementById('x1_coordinate').value);
  var y1 = parseFloat(document.getElementById('y1_coordinate').value);

  //v2 inputs
  var x2 = parseFloat(document.getElementById('x2_coordinate').value);
  var y2 = parseFloat(document.getElementById('y2_coordinate').value);

  //new vector
  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);

  // draw both
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

// Part 5 and 6: Options and Operations
function handleDrawOperationEvent() 
{
  var canvas = document.getElementById('asmt0-canvas');
  var ctx = canvas.getContext('2d');

  //clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, 400, 400);

  var x1 = parseFloat(document.getElementById('x1_coordinate').value);
  var y1 = parseFloat(document.getElementById('y1_coordinate').value);

  var x2 = parseFloat(document.getElementById('x2_coordinate').value);
  var y2 = parseFloat(document.getElementById('y2_coordinate').value);

  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);

  //orginalvector
  drawVector(v1, "red");
  drawVector(v2, "blue");

  //operation 
  var opt = document.getElementById('op').value;
  var scalar = parseFloat(document.getElementById('scalar').value);

  if (opt === "Add") 
  {
    var v3 = new Vector3(v1.elements);
    v3.add(v2);
    drawVector(v3, "green");
  }

  else if (opt === "Sub") 
  {
    var v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(v3, "green");
  }

  else if (opt === "Mul") 
  {
    var v3 = new Vector3(v1.elements);
    var v4 = new Vector3(v2.elements);

    v3.mul(scalar);
    v4.mul(scalar);

    drawVector(v3, "green");
    drawVector(v4, "green");
  }

  else if (opt === "Div") 
  {
    var v3 = new Vector3(v1.elements);
    var v4 = new Vector3(v2.elements);

    v3.div(scalar);
    v4.div(scalar);

    drawVector(v3, "green");
    drawVector(v4, "green");
  }

  else if (opt === "Mag") 
  {
    console.log("Magnitude of v1:", v1.magnitude());
    console.log("Magnitude of v2:", v2.magnitude());
  }

  else if (opt === "Norm") 
  {
    var v3 = new Vector3(v1.elements);
    var v4 = new Vector3(v2.elements);

    v3.normalize();
    v4.normalize();

    drawVector(v3, "green");
    drawVector(v4, "green");
  }
  
  // angle between from part 7
  else if (opt === "Ang") 
  {
  let angle = angleBetween(v1, v2);
  console.log("Angle:", angle);
  }

  //area of the triangle from part 8  
  else if (opt === "Tri") 
  {
  let area = areaTriangle(v1, v2);
  console.log("Area of The Triangle:", area);
  }
}

//Part 7: Angle Between (use the cos formula)
function angleBetween(v1, v2) 
{
  let dot = Vector3.dot(v1, v2);

  let m1 = v1.magnitude();
  let m2 = v2.magnitude();

  let cos_formula = dot / (m1 * m2);

  let value_Rad = Math.acos(cos_formula);
  let value_Deg = value_Rad * (180 / Math.PI);

  return value_Deg;
}

//Part 8: Area of the triangle
function areaTriangle(v1, v2) 
{
  let cross = Vector3.cross(v1, v2);

  //area of the triangle formula
  let tri_area = cross.magnitude() / 2;

  return tri_area;
}
