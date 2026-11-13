import * as THREE from "three";

// Piezas compartidas por las dos escenas 3D del banner de Grifería (ducha.ts y lavamanos.ts), portadas del
// prototipo aprobado (banner-griferia.html): render, estudio de luces, materiales y texturas. Solo se cargan desde
// GriferiaAgua.tsx con import() dinámico, así Three.js no pesa en el resto de la página.

/** Estado del agua: abierta o no, cuánto (0..1, suavizado) y temperatura (0 fría, 1 caliente; obj = destino). */
export type Estado = { abierta: boolean; apertura: number; obj: number; act: number };

/** Lo que cada escena le ofrece al componente. */
export type Escena3D = {
  encuadrar: (ancho: number, alto: number, movil: boolean) => void;
  /** Aplica el estado (giro de pomos, opacidad del agua, color de la luz, vapor). */
  actualizar: (st: Estado) => void;
  /** Avanza las partículas del agua (solo mientras está abierta). */
  avanzar: (dt: number, t: number) => void;
  dibujar: () => void;
  /** Dónde va la etiqueta de temperatura, en coordenadas normalizadas de la cámara (-1..1). */
  etiqueta: () => { x: number; y: number };
  /** Libera todo (geometrías, materiales, texturas y el contexto WebGL). */
  liberar: () => void;
};

export function crearRender(lienzo: HTMLCanvasElement) {
  const r = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFShadowMap;
  return r;
}

/** Estudio oscuro con cajas de luz: el cromo refleja franjas brillantes sobre fondo oscuro (foto de producto). */
export function entorno(render: THREE.WebGLRenderer, escena: THREE.Scene, intensidad = 1) {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(12, 7, 12), new THREE.MeshBasicMaterial({ color: 0x0c0e11, side: THREE.BackSide })));
  const panel = (w: number, h: number, x: number, y: number, z: number, rx: number, ry: number, k: number, tinte = [1, 1, 1]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(k * tinte[0], k * tinte[1], k * tinte[2]), side: THREE.DoubleSide }),
    );
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    env.add(m);
  };
  panel(5, 1.2, 0, 3.4, 0.5, Math.PI / 2, 0, 6, [1, 0.97, 0.92]); // cenital
  panel(0.7, 4.5, -5.9, 0.5, 1, 0, Math.PI / 2, 4); // franja izquierda
  panel(0.5, 4.5, 5.9, 0.5, -1, 0, -Math.PI / 2, 3); // franja derecha
  panel(3, 1.4, -1.2, 1.2, 5.9, 0, Math.PI, 2.2); // frente (lado de la cámara)
  panel(1.2, 3, 2.6, 0.8, 5.9, 0, Math.PI, 1.2, [0.9, 0.95, 1]);
  const pm = new THREE.PMREMGenerator(render);
  escena.environment = pm.fromScene(env, 0.02).texture;
  escena.environmentIntensity = intensidad;
  pm.dispose();
  liberarObjetos(env);
}

export const M = {
  cromo: () => new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.05 }),
  cromoSat: () => new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.28 }),
  goma: () => new THREE.MeshStandardMaterial({ color: 0x14181c, metalness: 0.1, roughness: 0.55 }),
  color: (hex: number) => new THREE.MeshStandardMaterial({ color: hex, metalness: 0.1, roughness: 0.25 }),
  ceramica: () => new THREE.MeshPhysicalMaterial({ color: 0xf3f3f0, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04 }),
};

type OpcionesLosas = {
  ancho?: number;
  alto?: number;
  cols?: number;
  filas?: number;
  desfase?: number;
  base?: string;
  varia?: number;
  junta?: string;
  grosor?: number;
  vetas?: boolean;
  brillo?: number;
};

/** Textura de losas / azulejos con junta y una leve veta. */
export function texLosas({
  ancho = 1024,
  alto = 512,
  cols = 4,
  filas = 4,
  desfase = 0,
  base = "#2f343a",
  varia = 10,
  junta = "#0d0f11",
  grosor = 3,
  vetas = true,
  brillo = 0.05,
}: OpcionesLosas) {
  const c = document.createElement("canvas");
  c.width = ancho;
  c.height = alto;
  const g = c.getContext("2d")!;
  g.fillStyle = junta;
  g.fillRect(0, 0, ancho, alto);
  const tw = ancho / cols,
    th = alto / filas;
  for (let f = 0; f < filas; f++)
    for (let k = -1; k <= cols; k++) {
      const x = k * tw + (f % 2 ? desfase * tw : 0),
        y = f * th;
      const v = (Math.random() - 0.5) * varia;
      const col = new THREE.Color(base);
      col.offsetHSL(0, 0, v / 255);
      const gr = g.createLinearGradient(x, y, x + tw, y + th);
      gr.addColorStop(0, "#" + col.clone().offsetHSL(0, 0, 0.012).getHexString());
      gr.addColorStop(1, "#" + col.clone().offsetHSL(0, 0, -0.012).getHexString());
      g.fillStyle = gr;
      g.fillRect(x + grosor / 2, y + grosor / 2, tw - grosor, th - grosor);
      g.fillStyle = `rgba(255,255,255,${brillo})`;
      g.fillRect(x + grosor, y + grosor, tw - grosor * 2, 2);
      if (vetas) {
        g.strokeStyle = "rgba(200,205,210,.06)";
        g.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          g.beginPath();
          g.moveTo(x, y + Math.random() * th);
          g.bezierCurveTo(x + tw * 0.3, y + Math.random() * th, x + tw * 0.6, y + Math.random() * th, x + tw, y + Math.random() * th);
          g.stroke();
        }
      }
    }
  const im = g.getImageData(0, 0, ancho, alto);
  for (let i = 0; i < im.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    im.data[i] += n;
    im.data[i + 1] += n;
    im.data[i + 2] += n;
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Mancha radial suave (vapor). */
export function texSuave() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function cil(rt: number, rb: number, h: number, mat: THREE.Material, seg = 48) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function sombra<T extends THREE.Object3D>(o: T) {
  o.traverse((n) => {
    if ((n as THREE.Mesh).isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
  });
  return o;
}

/** Libera geometrías, materiales y sus texturas de todo lo que cuelga de `raiz`. */
function liberarObjetos(raiz: THREE.Object3D) {
  raiz.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
      mat.dispose();
    }
  });
}

/**
 * Libera la escena entera y el render (al salir del inicio). Sin forceContextLoss(): Chrome cuenta cada pérdida de
 * contexto provocada por la página y, tras unas cuantas, bloquea WebGL en toda la página.
 */
export function liberarTodo(escena: THREE.Scene, render: THREE.WebGLRenderer) {
  liberarObjetos(escena);
  escena.environment?.dispose();
  render.dispose();
}
