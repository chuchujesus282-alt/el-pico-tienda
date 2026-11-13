import * as THREE from "three";
import { M, cil, crearRender, entorno, liberarTodo, sombra, texLosas, texSuave, type Escena3D, type Estado } from "./comun";

// Escena "ducha" del banner de Grifería (prototipo aprobado): pared de losas, regadera tipo lluvia, mezcladora de dos
// pomos (azul y rojo), barra con teleducha, mampara de vidrio y drenaje lineal. Al abrir el agua cae la lluvia; los
// pomos giran según la temperatura, la luz se vuelve fría o cálida y, con agua caliente, sube vapor y se empaña el vidrio.

export function crearEscena(lienzo: HTMLCanvasElement): Escena3D {
  const render = crearRender(lienzo);
  const escena = new THREE.Scene();
  entorno(render, escena, 1);
  const cam = new THREE.PerspectiveCamera(26, 3, 0.05, 30);
  const XC = 0.72; // centro de la ducha (a la derecha del texto)

  /* Pared y piso */
  const tPared = texLosas({ cols: 2, filas: 4, desfase: 0, base: "#363b41", varia: 8, grosor: 4 });
  tPared.repeat.set(6, 3);
  const pared = new THREE.Mesh(
    new THREE.PlaneGeometry(9.6, 3.6),
    new THREE.MeshStandardMaterial({ map: tPared, roughness: 0.32, metalness: 0, envMapIntensity: 0.35 }),
  );
  pared.position.set(0, 1.8, 0);
  pared.receiveShadow = true;
  escena.add(pared);
  const tPiso = texLosas({ cols: 4, filas: 4, base: "#24282d", varia: 6, grosor: 5, brillo: 0.02 });
  tPiso.repeat.set(10, 4);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 4), new THREE.MeshStandardMaterial({ map: tPiso, roughness: 0.45, envMapIntensity: 0.3 }));
  piso.rotation.x = -Math.PI / 2;
  piso.position.set(0, 0, 2);
  piso.receiveShadow = true;
  escena.add(piso);

  /* Drenaje lineal */
  const dren = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.006, 0.06), M.cromoSat());
  dren.position.set(XC, 0.003, 0.35);
  dren.receiveShadow = true;
  escena.add(dren);
  for (let i = 0; i < 24; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.007, 0.03), M.goma());
    s.position.set(XC - 0.28 + i * 0.0245, 0.004, 0.35);
    escena.add(s);
  }

  /* Regadera tipo lluvia desde el techo */
  const reg = new THREE.Group();
  reg.add(cil(0.011, 0.011, 0.5, M.cromo()).translateY(0.27));
  const cuello = cil(0.022, 0.018, 0.03, M.cromo());
  cuello.position.y = 0.02;
  reg.add(cuello);
  reg.add(cil(0.15, 0.15, 0.012, M.cromo(), 96));
  const cara = new THREE.Mesh(new THREE.CircleGeometry(0.138, 96), M.goma());
  cara.rotation.x = Math.PI / 2;
  cara.position.y = -0.0065;
  reg.add(cara);
  const boq = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.004, 10), M.cromoSat(), 200);
  let nb = 0;
  const mm = new THREE.Matrix4();
  for (let r = 0.02; r < 0.13; r += 0.02) {
    const n = Math.floor((2 * Math.PI * r) / 0.019);
    for (let i = 0; i < n && nb < 200; i++) {
      const a = (i / n) * Math.PI * 2;
      mm.makeTranslation(Math.cos(a) * r, -0.008, Math.sin(a) * r);
      boq.setMatrixAt(nb++, mm);
    }
  }
  boq.count = nb;
  reg.add(boq);
  reg.position.set(XC, 1.3, 0.3);
  reg.traverse((n) => {
    n.castShadow = false;
  });
  escena.add(reg);

  /* Mezcladora de dos pomos */
  const mez = new THREE.Group();
  const barra = cil(0.021, 0.021, 0.3, M.cromo());
  barra.rotation.z = Math.PI / 2;
  barra.position.z = 0.075;
  mez.add(barra);
  const pomos: Record<"frio" | "caliente", THREE.Group> = { frio: new THREE.Group(), caliente: new THREE.Group() };
  for (const [lado, colorTapa] of [
    [-1, 0x2a6fd1],
    [1, 0xd8262c],
  ] as const) {
    const x = lado * 0.15;
    const ros = cil(0.05, 0.052, 0.012, M.cromo(), 64);
    ros.rotation.x = Math.PI / 2;
    ros.position.set(x, 0, 0.006);
    mez.add(ros);
    const cuerpo = cil(0.034, 0.034, 0.1, M.cromo(), 48);
    cuerpo.rotation.x = Math.PI / 2;
    cuerpo.position.set(x, 0, 0.06);
    mez.add(cuerpo);
    const p = new THREE.Group();
    p.position.set(x, 0, 0.115);
    const cubo = cil(0.02, 0.024, 0.03, M.cromo(), 48);
    cubo.rotation.x = Math.PI / 2;
    p.add(cubo);
    for (let i = 0; i < 4; i++) {
      const brazo = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, 0.05, 8, 16), M.cromo());
      brazo.castShadow = true;
      brazo.position.set(Math.cos((i * Math.PI) / 2) * 0.036, Math.sin((i * Math.PI) / 2) * 0.036, 0.004);
      brazo.rotation.z = (i * Math.PI) / 2 + Math.PI / 2;
      p.add(brazo);
      const bola = new THREE.Mesh(new THREE.SphereGeometry(0.012, 24, 16), M.cromo());
      bola.position.set(Math.cos((i * Math.PI) / 2) * 0.066, Math.sin((i * Math.PI) / 2) * 0.066, 0.004);
      p.add(bola);
    }
    const tapa = cil(0.011, 0.011, 0.004, M.color(colorTapa), 32);
    tapa.rotation.x = Math.PI / 2;
    tapa.position.z = 0.0165;
    p.add(tapa);
    mez.add(p);
    pomos[lado < 0 ? "frio" : "caliente"] = p;
  }
  const salida = cil(0.014, 0.014, 0.05, M.cromo());
  salida.position.set(0, -0.03, 0.075);
  mez.add(salida);
  const tuerca = cil(0.017, 0.017, 0.016, M.cromoSat(), 6);
  tuerca.position.set(0, -0.058, 0.075);
  mez.add(tuerca);
  mez.position.set(XC, 0.82, 0);
  sombra(mez);
  escena.add(mez);

  /* Barra deslizante + teleducha + manguera */
  const BX = XC + 0.56;
  const barraD = cil(0.011, 0.011, 0.82, M.cromo());
  barraD.position.set(BX, 0.86, 0.045);
  escena.add(barraD);
  for (const y of [0.45, 1.27]) {
    const s = cil(0.014, 0.016, 0.045, M.cromo());
    s.rotation.x = Math.PI / 2;
    s.position.set(BX, y, 0.022);
    escena.add(s);
  }
  const sop = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.03), M.cromo());
  sop.position.set(BX, 1.06, 0.06);
  sop.castShadow = true;
  escena.add(sop);
  const tele = new THREE.Group();
  const mango = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.15, 8, 24), M.cromo());
  mango.position.y = -0.09;
  tele.add(mango);
  const cab = cil(0.048, 0.04, 0.028, M.cromo(), 64);
  cab.rotation.x = Math.PI / 2 - 0.5;
  cab.position.set(0, 0.015, 0.012);
  tele.add(cab);
  const caraT = new THREE.Mesh(new THREE.CircleGeometry(0.04, 48), M.goma());
  caraT.position.set(0, 0.019, 0.027);
  caraT.rotation.x = -0.5;
  tele.add(caraT);
  tele.position.set(BX - 0.005, 1.1, 0.085);
  tele.rotation.z = 0.28;
  sombra(tele);
  escena.add(tele);
  const curva = new THREE.CatmullRomCurve3([
    new THREE.Vector3(XC, 0.755, 0.075),
    new THREE.Vector3(XC + 0.02, 0.5, 0.14),
    new THREE.Vector3(XC + 0.2, 0.3, 0.17),
    new THREE.Vector3(XC + 0.45, 0.36, 0.14),
    new THREE.Vector3(BX - 0.02, 0.62, 0.1),
    new THREE.Vector3(tele.position.x + 0.02, 1.0, 0.085),
  ]);
  const manguera = new THREE.Mesh(
    new THREE.TubeGeometry(curva, 120, 0.0085, 16),
    new THREE.MeshStandardMaterial({ color: 0xc8ced4, metalness: 1, roughness: 0.38 }),
  );
  manguera.castShadow = true;
  escena.add(manguera);

  /* Mampara de vidrio lateral (en perspectiva) */
  const vidrioMat = new THREE.MeshPhysicalMaterial({
    color: 0xdfe9f0,
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.12,
    envMapIntensity: 1.4,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const vidrio = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.1), vidrioMat);
  vidrio.rotation.y = Math.PI / 2;
  vidrio.position.set(XC - 0.62, 1.05, 0.475);
  vidrio.renderOrder = 2;
  escena.add(vidrio);
  const perfil = cil(0.012, 0.012, 2.1, M.cromoSat());
  perfil.position.set(XC - 0.62, 1.05, 0.95);
  escena.add(perfil);
  const perfilP = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.1, 0.02), M.cromo());
  perfilP.position.set(XC - 0.62, 1.05, 0.01);
  escena.add(perfilP);
  for (const y of [0.35, 1.7]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.05), M.cromo());
    b.position.set(XC - 0.62, y, 0.03);
    escena.add(b);
  }

  /* Luces */
  escena.add(new THREE.HemisphereLight(0xdfe8f0, 0x101214, 0.45));
  const foco = new THREE.SpotLight(0xfff1dc, 34, 6, 0.6, 0.9, 1.6);
  foco.position.set(XC + 0.15, 2.5, 1.5);
  foco.target.position.set(XC, 0.8, 0);
  foco.castShadow = true;
  foco.shadow.mapSize.set(2048, 2048);
  foco.shadow.bias = -0.0004;
  foco.shadow.radius = 9;
  foco.shadow.blurSamples = 16;
  escena.add(foco, foco.target);
  const relleno = new THREE.PointLight(0xf2f4f7, 0.7, 5);
  relleno.position.set(XC - 0.4, 1.3, 2.4);
  escena.add(relleno);

  /* Lluvia (partículas en líneas) y salpicaduras */
  const N = 1400,
    pos = new Float32Array(N * 6),
    vel = new Float32Array(N),
    ori = new Float32Array(N * 2);
  const colocar = (i: number, y: number) => {
    const k = (1.29 - y) * 0.2;
    const x = XC + ori[i * 2] * (1 + k),
      z = 0.3 + ori[i * 2 + 1] * (1 + k);
    pos.set([x, y, z, x, y - 0.045, z], i * 6);
  };
  const nacer = (i: number, y?: number) => {
    const a = Math.random() * Math.PI * 2,
      r = Math.sqrt(Math.random()) * 0.13;
    ori[i * 2] = Math.cos(a) * r;
    ori[i * 2 + 1] = Math.sin(a) * r;
    vel[i] = 2.6 + Math.random() * 2.2;
    colocar(i, y ?? 1.29 - Math.random() * 1.29);
  };
  for (let i = 0; i < N; i++) nacer(i);
  const gl = new THREE.BufferGeometry();
  gl.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const matLluvia = new THREE.LineBasicMaterial({ color: 0xe6f2ff, transparent: true, opacity: 0, depthWrite: false });
  const lluvia = new THREE.LineSegments(gl, matLluvia);
  lluvia.frustumCulled = false;
  escena.add(lluvia);
  const NS = 120,
    sp = new Float32Array(NS * 3),
    vida = new Float32Array(NS);
  const gs = new THREE.BufferGeometry();
  gs.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const matSalp = new THREE.PointsMaterial({ color: 0xffffff, size: 0.012, transparent: true, opacity: 0, depthWrite: false });
  const salp = new THREE.Points(gs, matSalp);
  salp.frustumCulled = false;
  escena.add(salp);
  for (let i = 0; i < NS; i++) vida[i] = Math.random();

  /* Vapor (sprites suaves que suben) */
  const tS = texSuave();
  const humos: THREE.Sprite[] = [];
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tS, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    s.userData = { x: XC + (Math.random() - 0.5) * 0.9, z: 0.3 + Math.random() * 0.5, t: Math.random() };
    humos.push(s);
    escena.add(s);
  }

  const cFrio = new THREE.Color(0xd2e6ff),
    cCal = new THREE.Color(0xffd6a6),
    cNeu = new THREE.Color(0xfff1dc),
    tmp = new THREE.Color();

  return {
    encuadrar(ancho, alto, movil) {
      render.setSize(ancho, alto, false);
      cam.aspect = ancho / alto;
      cam.fov = movil ? 40 : 28;
      cam.position.set(movil ? XC + 0.05 : 0, 0.98, movil ? 2.5 : 2.35);
      cam.lookAt(movil ? XC + 0.05 : 0, 0.84, 0);
      cam.updateProjectionMatrix();
    },
    actualizar(st: Estado) {
      pomos.frio.rotation.z = st.apertura * (1 - st.act) * 1.9;
      pomos.caliente.rotation.z = -st.apertura * st.act * 1.9;
      matLluvia.opacity = st.apertura * 0.5;
      matSalp.opacity = st.apertura * 0.7;
      matLluvia.color.set(st.act < 0.5 ? 0xd6ebff : 0xfff3e8);
      tmp.copy(cNeu).lerp(st.act < 0.5 ? cFrio : cCal, Math.abs(st.act - 0.5) * 2 * st.apertura);
      foco.color.copy(tmp);
      const calor = Math.max(0, (st.act - 0.5) / 0.5) * st.apertura;
      vidrioMat.opacity = 0.12 + calor * 0.22;
      vidrioMat.roughness = 0.04 + calor * 0.5;
      humos.forEach((s) => (s.material.opacity = calor * 0.1));
    },
    avanzar(dt) {
      for (let i = 0; i < N; i++) {
        const y = pos[i * 6 + 1] - vel[i] * dt;
        if (y < 0.02) nacer(i, 1.29 - Math.random() * 0.03);
        else colocar(i, y);
      }
      gl.attributes.position.needsUpdate = true;
      for (let i = 0; i < NS; i++) {
        vida[i] -= dt * 3;
        if (vida[i] < 0) {
          vida[i] = 1;
          sp[i * 3] = XC + (Math.random() - 0.5) * 0.34;
          sp[i * 3 + 2] = 0.3 + (Math.random() - 0.5) * 0.34;
        }
        sp[i * 3 + 1] = 0.01 + Math.sin(vida[i] * Math.PI) * 0.03;
      }
      gs.attributes.position.needsUpdate = true;
      humos.forEach((s) => {
        const u = s.userData as { x: number; z: number; t: number };
        u.t = (u.t + dt * 0.08) % 1;
        s.position.set(u.x + Math.sin(u.t * 6) * 0.05, 0.1 + u.t * 1.5, u.z);
        const e = 0.5 + u.t * 1.1;
        s.scale.set(e, e, 1);
      });
    },
    dibujar: () => render.render(escena, cam),
    etiqueta() {
      const p = new THREE.Vector3(XC + 0.17, 1.3, 0.3).project(cam);
      return { x: p.x, y: p.y };
    },
    liberar: () => liberarTodo(escena, render),
  };
}
