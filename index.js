const THREE = require('three');
require('three-obj-loader')(THREE);
var OrbitControls = require('three-orbit-controls')(THREE);

const aalib = require('aalib.js');


var container;
            
var camera, scene, renderer, controls;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var backBuffer;

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
    backBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});


    //
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //container.appendChild(renderer.domElement);

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

var pixelBuffer = new Uint8Array(window.innerWidth*window.innerHeight*4);
function render() {
    renderer.render(scene, camera, backBuffer);
    renderer.readRenderTargetPixels(backBuffer, 0, 0, window.innerWidth, window.innerHeight, pixelBuffer);

    renderer.render(scene, camera);
}


///////////////////////
class Stream {

    constructor() {
        this.clear();
    }

    write(data) {
        this.initialData = data;

        if (this.ready && this.sink.length) {
            this.run();
        }

        return this;
    }

    run() {
        this.data = this.initialData;

        this.sink.forEach((fn) => {
            this.data = fn(this.data);
        });

        return this;
    }

    end() {
        this.ready = true;

        if (this.initialData) {
            this.run();
        }

        return this;
    }

    pipe(fn) {
        this.sink.push(fn);

        return this;
    }

    clear() {
        this.sink = [];
        this.data = null;
        this.initialData = null;
        this.ready = false;

        return this;
    }
}

class Reader {
    constructor() {
        this.stream = new Stream();
    }

    onRead(stream, error) {
        void stream; void error;
    }

    read() {
        this.onRead(
            this.stream.write.bind(this.stream),
            this.error.bind(this)
        );

        return this.stream;
    }

    error(msg) {
        this.stream.clear();
        throw msg;
    }
}


aalib.read.image.fromURL("marylin.jpg")
    .pipe(aalib.aa({ width: 160, height: 80, colorful: true }))
    .pipe(aalib.filter.inverse())
    .pipe(aalib.render.html())
    .pipe(function (el) {
        document.body.appendChild(el);
    })
    .end();