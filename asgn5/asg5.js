import * as THREE from 'three';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
RectAreaLightUniformsLib.init();


const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);

outlinePass.edgeStrength = 5;
outlinePass.edgeGlow = 0.5;
outlinePass.edgeThickness = 2;
outlinePass.visibleEdgeColor.set(0x70D0FF);
outlinePass.hiddenEdgeColor.set(0x70D0FF);

composer.addPass(outlinePass);

const outputPass = new OutputPass(); // fixes the darkness
composer.addPass(outputPass);

//sky box-------------------------------------------------------------------------------------
const skyTextureLoader = new THREE.CubeTextureLoader();

const skybox = skyTextureLoader.load([
    'textures/skybox/skyright.jpg',   // +X
    'textures/skybox/skyleft.jpg',    // -X
    'textures/skybox/skytop.jpg',     // +Y
    'textures/skybox/skybottom.jpg',  // -Y
    'textures/skybox/skyfront.jpg',   // +Z
    'textures/skybox/skyback.jpg',    // -Z
]);

scene.background = skybox;

// camera --------------------------------------------------------------

let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

let yaw = 0;
let pitch = 0;

const sensitivity = 0.009; 
document.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

document.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;

    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    yaw   -= dx * sensitivity;
    pitch -= dy * sensitivity;

    pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));

    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
});

document.addEventListener('wheel', (e) => {
    const zoomSpeed = 20;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    camera.position.addScaledVector(direction, -e.deltaY * zoomSpeed * 0.01);
});

const keys = {};

document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup',   (e) => { keys[e.code] = false; });

document.addEventListener('click', (e) => {
    if (isMouseDown) return;

    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const strawMeshes = [];
    const chocoMeshes = [];

    if (strawberryObject) strawberryObject.traverse((c) => { if (c.isMesh) strawMeshes.push(c); });
    if (chocolateObject)  chocolateObject.traverse((c)  => { if (c.isMesh) chocoMeshes.push(c); });

    const strawHit = raycaster.intersectObjects(strawMeshes);
    const chocoHit = raycaster.intersectObjects(chocoMeshes);

    if (strawHit.length > 0) {
        scoop1.visible = true;
        scoop2.visible = false;
        console.log('strawberry clicked - showing scoop1');
    }

    if (chocoHit.length > 0) {
        scoop2.visible = true;
        scoop1.visible = false;
        console.log('chocolate clicked - showing scoop2');
    }
});

document.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (isMouseDown) mouseMoved = true;

        yaw   -= dx * sensitivity;
        pitch -= dy * sensitivity;
        pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));
        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
        return;
    }

    const hoverMouse = new THREE.Vector2(
        (e.clientX / window.innerWidth)  * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(hoverMouse, camera);

    const strawMeshes = [];
    const chocoMeshes = [];

    if (strawberryObject) strawberryObject.traverse((c) => { if (c.isMesh) strawMeshes.push(c); });
    if (chocolateObject)  chocolateObject.traverse((c)  => { if (c.isMesh) chocoMeshes.push(c); });

    const allMeshes = [...strawMeshes, ...chocoMeshes];
    const hits = raycaster.intersectObjects(allMeshes);

    if (hits.length > 0) {
        let hitObject = hits[0].object;
        while (hitObject.parent && hitObject.parent !== scene) {
            hitObject = hitObject.parent;
        }
        outlinePass.selectedObjects = [hitObject];
        document.body.style.cursor = 'pointer';
    } else {
        outlinePass.selectedObjects = [];
        document.body.style.cursor = 'default';
    }
});


const textureLoader = new THREE.TextureLoader();

//ground box-------------------------------------------------------------------------------------
const sandTexture = textureLoader.load('textures/sand.jpg');

sandTexture.wrapS = THREE.RepeatWrapping;
sandTexture.wrapT = THREE.RepeatWrapping;

sandTexture.repeat.set(10, 10);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshPhongMaterial({
        map: sandTexture
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;

scene.add(ground);

//road box-------------------------------------------------------------------------------------

const roadTexture = textureLoader.load('textures/brick.jpg');

roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;

roadTexture.repeat.set(2, 10);

const roadMaterial = new THREE.MeshPhongMaterial({
    map: roadTexture
});

const road = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 200), 
    roadMaterial
);

road.rotation.x = -Math.PI / 2;

road.position.y = 0.01;
road.position.x = -50;
road.receiveShadow = true;

scene.add(road);

//building------------------------------------------------------------------------------------------
const building1Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xD1D1D1

    })
);

