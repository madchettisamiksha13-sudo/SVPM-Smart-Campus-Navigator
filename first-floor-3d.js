(function () {
  "use strict";

  // =========================================
  // CHECK THREE.JS
  // =========================================

  if (typeof THREE === "undefined" || !THREE.OrbitControls) {
    console.error("Three.js / OrbitControls missing.");
    return;
  }

  const viewer = document.getElementById("navigation3DViewer");
  const section = document.getElementById("navigation3DSection");

  if (!viewer || !section) {
    console.error("3D viewer not found.");
    return;
  }

  // =========================================
  // SCENE
  // =========================================

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeaf0f6);

  const camera = new THREE.PerspectiveCamera(
    50, 800 / 550, 0.1, 1000
  );

  camera.position.set(65, 65, 75);

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  renderer.shadowMap.enabled = true;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";

  viewer.appendChild(renderer.domElement);

  // =========================================
  // CAMERA CONTROLS
  // =========================================

  const controls = new THREE.OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 35;
controls.maxDistance = 220;
controls.maxPolarAngle = Math.PI * 0.48;

controls.target.set(0, 5.5, 0);
camera.position.set(85, 55, 95);

controls.update();
  // =========================================
  // LIGHTING
  // =========================================

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));

  const light = new THREE.DirectionalLight(0xffffff, 1.1);
  light.position.set(20, 40, 25);
  light.castShadow = true;
  scene.add(light);

  // =========================================
  // MATERIALS
  // =========================================

  const material = {
    base: new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }),
    room: new THREE.MeshStandardMaterial({ color: 0xdbeafe }),
    wall: new THREE.MeshStandardMaterial({ color: 0x64748b }),
    corridor: new THREE.MeshStandardMaterial({ color: 0xfde68a }),
    garden: new THREE.MeshStandardMaterial({ color: 0x86efac }),
    stair: new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
  };

  // =========================================
  // FLOOR GROUPS
  // =========================================

  const FLOOR_HEIGHT = 5.5;

const floorGroups = {
  first: new THREE.Group(),
  second: new THREE.Group()
};

floorGroups.first.position.y = FLOOR_HEIGHT;
floorGroups.second.position.y = FLOOR_HEIGHT * 2;

floorGroups.first.visible = true;
floorGroups.second.visible = true;

