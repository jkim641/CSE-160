//shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

//global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
//select color
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
//slide size
let g_sizeSlide = 5;
//segment
let g_segments = 10;
//type (tri)
const POINT = 0
const TRIANGLE = 1;
const CIRCLE = 2;
let g_selectedType = POINT;

//awesomness add ons (eraser and undo tool)
let g_eraserMode = false;
let g_eraserSize = 10;

//main
function main() 
{
  //set up
  setupWebGL();

  //GLSL shaders
  connectVariablesToGLSL();

  //actions for HTML UI elements
  addActionsForHtmlUI();

  //part 8: register function
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev)
  {
    if(ev.buttons == 1)
    {
      click(ev);
    }
  }



  //clear canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //clear
  gl.clear(gl.COLOR_BUFFER_BIT);

  //awesomeness: color preview
  updateColorPreview();
}

//Part 6: shape list
var g_shapesList = [];

//click
function click(ev) 
{
  //event click and into WebGL coord
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Store the coordinates to g_points array
  //before: g_points.push([x, y]);

  //select colors
  //before: g_colors.push([g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]]);

  //store size
  //before: g_sizes.push(g_sizeSlide);

  //new point
  let point;
  
  //eraser add on
  if (g_eraserMode) {
    eraseAt(x, y);
    renderAllShapes();
    return;
  }

  if (g_selectedType == POINT)
  {
    point = new Point();
  } else if (g_selectedType == TRIANGLE)
  {
    point = new Triangle();
    let d = g_sizeSlide / 200.0;

    point.vertices = [
      x, y,
      x + d, y,
      x, y + d
    ];
  } else
  {
    point = new Circle();
    point.segments = g_segments;
  }
  
  point.position=[x, y];
  point.color = g_selectedColor.slice();
  point.size = g_sizeSlide;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  //if (x >= 0.0 && y >= 0.0) {      // First quadrant
    //g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  //} else if (x < 0.0 && y < 0.0) { // Third quadrant
    //g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  //} else {                         // Others
    //g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  //}
  
  //draw shapes
  renderAllShapes();
}

//Part 3(Organize and Debug): set up WebGLPart
function setupWebGL()
{
  //canvas
  canvas = document.getElementById('asmt1-canvas');

  //webGL context
  if (!canvas) {
    console.log('Failed to get canvas!');
    return;
  }

  //Part 8: rendering context
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true} );
  if (!gl)
  {
    console.log('Error on getting rendering context!');
    return;
  }


}