building1Cube.position.set(30, 0, 0);
building1Cube.scale.set(9, 0.5, 9);
building1Cube.castShadow = true;
building1Cube.receiveShadow = true;

scene.add(building1Cube);

//platform
const building2Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xC2C2C2

    })
);

building2Cube.position.set(30, 1, 0);
building2Cube.scale.set(8.5, 0.5, 8.5);
building2Cube.castShadow = true;
building2Cube.receiveShadow = true;

scene.add(building2Cube);

//building 1
const building3Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

building3Cube.position.set(30, 32, -38);
building3Cube.scale.set(8, 7, 0.5);
building3Cube.castShadow = true;

scene.add(building3Cube);

//building 2
const building4Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

building4Cube.position.set(67.7, 32, -0.5);
building4Cube.scale.set(0.5, 7, 8);
building4Cube.castShadow = true;

scene.add(building4Cube);

//building 3
const building5Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

building5Cube.position.set(45, 32, 19.5);
building5Cube.scale.set(0.5, 7, 4);
building5Cube.castShadow = true;

scene.add(building5Cube);

//building 4
const building6Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

building6Cube.position.set(2, 9, -3);
building6Cube.scale.set(0.8, 1.2, 7);
building6Cube.castShadow = true;

scene.add(building6Cube);

//building 5
const building7Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

building7Cube.position.set(23, 9, 28);
building7Cube.scale.set(4, 1.2, 0.8);
building7Cube.castShadow = true;
building7Cube.receiveShadow = true;

scene.add(building7Cube);

//building 6
const building8Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

building8Cube.position.set(2, 32, 29);
building8Cube.scale.set(0.2, 7, 0.2);
building8Cube.castShadow = true;

scene.add(building8Cube);

//building 7
const building9Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

building9Cube.position.set(2, 57, -6);
building9Cube.scale.set(0.2, 1.5, 6.8);
building9Cube.castShadow = true;
building9Cube.receiveShadow = true;


scene.add(building9Cube);

//building 8
const wall1 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

wall1.position.set(34, 57, 29);
wall1.scale.set(6.5, 1.5, 0.2);
wall1.castShadow = true;
wall1.receiveShadow = true;

scene.add(wall1);

//table-----------------------------------------------------------------------------------------
//table 1
const table1Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xA68D6C

    })
);

table1Cube.position.set(1.1, 15, -3);
table1Cube.scale.set(1, 0.1, 7);

scene.add(table1Cube);

//table 2
const table2Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xA68D6C

    })
);

table2Cube.position.set(21.1, 15, 28.5);
table2Cube.scale.set(5, 0.1, 1);

scene.add(table2Cube);

//roof -------------------------------------------------------------------------------------
const roof1Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xE3F0FF

    })
);

roof1Cube.position.set(30, 63, 0);
roof1Cube.scale.set(7.5, 1, 7.5);
roof1Cube.castShadow = true;
roof1Cube.receiveShadow = true;

scene.add(roof1Cube);

//roof 2
const roof2Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xA68D6C

    })
);

roof2Cube.position.set(-8, 68, -1.5);
roof2Cube.scale.set(0.5, 0.8, 8);
roof2Cube.castShadow = true;
roof2Cube.receiveShadow = true;

scene.add(roof2Cube);

//roof 3
const roof3Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xA68D6C

    })
);

roof3Cube.position.set(70, 68, -1.5);
roof3Cube.scale.set(0.5, 0.8, 8);
roof3Cube.castShadow = true;
roof3Cube.receiveShadow = true;

scene.add(roof3Cube);

//roof 4
const roof4Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xA68D6C

    })
);

roof4Cube.position.set(31, 68, 40);
roof4Cube.scale.set(8.3, 0.8, 0.5);
roof4Cube.castShadow = true;
roof4Cube.receiveShadow = true;

scene.add(roof4Cube);

//roof 5
const roof5Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xA68D6C

    })
);

roof5Cube.position.set(31, 68, -40);
roof5Cube.scale.set(8.3, 0.8, 0.5);
roof5Cube.castShadow = true;
roof5Cube.receiveShadow = true;

scene.add(roof5Cube);

//metal
const metalCube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x8F8F8F

    })
);

metalCube.position.set(35, 68, 0);
metalCube.scale.set(3, 0.3, 3);
metalCube.castShadow = true;
metalCube.receiveShadow = true;

scene.add(metalCube);

//metal2
const metal2Cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x8F8F8F

    })
);

metal2Cube.position.set(35, 75, 0);
metal2Cube.scale.set(0.5, 3, 0.5);
metal2Cube.castShadow = true;
metal2Cube.receiveShadow = true;

