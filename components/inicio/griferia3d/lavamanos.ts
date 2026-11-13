import * as THREE from "three";
import { M, cil, crearRender, entorno, liberarTodo, sombra, texLosas, texSuave, type Escena3D, type Estado } from "./comun";

// Escena "lavamanos" del banner de Grifería (prototipo aprobado): pared de azulejos tipo metro, mesón de piedra con
// mueble, lavamanos de sobreponer, monomando alto, dispensador de jabón y toallero de aro. Al abrir el agua la palanca
// se levanta y gira según la temperatura, sale el chorro y, con agua caliente, sube vapor.

export function crearEscena(lienzo: HTMLCanvasElement): Escena3D {
  const render = crearRender(lienzo);
  const escena = new THREE.Scene();
  entorno(render, escena, 1);
  const cam = new THREE.PerspectiveCamera(28, 3, 0.05, 30);
  const XC = 0.72,
    MESA = 0.82,
    BZ = 0.3; // centro, altura del mesón, profundidad del lavamanos

  /* Pared de azulejos tipo metro (brillantes) */
  const tPared = texLosas({ ancho: 1024, alto: 1024, cols: 4, filas: 8, desfase: 0.5, base: "#2b3137", varia: 3, grosor: 6, vetas: false, brillo: 0.05 });
  tPared.repeat.set(20, 10);
  const pared = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 4.8), new THREE.MeshStandardMaterial({ map: tPared, roughness: 0.16, envMapIntensity: 0.45 }));
  pared.position.set(0, 2.4, 0);
  pared.receiveShadow = true;
  escena.add(pared);

  /* Mesón de piedra oscura + mueble */
  const tPiedra = texLosas({ ancho: 1024, alto: 256, cols: 1, filas: 1, base: "#2b2d30", varia: 0, grosor: 0, vetas: true, brillo: 0 });
  tPiedra.repeat.set(3, 1);
  const piedra = new THREE.MeshStandardMaterial({ map: tPiedra, roughness: 0.22, envMapIntensity: 0.6 });
  const meson = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.05, 0.6), piedra);
  meson.position.set(XC, MESA - 0.025, 0.3);
  meson.receiveShadow = true;
  meson.castShadow = true;
  escena.add(meson);
  const mueble = new THREE.Mesh(new THREE.BoxGeometry(4.2, MESA - 0.05, 0.56), new THREE.MeshStandardMaterial({ color: 0x15181b, roughness: 0.5 }));
  mueble.position.set(XC, (MESA - 0.05) / 2, 0.27);
  mueble.receiveShadow = true;
  escena.add(mueble);
  const tirador = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.012, 0.012), M.cromoSat());
  tirador.position.set(XC, MESA - 0.12, 0.56);
  escena.add(tirador);

  /* Lavamanos de sobreponer (cerámica) */
  const perfil = (
    [
      [0, 0],
      [0.07, 0],
      [0.12, 0.008],
      [0.165, 0.03],
      [0.192, 0.07],
      [0.2, 0.115],
      [0.201, 0.13],
      [0.194, 0.131],
      [0.188, 0.11],
      [0.178, 0.07],
      [0.152, 0.038],
      [0.11, 0.02],
      [0, 0.016],
    ] as const
  ).map(([x, y]) => new THREE.Vector2(x, y));
  const ceramica = M.ceramica();
  ceramica.side = THREE.DoubleSide;
  const cuenco = new THREE.Mesh(new THREE.LatheGeometry(perfil, 128), ceramica);
  cuenco.position.set(XC, MESA, BZ);
  cuenco.castShadow = true;
  cuenco.receiveShadow = true;
  escena.add(cuenco);
  const desague = cil(0.022, 0.022, 0.004, M.cromo(), 48);
  desague.position.set(XC, MESA + 0.018, BZ);
  escena.add(desague);

  /* Monomando alto: cuerpo, caño curvo hacia el lavamanos y palanca superior */
  const GZ = 0.06,
    TIP = 0.24,
    ALTO = 0.3;
  const grifo = new THREE.Group();
  grifo.position.set(XC, MESA, GZ);
  grifo.add(cil(0.034, 0.036, 0.012, M.cromo(), 64).translateY(0.006));
  const cuerpo = cil(0.023, 0.025, ALTO - 0.02, M.cromo(), 64);
  cuerpo.position.y = (ALTO - 0.02) / 2 + 0.01;
  grifo.add(cuerpo);
  const curvaC = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, ALTO - 0.04, 0),
    new THREE.Vector3(0, ALTO + 0.005, 0.015),
    new THREE.Vector3(0, ALTO + 0.012, 0.07),
    new THREE.Vector3(0, ALTO + 0.006, 0.16),
    new THREE.Vector3(0, ALTO - 0.012, TIP),
  ]);
  grifo.add(new THREE.Mesh(new THREE.TubeGeometry(curvaC, 96, 0.0125, 32), M.cromo()));
  const tapaS = new THREE.Mesh(new THREE.SphereGeometry(0.0235, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.cromo());
  tapaS.position.y = ALTO - 0.01;
  grifo.add(tapaS);
  const punta = cil(0.0135, 0.0135, 0.016, M.cromo(), 48);
  punta.position.set(0, ALTO - 0.02, TIP);
  grifo.add(punta);
  const aireador = new THREE.Mesh(new THREE.CircleGeometry(0.0095, 32), M.goma());
  aireador.rotation.x = Math.PI / 2;
  aireador.position.set(0, ALTO - 0.0285, TIP);
  grifo.add(aireador);
  const palanca = new THREE.Group();
  palanca.position.set(0, ALTO - 0.045, -0.022);
  const eje = cil(0.013, 0.013, 0.02, M.cromo(), 32);
  eje.rotation.x = Math.PI / 2;
  palanca.add(eje);
  const brazo = new THREE.Mesh(new THREE.CapsuleGeometry(0.0065, 0.085, 8, 24), M.cromo());
  brazo.position.set(0, 0.045, -0.012);
  brazo.rotation.x = -0.25;
  palanca.add(brazo);
  grifo.add(palanca);
  sombra(grifo);
  escena.add(grifo);
  for (const [x, c] of [
    [-0.018, 0x2a6fd1],
    [0.018, 0xd8262c],
  ] as const) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 16, 12), M.color(c));
    p.position.set(XC + x, MESA + ALTO - 0.045, GZ + 0.014);
    escena.add(p);
  }

  /* Chorro de agua (cilindro translúcido con textura que fluye) */
  const cTex = document.createElement("canvas");
  cTex.width = 64;
  cTex.height = 256;
  const gx = cTex.getContext("2d")!;
  for (let i = 0; i < 64; i++) {
    gx.fillStyle = `rgba(255,255,255,${(0.15 + Math.random() * 0.6).toFixed(2)})`;
    gx.fillRect(Math.random() * 64, Math.random() * 256, 1 + Math.random() * 3, 20 + Math.random() * 60);
  }
  const tAgua = new THREE.CanvasTexture(cTex);
  tAgua.wrapS = tAgua.wrapT = THREE.RepeatWrapping;
  tAgua.repeat.set(2, 2);
  const matAgua = new THREE.MeshPhysicalMaterial({
    color: 0xeaf4ff,
    map: tAgua,
    emissive: 0x1d2a36,
    transparent: true,
    opacity: 0,
    roughness: 0.05,
    metalness: 0,
    envMapIntensity: 2,
    depthWrite: false,
  });
  const altoChorro = ALTO - 0.03 - 0.018;
  const chorro = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0072, altoChorro, 24, 1, true), matAgua);
  chorro.position.set(XC, MESA + 0.018 + altoChorro / 2, GZ + TIP);
  escena.add(chorro);
  const anillo = new THREE.Mesh(
    new THREE.RingGeometry(0.008, 0.03, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }),
  );
  anillo.rotation.x = -Math.PI / 2;
  anillo.position.set(XC, MESA + 0.021, GZ + TIP);
  escena.add(anillo);

  /* Accesorios: dispensador de jabón y toallero de aro */
  const disp = new THREE.Group();
  disp.position.set(XC + 0.44, MESA, 0.3);
  const frasco = cil(
    0.034,
    0.034,
    0.13,
    new THREE.MeshPhysicalMaterial({ color: 0x9fb3a6, roughness: 0.08, transparent: true, opacity: 0.55, envMapIntensity: 1.5 }),
    48,
  );
  frasco.position.y = 0.065;
  disp.add(frasco);
  const liquido = cil(0.03, 0.03, 0.09, M.color(0x5f7d6a), 32);
  liquido.position.y = 0.047;
  disp.add(liquido);
  const bomba = cil(0.014, 0.018, 0.03, M.cromo(), 32);
  bomba.position.y = 0.145;
  disp.add(bomba);
  const boq = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.01, 0.05), M.cromo());
  boq.position.set(0, 0.162, 0.02);
  disp.add(boq);
  sombra(disp);
  escena.add(disp);
  const aro = new THREE.Group();
  aro.position.set(XC + 0.58, 1.32, 0);
  const base = cil(0.025, 0.025, 0.03, M.cromo(), 48);
  base.rotation.x = Math.PI / 2;
  base.position.z = 0.015;
  aro.add(base);
  const brazoA = cil(0.008, 0.008, 0.05, M.cromo(), 24);
  brazoA.rotation.x = Math.PI / 2;
  brazoA.position.set(0, 0, 0.045);
  aro.add(brazoA);
  const anilloT = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.008, 24, 96), M.cromo());
  anilloT.position.set(0, -0.09, 0.07);
  aro.add(anilloT);
  sombra(aro);
  escena.add(aro);

  /* Luces */
  escena.add(new THREE.HemisphereLight(0xdfe8f0, 0x101214, 0.6));
  const foco = new THREE.SpotLight(0xfff1dc, 30, 6, 0.6, 0.9, 1.6);
  foco.position.set(XC + 0.15, 2.4, 1.4);
  foco.target.position.set(XC, MESA, 0.2);
  foco.castShadow = true;
  foco.shadow.mapSize.set(2048, 2048);
  foco.shadow.bias = -0.0004;
  foco.shadow.radius = 9;
  foco.shadow.blurSamples = 16;
  escena.add(foco, foco.target);

  /* Vapor */
  const tS = texSuave();
  const humos: THREE.Sprite[] = [];
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tS, transparent: true, opacity: 0, depthWrite: false }));
    s.userData = { x: XC + (Math.random() - 0.5) * 0.25, z: BZ + (Math.random() - 0.5) * 0.15, t: Math.random() };
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
      cam.fov = movil ? 38 : 28;
      cam.position.set(movil ? XC + 0.05 : 0, 1.36, movil ? 2.0 : 2.1);
      cam.lookAt(movil ? XC + 0.05 : 0, 0.99, 0);
      cam.updateProjectionMatrix();
    },
    actualizar(st: Estado) {
      palanca.rotation.y = (st.act - 0.5) * 1.4 * Math.max(0.25, st.apertura); // giro = temperatura
      palanca.rotation.x = -st.apertura * 0.45; // levantar = abrir
      matAgua.opacity = Math.min(1, st.apertura * 1.4) * 0.85;
      anillo.material.opacity = st.apertura * 0.35;
      chorro.scale.set(1, Math.max(0.001, Math.min(1, st.apertura * 1.6)), 1);
      chorro.position.y = MESA + ALTO - 0.03 - (altoChorro * chorro.scale.y) / 2;
      matAgua.color.set(st.act < 0.5 ? 0xd9ecff : 0xfff1e2);
      tmp.copy(cNeu).lerp(st.act < 0.5 ? cFrio : cCal, Math.abs(st.act - 0.5) * 2 * st.apertura);
      foco.color.copy(tmp);
      const calor = Math.max(0, (st.act - 0.5) / 0.5) * st.apertura;
      humos.forEach((s) => (s.material.opacity = calor * 0.14));
    },
    avanzar(dt, t) {
      tAgua.offset.y += dt * 2.6;
      const k = 1 + Math.sin(t / 70) * 0.12;
      anillo.scale.set(k, k, 1);
      humos.forEach((s) => {
        const u = s.userData as { x: number; z: number; t: number };
        u.t = (u.t + dt * 0.1) % 1;
        s.position.set(u.x + Math.sin(u.t * 6) * 0.03, MESA + 0.05 + u.t * 0.6, u.z);
        const e = 0.15 + u.t * 0.45;
        s.scale.set(e, e, 1);
      });
    },
    dibujar: () => render.render(escena, cam),
    etiqueta() {
      const p = new THREE.Vector3(XC + 0.07, MESA + ALTO + 0.1, GZ).project(cam);
      return { x: p.x, y: p.y };
    },
    liberar: () => liberarTodo(escena, render),
  };
}