//Part 3(Organize and Debug): Connect variables to GLSL
function connectVariablesToGLSL()
{
  //initialize shaders!
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) 
  {
    console.log('Failed to intialize shaders.');
    return;
  }

  //storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');

  if (a_Position < 0) 
  {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  //storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  if (!u_FragColor) 
  {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  //storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  
  if (!u_Size) 
  {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

//Part 3(Organize and Debug): convert coordinates event to GL
function convertCoordinatesEventToGL(ev)
{
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

//Part 3(Organize and Debug): Render All Shapes 
function renderAllShapes()
{
  
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) 
  {
    g_shapesList[i].render();
  }
}

//HTML UI (Part 4, Part 5)
function addActionsForHtmlUI()
{
  //Part 4: color button
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  //Part 7: clear button
  document.getElementById('clearB').onclick = function() { g_shapesList = []; renderAllShapes(); };
  //Part 9: Triangle
  document.getElementById('pointB').onclick = function() { g_selectedType = POINT };
  document.getElementById('triangleB').onclick = function() { g_selectedType = TRIANGLE};
  //Part 10: circle
  document.getElementById('circleB').onclick = function() { g_selectedType = CIRCLE};

  //Part 12: My drawing
  document.getElementById('drawB').onclick = function() {showDrawing();};


  //Part 4: color slider
  document.getElementById('slideR').addEventListener('input',     function() { g_selectedColor[0] = this.value/100; updateColorPreview(); });
  document.getElementById('slideG').addEventListener('input',   function() { g_selectedColor[1] = this.value/100; updateColorPreview(); });
  document.getElementById('slideB').addEventListener('input',    function() { g_selectedColor[2] = this.value/100; updateColorPreview(); });

  //Part 5:Size Slider
  document.getElementById('slideSize').addEventListener('mouseup',    function() { g_sizeSlide = this.value; });

  //Part 11: segment slider
  document.getElementById('slideSeg').addEventListener('mouseup',    function() { g_segments = this.value; });

  //awesomeness Add on: Eraser and Undo Tool
  //eraser button
  document.getElementById('eraserB').onclick = function() {
    g_eraserMode = true;
  };

  //turn OFF eraser when selecting shapes
  document.getElementById('pointB').onclick = function() { 
    g_selectedType = POINT;
    g_eraserMode = false;
  };
  document.getElementById('triangleB').onclick = function() { 
    g_selectedType = TRIANGLE;
    g_eraserMode = false;
  };
  document.getElementById('circleB').onclick = function() { 
    g_selectedType = CIRCLE;
    g_eraserMode = false;
  };

  //eraser size slider
  document.getElementById('eraserSize').addEventListener('input', function() {
    g_eraserSize = this.value;
  });

  //undo button
  document.getElementById('undoB').onclick = function() {
    g_shapesList.pop();
    renderAllShapes();
  };
}

//awesomeness: eraser
function eraseAt(x, y)
{
  let threshold = g_eraserSize / 200;

  for (let i = g_shapesList.length - 1; i >= 0; i--)
  {
    let shape = g_shapesList[i];

    // use position (works for all your shapes)
    let dx = shape.position[0] - x;
    let dy = shape.position[1] - y;

    let dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < threshold)
    {
      g_shapesList.splice(i, 1);
    }
  }
}

//awesomeness: color preview
function updateColorPreview()
{
  let r = Math.floor(g_selectedColor[0] * 255);
  let g = Math.floor(g_selectedColor[1] * 255);
  let b = Math.floor(g_selectedColor[2] * 255);

  document.getElementById('colorPreview').style.backgroundColor =
    `rgb(${r}, ${g}, ${b})`;
}

//part 12: My Drawing
function showDrawing()
{
  g_shapesList = [];

  //Face Base (Alot of trinagle)-------------------------------------------------------------------------------------------
  let face1 = new Triangle();
  face1.color = [0.15, 0.15, 0.15, 1.0];
  face1.vertices = [
    -0.3, 0.6,
    0.3, 0.6,
    0.0, -0.5
  ];
  g_shapesList.push(face1);

  //left side--------------------------------------------------------------------------------------------------------------
  let face2 = new Triangle();
  face2.color = [0.15, 0.15, 0.15, 1.0];
  face2.vertices = [
    -0.4, 0.55,
    -0.3, 0.6,
    -0.13, 0.0
  ];
  g_shapesList.push(face2);

  let face3 = new Triangle();
  face3.color = [0.15, 0.15, 0.15, 1.0];
  face3.vertices = [
    -0.5, 0.45,
    -0.4, 0.55,
    -0.13, 0.0
  ];
  g_shapesList.push(face3);

  let face4 = new Triangle();
  face4.color = [0.15, 0.15, 0.15, 1.0];
  face4.vertices = [
    -0.6, 0.3,
    -0.5, 0.45,
    -0.13, 0.0
  ];
  g_shapesList.push(face4);

  let face5 = new Triangle();
  face5.color = [0.15, 0.15, 0.15, 1.0];
  face5.vertices = [
    -0.65, 0.1,
    -0.6, 0.3,
    -0.13, 0.0
  ];
  g_shapesList.push(face5);

  let face6 = new Triangle();
  face6.color = [0.15, 0.15, 0.15, 1.0];
  face6.vertices = [
    -0.65, -0.1,
    -0.65, 0.1,
    -0.13, 0.0
  ];
  g_shapesList.push(face6);

  let face7 = new Triangle();
  face7.color = [0.15, 0.15, 0.15, 1.0];
  face7.vertices = [
    -0.6, -0.2,
    -0.65, -0.1,
    -0.13, 0.0
  ];
  g_shapesList.push(face7);

  let face8 = new Triangle();
  face8.color = [0.15, 0.15, 0.15, 1.0];
  face8.vertices = [
    -0.55, -0.25,
    -0.6, -0.2,
    -0.13, 0.0
  ];
  g_shapesList.push(face8);

  let face9 = new Triangle();
  face9.color = [0.15, 0.15, 0.15, 1.0];
  face9.vertices = [
    -0.45, -0.3,
    -0.55, -0.25,
    -0.13, 0.0
  ];
  g_shapesList.push(face9);

  let face10 = new Triangle();
  face10.color = [0.15, 0.15, 0.15, 1.0];
  face10.vertices = [
    -0.35, -0.4,
    -0.45, -0.3,
    -0.13, 0.0
  ];
  g_shapesList.push(face10);

  let face11 = new Triangle();
  face11.color = [0.15, 0.15, 0.15, 1.0];
  face11.vertices = [
    -0.2, -0.45,
    -0.35, -0.4,
    -0.13, 0.0
  ];
  g_shapesList.push(face11);

  let face12 = new Triangle();
  face12.color = [0.15, 0.15, 0.15, 1.0];
  face12.vertices = [
    -0.1, -0.45,
    -0.2, -0.45,
    -0.13, 0.0
  ];
  g_shapesList.push(face12);

  let face13 = new Triangle();
  face13.color = [0.15, 0.15, 0.15, 1.0];
  face13.vertices = [
    0.0, -0.5,
    -0.1, -0.45,
    -0.13, 0.0
  ];
  g_shapesList.push(face13);

  //right side-----------------------------------------------------------------------------------------------------------
  let face2R = new Triangle();
  face2R.color = [0.15, 0.15, 0.15, 1.0];
  face2R.vertices = [
    0.4, 0.55,
    0.3, 0.6,
    0.13, 0.0
  ];
  g_shapesList.push(face2R);

  let face3R = new Triangle();
  face3R.color = [0.15, 0.15, 0.15, 1.0];
  face3R.vertices = [
    0.5, 0.45,
    0.4, 0.55,
    -0.13, 0.0
  ];
  g_shapesList.push(face3R);

  let face4R = new Triangle();
  face4R.color = [0.15, 0.15, 0.15, 1.0];
  face4R.vertices = [
    0.6, 0.3,
    0.5, 0.45,
    -0.13, 0.0
  ];
  g_shapesList.push(face4R);

  let face5R = new Triangle();
  face5R.color = [0.15, 0.15, 0.15, 1.0];
  face5R.vertices = [
    0.65, 0.1,
    0.6, 0.3,
    -0.13, 0.0
  ];
  g_shapesList.push(face5R);

  let face6R = new Triangle();
  face6R.color = [0.15, 0.15, 0.15, 1.0];
  face6R.vertices = [
    0.65, -0.1,
    0.65, 0.1,
    -0.13, 0.0
  ];
  g_shapesList.push(face6R);

  let face7R = new Triangle();
  face7R.color = [0.15, 0.15, 0.15, 1.0];
  face7R.vertices = [
    0.6, -0.2,
    0.65, -0.1,
    -0.13, 0.0
  ];
  g_shapesList.push(face7R);

  let face8R = new Triangle();
  face8R.color = [0.15, 0.15, 0.15, 1.0];
  face8R.vertices = [
    0.55, -0.25,
    0.6, -0.2,
    -0.13, 0.0
  ];
  g_shapesList.push(face8R);

  let face9R = new Triangle();
  face9R.color = [0.15, 0.15, 0.15, 1.0];
  face9R.vertices = [
    0.45, -0.3,
    0.55, -0.25,
    -0.13, 0.0
  ];
  g_shapesList.push(face9R);

  let face10R = new Triangle();
  face10R.color = [0.15, 0.15, 0.15, 1.0];
  face10R.vertices = [
    0.35, -0.4,
    0.45, -0.3,
    -0.13, 0.0
  ];
  g_shapesList.push(face10R);

  let face11R = new Triangle();
  face11R.color = [0.15, 0.15, 0.15, 1.0];
  face11R.vertices = [
    0.2, -0.45,
    0.35, -0.4,
    -0.13, 0.0
  ];
  g_shapesList.push(face11R);

  let face12R = new Triangle();
  face12R.color = [0.15, 0.15, 0.15, 1.0];
  face12R.vertices = [
    0.1, -0.45,
    0.2, -0.45,
    -0.13, 0.0
  ];
  g_shapesList.push(face12R);

  let face13R = new Triangle();
  face13R.color = [0.15, 0.15, 0.15, 1.0];
  face13R.vertices = [
    0.0, -0.5,
    0.1, -0.45,
    -0.13, 0.0
  ];
  g_shapesList.push(face13R);

  //left ear -------------------------------------------------------------------------------------------------------------
  let ear1 = new Triangle();
  ear1.color = [0.15, 0.15, 0.15, 1.0];
  ear1.vertices = [
    -0.35, 0.7,
    -0.2, 0.6,
    -0.3, 0.6
  ];
  g_shapesList.push(ear1);

  let ear2 = new Triangle();
  ear2.color = [0.15, 0.15, 0.15, 1.0];
  ear2.vertices = [
    -0.45, 0.7,
    -0.35, 0.7,
    -0.3, 0.6
  ];
  g_shapesList.push(ear2);
  
  let ear3 = new Triangle();
  ear3.color = [0.15, 0.15, 0.15, 1.0];
  ear3.vertices = [
    -0.5, 0.8,
    -0.35, 0.7,
    -0.45, 0.7
  ];
  g_shapesList.push(ear3);

  let ear4 = new Triangle();
  ear4.color = [0.15, 0.15, 0.15, 1.0];
  ear4.vertices = [
    -0.5, 0.8,
    -0.45, 0.7,
    -0.5, 0.45
  ];
  g_shapesList.push(ear4);
  
  let ear5 = new Triangle();
  ear5.color = [0.15, 0.15, 0.15, 1.0];
  ear5.vertices = [
    -0.5, 0.8,
    -0.5, 0.45,
    -0.6, 0.3
  ];
  g_shapesList.push(ear5);

  //right ear ------------------------------------------------------------------------------------------------------------
  let ear1r = new Triangle();
  ear1r.color = [0.15, 0.15, 0.15, 1.0];
  ear1r.vertices = [
    0.35, 0.7,
    0.2, 0.6,
    0.3, 0.6
  ];
  g_shapesList.push(ear1r);

  let ear2r = new Triangle();
  ear2r.color = [0.15, 0.15, 0.15, 1.0];
  ear2r.vertices = [
    0.45, 0.7,
    0.35, 0.7,
    0.3, 0.6
  ];
  g_shapesList.push(ear2r);
  
  let ear3r = new Triangle();
  ear3r.color = [0.15, 0.15, 0.15, 1.0];
  ear3r.vertices = [
    0.5, 0.8,
    0.35, 0.7,
    0.45, 0.7
  ];
  g_shapesList.push(ear3r);

  let ear4r = new Triangle();
  ear4r.color = [0.15, 0.15, 0.15, 1.0];
  ear4r.vertices = [
    0.5, 0.8,
    0.45, 0.7,
    0.5, 0.45
  ];
  g_shapesList.push(ear4r);
  
  let ear5r = new Triangle();
  ear5r.color = [0.15, 0.15, 0.15, 1.0];
  ear5r.vertices = [
    0.5, 0.8,
    0.5, 0.45,
    0.6, 0.3
  ];
  g_shapesList.push(ear5r);

  //fur texture left ------------------------------------------------------------------------------------------------------
  let fur1 = new Triangle();
  fur1.color = [0.15, 0.15, 0.15, 1.0];
  fur1.vertices = [
    -0.6, -0.2,
    -0.55, -0.25,
    -0.6, -0.3
  ];
  g_shapesList.push(fur1);

  let fur2 = new Triangle();
  fur2.color = [0.15, 0.15, 0.15, 1.0];
  fur2.vertices = [
    -0.55, -0.25,
    -0.45, -0.3,
    -0.5, -0.4
  ];
  g_shapesList.push(fur2);

  let fur3 = new Triangle();
  fur3.color = [0.15, 0.15, 0.15, 1.0];
  fur3.vertices = [
    -0.45, -0.3,
    -0.35, -0.4,
    -0.4, -0.45
  ];
  g_shapesList.push(fur3);

  let fur4 = new Triangle();
  fur4.color = [0.15, 0.15, 0.15, 1.0];
  fur4.vertices = [
    -0.35, -0.4,
    -0.2, -0.45,
    -0.25, -0.5
  ];
  g_shapesList.push(fur4);

  let fur5 = new Triangle();
  fur5.color = [0.15, 0.15, 0.15, 1.0];
  fur5.vertices = [
    -0.2, -0.45,
    -0.1, -0.45,
    -0.1, -0.5
  ];
  g_shapesList.push(fur5);

  let fur6 = new Triangle();
  fur6.color = [0.15, 0.15, 0.15, 1.0];
  fur6.vertices = [
    -0.1, -0.45,
    -0.05, -0.475,
    -0.1, -0.5
  ];
  g_shapesList.push(fur6);

  let fur7 = new Triangle();
  fur7.color = [0.25, 0.25, 0.25, 1.0];
  fur7.vertices = [
    -0.55, -0.2,
    -0.5, -0.25,
    -0.5, -0.3
  ];
  g_shapesList.push(fur7);

  let fur8 = new Triangle();
  fur8.color = [0.2, 0.2, 0.2, 1.0];
  fur8.vertices = [
    -0.4, -0.34,
    -0.35, -0.37,
    -0.4, -0.4
  ];
  g_shapesList.push(fur8);

  let fur9 = new Triangle();
  fur9.color = [0.2, 0.2, 0.2, 1.0];
  fur9.vertices = [
    -0.3, -0.4,
    -0.2, -0.43,
    -0.25, -0.45
  ];
  g_shapesList.push(fur9);

  let fur10 = new Triangle();
  fur10.color = [0.25, 0.25, 0.25, 1.0];
  fur10.vertices = [
    -0.05, -0.45,
    0.05, -0.45,
    0.0, -0.475
  ];
  g_shapesList.push(fur10);

  //right fur ------------------------------------------------------------------------------------------------------------
  let fur1r = new Triangle();
  fur1r.color = [0.15, 0.15, 0.15, 1.0];
  fur1r.vertices = [
    0.6, -0.2,
    0.55, -0.25,
    0.6, -0.3
  ];
  g_shapesList.push(fur1r);

  let fur2r = new Triangle();
  fur2r.color = [0.15, 0.15, 0.15, 1.0];
  fur2r.vertices = [
    0.55, -0.25,
    0.45, -0.3,
    0.5, -0.4
  ];
  g_shapesList.push(fur2r);

  let fur3r = new Triangle();
  fur3r.color = [0.15, 0.15, 0.15, 1.0];
  fur3r.vertices = [
    0.45, -0.3,
    0.35, -0.4,
    0.4, -0.45
  ];
  g_shapesList.push(fur3r);

  let fur4r = new Triangle();
  fur4r.color = [0.15, 0.15, 0.15, 1.0];
  fur4r.vertices = [
    0.35, -0.4,
    0.2, -0.45,
    0.25, -0.5
  ];
  g_shapesList.push(fur4r);

  let fur5r = new Triangle();
  fur5r.color = [0.15, 0.15, 0.15, 1.0];
  fur5r.vertices = [
    0.2, -0.45,
    0.1, -0.45,
    0.1, -0.5
  ];
  g_shapesList.push(fur5r);

  let fur6r = new Triangle();
  fur6r.color = [0.15, 0.15, 0.15, 1.0];
  fur6r.vertices = [
    0.1, -0.45,
    0.05, -0.475,
    0.1, -0.5
  ];
  g_shapesList.push(fur6r);

  let fur7r = new Triangle();
  fur7r.color = [0.2, 0.2, 0.2, 1.0];
  fur7r.vertices = [
    0.55, -0.2,
    0.5, -0.25,
    0.5, -0.3
  ];
  g_shapesList.push(fur7r);

  let fur8r = new Triangle();
  fur8r.color = [0.25, 0.25, 0.25, 1.0];
  fur8r.vertices = [
    0.4, -0.34,
    0.35, -0.37,
    0.4, -0.4
  ];
  g_shapesList.push(fur8r);

  let fur9r = new Triangle();
  fur9r.color = [0.2, 0.2, 0.2, 1.0];
  fur9r.vertices = [
    0.3, -0.4,
    0.2, -0.43,
    0.25, -0.45
  ];
  g_shapesList.push(fur9r);

// ear fill left -------------------------------------------------------------------------------------------------------------
let earfill1 = new Triangle();
earfill1.color = [0.3, 0.2, 0.2, 1.0];
earfill1.vertices = [
  -0.45, 0.7,
  -0.3, 0.6,
  -0.4, 0.55
];
g_shapesList.push(earfill1);

let earfill2 = new Triangle();
earfill2.color = [0.33, 0.2, 0.2, 0.97];
earfill2.vertices = [
  -0.45, 0.7,
  -0.4, 0.55,
  -0.5, 0.45
];
g_shapesList.push(earfill2);

//right ear fill------------------------------------------------------------------------------------------------------------
let earfill1r = new Triangle();
earfill1r.color = [0.3, 0.2, 0.2, 1.0];
earfill1r.vertices = [
  0.45, 0.7,
  0.3, 0.6,
  0.4, 0.55
];
g_shapesList.push(earfill1r);

let earfill2r = new Triangle();
earfill2r.color = [0.33, 0.2, 0.2, 0.97];
earfill2r.vertices = [
  0.45, 0.7,
  0.4, 0.55,
  0.5, 0.45
];
g_shapesList.push(earfill2r);

//left eye ----------------------------------------------------------------------------------------------------------------
let eye = new Triangle();
eye.color = [0.0, 0.0, 0.0, 1.0];
eye.vertices = [
  -0.2, 0.2,
  -0.15, 0.15,
  -0.2, 0.1
];
g_shapesList.push(eye);

let eye1 = new Triangle();
eye1.color = [0.0, 0.0, 0.0, 1.0];
eye1.vertices = [
  -0.2, 0.1,
  -0.15, 0.15,
  -0.15, 0.1
];
g_shapesList.push(eye1);

let eye2 = new Triangle();
eye2.color = [0.0, 0.0, 0.0, 1.0];
eye2.vertices = [
  -0.3, 0.1,
  -0.2, 0.2,
  -0.2, 0.1
];
g_shapesList.push(eye2);

let eye3 = new Triangle();
eye3.color = [0.0, 0.0, 0.0, 1.0];
eye3.vertices = [
  -0.3, 0.2,
  -0.2, 0.2,
  -0.3, 0.1
];
g_shapesList.push(eye3);

let eye4 = new Triangle();
eye4.color = [0.0, 0.0, 0.0, 1.0];
eye4.vertices = [
  -0.35, 0.15,
  -0.3, 0.2,
  -0.3, 0.1
];
g_shapesList.push(eye4);

let whitel = new Triangle();
whitel.color = [0.0, 0.0, 0.0, 0.0];
whitel.vertices = [
  -0.285, 0.185,
  -0.25, 0.185,
  -0.25, 0.15
];
g_shapesList.push(whitel);

//right eye ----------------------------------------------------------------------------------------------------------------
let eyer = new Triangle();
eyer.color = [0.0, 0.0, 0.0, 1.0];
eyer.vertices = [
  0.2, 0.2,
  0.15, 0.15,
  0.2, 0.1
];
g_shapesList.push(eyer);

let eye1r = new Triangle();
eye1r.color = [0.0, 0.0, 0.0, 1.0];
eye1r.vertices = [
  0.2, 0.1,
  0.15, 0.15,
  0.15, 0.1
];
g_shapesList.push(eye1r);

let eye2r = new Triangle();
eye2r.color = [0.0, 0.0, 0.0, 1.0];
eye2r.vertices = [
  0.3, 0.1,
  0.2, 0.2,
  0.2, 0.1
];
g_shapesList.push(eye2r);

let eye3r = new Triangle();
eye3r.color = [0.0, 0.0, 0.0, 1.0];
eye3r.vertices = [
  0.3, 0.2,
  0.2, 0.2,
  0.3, 0.1
];
g_shapesList.push(eye3r);

let eye4r = new Triangle();
eye4r.color = [0.0, 0.0, 0.0, 1.0];
eye4r.vertices = [
  0.35, 0.15,
  0.3, 0.2,
  0.3, 0.1
];
g_shapesList.push(eye4r);

let whitelr = new Triangle();
whitelr.color = [0.0, 0.0, 0.0, 0.0];
whitelr.vertices = [
  0.2, 0.185,
  0.235, 0.185,
  0.235, 0.15
];
g_shapesList.push(whitelr);

//nose------------------------------------------------------------------------------
let nose = new Triangle();
nose.color = [0.5, 0.25, 0.25, 1.0];
nose.vertices = [
  -0.1, 0.0,
  0.1, 0.0,
  0.0, -0.075
];
g_shapesList.push(nose);

//mouth left -------------------------------------------------------------------------
let mouth = new Triangle();
mouth.color = [0.4, 0.15, 0.15, 1.0];
mouth.vertices = [
  -0.05, -0.125,
  0.0, -0.075,
  0.0, -0.1
];
g_shapesList.push(mouth);

let mouth2 = new Triangle();
mouth2.color = [0.4, 0.15, 0.15, 1.0];
mouth2.vertices = [
  -0.05, -0.125,
  0.0, -0.1,
  -0.05, -0.15
];
g_shapesList.push(mouth2);

let mouth3 = new Triangle();
mouth3.color = [0.4, 0.15, 0.15, 1.0];
mouth3.vertices = [
  -0.1, -0.125,
  -0.05, -0.125,
  -0.05, -0.15
];
g_shapesList.push(mouth3);

let mouth4 = new Triangle();
mouth4.color = [0.4, 0.15, 0.15, 1.0];
mouth4.vertices = [
  -0.1, -0.125,
  -0.05, -0.15,
  -0.1, -0.15
];
g_shapesList.push(mouth4);

let mouth5 = new Triangle();
mouth5.color = [0.4, 0.15, 0.15, 1.0];
mouth5.vertices = [
  -0.15, -0.075,
  -0.1, -0.125,
  -0.1, -0.15
];
g_shapesList.push(mouth5);

//mouth right -------------------------------------------------------------------------
let mouthr = new Triangle();
mouthr.color = [0.4, 0.15, 0.15, 1.0];
mouthr.vertices = [
  0.05, -0.125,
  0.0, -0.075,
  0.0, -0.1
];
g_shapesList.push(mouthr);

let mouth2r = new Triangle();
mouth2r.color = [0.4, 0.15, 0.15, 1.0];
mouth2r.vertices = [
  0.05, -0.125,
  0.0, -0.1,
  0.05, -0.15
];
g_shapesList.push(mouth2r);

let mouth3r = new Triangle();
mouth3r.color = [0.4, 0.15, 0.15, 1.0];
mouth3r.vertices = [
  0.1, -0.125,
  0.05, -0.125,
  0.05, -0.15
];
g_shapesList.push(mouth3r);

let mouth4r = new Triangle();
mouth4r.color = [0.4, 0.15, 0.15, 1.0];
mouth4r.vertices = [
  0.1, -0.125,
  0.05, -0.15,
  0.1, -0.15
];
g_shapesList.push(mouth4r);

let mouth5r = new Triangle();
mouth5r.color = [0.4, 0.15, 0.15, 1.0];
mouth5r.vertices = [
  0.15, -0.075,
  0.1, -0.125,
  0.1, -0.15
];
g_shapesList.push(mouth5r);

//whisker (INITIAL) : J --------------------------------
let whiskj = new Triangle();
whiskj.color = [0.0, 0.0, 0.0, 0.6];
whiskj.vertices = [
  -0.4, 0.1,
  -0.275, 0.0,
  -0.4, 0.075
];
g_shapesList.push(whiskj);

let whiskj2 = new Triangle();
whiskj2.color = [0.0, 0.0, 0.0, 0.6];
whiskj2.vertices = [
  -0.4, 0.075,
  -0.275, 0.0,
  -0.275, -0.025
];
g_shapesList.push(whiskj2);

let whiskj3 = new Triangle();
whiskj3.color = [0.0, 0.0, 0.0, 0.6];
whiskj3.vertices = [
  -0.325, 0.020,
  -0.3, 0.020,
  -0.3, -0.125
];
g_shapesList.push(whiskj3);

let whiskj4 = new Triangle();
whiskj4.color = [0.0, 0.0, 0.0, 0.6];
whiskj4.vertices = [
  -0.325, 0.020,
  -0.3, -0.125,
  -0.325, -0.125
];
g_shapesList.push(whiskj4);

let whiskj5 = new Triangle();
whiskj5.color = [0.0, 0.0, 0.0, 0.6];
whiskj5.vertices = [
  -0.4, -0.175,
  -0.3, -0.1,
  -0.3, -0.125
];
g_shapesList.push(whiskj5);

let whiskj6 = new Triangle();
whiskj6.color = [0.0, 0.0, 0.0, 0.6];
whiskj6.vertices = [
  -0.4, -0.175,
  -0.3, -0.125,
  -0.4, -0.2
];
g_shapesList.push(whiskj6);

let whiskj7 = new Triangle();
whiskj7.color = [0.0, 0.0, 0.0, 0.6];
whiskj7.vertices = [
  -0.45, -0.125,
  -0.4, -0.175,
  -0.4, -0.2
];
g_shapesList.push(whiskj7);

//whisker right initial K
let whiskr = new Triangle();
whiskr.color = [0.0, 0.0, 0.0, 0.6];
whiskr.vertices = [
  0.3, 0.05,
  0.325, -0.175,
  0.3, -0.175
];
g_shapesList.push(whiskr);

let whiskr2 = new Triangle();
whiskr2.color = [0.0, 0.0, 0.0, 0.6];
whiskr2.vertices = [
  0.3, 0.05,
  0.325, 0.05,
  0.325, -0.175
];
g_shapesList.push(whiskr2);

let whiskr3 = new Triangle();
whiskr3.color = [0.0, 0.0, 0.0, 0.6];
whiskr3.vertices = [
  0.325, -0.02,
  0.4, 0.05,
  0.325, -0.05
];
g_shapesList.push(whiskr3);

let whiskr4 = new Triangle();
whiskr4.color = [0.0, 0.0, 0.0, 0.6];
whiskr4.vertices = [
  0.4, 0.05,
  0.4, 0.025,
  0.325, -0.05
];
g_shapesList.push(whiskr4);

let whiskr5 = new Triangle();
whiskr5.color = [0.0, 0.0, 0.0, 0.6];
whiskr5.vertices = [
  0.325, -0.05,
  0.45, -0.2,
  0.325, -0.085
];
g_shapesList.push(whiskr5);

  renderAllShapes();
}