scene.add(metal2Cube);

//lamp
const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xFFFBDE

    })
);

lamp.position.set(30, 58, -4);
lamp.scale.set(2, 0.3, 3);
lamp.castShadow = true;
lamp.receiveShadow = true;

scene.add(lamp);

const roomLight = new THREE.PointLight(
    0xFFF5CC, 
    1000,     
    6000       
);

roomLight.position.set(10, 56, -4);

roomLight.castShadow = true;

roomLight.shadow.mapSize.width = 1024;
roomLight.shadow.mapSize.height = 1024;

scene.add(roomLight);

//awnning---------------------------------------------------------------------------------------
const awn1 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn1.position.set(-6.4, 55.5, -33);
awn1.scale.set(0.1, 1.5, 0.5);
awn1.rotation.z = -1.3;

scene.add(awn1);

//2
const awn2 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn2.position.set(-6.4, 55.5, -28);
awn2.scale.set(0.1, 1.5, 0.5);
awn2.rotation.z = -1.3;

scene.add(awn2);

//3
const awn3 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn3.position.set(-6.4, 55.5, -23);
awn3.scale.set(0.1, 1.5, 0.5);
awn3.rotation.z = -1.3;

scene.add(awn3);

//4
const awn4 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn4.position.set(-6.4, 55.5, -18);
awn4.scale.set(0.1, 1.5, 0.5);
awn4.rotation.z = -1.3;

scene.add(awn4);

//5
const awn5 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn5.position.set(-6.4, 55.5, -13);
awn5.scale.set(0.1, 1.5, 0.5);
awn5.rotation.z = -1.3;

scene.add(awn5);

//6
const awn6 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn6.position.set(-6.4, 55.5, -8);
awn6.scale.set(0.1, 1.5, 0.5);
awn6.rotation.z = -1.3;

scene.add(awn6);

//7
const awn7 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn7.position.set(-6.4, 55.5, -3);
awn7.scale.set(0.1, 1.5, 0.5);
awn7.rotation.z = -1.3;

scene.add(awn7);

//8
const awn8 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn8.position.set(-6.4, 55.5, 2);
awn8.scale.set(0.1, 1.5, 0.5);
awn8.rotation.z = -1.3;

scene.add(awn8);

//9
const awn9 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn9.position.set(-6.4, 55.5, 7);
awn9.scale.set(0.1, 1.5, 0.5);
awn9.rotation.z = -1.3;

scene.add(awn9);

//10
const awn10 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn10.position.set(-6.4, 55.5, 12);
awn10.scale.set(0.1, 1.5, 0.5);
awn10.rotation.z = -1.3;

scene.add(awn10);

//11
const awn11 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn11.position.set(-6.4, 55.5, 17);
awn11.scale.set(0.1, 1.5, 0.5);
awn11.rotation.z = -1.3;

scene.add(awn11);

//12
const awn12 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn12.position.set(-6.4, 55.5, 22);
awn12.scale.set(0.1, 1.5, 0.5);
awn12.rotation.z = -1.3;

scene.add(awn12);

//13
const awn13 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn13.position.set(-6.4, 55.5, 27);
awn13.scale.set(0.1, 1.5, 0.5);
awn13.rotation.z = -1.3;

scene.add(awn13);

//14
const awn14 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn14.position.set(4, 55.6, 37);
awn14.scale.set(0.5, 1.5, 0.1);
awn14.rotation.x = -1.3;


scene.add(awn14);

//15
const awn15 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn15.position.set(9, 55.6, 37);
awn15.scale.set(0.5, 1.5, 0.1);
awn15.rotation.x = -1.3;


scene.add(awn15);

//16
const awn16 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn16.position.set(14, 55.6, 37);
awn16.scale.set(0.5, 1.5, 0.1);
awn16.rotation.x = -1.3;


scene.add(awn16);

//17
const awn17 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn17.position.set(19, 55.6, 37);
awn17.scale.set(0.5, 1.5, 0.1);
awn17.rotation.x = -1.3;


scene.add(awn17);

//18
const awn18 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn18.position.set(24, 55.6, 37);
awn18.scale.set(0.5, 1.5, 0.1);
awn18.rotation.x = -1.3;

scene.add(awn18);

//19
const awn19 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn19.position.set(29, 55.6, 37);
awn19.scale.set(0.5, 1.5, 0.1);
awn19.rotation.x = -1.3;


scene.add(awn19);

//20
const awn20 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

awn20.position.set(34, 55.6, 37);
awn20.scale.set(0.5, 1.5, 0.1);
awn20.rotation.x = -1.3;

