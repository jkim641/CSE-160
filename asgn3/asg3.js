//shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_UV;\n' +
  'varying vec2 v_UV;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjectionMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_UV = a_UV;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + 
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'uniform sampler2D u_Sampler2;\n' +
  'uniform sampler2D u_Sampler3;\n' +
  'uniform sampler2D u_Sampler4;\n' +
  'uniform sampler2D u_Sampler5;\n' +
  'uniform sampler2D u_Sampler6;\n' +
  'uniform sampler2D u_Sampler7;\n' +
  'uniform sampler2D u_Sampler8;\n' +
  'uniform sampler2D u_Sampler9;\n' +
  'uniform int u_whichTexture;\n' +
  'varying vec2 v_UV;\n' +
  'void main() {\n' +
  '  if (u_whichTexture == -2) {\n' +
  '    gl_FragColor = u_FragColor;\n' +
  '  }\n' +

  '  else if (u_whichTexture == -1) {\n' +
  '    gl_FragColor = vec4(v_UV, 1.0, 1.0);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 0) {\n' +
  '    gl_FragColor = texture2D(u_Sampler0, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 1) {\n' +
  '    gl_FragColor = texture2D(u_Sampler1, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 2) {\n' +
  '    gl_FragColor = texture2D(u_Sampler2, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 3) {\n' +
  '    gl_FragColor = texture2D(u_Sampler3, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 4) {\n' +
  '    gl_FragColor = texture2D(u_Sampler4, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 5) {\n' +
  '    gl_FragColor = texture2D(u_Sampler5, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 6) {\n' +
  '    gl_FragColor = texture2D(u_Sampler6, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 7) {\n' +
  '    gl_FragColor = texture2D(u_Sampler7, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 8) {\n' +
  '    gl_FragColor = texture2D(u_Sampler8, v_UV);\n' +
  '  }\n' +

  '  else if (u_whichTexture == 9) {\n' +
  '    gl_FragColor = texture2D(u_Sampler9, v_UV);\n' +
  '  }\n' +


  '  else {\n' +
  '    gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);\n' +
  '  }\n' +
  '}\n';

//global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let a_UV

//floor
let u_Sampler0
//candy block
let u_Sampler1;
//steel
let u_Sampler2;
//wall
let u_Sampler3;
//sky
let u_Sampler4;
let g_winAudio = null;

//extra
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;
let u_Sampler8;
let u_Sampler9;
let g_selectedBlock = 5;
let g_typeMap = Array.from(
    {length:32},
    () => Array.from({length:32}, () => [])
);
let g_originalTypeMap = Array.from({length:32}, () => Array(32).fill(0));

let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
var u_ProjectionMatrix;
var u_ViewMatrix;

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0;
let g_lastFrameTime = performance.now();

//camera
let g_camera;

let g_keys = {};
let g_walls = [];

//perf
let g_vertexBuffer = null;
let g_uvBuffer = null;

//asg 2
let g_globalAngle = 0;
let g_globalAngleV = 0;

//rotate
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

//main
function main() 
{
  //set up
  setupWebGL();

  //GLSL shaders
  connectVariablesToGLSL();

  //camera
  g_camera = new Camera();

  document.onkeydown = keydown;

  //actions for HTML UI elements
  addActionsForHtmlUI();

  //clear canvas
  gl.clearColor(0.53, 0.81, 0.92, 1.0);

  initTextures(gl, 0);

  buildMap();

  //clear
  //gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);

}


//Part 3(Organize and Debug): set up WebGLPart
function setupWebGL()
{
  //canvas
  canvas = document.getElementById('asmt3-world');

  //webGL context
  if (!canvas) {
    console.log('Failed to get canvas!');
    return;
  }

  //Part 8: rendering context
  gl = canvas.getContext("webgl");
  if (!gl)
  {
    console.log('Error on getting rendering context!');
    return;
  }

  //depth test
  gl.enable(gl.DEPTH_TEST);

  g_vertexBuffer = gl.createBuffer();

  g_uvBuffer = gl.createBuffer();
}

