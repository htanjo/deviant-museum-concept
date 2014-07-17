(function (window) {
  'use strict';

  // Modules
  var THREE = window.THREE;
  var CANNON = window.CANNON;
  var requestAnimationFrame = window.requestAnimationFrame;
  var PointerLockControls = window.PointerLockControls;

  // Three
  var scene;
  var camera;
  var renderer;

  // Cannon
  var world;
  var physicsMaterial;
  var sphereShape;
  var sphereBody;
  var dt = 1 / 60;

  // PointerLockControls
  var controls;
  var time = Date.now();

  // Application
  var sizeX = 10;
  var sizeY = 10;
  var height = 5;

  // DOM
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
      element.requestPointerLock();
    }, false);

  }
  else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
  }

  function init() {

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    initPhysics();
    initControls();
    initMesh();
    initRenderer();

    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

  }

  function initPhysics() {

    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRegularizationTime = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if (split) {
      world.solver = new CANNON.SplitSolver(solver);
    }
    else {
      world.solver = solver;
    }

    world.gravity.set(0, -20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material('slipperyMaterial');
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                            physicsMaterial,
                                                            0.0, // friction coefficient
                                                            0.3  // restitution
                                                            );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    // Create a sphere
    var mass = 5;
    var radius = 0.5;
    sphereShape = new CANNON.Sphere(radius);
    sphereBody = new CANNON.RigidBody(mass, sphereShape, physicsMaterial);
    sphereBody.position.set(sizeX / 2, radius, sizeY / 2);
    sphereBody.linearDamping = 0.9;
    world.add(sphereBody);

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.RigidBody(0, groundShape, physicsMaterial);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.add(groundBody);

    // Create walls
    var wallShape = new CANNON.Box(new CANNON.Vec3(sizeX / 2, height / 2, 0.1));

    var wallBody0 = new CANNON.RigidBody(0, wallShape, physicsMaterial);
    wallBody0.position.set(sizeX / 2, height / 2, 0);
    world.add(wallBody0);

    var wallBody1 = new CANNON.RigidBody(0, wallShape, physicsMaterial);
    wallBody1.position.set(0, height / 2, sizeY / 2);
    wallBody1.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    world.add(wallBody1);

    var wallBody2 = new CANNON.RigidBody(0, wallShape, physicsMaterial);
    wallBody2.position.set(sizeX, height / 2, sizeY / 2);
    wallBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    world.add(wallBody2);

    var wallBody3 = new CANNON.RigidBody(0, wallShape, physicsMaterial);
    wallBody3.position.set(sizeX / 2, height / 2, sizeY);
    wallBody3.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    world.add(wallBody3);

  }

  function initControls() {

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);

    controls = new PointerLockControls(camera, sphereBody);
    scene.add(controls.getObject());

  }

  function initMesh() {

    var floorTexture = THREE.ImageUtils.loadTexture('images/floor.png');
    floorTexture.anisotropy = 4;

    var floorGeometry = new THREE.PlaneGeometry(sizeX, sizeY, sizeX * 2, sizeY * 2);
    var floorMaterial = new THREE.MeshLambertMaterial({map: floorTexture});
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.rotation.x = -90 / 180 * Math.PI;
    floor.position.x = sizeX / 2;
    floor.position.z = sizeY / 2;

    scene.add(floor);

    var wallTexture = THREE.ImageUtils.loadTexture('images/wall.png');
    var wallGeometry = new THREE.PlaneGeometry(sizeX, height, sizeX * 2, height * 2);
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

    var ceilingTexture = THREE.ImageUtils.loadTexture('images/ceiling.png');
    var ceilingGeometry = new THREE.PlaneGeometry(sizeX, sizeY, sizeX * 2, sizeY * 2);
    var ceilingMaterial = new THREE.MeshLambertMaterial({map: ceilingTexture});

    var ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
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

    // scene.add(art0);

    var personTexture = THREE.ImageUtils.loadTexture('images/person.png');
    var personGeometry = new THREE.PlaneGeometry(1, 2, 2, 4);
    var personMaterial = new THREE.MeshLambertMaterial({map: personTexture});
    personMaterial.side = THREE.DoubleSide;
    personMaterial.transparent = true;
    var person = new THREE.Mesh(personGeometry, personMaterial);
    person.position.x = 3.5;
    person.position.y = 1;
    person.position.z = 2;

    scene.add(person);

    var peopleTexture = THREE.ImageUtils.loadTexture('images/people.png');
    var peopleGeometry = new THREE.PlaneGeometry(2, 2, 4, 4);
    var peopleMaterial = new THREE.MeshLambertMaterial({map: peopleTexture});
    peopleMaterial.side = THREE.DoubleSide;
    peopleMaterial.transparent = true;
    var people = new THREE.Mesh(peopleGeometry, peopleMaterial);
    people.position.x = 5;
    people.position.y = 1;
    people.position.z = 1;

    scene.add(people);

    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

  }

  function initRenderer() {

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function animate() {

    requestAnimationFrame(animate);

    if (controls.enabled) {
      world.step(dt);
      // Update box positions
      // for (var i = 0; i < boxes.length; i++) {
      //   boxes[i].position.copy(boxMeshes[i].position);
      //   boxes[i].quaternion.copy(boxMeshes[i].quaternion);
      // }
    }

    controls.update(Date.now() - time);
    renderer.render(scene, camera);
    time = Date.now();

  }

  // Start application
  init();
  animate();

}(window));