scene.add(awn20);

//21
const awn21 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

awn21.position.set(39, 55.6, 37);
awn21.scale.set(0.5, 1.5, 0.1);
awn21.rotation.x = -1.3;


scene.add(awn21);

//curtian ----------------------------------------------------
const curtain1 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain1.position.set(-13.3, 51.5, -33);
curtain1.scale.set(0.1, 0.5, 0.5);

scene.add(curtain1);

//curtain 2
const curtain2 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain2.position.set(-13.3, 51.5, -28);
curtain2.scale.set(0.1, 0.5, 0.5);

scene.add(curtain2);

//curtain3
const curtain3 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain3.position.set(-13.3, 51.5, -23);
curtain3.scale.set(0.1, 0.5, 0.5);

scene.add(curtain3);

//curtain 4
const curtain4 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain4.position.set(-13.3, 51.5, -18);
curtain4.scale.set(0.1, 0.5, 0.5);

scene.add(curtain4);

//curtain5
const curtain5 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain5.position.set(-13.3, 51.5, -13);
curtain5.scale.set(0.1, 0.5, 0.5);

scene.add(curtain5);

//curtain 6
const curtain6 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain6.position.set(-13.3, 51.5, -8);
curtain6.scale.set(0.1, 0.5, 0.5);

scene.add(curtain6);

//curtain7
const curtain7 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain7.position.set(-13.3, 51.5, -3);
curtain7.scale.set(0.1, 0.5, 0.5);

scene.add(curtain7);

//curtain 8
const curtain8 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain8.position.set(-13.3, 51.5, 2);
curtain8.scale.set(0.1, 0.5, 0.5);

scene.add(curtain8);

//curtain9
const curtain9 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain9.position.set(-13.3, 51.5, 7);
curtain9.scale.set(0.1, 0.5, 0.5);

scene.add(curtain9);

//curtain 10
const curtain10 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain10.position.set(-13.3, 51.5, 12);
curtain10.scale.set(0.1, 0.5, 0.5);

scene.add(curtain10);

//curtain11
const curtain11 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain11.position.set(-13.3, 51.5, 17);
curtain11.scale.set(0.1, 0.5, 0.5);

scene.add(curtain11);

//curtain 12
const curtain12 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain12.position.set(-13.3, 51.5, 22);
curtain12.scale.set(0.1, 0.5, 0.5);

scene.add(curtain12);

//curtain13
const curtain13 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain13.position.set(-13.3, 51.5, 27);
curtain13.scale.set(0.1, 0.5, 0.5);

scene.add(curtain13);

//curtain14
const curtain14 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain14.position.set(39, 51.6, 43.85);
curtain14.scale.set(0.5, 0.5, 0.1);


scene.add(curtain14);

//curtain15
const curtain15 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain15.position.set(34, 51.6, 43.85);
curtain15.scale.set(0.5, 0.5, 0.1);


scene.add(curtain15);

//curtain16
const curtain16 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain16.position.set(29, 51.6, 43.85);
curtain16.scale.set(0.5, 0.5, 0.1);

scene.add(curtain16);

//curtain17
const curtain17 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain17.position.set(24, 51.6, 43.85);
curtain17.scale.set(0.5, 0.5, 0.1);

scene.add(curtain17);

//curtain18
const curtain18 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain18.position.set(19, 51.6, 43.85);
curtain18.scale.set(0.5, 0.5, 0.1);

scene.add(curtain18);

//curtain19
const curtain19 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain19.position.set(14, 51.6, 43.85);
curtain19.scale.set(0.5, 0.5, 0.1);

scene.add(curtain19);

//curtain20
const curtain20 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

curtain20.position.set(9, 51.6, 43.85);
curtain20.scale.set(0.5, 0.5, 0.1);

scene.add(curtain20);

//curtain21
const curtain21 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x82D6FF

    })
);

curtain21.position.set(4, 51.6, 43.85);
curtain21.scale.set(0.5, 0.5, 0.1);

scene.add(curtain21);

//wood -----------------------------------------------------------------------
//wood1
const wood1 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x785D37

    })
);

wood1.position.set(-5.3, 52.8, 28.7);
wood1.scale.set(1.5, 0.1, 0.1);

scene.add(wood1);

//wood2
const wood2 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x785D37

    })
);

wood2.position.set(2.8, 52.8, 36);
wood2.scale.set(0.1, 0.1, 1.5);

scene.add(wood2);

