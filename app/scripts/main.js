(function (window) {
  'use strict';

  var THREE = window.THREE;
  var requestAnimationFrame = window.requestAnimationFrame;

  var scene;
  var camera;
  var renderer;

  var controls;
  var ray;

  var sizeX = 100;
  var sizeY = 100;
  var height = 50;

  var blocker = document.getElementById('blocker');
  var instructions = document.getElementById('instructions');

  // http://www.html5rocks.com/en/tutorials/pointerlock/intro/
  var havePointerLock = 'pointerLockElement' in document ||
                        'mozPointerLockElement' in document ||
                        'webkitPointerLockElement' in document;

  if (havePointerLock) {

    var element = document.body;
    var pointerlockchange = function () {
      var isPointerlookElement = document.pointerLockElement === element ||
                                 document.mozPointerLockElement === element ||
                                 document.webkitPointerLockElement === element;
      if (isPointerlookElement) {
        controls.enabled = true;
        blocker.style.display = 'none';
      }
      else {
        controls.enabled = false;
        blocker.style.display = '-webkit-box';
        blocker.style.display = '-moz-box';
        blocker.style.display = 'box';
        instructions.style.display = '';
      }
    };
    var pointerlockerror = function () {
      instructions.style.display = '';
    };

    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    instructions.addEventListener('click', function () {
      instructions.style.display = 'none';

      // Ask the browser to lock the pointer
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

      if (/Firefox/i.test(navigator.userAgent)) {
        var fullscreenchange = function () {
          var isFullscreenElement = document.fullscreenElement === element ||
                                    document.mozFullscreenElement === element ||
                                    document.mozFullScreenElement === element;
          if (isFullscreenElement) {
            document.removeEventListener('fullscreenchange', fullscreenchange);
            document.removeEventListener('mozfullscreenchange', fullscreenchange);
            element.requestPointerLock();
          }
        };
        document.addEventListener('fullscreenchange', fullscreenchange, false);
        document.addEventListener('mozfullscreenchange', fullscreenchange, false);
        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
        element.requestFullscreen();
      }
      else {
        element.requestPointerLock();
      }
    }, false);

  }
  else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
  }

  function init() {

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    initCamera();
    initMesh();
    initRenderer();

    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

  }

  function initCamera() {

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 10000);

    controls = new THREE.PointerLockControls(camera);
    controls.getObject().position.set(sizeX / 2, 0, sizeY / 2);
    scene.add(controls.getObject());

    ray = new THREE.Raycaster();
    ray.ray.direction.set(0, -1, 0);

  }

  function initMesh() {

    var floorTexture = THREE.ImageUtils.loadTexture('images/floor.png');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(sizeX / 10, sizeY / 10);

    var floorGeometry = new THREE.PlaneGeometry(sizeX, sizeY, sizeX / 50, sizeY / 50);
    var floorMaterial = new THREE.MeshLambertMaterial({map: floorTexture});
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.rotation.x = -90 / 180 * Math.PI;
    floor.position.x = sizeX / 2;
    floor.position.z = sizeY / 2;

    scene.add(floor);

    var wallTexture = THREE.ImageUtils.loadTexture('images/wall.png');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(sizeX / 10, sizeY / 10);

    var wallGeometry = new THREE.PlaneGeometry(sizeX, height, sizeX / 50, height / 50);
    var wallMaterial = new THREE.MeshLambertMaterial({map: wallTexture});

    var wall0 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall0.position.x = sizeX / 2;
    wall0.position.y = height / 2;
    wall0.position.z = 0;

    scene.add(wall0);

    var wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.rotation.y = 90 / 180 * Math.PI;
    wall1.position.x = 0;
    wall1.position.y = height / 2;
    wall1.position.z = sizeY / 2;

    scene.add(wall1);

    var wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.rotation.y = -90 / 180 * Math.PI;
    wall2.position.x = sizeX;
    wall2.position.y = height / 2;
    wall2.position.z = sizeY / 2;

    scene.add(wall2);

    var wall3 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall3.rotation.y = 180 / 180 * Math.PI;
    wall3.position.x = sizeX / 2;
    wall3.position.y = height / 2;
    wall3.position.z = sizeY;

    scene.add(wall3);

    var ceiling = new THREE.Mesh(floorGeometry, wallMaterial);
    ceiling.rotation.x = 90 / 180 * Math.PI;
    ceiling.position.x = sizeX / 2;
    ceiling.position.y = height;
    ceiling.position.z = sizeY / 2;

    scene.add(ceiling);

    var art0Texture = THREE.ImageUtils.loadTexture('images/art0.jpg');
    var art0Geometry = new THREE.PlaneGeometry(32, 24, 4, 4);
    var art0Material = new THREE.MeshLambertMaterial({map: art0Texture});
    var art0 = new THREE.Mesh(art0Geometry, art0Material);
    art0.position.x = sizeX / 2;
    art0.position.y = 20;
    art0.position.z = 1;

    scene.add(art0);

    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

  }

  function initRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function animate() {

    requestAnimationFrame( animate );

    ray.ray.origin.copy(controls.getObject().position);
    ray.ray.origin.y -= 10;

    controls.update();

    renderer.render(scene, camera);

  }

  // Start application
  init();
  animate();

}(window));
