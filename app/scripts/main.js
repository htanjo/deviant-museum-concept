(function (window) {
  'use strict';

  var THREE = window.THREE;
  var requestAnimationFrame = window.requestAnimationFrame;

  var scene, camera, renderer;
  var plane;

  var input;

  function init() {

    scene = new THREE.Scene();
    input = new Input();

    initCamera();
    initMesh();
    initRenderer();

    document.body.appendChild( renderer.domElement );

  }

  function initCamera() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.y = 100;
    camera.position.z = 1000;

  }

  function initMesh() {

    var geometry = new THREE.PlaneGeometry(10000, 10000);
    var material = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide, wireframe: true});
    plane = new THREE.Mesh(geometry, material);

    plane.rotation.x = 90 / 180 * Math.PI;

    scene.add(plane);

  }

  function initRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function animate() {

    var speed = 10;

    requestAnimationFrame( animate );

    if (input.up) {
      camera.position.z -= speed;
    }
    if (input.down) {
      camera.position.z += speed;
    }
    if (input.left) {
      camera.position.x -= speed;
    }
    if (input.right) {
      camera.position.x += speed;
    }

    renderer.render( scene, camera );

  }

  function Input() {
    var self = this;

    function onKeyDown(event) {
      switch (event.keyCode) {
        case 87:    // w
          self.up = true;
          break;
        case 83:    // s
          self.down = true;
          break;
        case 65:    // a
          self.left = true;
          break;
        case 68:    // d
          self.right = true;
          break;
      }
    }

    function onKeyUp(event) {
      switch (event.keyCode) {
        case 87:    // w
          self.up = false;
          break;
        case 83:    // s
          self.down = false;
          break;
        case 65:    // a
          self.left = false;
          break;
        case 68:    // d
          self.right = false;
          break;
      }
    }

    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

  }

  init();
  animate();

}(window));
