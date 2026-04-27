//shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
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
//asg 2
let g_globalAngle = 0;
let g_globalAngleV = 0;

//triple joint leg
let g_upperLegRAngle = 0;
let g_lowerLegRAngle = 0;
let g_feetRAngle = 0;
//left
let g_upperLegLAngle = 0;
let g_lowerLegLAngle = 0;
let g_feetLAngle = 0;

// RIGHT ARM
let g_upperArmRAngle = 0;
let g_lowerArmRAngle = 0;
let g_handRAngle = 0;

// LEFT ARM
let g_upperArmLAngle = 0;
let g_lowerArmLAngle = 0;
let g_handLAngle = 0;

//animation
let g_yellowAnimation = false;
let g_headAngle = 0;
let g_earTwitch = 0;
let g_lastTwitchTime = 0;

let g_sleepState   = 'idle';
let g_sleepStart   = 0;   
let g_bodyTilt     = 0;    
let g_bodyTiltY    = 0;    
let g_logHeight = -0.3;

//rotate animal
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

  //actions for HTML UI elements
  addActionsForHtmlUI();




  //clear canvas
  gl.clearColor(0.53, 0.81, 0.92, 1.0);

  //clear
  //gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);

}


//Part 3(Organize and Debug): set up WebGLPart
function setupWebGL()
{
  //canvas
  canvas = document.getElementById('asmt2-animal');

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

  //depth test
  gl.enable(gl.DEPTH_TEST);
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

//asg2 renderscene -------------------------------------------------------------------------------------------------------------------------
function renderScene()
{
  //pass matrix asg 2
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_globalAngleV, 1, 0, 0).translate(0, -0.2, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

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

  //Colors --------------------------------------------------------
  const gray       = [0.55, 0.55, 0.55, 1.0];  
  const slightgray = [0.57, 0.57, 0.57, 1.0];
  const lightGray  = [0.80, 0.80, 0.80, 1.0];  
  const lighterGray= [0.90, 0.90, 0.90, 1.0]; 
  const darkGray   = [0.30, 0.30, 0.30, 1.0];  
  const darkerGray = [0.20, 0.20, 0.20, 1.0]; 
  const white      = [1.00, 1.00, 1.00, 1.0];  
  const black      = [0.05, 0.05, 0.05, 1.0];  
  const pink       = [0.95, 0.60, 0.70, 1.0];  
  const darkBrown  = [0.20, 0.12, 0.05, 1.0];  

  // head -----------------------------------
  var headMat = new Matrix4();
  headMat.translate(0, 0.5, 0);
  headMat.rotate(g_headAngle, 0, 1, 0);
  headMat.translate(0, -0.5, 0);

  var head = new Cube();
  head.color = gray;
  head.matrix = new Matrix4(headMat);
  head.matrix.translate(-0.2, 0.3, -0.2);
  head.matrix.scale(0.4, 0.4, 0.4);
  head.render();

  var top = new Cube();
  top.color = gray;
  top.matrix = new Matrix4(headMat);
  top.matrix.translate(-0.10, 0.75, -0.15);
  top.matrix.scale(0.2, 0.025, 0.3);
  top.render();

  var tophead = new Cube();
  tophead.color = gray;
  tophead.matrix = new Matrix4(headMat);
  tophead.matrix.translate(-0.15, 0.7, -0.2);
  tophead.matrix.scale(0.3, 0.05, 0.4);
  tophead.render();

  var bottomhead = new Cube();
  bottomhead.color = gray;
  bottomhead.matrix = new Matrix4(headMat);
  bottomhead.matrix.translate(-0.15, 0.28, -0.2);
  bottomhead.matrix.scale(0.3, 0.025, 0.4);
  bottomhead.render();

  var righthead = new Cube();
  righthead.color = gray;
  righthead.matrix = new Matrix4(headMat);
  righthead.matrix.translate(-0.25, 0.36, -0.15);
  righthead.matrix.scale(0.05, 0.27, 0.3);
  righthead.render();

  var lefthead = new Cube();
  lefthead.color = gray;
  lefthead.matrix = new Matrix4(headMat);
  lefthead.matrix.translate(0.2, 0.36, -0.15);
  lefthead.matrix.scale(0.05, 0.27, 0.3);
  lefthead.render();

  var face = new Cube();
  face.color = gray;
  face.matrix = new Matrix4(headMat);
  face.matrix.translate(-0.15, 0.3, -0.25);
  face.matrix.scale(0.3, 0.4, 0.05);
  face.render();

  var face2 = new Cube();
  face2.color = gray;
  face2.matrix = new Matrix4(headMat);
  face2.matrix.translate(-0.175, 0.35, -0.25);
  face2.matrix.scale(0.35, 0.3, 0.05);
  face2.render();

  var back = new Cube();
  back.color = gray;
  back.matrix = new Matrix4(headMat);
  back.matrix.translate(-0.15, 0.3, 0.2);
  back.matrix.scale(0.3, 0.4, 0.05);
  back.render();

  var back2 = new Cube();
  back2.color = gray;
  back2.matrix = new Matrix4(headMat);
  back2.matrix.translate(-0.175, 0.35, 0.2);
  back2.matrix.scale(0.35, 0.3, 0.05);
  back2.render();

  var face3 = new Cube();
  face3.color = slightgray;
  face3.matrix = new Matrix4(headMat);
  face3.matrix.translate(-0.15, 0.5, -0.275);
  face3.matrix.scale(0.3, 0.12, 0.025);
  face3.render();

  var nose = new Cube();
  nose.color = darkerGray;
  nose.matrix = new Matrix4(headMat);
  nose.matrix.translate(-0.05, 0.375, -0.32);
  nose.matrix.scale(0.1, 0.15, 0.1);
  nose.render();

  let eyeScaleY = 1.0;
  if (g_sleepState === 'sleeping') {
    eyeScaleY = 0.1;
  } else if (g_sleepState === 'falling' || g_sleepState === 'waking') {
    let t = easeInOut(clamp01((g_seconds - g_sleepStart) / 0.7));
    eyeScaleY = (g_sleepState === 'falling') ? (1 - t * 0.9) : (0.1 + t * 0.9);
  }

  // eyes
  // Left Eye
  var eye = new Cube();
  eye.color = black;
  eye.matrix = new Matrix4(headMat);
  eye.matrix.translate(-0.14, 0.45, -0.26);
  eye.matrix.scale(0.05, 0.05 * eyeScaleY, 0.05);
  eye.render();

  // Only draw white highlight if eyes are open
  if (eyeScaleY > 0.5) {
    var eyew = new Cube();
    eyew.color = white;
    eyew.matrix = new Matrix4(headMat);
    eyew.matrix.translate(-0.13, 0.472, -0.27);
    eyew.matrix.scale(0.015, 0.015, 0.05);
    eyew.render();
  }

  // Right Eye
  var eye2 = new Cube();
  eye2.color = black;
  eye2.matrix = new Matrix4(headMat);
  eye2.matrix.translate(0.09, 0.45, -0.26);
  eye2.matrix.scale(0.05, 0.05 * eyeScaleY, 0.05); 
  eye2.render();

  if (eyeScaleY > 0.5) {
    var eye2w = new Cube();
    eye2w.color = white;
    eye2w.matrix = new Matrix4(headMat);
    eye2w.matrix.translate(0.10, 0.472, -0.27);
    eye2w.matrix.scale(0.015, 0.015, 0.05);
    eye2w.render();
  }

  var face4 = new Cube();
  face4.color = slightgray;
  face4.matrix = new Matrix4(headMat);
  face4.matrix.translate(-0.15, 0.325, -0.275);
  face4.matrix.scale(0.3, 0.12, 0.025);
  face4.render();

  var mouth = new Cube();
  mouth.color = pink;
  mouth.matrix = new Matrix4(headMat);
  mouth.matrix.translate(-0.05, 0.35, -0.28);
  mouth.matrix.scale(0.1, 0.025, 0.05);
  mouth.render();

  var mouthbottom = new Cube();
  mouthbottom.color = lightGray;
  mouthbottom.matrix = new Matrix4(headMat);
  mouthbottom.matrix.translate(-0.05, 0.265, -0.215);
  mouthbottom.matrix.rotate(-45, 1, 0, 0);
  mouthbottom.matrix.scale(0.1, 0.1, 0.07);
  mouthbottom.render();

  //right ear
  var rightear = new Cube();
  rightear.color = gray;
  rightear.matrix = new Matrix4(headMat);
  rightear.matrix.translate(0.07, 0.64, -0.025);
  rightear.matrix.rotate(-45, 0, 0, 1);
  rightear.matrix.scale(0.05, 0.25, 0.1);
  rightear.render();

  var rightear2 = new Cube();
  rightear2.color = gray;
  rightear2.matrix = new Matrix4(headMat);
  rightear2.matrix.translate(0.225, 0.73, -0.025);
  rightear2.matrix.scale(0.15, 0.05, 0.1);
  rightear2.render();

  var rightear3 = new Cube();
  rightear3.color = gray;
  rightear3.matrix = new Matrix4(headMat);
  rightear3.matrix.translate(0.325, 0.73, -0.025);
  rightear3.matrix.rotate(-60, 0, 0, 1);
  rightear3.matrix.scale(0.13, 0.05, 0.1);
  rightear3.render();

  var earinr = new Cube();
  earinr.color = pink;
  earinr.matrix = new Matrix4(headMat);
  earinr.matrix.translate(0.20, 0.52, 0.01);
  earinr.matrix.scale(0.15, 0.25, 0.05);
  earinr.render();

  var earinr2 = new Cube();
  earinr2.color = pink;
  earinr2.matrix = new Matrix4(headMat);
  earinr2.matrix.translate(0.345, 0.55, 0.01);
  earinr2.matrix.scale(0.05, 0.15, 0.05);
  earinr2.render();

  var earinr3 = new Cube();
  earinr3.color = white;
  earinr3.matrix = new Matrix4(headMat);
  earinr3.matrix.translate(0.20, 0.52, -0.01);
  earinr3.matrix.scale(0.08, 0.17, 0.06);
  earinr3.render();

  var earinr4 = new Cube();
  earinr4.color = white;
  earinr4.matrix = new Matrix4(headMat);
  earinr4.matrix.translate(0.26, 0.52, -0.01);
  earinr4.matrix.scale(0.08, 0.13, 0.06);
  earinr4.render();

  var earinr5 = new Cube();
  earinr5.color = white;
  earinr5.matrix = new Matrix4(headMat);
  earinr5.matrix.translate(0.26, 0.52, -0.01);
  earinr5.matrix.scale(0.1, 0.09, 0.06);
  earinr5.render();

  var earinr6 = new Cube();
  earinr6.color = white;
  earinr6.matrix = new Matrix4(headMat);
  earinr6.matrix.translate(0.26, 0.55, -0.01);
  earinr6.matrix.scale(0.12, 0.03, 0.06);
  earinr6.render();

  var rightear4 = new Cube();
  rightear4.color = gray;
  rightear4.matrix = new Matrix4(headMat);
  rightear4.matrix.translate(0.2, 0.52, 0.04);
  rightear4.matrix.scale(0.17, 0.23, 0.05);
  rightear4.render();

  var rightear5 = new Cube();
  rightear5.color = gray;
  rightear5.matrix = new Matrix4(headMat);
  rightear5.matrix.translate(0.2, 0.52, 0.04);
  rightear5.matrix.scale(0.21, 0.13, 0.05);
  rightear5.render();

  var rightear6 = new Cube();
  rightear6.color = gray;
  rightear6.matrix = new Matrix4(headMat);
  rightear6.matrix.translate(0.225, 0.47, 0);
  rightear6.matrix.scale(0.15, 0.05, 0.1);
  rightear6.render();

  // left ear
  var leftear = new Cube();
  leftear.color = gray;
  leftear.matrix = new Matrix4(headMat); 
  leftear.matrix.translate(-0.07, 0.64, -0.025); 
  leftear.matrix.rotate(45, 0, 0, 1);           
  leftear.matrix.scale(-0.05, 0.25, 0.1);       
  leftear.render();

  var leftear2 = new Cube();
  leftear2.color = gray;
  leftear2.matrix = new Matrix4(headMat); 
  leftear2.matrix.translate(-0.225, 0.73, -0.025);
  leftear2.matrix.scale(-0.15, 0.05, 0.1);
  leftear2.render();

  var leftear3 = new Cube();
  leftear3.color = gray;
  leftear3.matrix = new Matrix4(headMat);
  leftear3.matrix.translate(-0.325, 0.73, -0.025);
  leftear3.matrix.rotate(60, 0, 0, 1);          
  leftear3.matrix.scale(-0.13, 0.05, 0.1);
  leftear3.render();

  var earinl = new Cube();
  earinl.color = pink;
  earinl.matrix = new Matrix4(headMat);
  earinl.matrix.translate(-0.20, 0.52, 0.01);
  earinl.matrix.scale(-0.15, 0.25, 0.05);
  earinl.render();

  var earinl2 = new Cube();
  earinl2.color = pink;
  earinl2.matrix = new Matrix4(headMat); 
  earinl2.matrix.translate(-0.345, 0.55, 0.01);
  earinl2.matrix.scale(-0.05, 0.15, 0.05);
  earinl2.render();

  var earinl3 = new Cube();
  earinl3.color = white;
  earinl3.matrix = new Matrix4(headMat); 
  earinl3.matrix.translate(-0.20, 0.52, -0.01);
  earinl3.matrix.scale(-0.08, 0.17, 0.06);
  earinl3.render();

  var earinl4 = new Cube();
  earinl4.color = white;
  earinl4.matrix = new Matrix4(headMat); 
  earinl4.matrix.translate(-0.26, 0.52, -0.01);
  earinl4.matrix.scale(-0.08, 0.13, 0.06);
  earinl4.render();

  var earinl5 = new Cube();
  earinl5.color = white;
  earinl5.matrix = new Matrix4(headMat); 
  earinl5.matrix.translate(-0.26, 0.52, -0.01);
  earinl5.matrix.scale(-0.1, 0.09, 0.06);
  earinl5.render();

  var earinl6 = new Cube();
  earinl6.color = white;
  earinl6.matrix = new Matrix4(headMat); 
  earinl6.matrix.translate(-0.26, 0.55, -0.01);
  earinl6.matrix.scale(-0.12, 0.03, 0.06);
  earinl6.render();

  var leftear4 = new Cube();
  leftear4.color = gray;
  leftear4.matrix = new Matrix4(headMat); 
  leftear4.matrix.translate(-0.2, 0.52, 0.04);
  leftear4.matrix.scale(-0.17, 0.23, 0.05);
  leftear4.render();

  var leftear5 = new Cube();
  leftear5.color = gray;
  leftear5.matrix = new Matrix4(headMat); 
  leftear5.matrix.translate(-0.2, 0.52, 0.04);
  leftear5.matrix.scale(-0.21, 0.13, 0.05);
  leftear5.render();

  var leftear6 = new Cube();
  leftear6.color = gray;
  leftear6.matrix = new Matrix4(headMat); 
  leftear6.matrix.translate(-0.225, 0.47, 0);
  leftear6.matrix.scale(-0.15, 0.05, 0.1);
  leftear6.render();


  // body
  var body = new Cube();
  body.color = gray;
  body.matrix.translate(-0.16, -0.03, -0.1);
  body.matrix.scale(0.32, 0.3, 0.4);
  body.render();

  var body2 = new Cube();
  body2.color = gray;
  body2.matrix.translate(-0.155, 0.23, -0.2);
  body2.matrix.scale(0.31, 0.1, 0.47);
  body2.render();

  var body3 = new Cube();
  body3.color = gray;
  body3.matrix.translate(-0.2, -0.05, -0.13);
  body3.matrix.scale(0.4, 0.3, 0.5);
  body3.render();

  var body4 = new Cube();
  body4.color = gray;
  body4.matrix.translate(-0.225, -0.2, -0.07);
  body4.matrix.scale(0.45, 0.4, 0.55);
  body4.render();

  var body5 = new Cube();
  body5.color = gray;
  body5.matrix.translate(-0.2, -0.25, 0);
  body5.matrix.scale(0.4, 0.4, 0.55);
  body5.render();

  //belly
  var belly = new Cube();
  belly.color = lighterGray;
  belly.matrix.translate(-0.11, 0.223, -0.21);
  belly.matrix.scale(0.22, 0.08, 0.01);
  belly.render();

  var belly2 = new Cube();
  belly2.color = lighterGray;
  belly2.matrix.translate(-0.11, 0.227, -0.21);
  belly2.matrix.rotate(90, 1, 0, 0); 
  belly2.matrix.scale(0.22, 0.08, 0.01);
  belly2.render();

  //belly
  var belly3 = new Cube();
  belly3.color = lighterGray;
  belly3.matrix.translate(-0.125, -0.08, -0.16);
  belly3.matrix.scale(0.25, 0.3, 0.1);
  belly3.render();

  //belly
  var belly4 = new Cube();
  belly4.color = lighterGray;
  belly4.matrix.translate(-0.15, -0.22, -0.09);
  belly4.matrix.scale(0.3, 0.18, 0.1);
  belly4.render();

  var belly5 = new Cube();
  belly5.color = lighterGray;
  belly5.matrix.translate(-0.170, -0.27, -0.02);
  belly5.matrix.scale(0.35, 0.06, 0.3);
  belly5.render();

  //right leg
  var upperlegr = new Cube();
  upperlegr.color = slightgray;
  upperlegr.matrix.translate(0.2, -0.28, 0.23);
  upperlegr.matrix.translate(0.06, 0.18, 0.16);
  upperlegr.matrix.rotate(g_upperLegRAngle, 1, 0, 0);
  upperlegr.matrix.rotate(-10, 1, 0, 0);
  upperlegr.matrix.translate(-0.06, -0.18, -0.16);
  var upperLegRMat = new Matrix4(upperlegr.matrix);
  upperlegr.matrix.scale(0.12, 0.36, 0.32);
  upperlegr.render();

  var lowerlegr = new Cube();
  lowerlegr.color = slightgray;
  lowerlegr.matrix = upperLegRMat;                   
  lowerlegr.matrix.translate(0, 0.08, -0.18);
  lowerlegr.matrix.translate(0, 0.28, 0.16);        
  lowerlegr.matrix.rotate(g_lowerLegRAngle, 1, 0, 0); 
  lowerlegr.matrix.rotate(20, 1, 0, 0);                
  lowerlegr.matrix.translate(0, -0.28, -0.05);
  var lowerLegRMat = new Matrix4(lowerlegr.matrix);
  lowerlegr.matrix.scale(0.12, 0.28, 0.16);
  lowerlegr.render();

  var feetr = new Cube();
  feetr.color = slightgray;
  feetr.matrix = lowerLegRMat;                       
  feetr.matrix.translate(0, -0.07, -0.06);    
  feetr.matrix.translate(0, 0.1, 0.19);       
  feetr.matrix.rotate(g_feetRAngle, 1, 0, 0);  
  feetr.matrix.translate(0, -0.1, -0.19);       
  feetr.matrix.scale(0.13, 0.1, 0.19);
  feetr.render();

  //right arm
  var upperarmr = new Cube();
  upperarmr.color = slightgray;
  upperarmr.matrix.translate(0.15, 0.03, -0.03);
  upperarmr.matrix.translate(0.05, 0.16, 0.14);
  upperarmr.matrix.rotate(g_upperArmRAngle, 1, 0, 0);
  upperarmr.matrix.rotate(-25, 1, 0, 0);
  upperarmr.matrix.translate(-0.05, -0.08, -0.2);
  var upperArmRMat = new Matrix4(upperarmr.matrix);
  upperarmr.matrix.scale(0.1, 0.16, 0.28);
  upperarmr.render();


  var lowerarmr = new Cube();
  lowerarmr.color = slightgray;
  lowerarmr.matrix = upperArmRMat;
  lowerarmr.matrix.translate(0, 0.02, -0.22);
  lowerarmr.matrix.translate(0, 0.14, 0.2);
  lowerarmr.matrix.rotate(g_lowerArmRAngle, 1, 0, 0);
  lowerarmr.matrix.rotate(10, 0, 1, 0);
  lowerarmr.matrix.translate(0, -0.14, -0.1);
  var lowerArmRMat = new Matrix4(lowerarmr.matrix);
  lowerarmr.matrix.scale(0.1, 0.14, 0.2);
  lowerarmr.render();


  var handr = new Cube();
  handr.color = slightgray;
  handr.matrix = lowerArmRMat;
  handr.matrix.translate(0, -0.02, -0.05);
  handr.matrix.translate(0, 0.14, 0.07);
  handr.matrix.rotate(g_handRAngle, 1, 0, 0);
  handr.matrix.translate(0, -0.14, -0.07);
  var handRMat = new Matrix4(handr.matrix);
  handr.matrix.scale(0.1, 0.14, 0.07);
  handr.render();


  //left leg
  var upperlegl = new Cube();
  upperlegl.color = slightgray;
  upperlegl.matrix.translate(-0.32, -0.28, 0.23);
  upperlegl.matrix.translate(0.06, 0.18, 0.16);
  upperlegl.matrix.rotate(g_upperLegLAngle, 1, 0, 0);
  upperlegl.matrix.rotate(-10, 1, 0, 0);
  upperlegl.matrix.translate(-0.06, -0.18, -0.16);
  var upperLegLMat = new Matrix4(upperlegl.matrix);
  upperlegl.matrix.scale(0.12, 0.36, 0.32);
  upperlegl.render();

  var lowerlegl = new Cube();
  lowerlegl.color = slightgray;
  lowerlegl.matrix = upperLegLMat;
  lowerlegl.matrix.translate(0, 0.08, -0.18);
  lowerlegl.matrix.translate(0, 0.28, 0.16);
  lowerlegl.matrix.rotate(g_lowerLegLAngle, 1, 0, 0);
  lowerlegl.matrix.rotate(20, 1, 0, 0);
  lowerlegl.matrix.translate(0, -0.28, -0.05);
  var lowerLegLMat = new Matrix4(lowerlegl.matrix);
  lowerlegl.matrix.scale(0.12, 0.28, 0.16);
  lowerlegl.render();

  var feetl = new Cube();
  feetl.color = slightgray;
  feetl.matrix = lowerLegLMat;
  feetl.matrix.translate(-0.01, -0.07, -0.06);
  feetl.matrix.translate(0, 0.1, 0.19);
  feetl.matrix.rotate(g_feetLAngle, 1, 0, 0);  
  feetl.matrix.translate(0, -0.1, -0.19);    
  feetl.matrix.scale(0.13, 0.1, 0.19);
  feetl.render();

  //left arm
  var upperarml = new Cube();
  upperarml.color = slightgray;
  upperarml.matrix.translate(-0.25, 0.03, -0.03);
  upperarml.matrix.translate(0.05, 0.16, 0.14);
  upperarml.matrix.rotate(g_upperArmLAngle, 1, 0, 0);
  upperarml.matrix.rotate(-25, 1, 0, 0);
  upperarml.matrix.translate(-0.05, -0.08, -0.2);
  var upperArmLMat = new Matrix4(upperarml.matrix);
  upperarml.matrix.scale(0.1, 0.16, 0.28);
  upperarml.render();


  var lowerarml = new Cube();
  lowerarml.color = slightgray;
  lowerarml.matrix = upperArmLMat;
  lowerarml.matrix.translate(0, 0.02, -0.22);
  lowerarml.matrix.translate(0, 0.14, 0.2);
  lowerarml.matrix.rotate(g_lowerArmLAngle, 1, 0, 0);
  lowerarml.matrix.rotate(-10, 0, 1, 0);
  lowerarml.matrix.translate(0, -0.14, -0.1);
  var lowerArmLMat = new Matrix4(lowerarml.matrix);
  lowerarml.matrix.scale(0.1, 0.14, 0.2);
  lowerarml.render();


  var handl = new Cube();
  handl.color = slightgray;
  handl.matrix = lowerArmLMat;
  handl.matrix.translate(0, -0.02, -0.05);
  handl.matrix.translate(0, 0.14, 0.07);
  handl.matrix.rotate(g_handLAngle, 1, 0, 0);
  handl.matrix.translate(0, -0.14, -0.07);
  var handLMat = new Matrix4(handl.matrix);
  handl.matrix.scale(0.1, 0.14, 0.07);
  handl.render();

  //green grass platform----------------------------------------------------------------------------------------------
  var platform = new Cylinder(40);
  platform.color = [0.25, 0.75, 0.25, 1.0];
  platform.matrix.translate(0, -0.6, 0);      
  platform.matrix.scale(1.8, 0.54, 1.8);       
  platform.render();

  // grass
  const darkGreen  = [0.10, 0.45, 0.08, 1.0];
  const midGreen   = [0.18, 0.58, 0.12, 1.0];
  const lightGreen = [0.28, 0.72, 0.15, 1.0];

  var g1 = new Pyramid();
  g1.color = midGreen;
  g1.matrix.translate(-0.55, -0.33, 0.35);
  g1.matrix.rotate(10, 0, 1, 0);
  g1.matrix.scale(0.08, 0.22, 0.06);
  g1.render();

  var g2 = new Pyramid();
  g2.color = darkGreen;
  g2.matrix.translate(-0.45, -0.33, 0.45);
  g2.matrix.rotate(-15, 0, 1, 0);
  g2.matrix.scale(0.07, 0.18, 0.06);
  g2.render();

  var g3 = new Pyramid();
  g3.color = lightGreen;
  g3.matrix.translate(-0.62, -0.33, 0.25);
  g3.matrix.rotate(5, 0, 1, 0);
  g3.matrix.scale(0.06, 0.26, 0.05);
  g3.render();

  var g4 = new Pyramid();
  g4.color = midGreen;
  g4.matrix.translate(-0.50, -0.33, 0.55);
  g4.matrix.rotate(-8, 0, 1, 0);
  g4.matrix.scale(0.07, 0.20, 0.05);
  g4.render();

  var g5 = new Pyramid();
  g5.color = lightGreen;
  g5.matrix.translate(0.45, -0.33, -0.40);
  g5.matrix.rotate(12, 0, 1, 0);
  g5.matrix.scale(0.08, 0.20, 0.06);
  g5.render();

  var g6 = new Pyramid();
  g6.color = darkGreen;
  g6.matrix.translate(0.55, -0.33, -0.30);
  g6.matrix.rotate(-10, 0, 1, 0);
  g6.matrix.scale(0.07, 0.24, 0.05);
  g6.render();

  var g7 = new Pyramid();
  g7.color = midGreen;
  g7.matrix.translate(0.38, -0.33, -0.50);
  g7.matrix.rotate(20, 0, 1, 0);
  g7.matrix.scale(0.06, 0.18, 0.05);
  g7.render();

  if (g_sleepState !== 'idle') {
    //main log body
    var log = new Cylinder(20);
    log.color = [0.38, 0.22, 0.08, 1.0]; // warm wood brown
    log.matrix.translate(0, g_logHeight, -0.3);
    log.matrix.rotate(0, 0, 0, 1);
    log.matrix.scale(0.30, 0.645, 0.30);  // taller (0.55 vs 0.25)
    log.render();

    //top part of the log
    var logTop = new Cylinder(20);
    logTop.color = [0.58, 0.38, 0.18, 1.0]; // lighter cut-wood face
    logTop.matrix.translate(0, g_logHeight + 0.27, -0.3);
    logTop.matrix.rotate(0, 0, 0, 1);
    logTop.matrix.scale(0.25, 0.12, 0.25);
    logTop.render();

  }

  drawZzzParticles();

}
//----------------------------------------------------------------------------------------------------------------------------------------

//HTML UI (Part 4, Part 5)
function addActionsForHtmlUI()
{

  //asg 2 angle slider
  document.getElementById('slideAng').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene();});
  document.getElementById('slideAngV').addEventListener('mousemove', function() { g_globalAngleV = this.value; renderScene(); });

  //asg 2 on and off
  document.getElementById('yellowAniOn').onclick = function() { g_yellowAnimation = true; };
  document.getElementById('yellowAniOff').onclick = function() { g_yellowAnimation = false; };

  //reset camera angle
  document.getElementById('resetCamera').onclick = function() 
  {
    g_globalAngle = 23;
    g_globalAngleV = -5;
    
    document.getElementById('slideAng').value = 23;
    document.getElementById('slideAngV').value = -5;
    renderScene();
  };

  document.getElementById('frontCamera').onclick = function() 
  {
    g_globalAngle = 0;
    g_globalAngleV = 0;
    
    document.getElementById('slideAng').value = 0;
    document.getElementById('slideAngV').value = 0;
    renderScene();
  };

  document.getElementById('backCamera').onclick = function() 
  {
    g_globalAngle = 180;
    g_globalAngleV = 0;
    
    document.getElementById('slideAng').value = 180;
    document.getElementById('slideAngV').value = 0;
    renderScene();
  };

  document.getElementById('rightCamera').onclick = function() 
  {
    g_globalAngle = 90;
    g_globalAngleV = 0;
    
    document.getElementById('slideAng').value = 90;
    document.getElementById('slideAngV').value = 0;
    renderScene();
  };

  document.getElementById('leftCamera').onclick = function() 
  {
    g_globalAngle = -90;
    g_globalAngleV = 0;
    
    document.getElementById('slideAng').value = -90;
    document.getElementById('slideAngV').value = 0;
    renderScene();
  };

  addMouseControl();

  document.getElementById('slideUpperLegR').addEventListener('mousemove', function() { g_upperLegRAngle = this.value; renderScene(); });
  document.getElementById('slideLowerLegR').addEventListener('mousemove', function() { g_lowerLegRAngle = this.value; renderScene(); });
  document.getElementById('slideFeetR').addEventListener('mousemove',     function() { g_feetRAngle     = this.value; renderScene(); });
  document.getElementById('slideUpperLegL').addEventListener('mousemove', function() { g_upperLegLAngle = this.value; renderScene(); });
  document.getElementById('slideLowerLegL').addEventListener('mousemove', function() { g_lowerLegLAngle = this.value; renderScene(); });
  document.getElementById('slideFeetL').addEventListener('mousemove',     function() { g_feetLAngle     = this.value; renderScene(); });

  // RIGHT ARM
  document.getElementById('slideUpperArmR').addEventListener('mousemove', function() {
    g_upperArmRAngle = this.value;
  });
  document.getElementById('slideLowerArmR').addEventListener('mousemove', function() {
    g_lowerArmRAngle = this.value;
  });
  document.getElementById('slideHandR').addEventListener('mousemove', function() {
    g_handRAngle = this.value;
  });

  // LEFT ARM
  document.getElementById('slideUpperArmL').addEventListener('mousemove', function() {
    g_upperArmLAngle = this.value;
  });
  document.getElementById('slideLowerArmL').addEventListener('mousemove', function() {
    g_lowerArmLAngle = this.value;
  });
  document.getElementById('slideHandL').addEventListener('mousemove', function() {
    g_handLAngle = this.value;
  });


}

