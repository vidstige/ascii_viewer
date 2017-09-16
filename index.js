const THREE = require('three');
require('three-obj-loader')(THREE);
var OrbitControls = require('three-orbit-controls')(THREE);

var container;
            
var camera, scene, renderer, controls;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
//animate();

function extractMesh(object)
{
    var result;
    object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            result = child;
        }
    });
    return result;
}

function computeNormals(object) {
    object.geometry.computeFaceNormals();
    object.geometry.computeVertexNormals();
}

function setMaterial(object) {
    object.material.side = THREE.DoubleSide;
    object.material.color.set(0xefefef);
}

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 2);
    camera.up.set(0, 0, 1);
    camera.position.x = -0.7;
    //camera.lookAt(new THREE.Vector3(0,0,0));

    controls = new OrbitControls(camera);
    controls.target.set(-0.0, 0.1, 0);
    controls.addEventListener('change', render);
    // scene

    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight(0x101030);
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    // texture
    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    // model
    var loader = new THREE.OBJLoader(manager);
    loader.load('obj/right.obj', function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                computeNormals(child);
                setMaterial(child);
            }
        });
        scene.add(object);
        render();
    }, manager.onProgress, console.error);

    //
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    //
    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;
}

//
function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}