//light1
const light1 = new THREE.Mesh(
    new THREE.CylinderGeometry(
        1.5,   
        1.5,   
        70, 
        32  
    ),
    new THREE.MeshPhongMaterial({
        color: 0x262626

    })
);

light1.position.set(-20, 30, -82);
light1.castShadow = true;

scene.add(light1);

//light2
const light2 = new THREE.Mesh(
    new THREE.CylinderGeometry(
        1.5,   
        1.5,   
        20, 
        32  
    ),
    new THREE.MeshPhongMaterial({
        color: 0x262626

    })
);

light2.position.set(-28.5, 65, -82);
light2.rotation.z = -Math.PI / 2
light2.castShadow = true;

scene.add(light2);

//light3
const light3 = new THREE.Mesh(
    new THREE.CylinderGeometry(
        3,   
        3,   
        2, 
        32  
    ),
    new THREE.MeshPhongMaterial({
        color: 0x262626

    })
);

light3.position.set(-40, 65, -82);
light3.castShadow = true;

scene.add(light3);

//light4
const light4 = new THREE.Mesh(
    new THREE.CylinderGeometry(
        2.6,   
        2.6,   
        2, 
        32  
    ),
    new THREE.MeshPhongMaterial({
        color: 0xFFFFFF

    })
);

light4.position.set(-40, 64, -82);
light4.castShadow = true;

scene.add(light4);

//spotlight
const lanternLight = new THREE.SpotLight(
    0xFFFBDE,
    20000
);

lanternLight.position.set(-40, 64, -82);

lanternLight.angle = Math.PI / 6;
lanternLight.penumbra = 0.1;
lanternLight.distance = 100;

lanternLight.target.position.set(-40, 0, -82);

scene.add(lanternLight);
scene.add(lanternLight.target);


//ice cream sign -----------------------------------------------------------
const sign1 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x70D0FF

    })
);

sign1.position.set(-4, 75, 8);
sign1.scale.set(0.2, 2, 3);
sign1.castShadow = true;
sign1.receiveShadow = true;

scene.add(sign1);

const sign2 = new THREE.Mesh(
    new THREE.CylinderGeometry(
        15,   
        15,   
        2, 
        32  
    ),
    new THREE.MeshPhongMaterial({
        color: 0x70D0FF

    })
);

sign2.position.set(-4, 85, 8);
sign2.rotation.z = -Math.PI / 2
sign2.castShadow = true;
sign2.receiveShadow = true;

scene.add(sign2);

//sign 2
const sign3 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0x70D0FF

    })
);

sign3.position.set(-4, 70, -13);
sign3.scale.set(0.2, 2, 3);
sign3.castShadow = true;
sign3.receiveShadow = true;

scene.add(sign3);

const sign4 = new THREE.Mesh(
    new THREE.CylinderGeometry(
        15,  
        15,   
        2,
        32 
    ),
    new THREE.MeshPhongMaterial({
        color: 0x70D0FF

    })
);

sign4.position.set(-4, 80, -13);
sign4.rotation.z = -Math.PI / 2
sign4.castShadow = true;
sign4.receiveShadow = true;

scene.add(sign4);

//jinho's creamery
const fontLoader = new FontLoader();

fontLoader.load('https://threejs.org/examples/fonts/optimer_bold.typeface.json', (font) => {

    const textGeometry = new TextGeometry("Jinho's", {
        font: font,
        size: 5,
        depth: 1,
    });

  
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;

    const textMesh = new THREE.Mesh(
        textGeometry,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );

   
    textMesh.position.set(-5, 84.5, -4.5);  
    textMesh.scale.set(1.2, 1.2, 1.2);
    textMesh.rotation.y = -Math.PI / 2; 
    textMesh.castShadow = true;

    scene.add(textMesh);
});

//jinho's creamery2
const font2Loader = new FontLoader();

font2Loader.load('https://threejs.org/examples/fonts/optimer_bold.typeface.json', (font) => {

    const textGeometry = new TextGeometry("Creamery!", {
        font: font,
        size: 5,
        depth: 1,
    });


    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;

    const textMesh = new THREE.Mesh(
        textGeometry,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );

   
    textMesh.position.set(-5, 75.5, -24);  
    textMesh.scale.set(1.4, 1.4, 1.4);
    textMesh.rotation.y = -Math.PI / 2;  
    textMesh.castShadow = true;

    scene.add(textMesh);
});

const signLight = new THREE.SpotLight(
    0xFFF5CC, 
    3000
);

signLight.position.set(-20, 74, 23); 

signLight.angle = Math.PI / 3;
signLight.penumbra = 0.8;
signLight.distance = 100;

signLight.castShadow = true;

