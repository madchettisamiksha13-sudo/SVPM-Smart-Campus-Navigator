(function () {
  "use strict";

  if (!window.Campus3D || !window.Campus3D.registerFloor) {
    console.error("Campus3D engine not ready.");
    return;
  }

  function buildGroundFloor(group) {

    const mats = {
      base: new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }),
      room: new THREE.MeshStandardMaterial({ color: 0xdbeafe }),
      wall: new THREE.MeshStandardMaterial({ color: 0x64748b }),
      corridor: new THREE.MeshStandardMaterial({ color: 0xfde68a }),
      garden: new THREE.MeshStandardMaterial({ color: 0x86efac }),
      stair: new THREE.MeshStandardMaterial({ color: 0x94a3b8 }),
      entrance: new THREE.MeshStandardMaterial({ color: 0x16a34a })
    };

    function box(w, h, d, x, y, z, mat) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }

    function label(name, x, z, width) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 160;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 40px Arial";
      ctx.fillText(name, 256, 80, 490);

      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false
        })
      );

      sprite.position.set(x, 3.3, z);
      sprite.scale.set(Math.min(width * 0.85, 9), 2.5, 1);
      sprite.renderOrder = 10;
      group.add(sprite);
    }

    function room(name, x, z, w, d, doorSide) {
      box(w - 0.08, 0.12, d - 0.08, x, 0.02, z, mats.room);

      const h = 3;
      const t = 0.18;
      const door = Math.min(1.4, w * 0.25);
      const sw = (w - door) / 2;
      const sd = (d - door) / 2;

      // North wall
      if (doorSide === "north") {
        box(sw, h, t, x - door / 2 - sw / 2, 1.5, z - d / 2, mats.wall);
        box(sw, h, t, x + door / 2 + sw / 2, 1.5, z - d / 2, mats.wall);
      } else {
        box(w, h, t, x, 1.5, z - d / 2, mats.wall);
      }

      // South wall
      if (doorSide === "south") {
        box(sw, h, t, x - door / 2 - sw / 2, 1.5, z + d / 2, mats.wall);
        box(sw, h, t, x + door / 2 + sw / 2, 1.5, z + d / 2, mats.wall);
      } else {
        box(w, h, t, x, 1.5, z + d / 2, mats.wall);
      }

      // West wall
      if (doorSide === "west") {
        box(t, h, sd, x - w / 2, 1.5, z - door / 2 - sd / 2, mats.wall);
        box(t, h, sd, x - w / 2, 1.5, z + door / 2 + sd / 2, mats.wall);
      } else {
        box(t, h, d, x - w / 2, 1.5, z, mats.wall);
      }

      // East wall
      if (doorSide === "east") {
        box(t, h, sd, x + w / 2, 1.5, z - door / 2 - sd / 2, mats.wall);
        box(t, h, sd, x + w / 2, 1.5, z + door / 2 + sd / 2, mats.wall);
      } else {
        box(t, h, d, x + w / 2, 1.5, z, mats.wall);
      }

      label(name, x, z, w);
    }

    // Building base
    box(84, 0.3, 48, 0, -0.2, 0, mats.base);

    // Top row
    const top = [
      ["13 - Electrical Machines Lab", 7],
      ["14 - Circuit Lab", 7],
      ["15 - Concrete Technology Lab", 10],
      ["16 - Mechanics of Structures", 10],
      ["17 - Hydraulics Lab", 8],
      ["18 - Surveying Lab", 8],
      ["19 - CAD Drawing Hall", 12],
      ["20 - CAD Centre", 7],
      ["21 - HOD Office", 7],
      ["22 - Stationery Store", 8]
    ];

    let x = -42;
    top.forEach(([n, w]) => {
      room(n, x + w / 2, -19.5, w, 9, "south");
      x += w;
    });

    // Left side
    const left = [
      ["7 - Computer Network Lab", 5],
      ["8 - Multimedia Lab", 5],
      ["9 - Electrical Workshop", 7],
      ["9A - Department Office", 4],
      ["10 - Girls Toilet", 3],
      ["11 - Ladies Toilet", 3],
      ["12 - HOD Room", 3]
    ];

    let z = -16;
    left.forEach(([n, d]) => {
      room(n, -37.5, z + d / 2, 9, d, "east");
      z += d;
    });

    // Right side (Pantry intentionally omitted)
    const right = [
      ["23 - Sick Room", 4],
      ["24 - Staff Toilet", 5],
      ["25 - Microprocessor Lab IF", 5],
      ["26 - Microprocessor Lab CO", 5],
      ["27 - Hardware Lab IF", 5],
      ["28 - Hardware Lab CO", 5]
    ];

    z = -17;
    right.forEach(([n, d]) => {
      room(n, 37.5, z + d / 2, 9, d, "west");
      z += d;
    });

    // Bottom row
    const bottom = [
      ["6 - Programming Lab", 10],
      ["5 - Computer Network Lab", 10],
      ["4 - Principal Room", 7],
      ["3 - Board Room", 7],
      ["2 - Administrative Office", 10],
      ["1 - Administrative Office", 12]
    ];

    x = -28;
    bottom.forEach(([n, w]) => {
      room(n, x + w / 2, 16.5, w, 9, "north");
      x += w;
    });

    // Garden
    box(60, 0.12, 22, 0, -0.025, 0, mats.garden);
    label("OPEN TO SKY - GARDEN LAWN", 0, 0, 20);

    // Corridors
    box(84, 0.1, 3, 0, 0.055, -13.5, mats.corridor);
    box(84, 0.1, 3, 0, 0.055, 22.5, mats.corridor);
    box(3, 0.1, 24, -31.5, 0.055, 0, mats.corridor);
    box(3, 0.1, 24, 31.5, 0.055, 0, mats.corridor);

    // Staircase 1 - bottom gap between Room 1 and Room 28
    for (let i = 0; i < 8; i++) {
      box(
        0.65, 0.25, 5,
        28.3 + i * 0.6,
        0.15 + i * 0.2,
        16.5,
        mats.stair
      );
    }

    label("STAIRCASE 1", 30.5, 16.5, 5);

    // Staircase 2
    for (let i = 0; i < 8; i++) {
      box(
        5, 0.25, 0.8,
        30,
        0.15 + i * 0.2,
        -10 + i * 0.8,
        mats.stair
      );
    }

    label("STAIRCASE 2", 30, -12, 6);

    // Entrance
    box(8, 0.15, 1.5, 0, 0.1, 24, mats.entrance);
    label("MAIN ENTRANCE", 0, 23, 8);

    console.log("Ground Floor created.");
  }

  window.Campus3D.registerFloor("ground", buildGroundFloor);

})();