//Connect variables to GLSL
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

  //model matrix -asg2
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

  if (!u_ModelMatrix) 
  {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  //rotate matrix - ags2
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');

  if (!u_GlobalRotateMatrix) 
  {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  //UV - ags  3
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');

  if (a_UV < 0)
  {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
 
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

  if (!u_Sampler1) {
    console.log('Failed to get u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');

  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');

  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');

  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');

  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
    return;
  }

  u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');

  if (!u_Sampler6) {
    console.log('Failed to get the storage location of u_Sampler6');
    return;
  }

  u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');

  if (!u_Sampler7) {
    console.log('Failed to get the storage location of u_Sampler7');
    return;
  }

  u_Sampler8 = gl.getUniformLocation(gl.program, 'u_Sampler8');

  if (!u_Sampler8) {
    console.log('Failed to get the storage location of u_Sampler8');
    return;
  }

  u_Sampler9 = gl.getUniformLocation(gl.program, 'u_Sampler9');

  if (!u_Sampler9) {
    console.log('Failed to get the storage location of u_Sampler9');
    return;
  }


  //texture or color
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');

  if (!u_whichTexture)
  {
    console.log('Failed to get u_whichTexture');
    return;
  }
  
  //projection matrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  
  if (!u_ProjectionMatrix) 
  {
    console.log('Failed to get u_ProjectionMatrix');
    return;
  }

  //view matrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  
  if (!u_ViewMatrix) 
  {
    console.log('Failed to get u_ViewMatrix');
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

//map for wall
var g_map = [
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  [5,4,4,4,4,4,4,4,4,4,4,3,3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,4,3,3,3,3,3,3,3,3,3,3,2,2,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,5],
  [5,4,3,2,2,2,2,2,2,2,2,2,2,1,1,0,0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,5],
  [5,3,3,2,2,2,2,2,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,5],
  [5,2,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,5],
  [5,2,2,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,5],
  [5,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,5],
  [5,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,5],
  [5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,5],
  [5,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,5],
  [5,0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,2,1,1,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,3,3,3,3,2,2,1,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3,3,3,3,2,2,1,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3,3,3,2,2,1,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,3,2,1,1,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,2,1,0,0,0,0,5],
  [5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,1,0,0,0,0,5],
  [5,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,5],
  [5,2,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,5],
  [5,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,5],
  [5,3,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,5],
  [5,3,3,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,4,3,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,4,3,3,3,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,4,4,4,4,3,2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
];

let g_originalMap = JSON.parse(JSON.stringify(g_map));

function buildMap() {
    g_walls = [];
    for (let x = 0; x < g_map.length; x++) {
        for (let z = 0; z < g_map[x].length; z++) {
            let height = g_map[x][z];
            for (let y = 0; y < height; y++) {
                let wall = new Cube();

                if (x == 0 || x == g_map.length-1 || z == 0 || z == g_map[x].length-1) {
                    wall.textureNum = 3;
                } else if (x >= 6 && x <= 13 && z >= 17 && z <= 24) {
                    // steel
                    let t = g_typeMap[x][z][y];
                    wall.textureNum = t ? t : 2;
                } else {
                    let t = g_typeMap[x][z][y];
                    wall.textureNum = t ? t : 1;
                }

                wall.matrix.translate(x - 16, y - 0.75, z - 16);
                g_walls.push(wall);
            }
        }
    }
}

function getBlockInFront()
{
    let dir = new Vector3();

    dir.set(g_camera.at);

    dir.sub(g_camera.eye);

    dir.normalize();

    let x = Math.floor(g_camera.eye.elements[0] + dir.elements[0] * 2 + 16);

    let z = Math.floor(g_camera.eye.elements[2] + dir.elements[2] * 2 + 16);

    return [x, z];
}

function addBlock() {

    let pos = getBlockInFront();

    let x = pos[0];
    let z = pos[1];

    if (x < 0 || x >= 32 || z < 0 || z >= 32) return;

    let y = g_map[x][z];

    g_typeMap[x][z][y] = g_selectedBlock;

    g_map[x][z]++;

    buildMap();

    checkRecipe();

    g_keys[70] = false;
}

function removeBlock() {
    let pos = getBlockInFront();
    let x = pos[0];
    let z = pos[1];

    if (x < 0 || x >= 32 || z < 0 || z >= 32) return;
    if (x == 0 || x == 31 || z == 0 || z == 31) return;

    if (g_map[x][z] > 0) {

      let topY = g_map[x][z] - 1;

      g_typeMap[x][z][topY] = undefined;

      g_map[x][z]--;
    }

    buildMap();
    g_keys[71] = false;
}

function resetWorld() {
    if (g_winAudio) {
        g_winAudio.pause();
        g_winAudio.currentTime = 0;
        g_winAudio = null;
    }
    g_map = JSON.parse(JSON.stringify(g_originalMap));
    g_typeMap = Array.from({length:32}, () => Array.from({length:32}, () => []));
    buildMap();
    document.getElementById('win-message').style.display = 'none';
}

function drawMap() {
  for (let i = 0; i < g_walls.length; i++) {
    g_walls[i].render();
  }
}

//asg2 renderscene -------------------------------------------------------------------------------------------------------------------------
function renderScene()
{
  // pass projecton matrix asg3
  var projMat = g_camera.projMat;
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
  //pass view matrix asg 3
  var viewMat = g_camera.viewMat;
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  //pass matrix asg 2
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_globalAngleV, 1, 0, 0).translate(0, -0.2, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //var len = g_shapesList.length;

  //for(var i = 0; i < len; i++) 
  //{
    //g_shapesList[i].render();
  //}

  //draw 3d triangle ---------


  //draw a cube
  //var body = new Cube()
  //body.color = [1.0,0.0,0.0,1.0];
  //body.matrix.translate(0.25, -0.75, 0.0);
  //body.matrix.rotate(-5, 1, 0, 0);
  //body.matrix.scale(0.5, 0.3, 0.5);
  //body.render();

  var body = new Cube();
  body.textureNum = 0;
  body.matrix.translate(0, -0.75, 0.0);
  body.matrix.scale(32, 0.01, 32);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  var body = new Cube();
  body.textureNum = 4;
  body.matrix.translate(0, -0.75, 0.0);
  body.matrix.scale(100, 100, 100);
  body.matrix.translate(-0.5, -0.5, -0.5);
  body.render();

  var signPost = new Cube();
  signPost.textureNum = -2;
  signPost.color = [0.45, 0.28, 0.12, 1.0];

  signPost.matrix.translate(-3.16, -0.75, 0.5);
  signPost.matrix.scale(0.15, 1.5, 0.15);
  signPost.render();

  // sign board
  var signBoard = new Cube();
  signBoard.textureNum = 9;
  signBoard.color = [0.60, 0.40, 0.20, 1.0];

  signBoard.matrix.translate(-3.56, 0.1, 0.4);
  signBoard.matrix.scale(1.0, 1.0, 0.1);
  signBoard.render();

  drawMap();

}
//----------------------------------------------------------------------------------------------------------------------------------------

//HTML UI (Part 4, Part 5)
function addActionsForHtmlUI()
{

  document.getElementById('resetWorld').onclick = function()
  {
    resetWorld();
  };

  addMouseControl();

}

function addMouseControl() {

  canvas.addEventListener('mousedown', function(ev) {
    g_isDragging = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  });

  canvas.addEventListener('mousemove', function(ev) {

    if (!g_isDragging) return;

    let dx = ev.clientX - g_lastMouseX;
    let dy = ev.clientY - g_lastMouseY;

    g_camera.panMouse(-dx * 0.5);
    g_camera.panMouseVertical(-dy * 0.5); 

    g_lastMouseX = ev.clientX;

    g_lastMouseY = ev.clientY;

  });

  canvas.addEventListener('mouseup', function() {
    g_isDragging = false;
  });

  canvas.addEventListener('mouseleave', function() {
    g_isDragging = false;
  });
}

//asg 3 - init texture
function initTextures() {

    let image0 = new Image();
    let image1 = new Image();
    let image2 = new Image();
    let image3 = new Image();
    let image4 = new Image();
    let image5 = new Image();
    let image6 = new Image();
    let image7 = new Image();
    let image8 = new Image();
    let image9 = new Image();

    image0.onload = function() {
        sendTextureToGLSL(image0, 0);
    };

    image1.onload = function() {
        sendTextureToGLSL(image1, 1);
    };

    image2.onload = function() {
        sendTextureToGLSL(image2, 2);
    };

    image3.onload = function() {
        sendTextureToGLSL(image3, 3);
    };

    image4.onload = function() {
        sendTextureToGLSL(image4, 4);
    };

    image5.onload = function() {
        sendTextureToGLSL(image5, 5);
    };

    image6.onload = function() {
        sendTextureToGLSL(image6, 6);
    };

    image7.onload = function() {
        sendTextureToGLSL(image7, 7);
    };

    image8.onload = function() {
        sendTextureToGLSL(image8, 8);
    };

    image9.onload = function() {
        sendTextureToGLSL(image9, 9);
    };

    image0.src = 'icecreamfloor.jpg';

    image1.src = 'candyblock.jpg';
    
    image2.src = 'steel.jpg';

    image3.src = 'wall.jpg';

    image4.src = 'candysky.jpg';

    image5.src = 'bread.jpg';
    image6.src = 'cream.jpg';
    image7.src = 'straw1.jpg';
    image8.src = 'straw2.jpg';
    image9.src = 'cakerecipe.jpg';
}

//load texture
function sendTextureToGLSL(image, textureUnit)
{
    let texture = gl.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    if (textureUnit == 0)
    {
        gl.activeTexture(gl.TEXTURE0);
    }
    else if (textureUnit == 1)
    {
        gl.activeTexture(gl.TEXTURE1);
    }
    else if (textureUnit == 2)
    {
        gl.activeTexture(gl.TEXTURE2);
    }
    else if (textureUnit == 3)
    {
        gl.activeTexture(gl.TEXTURE3);
    }
    else if (textureUnit == 4)
    {
        gl.activeTexture(gl.TEXTURE4);
    }
    else if (textureUnit == 5)
    {
        gl.activeTexture(gl.TEXTURE5);
    }
    else if (textureUnit == 6)
    {
        gl.activeTexture(gl.TEXTURE6);
    }
    else if (textureUnit == 7)
    {
        gl.activeTexture(gl.TEXTURE7);
    }
    else if (textureUnit == 8)
    {
        gl.activeTexture(gl.TEXTURE8);
    }
    else 
    {
        gl.activeTexture(gl.TEXTURE9);
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl.LINEAR
    );

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        image
    );

    gl.generateMipmap(gl.TEXTURE_2D);

    if (textureUnit == 0)
    {
        gl.uniform1i(u_Sampler0, 0);
    }
    else if (textureUnit == 1)
    {
        gl.uniform1i(u_Sampler1, 1);
    }
    else if (textureUnit == 2)
    {
        gl.uniform1i(u_Sampler2, 2);
    }
    else if (textureUnit == 3)
    {
        gl.uniform1i(u_Sampler3, 3);
    }
    else if (textureUnit == 4)
    {
        gl.uniform1i(u_Sampler4, 4);
    }
    else if (textureUnit == 5)
    {
        gl.uniform1i(u_Sampler5, 5);
    }
    else if (textureUnit == 6)
    {
        gl.uniform1i(u_Sampler6, 6);
    }
    else if (textureUnit == 7)
    {
        gl.uniform1i(u_Sampler7, 7);
    }
    else if (textureUnit == 8)
    {
        gl.uniform1i(u_Sampler8, 8);
    }
    else
    {
        gl.uniform1i(u_Sampler9, 9);
    }
}

//move camera
function keydown(ev) {
  g_keys[ev.keyCode] = true;
}

document.onkeyup = function(ev) {
  g_keys[ev.keyCode] = false;
}

function tick()
{
    g_seconds = performance.now()/1000.0 - g_startTime;

    let now = performance.now();
    let elapsed = now - g_lastFrameTime;
    g_lastFrameTime = now;
    let fps = Math.round(1000 / elapsed);
    document.getElementById('fps-counter').textContent = 'FPS: ' + fps;

    // handle keys every frame - no more delay
    if (g_keys[87]) { g_camera.moveForward(); }    // W
    if (g_keys[83]) { g_camera.moveBackwards(); }  // S
    if (g_keys[65]) { g_camera.moveLeft(); }       // A
    if (g_keys[68]) { g_camera.moveRight(); }      // D
    if (g_keys[81]) { g_camera.panLeft(); }        // Q
    if (g_keys[69]) { g_camera.panRight(); }       // E
    if (g_keys[70]) { addBlock(); }     // F
    if (g_keys[71]) { removeBlock(); }  // G

    if (g_keys[49]) { g_selectedBlock = 5; updateBlockSelector(); } // 1
    if (g_keys[50]) { g_selectedBlock = 6; updateBlockSelector(); } // 2
    if (g_keys[51]) { g_selectedBlock = 7; updateBlockSelector(); } // 3
    if (g_keys[52]) { g_selectedBlock = 1; updateBlockSelector(); } // 4

    function updateBlockSelector() {
      const names = {
        1: 'Chocolate Brick',
        5: 'Cake Bread',
        6: 'White Icing',
        7: 'Strawberry'
      };
      document.getElementById('block-selector').textContent = 'Selected: ' + names[g_selectedBlock];
    }

    renderScene();
    requestAnimationFrame(tick);
}

//add on - recipe game
let g_recipeStep = 0;

function checkRecipe() {

    let breadCount = 0;
    let icingCount = 0;
    let strawberryCount = 0;

    for (let x = 6; x <= 13; x++) {

        for (let z = 17; z <= 24; z++) {

            for (let y = 0; y < g_typeMap[x][z].length; y++) {

                let t = g_typeMap[x][z][y];

                if (t == 5) breadCount++;

                if (t == 6) icingCount++;

                if (t == 7) strawberryCount++;
            }
        }
    }

    console.log("Bread:", breadCount);
    console.log("Icing:", icingCount);
    console.log("Strawberry:", strawberryCount);

    if (
        breadCount >= 9 &&
        icingCount >= 9 &&
        strawberryCount >= 4
    ) {
        winGame();
    }
}

function winGame() {
    g_winAudio = new Audio('happy.mp3');
    g_winAudio.play();
    document.getElementById('win-message').style.display = 'block';
}