signLight.shadow.mapSize.width = 2048;
signLight.shadow.mapSize.height = 2048;

scene.add(signLight);

signLight.target.position.set(
    -5,
    80,
    -15
);

scene.add(signLight.target);


//behind ---------------------------------------------------------------
const sign5 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

sign5.position.set(-2, 75, 8);
sign5.scale.set(0.2, 2, 3);
sign5.receiveShadow = true;

scene.add(sign5);

const sign6 = new THREE.Mesh(
    new THREE.CylinderGeometry(
        15,   
        15,  
        2,  
        32  
    ),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

sign6.position.set(-2, 85, 8);
sign6.rotation.z = -Math.PI / 2
sign6.receiveShadow = true;

scene.add(sign6);

//sign 2
const sign7 = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

sign7.position.set(-2, 70, -13);
sign7.scale.set(0.2, 2, 3);
sign7.receiveShadow = true;

scene.add(sign7);

const sign8 = new THREE.Mesh(
    new THREE.CylinderGeometry(
        15,   
        15,   
        2,  
        32   
    ),
    new THREE.MeshPhongMaterial({
        color: 0xF5FCFF

    })
);

sign8.position.set(-2, 80, -13);
sign8.rotation.z = -Math.PI / 2
sign8.receiveShadow = true;

scene.add(sign8);

//palm tree obj 2 - https://www.fab.com/listings/931dee67-df78-4bc7-8504-e552955cbb65
const palmLoader = new OBJLoader();
const texturepalmLoader = new THREE.TextureLoader();

const palmTexture = texturepalmLoader.load('textures/palm.png');

palmLoader.load('textures/palm.obj', (object) => {

    object.traverse((child) => {

        if (child.isMesh) {

            child.material = new THREE.MeshPhongMaterial({
                map: palmTexture,
                side: THREE.DoubleSide
            });

            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    object.position.set(60, 0, -80);
    object.scale.set(0.1, 0.1, 0.1);
    object.rotation.y = 0.5;

    scene.add(object);
});

//palm tree obj 3 - https://www.fab.com/listings/931dee67-df78-4bc7-8504-e552955cbb65
const palm2Loader = new OBJLoader();
const texturepalm2Loader = new THREE.TextureLoader();

const palm2Texture = texturepalm2Loader.load('textures/palm.png');

palm2Loader.load('textures/palm.obj', (object) => {

    object.traverse((child) => {

        if (child.isMesh) {

            child.material = new THREE.MeshPhongMaterial({
                map: palm2Texture,
                side: THREE.DoubleSide
            });

            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    object.position.set(60, -1, -55);
    object.scale.set(0.08, 0.08, 0.08);

    scene.add(object);
});

//palm tree obj 4 - https://www.fab.com/listings/931dee67-df78-4bc7-8504-e552955cbb65
const palm4Loader = new OBJLoader();
const texturepalm4Loader = new THREE.TextureLoader();

const palm4Texture = texturepalm4Loader.load('textures/palm.png');

palm4Loader.load('textures/palm.obj', (object) => {

    object.traverse((child) => {

        if (child.isMesh) {

            child.material = new THREE.MeshPhongMaterial({
                map: palm4Texture,
                side: THREE.DoubleSide
            });

            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    object.position.set(70, -1, 85);
    object.scale.set(0.09, 0.09, 0.09);
    object.rotation.y = -0.3;

    scene.add(object);
});

//ice cream - https://www.cgtrader.com/items/5495829/download-page
const mtlLoader = new MTLLoader();

mtlLoader.load('textures/Icecream.mtl', (materials) => {

    materials.preload();

    const iceCreamLoader = new OBJLoader();
    iceCreamLoader.setMaterials(materials);

    iceCreamLoader.load('textures/Icecream.obj', (object) => {

        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        object.position.set(37, 75, -43);
        object.scale.set(4, 4, 4);
        object.rotation.x = 1.1;

        scene.add(object);
    });
});

// spotlight shining on the ice cream
const iceCreamLight = new THREE.SpotLight(
    0xFFF5CC, // warm white
    8000      // brightness
);

iceCreamLight.position.set(20, 85, 60); 

iceCreamLight.angle = Math.PI / 5;
iceCreamLight.penumbra = 0.8;
iceCreamLight.distance = 150;

iceCreamLight.castShadow = true;

iceCreamLight.shadow.mapSize.width = 2048;
iceCreamLight.shadow.mapSize.height = 2048;

scene.add(iceCreamLight);

// point at the ice cream
iceCreamLight.target.position.set(
    37,
    75,
    -43
);

scene.add(iceCreamLight.target);

//dumpster - https://www.cgtrader.com/items/2257883/download-page
const dumpsterMtlLoader = new MTLLoader();

dumpsterMtlLoader.load('textures/dumpster.mtl', (materials) => {

    materials.preload();

    const dumpsterLoader = new OBJLoader();
    dumpsterLoader.setMaterials(materials);

    dumpsterLoader.load('textures/dumpster.obj', (object) => {

        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        object.position.set(20, -0.5, -56);  
        object.scale.set(22, 22, 22);     
        object.rotation.y = -3.1;
        scene.add(object);
    });
});

//umbrella - https://free3d.com/3d-model/beach-umbrella-v1--514487.html?dd_referrer=
const umbrellaMtlLoader = new MTLLoader();

umbrellaMtlLoader.load('textures/umbrella.mtl', (materials) => {

    materials.preload();

    const umbrellaLoader = new OBJLoader();
    umbrellaLoader.setMaterials(materials);

    umbrellaLoader.load('textures/umbrella.obj', (object) => {

        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        object.position.set(0, -10, 69);  
        object.scale.set(0.4, 0.4, 0.4);    
        object.rotation.x = -Math.PI / 2; 
        object.rotation.y = -0.2;
        

        scene.add(object);
    });
});

//painting
const frame = new THREE.Mesh(
    new THREE.BoxGeometry(22, 17, 1),
    new THREE.MeshPhongMaterial({
        color: 0x5C3A21
    })
);

frame.position.set(30, 35, -34.2);

scene.add(frame);

//image
const paintingTexture = textureLoader.load('textures/painting.jpg');

const painting = new THREE.Mesh(
    new THREE.BoxGeometry(20, 15, 0.3),
    new THREE.MeshPhongMaterial({
        map: paintingTexture
    })
);

painting.position.set(30, 35, -33.5);

scene.add(painting);

//cone - https://www.cgtrader.com/items/6297065/download-page
const coneMtlLoader = new MTLLoader();

coneMtlLoader.load('textures/cone.mtl', (materials) => {

    materials.preload();

    const coneLoader = new OBJLoader();
    coneLoader.setMaterials(materials);

    coneLoader.load('textures/cone.obj', (object) => {

        object.traverse((child) => {
            if (child.isMesh) {
                const map = child.material.map;

                child.material = new THREE.MeshPhongMaterial({
                    map: map,
                    side: THREE.DoubleSide
                });

                child.castShadow = true;
                child.receiveShadow = true;

                child.material.side = THREE.DoubleSide;
            }
        });

        object.position.set(21, 17, -5);  
        object.scale.set(0.3, 0.29, 0.3);    
        
        

        scene.add(object);
    });
});

//strawberry - https://www.cgtrader.com/items/3997284/download-page
const strawMtlLoader = new MTLLoader();

strawMtlLoader.load('textures/straw.mtl', (materials) => {

    materials.preload();

    const strawLoader = new OBJLoader();
    strawLoader.setMaterials(materials);

    strawLoader.load('textures/straw.obj', (object) => {

        object.traverse((child) => {
            if (child.isMesh) {
                const map = child.material.map;

                child.material = new THREE.MeshPhongMaterial({
                    map: map,
                    side: THREE.DoubleSide
                });
                
                child.castShadow = true;
                child.receiveShadow = true;

                child.material.side = THREE.DoubleSide;
            }
        });

        object.position.set(1, 16, -25);  
        object.scale.set(1, 1, 1);   
        object.rotation.x = 1.3; 
        
        strawberryObject = object;
        scene.add(object);
    });
});

//chocolate - https://www.cgtrader.com/free-3d-models/food/miscellaneous/tile-of-milk-chocolate
const chocoMtlLoader = new MTLLoader();

chocoMtlLoader.load('textures/choco.mtl', (materials) => {

    materials.preload();

    const chocoLoader = new OBJLoader();
    chocoLoader.setMaterials(materials);

    chocoLoader.load('textures/choco.obj', (object) => {

        object.traverse((child) => {
            if (child.isMesh) {
                const map = child.material.map;

                child.material = new THREE.MeshPhongMaterial({
                    map: map,
                    side: THREE.DoubleSide
                });
                
                child.castShadow = true;
                child.receiveShadow = true;

                child.material.side = THREE.DoubleSide;
            }
        });

        object.position.set(4, 15.5, -10);  
        object.scale.set(70, 50, 50);   
        object.rotation.z = Math.PI / 2; 
        object.rotation.y = 1; 
        
        chocolateObject = object;
        scene.add(object);
    });
});

//ice cream sphere
const scoop1Texture = textureLoader.load('textures/scoop1.jpg');

let scoop1 = new THREE.Mesh(
    new THREE.SphereGeometry(6.3, 32, 32),
    new THREE.MeshPhongMaterial({
        map: scoop1Texture
    })
);

scoop1.position.set(21, 34, -5);

scoop1.castShadow = true;
scoop1.receiveShadow = true;

scene.add(scoop1);

//ice cream sphere 2 
const scoop2Texture = textureLoader.load('textures/scoop2.jpg');

let scoop2 = new THREE.Mesh(
    new THREE.SphereGeometry(6.3, 32, 32),
    new THREE.MeshPhongMaterial({
        map: scoop2Texture
    })
);

scoop2.position.set(21, 34, -5);
scoop2.castShadow = true;
scoop2.receiveShadow = true;
scoop2.visible = false; 

scene.add(scoop2);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let strawberryObject = null;
let chocolateObject = null;





// LIGHT ---------------------------------------------------------------------------

//ambient
const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.4);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xFFAA69, 2.0);
sunLight.position.set(100, 200, 100);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 1000;
sunLight.shadow.camera.left = -200;
sunLight.shadow.camera.right = 200;
sunLight.shadow.camera.top = 200;
sunLight.shadow.camera.bottom = -200;
scene.add(sunLight);

//hemosphere ight
const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0xF5DEB3, 0.6);
scene.add(hemisphereLight);

//point light
const shopLight = new THREE.PointLight(0xFFD1A0, 2.0, 150);
shopLight.position.set(30, 20, 0);
scene.add(shopLight);

//rect light
const sunsetLight = new THREE.RectAreaLight(0xFF6B35, 6, 200, 100);
sunsetLight.position.set(200, 50, 0);   
sunsetLight.lookAt(0, 0, 0);          
scene.add(sunsetLight);

const fireflyCount = 200;
const fireflyGeometry = new THREE.BufferGeometry();

const positions = new Float32Array(fireflyCount * 3);
const velocities = [];

for (let i = 0; i < fireflyCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 300;  
    positions[i * 3 + 1] = Math.random() * 60 + 2;       
    positions[i * 3 + 2] = (Math.random() - 0.5) * 300;  

    velocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.05,
    });
}

fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const fireflyMaterial = new THREE.PointsMaterial({
    color: 0xFFFFAA,  
    size: 0.8,
    transparent: true,
    opacity: 0.85,
    depthWrite: false, 
});

const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
scene.add(fireflies);



//camera---------------------------------------------------------------------------

camera.position.set(0, 10, 100);
camera.rotation.order = 'YXZ';


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); 
});


//animayion -------------------------------------------------------------------------

const moveSpeed = 1.5;

function animate() {

    requestAnimationFrame(animate);

    const direction = new THREE.Vector3();
    const right     = new THREE.Vector3();

    camera.getWorldDirection(direction);
    right.crossVectors(direction, camera.up).normalize();

    if (keys['KeyW']) camera.position.addScaledVector(direction, moveSpeed);
    if (keys['KeyS']) camera.position.addScaledVector(direction, -moveSpeed);
    if (keys['KeyA']) camera.position.addScaledVector(right, -moveSpeed);
    if (keys['KeyD']) camera.position.addScaledVector(right, moveSpeed);

    if (scoop1.visible) scoop1.rotation.y += 0.01;
    if (scoop2.visible) scoop2.rotation.y += 0.01;

    //fireflies
    const pos = fireflies.geometry.attributes.position.array;
    for (let i = 0; i < fireflyCount; i++) {
        pos[i * 3]     += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;

        if (pos[i * 3]     >  150) velocities[i].x *= -1;
        if (pos[i * 3]     < -150) velocities[i].x *= -1;
        if (pos[i * 3 + 1] >  65)  velocities[i].y *= -1;
        if (pos[i * 3 + 1] <  2)   velocities[i].y *= -1;
        if (pos[i * 3 + 2] >  150) velocities[i].z *= -1;
        if (pos[i * 3 + 2] < -150) velocities[i].z *= -1;
    }
    fireflies.geometry.attributes.position.needsUpdate = true;

    composer.render();
}

animate();

const infoButton = document.getElementById("infoButton");
const infoPanel = document.getElementById("infoPanel");
const closeInfo = document.getElementById("closeInfo");

infoButton.addEventListener("click", () => {
    infoPanel.style.display = "block";
});

closeInfo.addEventListener("click", () => {
    infoPanel.style.display = "none";
});