//animation 
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
var g_lastFrameTime = performance.now();


//tick
function tick()
{
  g_seconds = performance.now()/1000.0-g_startTime;

  // FPS counter
  let now = performance.now();
  let elapsed = now - g_lastFrameTime;
  g_lastFrameTime = now;
  let fps = Math.round(1000 / elapsed);
  document.getElementById('fps-counter').textContent = 'FPS: ' + fps;

  updateAnimationAngles();
  updateSleepAnimation();

  renderScene();
  requestAnimationFrame(tick);
}

//animaton on and off
function updateAnimationAngles()
{
  if (g_yellowAnimation) {
    // head swishes left and right slowly
    g_headAngle = 18 * Math.sin(g_seconds * 1.0);

    let timeSinceTwitch = g_seconds - g_lastTwitchTime;
    if (timeSinceTwitch > 3.0) {
      g_lastTwitchTime = g_seconds;
    }
    if (timeSinceTwitch < 0.15) {
      g_earTwitch = 25 * Math.sin(timeSinceTwitch * Math.PI / 0.15);
    } else {
      g_earTwitch = 0;
    }

    const wave = g_seconds * 2.0;
    const phaseShift = 0.6; 

    g_upperArmRAngle =  30 * Math.sin(wave);
    g_lowerArmRAngle =  25 * Math.sin(wave - phaseShift);
    g_handRAngle     =  45 * Math.sin(wave - phaseShift * 2);

    g_upperArmLAngle = -30 * Math.sin(wave);
    g_lowerArmLAngle = -25 * Math.sin(wave - phaseShift);
    g_handLAngle     = -45 * Math.sin(wave - phaseShift * 2);

    const legWave = g_seconds * 3.0;
    g_upperLegRAngle =  15 * Math.sin(legWave);
    g_lowerLegRAngle =  10 * Math.sin(legWave - 0.5);
    g_feetRAngle     =   8 * Math.sin(legWave - 1.0);

    g_upperLegLAngle = -15 * Math.sin(legWave);
    g_lowerLegLAngle = -10 * Math.sin(legWave - 0.5);
    g_feetLAngle     =  -8 * Math.sin(legWave - 1.0);

  } else {
  }
}