scene.add(floorGroups.first);
scene.add(floorGroups.second);

  // =========================================
  // BASIC BOX
  // =========================================

  function box(group, w, h, d, x, y, z, mat) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      mat
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);
    return mesh;
  }

  // =========================================
  // ROOM LABEL
  // =========================================

  function label(group, name, x, z, width) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 160;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 42px Arial";
    ctx.fillText(name, 256, 80, 490);

    const texture = new THREE.CanvasTexture(canvas);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      })
    );

    sprite.position.set(x, 3.4, z);
    sprite.scale.set(Math.min(width * 0.8, 8), 2.4, 1);
    sprite.renderOrder = 10;

    group.add(sprite);
  }

  // =========================================
  // ROOM BUILDER
  // =========================================

  function room(group, name, x, z, w, d, doorSide) {
    box(
      group, w - 0.08, 0.12, d - 0.08,
      x, 0.02, z, material.room
    );

    const h = 3;
    const t = 0.18;

    const door = Math.min(1.4, w * 0.25);
    const sw = (w - door) / 2;
    const sd = (d - door) / 2;

    // North wall
    if (doorSide === "north") {
      box(group, sw, h, t, x - door / 2 - sw / 2, 1.5, z - d / 2, material.wall);
      box(group, sw, h, t, x + door / 2 + sw / 2, 1.5, z - d / 2, material.wall);
    } else {
      box(group, w, h, t, x, 1.5, z - d / 2, material.wall);
    }

    // South wall
    if (doorSide === "south") {
      box(group, sw, h, t, x - door / 2 - sw / 2, 1.5, z + d / 2, material.wall);
      box(group, sw, h, t, x + door / 2 + sw / 2, 1.5, z + d / 2, material.wall);
    } else {
      box(group, w, h, t, x, 1.5, z + d / 2, material.wall);
    }

    // West wall
    if (doorSide === "west") {
      box(group, t, h, sd, x - w / 2, 1.5, z - door / 2 - sd / 2, material.wall);
      box(group, t, h, sd, x - w / 2, 1.5, z + door / 2 + sd / 2, material.wall);
    } else {
      box(group, t, h, d, x - w / 2, 1.5, z, material.wall);
    }

    // East wall
    if (doorSide === "east") {
      box(group, t, h, sd, x + w / 2, 1.5, z - door / 2 - sd / 2, material.wall);
      box(group, t, h, sd, x + w / 2, 1.5, z + door / 2 + sd / 2, material.wall);
    } else {
      box(group, t, h, d, x + w / 2, 1.5, z, material.wall);
    }

    label(group, name, x, z, w);
  }

  // =========================================
  // BUILD FIRST FLOOR
  // =========================================

  function buildFirstFloor() {
    const g = floorGroups.first;

    box(g, 84, 0.3, 48, 0, -0.2, 0, material.base);

    const top = [
      ["112 - Classroom", 9],
      ["113 - Classroom", 6],
      ["114 - Classroom", 9],
      ["115 - Classroom", 9],
      ["116 - Classroom", 9],
      ["117 - Classroom", 9],
      ["118 - Classroom", 9],
      ["119 - Classroom", 9],
      ["120 - Environmental Lab", 6],
      ["121 - Chemistry Lab", 9]
    ];

    let x = -42;

    top.forEach(([name, w]) => {
      room(g, name, x + w / 2, -19.5, w, 9, "south");
      x += w;
    });

    const bottom = [
      ["106 - Communication / DTA", 8],
      ["105 - Basic Applied Electronics", 6],
      ["104 - LIC Instrumentation", 8],
      ["103 - Electronics Workshop", 6],
      ["102 - Computer Lab", 6],
      ["101 - Programming Lab", 6]
    ];

    x = -32;

    bottom.forEach(([name, w]) => {
      room(g, name, x + w / 2, 16.5, w, 9, "north");
      x += w;
    });

    room(g, "128 - Computer Centre", 25, 16.5, 18, 9, "north");

    const left = [
      ["111 - HOD Room", 4],
      ["110 - Gents Toilet", 4],
      ["109 - Boys Common Room", 5],
      ["108A - HOD Room", 4],
      ["108B - Department Office", 4],
      ["107 - Power Electronics", 5]
    ];

    let z = -12;

    left.forEach(([name, d]) => {
      room(g, name, -37.5, z + d / 2, 9, d, "east");
      z += d;
    });

    const right = [
      ["122 - Staff Room", 4],
      ["123 - Ladies Toilet", 4],
      ["124 - Physics Lab", 7],
      ["124A - Faculty Room", 4],
      ["125 - Exam Control", 5],
      ["126 - Faculty Room", 5]
    ];

    z = -12;

    right.forEach(([name, d]) => {
      room(g, name, 37.5, z + d / 2, 9, d, "west");
      z += d;
    });

    // Central garden
    box(g, 60, 0.12, 24, 0, -0.025, 0, material.garden);
    label(g, "OPEN TO SKY - GARDEN", 0, 0, 20);

    // Corridors
    box(g, 84, 0.1, 3, 0, 0.055, -13.5, material.corridor);
    box(g, 84, 0.1, 3, 0, 0.055, 22.5, material.corridor);
    box(g, 3, 0.1, 24, -31.5, 0.055, 0, material.corridor);
    box(g, 3, 0.1, 24, 31.5, 0.055, 0, material.corridor);

    // Staircase 1: Ground <-> First
    for (let i = 0; i < 8; i++) {
      box(
        g, 0.65, 0.25, 5,
        12 + i * 0.6,
        0.15 + i * 0.2,
        16.5,
        material.stair
      );
    }

    label(g, "STAIRCASE 1", 14.5, 16.5, 5);

    // =====================================
    // GIRLS COMMON ROOM SIDE STAIRCASE
    // First <-> Second Floor
    // Between HOD Room 111 and Classroom 112
    // =====================================

    const girlsStairX = -31.5;
    const girlsStairZ = -13.5;

    for (let i = 0; i < 8; i++) {
      box(
        g,
        0.65,
        0.25,
        0.32,
        girlsStairX,
        0.15 + i * 0.2,
        girlsStairZ + i * 0.32,
        material.stair
      );
    }

    label(
      g,
      "STAIRCASE TO SECOND FLOOR",
      girlsStairX,
      girlsStairZ - 1.5,
      8
    );
  }

  // =========================================
  // BUILD SECOND FLOOR
  // =========================================

  function buildSecondFloor() {
    const g = floorGroups.second;

    box(g, 70, 0.3, 48, 0, -0.2, 0, material.base);

    const top = [
      ["201 - Classroom", 12],
      ["AI Lab 1", 10],
      ["AI Lab 2", 10],
      ["AI Lab 3", 10],
      ["AI Lab 4", 10]
    ];

    let x = -34;

    top.forEach(([name, w]) => {
      room(g, name, x + w / 2, -15, w, 10, "south");
      x += w;
    });

    const bottom = [
      ["205 - Staff Room", 10],
      ["206 - Tutorial Room", 10],
      ["207 - Classroom", 12]
    ];

    x = -30;

    bottom.forEach(([name, w]) => {
      room(g, name, x + w / 2, 14, w, 10, "north");
      x += w;
    });

    const labs = [
      ["IF Lab 1", -15],
      ["IF Lab 2", -5],
      ["IF Lab 3", 5],
      ["IF Lab 4", 15]
    ];

    labs.forEach(([name, px]) => {
      room(g, name, px, 3, 8, 8, "north");
    });

    box(g, 70, 0.1, 3, 0, 0.055, 0, material.corridor);

    // Existing Second Floor staircase landing.
    // Verify its exact position against the actual floor plan.
    for (let i = 0; i < 8; i++) {
      box(
        g, 0.65, 0.25, 5,
        -37 + i * 0.6,
        0.15 + i * 0.2,
        -7,
        material.stair
      );
    }

    label(g, "GIRLS COMMON ROOM STAIRCASE", -34, -7, 8);
  }

  buildFirstFloor();
  buildSecondFloor();

  // =========================================
  // FLOOR REGISTRATION
  // =========================================

  function registerFloor(name, buildFunction) {
  if (floorGroups[name]) {
    console.warn("Floor already exists:", name);
    return;
  }

  const group = new THREE.Group();

  if (name === "ground") {
    group.position.y = 0;
  }

  group.visible = true;

  floorGroups[name] = group;
  scene.add(group);

  buildFunction(group);

  group.visible = true;

  console.log(name + " floor registered.");
}

