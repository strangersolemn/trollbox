// The Trollbox computer: beige CRT + keyboard, built around the screen canvas.
// Group origin = the desk surface, centred under the monitor. Screen faces +z.
function makeTrollboxComputer(THREE, screenCanvas) {
  const g = new THREE.Group();
  const beige = new THREE.MeshStandardMaterial({ color: "#d8cfb4", roughness: 0.75 });
  const beigeDark = new THREE.MeshStandardMaterial({ color: "#bdb295", roughness: 0.8 });

  const mon = new THREE.Group(); mon.position.set(0, 0, -0.2); g.add(mon);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.55), beigeDark); base.position.y = 0.03; mon.add(base);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.3), beigeDark); neck.position.y = 0.12; mon.add(neck);
  const head = new THREE.Group(); head.position.y = 0.66; mon.add(head);
  const front = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.98, 0.22), beige); front.position.z = 0.22; head.add(front);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.78, 0.55), beigeDark); back.position.z = -0.15; head.add(back);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.8), new THREE.MeshStandardMaterial({ color: "#1a1a17", roughness: 0.4 }));
  bezel.position.set(0, 0.04, 0.331); head.add(bezel);
  const tex = new THREE.CanvasTexture(screenCanvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.705), new THREE.MeshBasicMaterial({ map: tex }));
  screenMesh.position.set(0, 0.04, 0.334); head.add(screenMesh);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), new THREE.MeshBasicMaterial({ color: "#5cff7a" }));
  led.position.set(0.5, -0.42, 0.332); head.add(led);
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.03), new THREE.MeshBasicMaterial({ color: "#8a8270" }));
  badge.position.set(-0.4, -0.42, 0.332); head.add(badge);

  const glow = new THREE.PointLight("#66ff99", 0.35, 1.6); glow.position.set(0, 0.61, 0.4); g.add(glow);

  const kb = new THREE.Group(); kb.position.set(0, 0.02, 0.5); kb.rotation.x = 0.06; g.add(kb);
  kb.add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 0.34), beigeDark));
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.058, 0.025, 0.058), beige, 75);
  const m = new THREE.Matrix4(), dip = new Float32Array(75);
  kb.add(keys);
  function updateKeys() {
    let i = 0;
    for (let row = 0; row < 5; row++) for (let col = 0; col < 15; col++, i++) {
      dip[i] *= 0.82;
      m.makeTranslation(-0.455 + col * 0.065, 0.03 - dip[i] * 0.014, -0.13 + row * 0.065);
      keys.setMatrixAt(i, m);
    }
    keys.instanceMatrix.needsUpdate = true;
  }
  updateKeys();

  return {
    group: g,
    screenMesh,
    screenCenter: new THREE.Vector3(0, 0.70, 0.134), // local, relative to group
    press() { dip[Math.floor(Math.random() * 75)] = 1; },
    update(t) {
      tex.needsUpdate = true;
      updateKeys();
      glow.intensity = 0.35 + Math.sin(t * 50) * 0.02;
    },
  };
}