//rotate animal
function addMouseControl() {
  canvas.addEventListener('mousedown', function(ev) {
    if (ev.shiftKey) {
      if (g_sleepState === 'idle') {
        g_sleepState = 'falling';
        g_sleepStart = g_seconds;
        g_yellowAnimation = false;
      }
    } else {
      g_isDragging = true;
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
    }
  });

  canvas.addEventListener('mousemove', function(ev) {
    if (!g_isDragging) return;
    let dx = ev.clientX - g_lastMouseX;
    let dy = ev.clientY - g_lastMouseY;
    g_globalAngle  -= dx * 0.5;  
    g_globalAngleV -= dy * 0.5;  
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;

    document.getElementById('slideAng').value  = g_globalAngle;
    document.getElementById('slideAngV').value = g_globalAngleV;
  });

  canvas.addEventListener('mouseup',    function() { g_isDragging = false; });
  canvas.addEventListener('mouseleave', function() { g_isDragging = false; });
}

//poke animation
function easeInOut(t) { return t * t * (3 - 2 * t); }
function clamp01(t)   { return Math.max(0, Math.min(1, t)); }

function updateSleepAnimation() {
  if (g_sleepState === 'idle') return;

  let elapsed = g_seconds - g_sleepStart;

  if (g_sleepState === 'falling') {
    let t = easeInOut(clamp01(elapsed / 0.7));

    // body tilt
    g_bodyTilt  = -90 * t;
    g_bodyTiltY =  20 * t;

    //log
    g_logHeight = -0.75 + 0.75 * t;
    if (g_logHeight > 0.1) g_logHeight = 0.1;

    //leg
    g_upperLegRAngle =  30 * t;
    g_upperLegLAngle =  30 * t;
    g_lowerLegRAngle = -20 * t;
    g_lowerLegLAngle = -20 * t;

    //arm
    g_upperArmRAngle = 20;
    g_upperArmLAngle = 20;

    g_lowerArmRAngle = 40;
    g_lowerArmLAngle = 40;

    g_handRAngle = 20;
    g_handLAngle = 20;

    g_headAngle = 0;

    if (elapsed > 0.7) {
      g_sleepState = 'sleeping';
      g_sleepStart = g_seconds;
    }

  } else if (g_sleepState === 'sleeping') {
    g_bodyTilt  = -90;
    g_bodyTiltY =  20;

    const wave = Math.sin(g_seconds * 2.5);

    g_upperArmRAngle = 20 + 3 * wave;
    g_upperArmLAngle = 20 + 3 * wave;

    g_lowerArmRAngle = 40 + 2 * wave;
    g_lowerArmLAngle = 40 + 2 * wave;

    g_handRAngle = 20 + 1 * wave;
    g_handLAngle = 20 + 1 * wave;

    if (elapsed > 4.0) {
      g_sleepState = 'waking';
      g_sleepStart = g_seconds;
    }

  } else if (g_sleepState === 'waking') {
    let t = easeInOut(clamp01(elapsed / 0.7));

   
    g_bodyTilt  = -90 * (1 - t);
    g_bodyTiltY =  20 * (1 - t);

    
    g_upperLegRAngle =  30 * (1 - t);
    g_upperLegLAngle =  30 * (1 - t);
    g_lowerLegRAngle = -20 * (1 - t);
    g_lowerLegLAngle = -20 * (1 - t);

   
    g_upperArmRAngle = 20 * (1 - t);
    g_upperArmLAngle = 20 * (1 - t);

    g_lowerArmRAngle = 40 * (1 - t);
    g_lowerArmLAngle = 40 * (1 - t);

    g_handRAngle = 20 * (1 - t);
    g_handLAngle = 20 * (1 - t);

    
    g_logHeight = 0.1 * (1 - t) - 0.55 * t;

    if (elapsed > 0.7) {
      g_sleepState  = 'idle';
      g_bodyTilt    = 0;
      g_bodyTiltY   = 0;

      g_upperLegRAngle = g_upperLegLAngle = 0;
      g_lowerLegRAngle = g_lowerLegLAngle = 0;

      g_upperArmRAngle = g_upperArmLAngle = 0;
      g_lowerArmRAngle = g_lowerArmLAngle = 0;
      g_handRAngle     = g_handLAngle     = 0;

      g_logHeight = -0.65;
    }
  }
}