// =========================================
// MULTI-FLOOR ROUTE MANAGEMENT
// =========================================

const routeObjectsByFloor = {};

function clearRoute(floor) {

  const floorsToClear = floor
    ? [floor]
    : Object.keys(routeObjectsByFloor);

  floorsToClear.forEach(floorName => {

    const objects = routeObjectsByFloor[floorName] || [];

    objects.forEach(obj => {

      if (obj.parent) {
        obj.parent.remove(obj);
      }

      if (obj.geometry) {
        obj.geometry.dispose();
      }

      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }

    });

    routeObjectsByFloor[floorName] = [];

  });
}


// =========================================
// DRAW ROUTE ON SELECTED FLOOR
// =========================================

function drawRoute(floor, points) {

  const group = floorGroups[floor];

  if (!group || !points || points.length < 2) {
    console.warn("Invalid route data:", floor);
    return false;
  }

  if (points.some(point =>
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.z)
  )) {
    console.error("Invalid route coordinates.");
    return false;
  }

  // Clear only this floor's previous route.
  clearRoute(floor);

  routeObjectsByFloor[floor] = [];

  const objects = routeObjectsByFloor[floor];

  const vectors = points.map(point =>
    new THREE.Vector3(point.x, 0.45, point.z)
  );

  // BLUE ROUTE LINE
  const geometry = new THREE.BufferGeometry()
    .setFromPoints(vectors);

  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0x2563eb
    })
  );

  group.add(line);
  objects.push(line);

  // DIRECTION ARROWS
  for (let i = 0; i < vectors.length - 1; i++) {

    const start = vectors[i];
    const end = vectors[i + 1];

    const direction = new THREE.Vector3()
      .subVectors(end, start);

    if (direction.length() < 0.5) continue;

    direction.normalize();

    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 1.8, 12),
      new THREE.MeshBasicMaterial({
        color: 0x1d4ed8
      })
    );

    arrow.position.copy(start)
      .add(end)
      .multiplyScalar(0.5);

    arrow.position.y = 0.9;

    arrow.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction
    );

    group.add(arrow);
    objects.push(arrow);
  }

  // GREEN START MARKER
  const startMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x16a34a
    })
  );

  startMarker.position.copy(vectors[0]);
  startMarker.position.y = 0.9;

  group.add(startMarker);
  objects.push(startMarker);

  // RED DESTINATION MARKER
  const endMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xdc2626
    })
  );

  endMarker.position.copy(vectors[vectors.length - 1]);
  endMarker.position.y = 0.9;

  group.add(endMarker);
  objects.push(endMarker);

  console.log("Route drawn successfully:", floor);

  return true;
}
  // =========================================
  // CURRENT LOCATION MARKER
  // =========================================

  let currentFloor = "first";
  let locationPickingEnabled = false;
  let locationCallback = null;
  let pointerStart = null;

  const locationMarkers = {};

  function setLocationMarker(floor, x, z) {
    const group = floorGroups[floor];

    if (!group) {
      console.error("Location marker: floor not found", floor);
      return false;
    }

    if (locationMarkers[floor]) {
      group.remove(locationMarkers[floor]);
    }

    const markerGroup = new THREE.Group();

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x2563eb })
    );

    sphere.position.y = 1.5;
    markerGroup.add(sphere);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.15, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x2563eb })
    );

    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.5;
    markerGroup.add(ring);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 110;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 46px Arial";
    ctx.textAlign = "center";
    ctx.fillText("YOU ARE HERE", 256, 70);

    const texture = new THREE.CanvasTexture(canvas);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      })
    );

    sprite.position.set(0, 4, 0);
    sprite.scale.set(8, 1.8, 1);

    markerGroup.add(sprite);

    markerGroup.position.set(x, 0, z);

    group.add(markerGroup);
    locationMarkers[floor] = markerGroup;

    console.log("BLUE MARKER ADDED:", floor, x, z);

    return true;
  }

  function enableLocationPicking(callback) {

  locationPickingEnabled = true;
  locationCallback = callback;

  const activeGroup = floorGroups[currentFloor];

  if (activeGroup) {

    const floorHeight = activeGroup.position.y;

    locationPlane.constant = -(floorHeight + 0.35);

  }

  renderer.domElement.style.cursor = "crosshair";

  console.log(
    "LOCATION PICKING ENABLED:",
    currentFloor,
    "Height:",
    floorGroups[currentFloor]?.position.y
  );
}

  function disableLocationPicking() {
    locationPickingEnabled = false;
    pointerStart = null;
    renderer.domElement.style.cursor = "grab";
  }

  // =========================================
  // FLOOR SWITCHING
  // =========================================

  function showFloor(name) {
  if (!floorGroups[name]) {
    console.error("Floor model missing:", name);
    return false;
  }

  currentFloor = name;

  // Keep every registered floor visible.
  Object.keys(floorGroups).forEach(key => {
    floorGroups[key].visible = true;
  });

  section.style.display = "block";

  const floorTitle = document.getElementById("activeFloorName");

  if (floorTitle) {
    floorTitle.textContent =
      "Complete Diploma Building - " +
      name.charAt(0).toUpperCase() + name.slice(1) + " Floor Selected";
  }

  resizeViewer();

  console.log("All floors displayed. Active floor:", name);

  return true;
}

  // =========================================
  // LOCATION PICKING
  // =========================================

  const locationRaycaster = new THREE.Raycaster();
  const locationMouse = new THREE.Vector2();

  let locationPlane = new THREE.Plane(
    new THREE.Vector3(0, 1, 0),
    -0.35
  );

  renderer.domElement.addEventListener("pointerdown", function(event) {
    if (!locationPickingEnabled) return;

    pointerStart = {
      x: event.clientX,
      y: event.clientY
    };
  });

  renderer.domElement.addEventListener("pointerup", function(event) {
    if (!locationPickingEnabled || !pointerStart) return;

    const movement = Math.hypot(
      event.clientX - pointerStart.x,
      event.clientY - pointerStart.y
    );

    pointerStart = null;

    if (movement > 6) return;

    const rect = renderer.domElement.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    locationMouse.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    locationMouse.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1;

    locationRaycaster.setFromCamera(locationMouse, camera);

    const point = new THREE.Vector3();

    const hit = locationRaycaster.ray.intersectPlane(
      locationPlane,
      point
    );

    if (!hit) {
      console.warn("Could not detect map position.");
      return;
    }

    const selectedFloor = currentFloor;
    const savedCallback = locationCallback;

    const success = setLocationMarker(
      selectedFloor,
      point.x,
      point.z
    );

    if (success) {
      disableLocationPicking();
      locationCallback = null;

      if (savedCallback) {
        savedCallback(selectedFloor, point.x, point.z);
      }
    }
  });

  // =========================================
  // CAMERA AND RESIZE
  // =========================================

  function resizeViewer() {
    const width = viewer.clientWidth || 800;
    const height = viewer.clientHeight || 550;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  window.addEventListener("resize", resizeViewer);

  // =========================================
  // ANIMATION
  // =========================================

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  resizeViewer();
  animate();

  // =========================================
  // PUBLIC API
  // =========================================

  window.Campus3D = {
    showFloor,
    registerFloor,
    drawRoute,
    clearRoute,
    setLocationMarker,
    enableLocationPicking,
    disableLocationPicking,
    resize: resizeViewer,
    scene,
    camera,
    renderer,
    controls
  };

  showFloor("first");

  console.log("Campus 3D engine initialized.");

})();