//sleeping ZZZ
function drawZzzParticles() {
  if (g_sleepState !== 'sleeping') return;

  let elapsed = g_seconds - g_sleepStart;
  const blue = [0.3, 0.55, 1.0, 1.0];

  
  const zDefs = [
    { delay: 0.0,  xOff:  0.15, xSide: -0.05 },
    { delay: 1.3,  xOff:  0.28, xSide:  0.0  },
    { delay: 2.6,  xOff:  0.18, xSide: -0.08 },
  ];

  for (let i = 0; i < zDefs.length; i++) {
    let z = zDefs[i];
    let t = ((elapsed - z.delay) % 4.0) / 3.5;
    if (t < 0) continue;
    t = clamp01(t);

   
    let yBase =  0.85 + t * 0.55;  
    let xBase = -0.05 + z.xOff + t * z.xSide;
    let zBase = -0.15;

    let scale  = 0.04 + 0.03 * (1 - t);   
    let alpha  = t < 0.7 ? 1.0 : 1.0 - (t - 0.7) / 0.3; 
    let zColor = [0.3, 0.55, 1.0, alpha];

    let zt = new Cube();
    zt.color = zColor;
    zt.matrix.translate(xBase, yBase + scale * 2, zBase);
    zt.matrix.scale(scale * 3, scale * 0.6, scale * 0.4);
    zt.render();

    let zm = new Cube();
    zm.color = zColor;
    zm.matrix.translate(xBase + scale * 0.2, yBase + scale * 0.8, zBase);
    zm.matrix.rotate(-45, 0, 0, 1);
    zm.matrix.scale(scale * 0.6, scale * 2.2, scale * 0.4);
    zm.render();

    let zb = new Cube();
    zb.color = zColor;
    zb.matrix.translate(xBase, yBase, zBase);
    zb.matrix.scale(scale * 3, scale * 0.6, scale * 0.4);
    zb.render();
  }
}





