"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { plexMono } from "./fuentes";
import styles from "./CategoryCardElectricidad.module.css";

// Tarjeta de categoría "Electricidad" con un bombillo 3D (Three.js r128 + GSAP 3.12.5). Portada TAL CUAL del
// prototipo aprobado tarjeta-electricidad.html: geometría, materiales, luces, tiempos y CSS sin cambios.
// Al pasar el mouse (o con el foco del teclado) baja el portalámparas, el bombillo se voltea, se enrosca y prende con
// un parpadeo. Diferencias con el prototipo, acordadas: toda la tarjeta es un <Link> que navega (en el prototipo el
// clic no iba a ningún lado); en el teléfono el 1er toque enciende y el 2º entra; sin window.__demo.

type Props = {
  titulo?: string;
  descripcion?: string;
  href?: string;
  /**
   * Llena el ancho de quien la contiene y escala TODO en proporción (ej. una columna del inicio). Sin ella mide
   * 320×420, como el prototipo.
   */
  escalar?: boolean;
};

/** "Cables, breakers, tomas e iluminación." → "cables, breakers, tomas e iluminación" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

export default function CategoryCardElectricidad({
  titulo = "Electricidad",
  descripcion = "Cables, breakers, tomas e iluminación.",
  href = "#electricidad",
  escalar = false,
}: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- renderer / escena ----------
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- aviso de una sola vez si el navegador no tiene WebGL.
      setAviso("Este navegador no tiene WebGL activo.");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- está en el prototipo (alto visible en z=0), sin uso.
    const VIS_H = 6.43; // alto visible en z=0
    const camera = new THREE.PerspectiveCamera(30, 320 / 420, 0.1, 100);
    camera.position.set(0, 0, 12);

    // entorno de estudio simple para reflejos del vidrio y el metal
    const envScene = new THREE.Scene();
    let envTarget: THREE.WebGLRenderTarget;
    (function buildEnv() {
      envScene.background = new THREE.Color(0x0d2238);
      const panel = (w: number, h: number, color: number, x: number, y: number, z: number, ry?: number) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
        m.position.set(x, y, z);
        m.rotation.y = ry || 0;
        m.lookAt(0, 0, 0);
        envScene.add(m);
      };
      panel(6, 10, 0xffffff, -8, 3, 4);
      panel(3, 8, 0xbfd8ff, 8, 1, 2);
      panel(10, 2, 0xffffff, 0, 9, 0);
      panel(4, 4, 0x6f9fd8, 0, -6, 6);
      const pmrem = new THREE.PMREMGenerator(renderer);
      envTarget = pmrem.fromScene(envScene, 0.02);
      scene.environment = envTarget.texture;
      pmrem.dispose();
    })();

    scene.add(new THREE.HemisphereLight(0xcfe2ff, 0x0a1a2e, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fbaff, 1.0);
    rim.position.set(5, -2, -4);
    scene.add(rim);

    // ---------- bombillo (A60 / E27) ----------
    const bulb = new THREE.Group();

    // vidrio
    const glassPts = [new THREE.Vector2(0.29, -0.02), new THREE.Vector2(0.3, 0.2), new THREE.Vector2(0.315, 0.33)];
    const R = 0.72,
      C = 1.1,
      th0 = -Math.acos(0.33 / R);
    for (let i = 0; i <= 48; i++) {
      const th = th0 + (Math.PI / 2 - th0) * (i / 48);
      glassPts.push(new THREE.Vector2(Math.max(R * Math.cos(th), 0.0001), C + R * Math.sin(th)));
    }
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.6,
      emissive: new THREE.Color(0xffd9a0),
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glass = new THREE.Mesh(new THREE.LatheGeometry(glassPts, 72), glassMat);
    glass.renderOrder = 2;
    bulb.add(glass);

    // rosca E27
    const threadPts: THREE.Vector2[] = [];
    const yTop = 0.02,
      yBot = -0.55,
      steps = 90;
    for (let i = 0; i <= steps; i++) {
      const y = yBot + (yTop - yBot) * (i / steps);
      const ph = ((y - yBot) / 0.092) % 1;
      const tri = 1 - Math.abs(ph * 2 - 1);
      threadPts.push(new THREE.Vector2(0.305 + 0.035 * Math.pow(tri, 0.8), y));
    }
    threadPts.push(new THREE.Vector2(0.335, yTop + 0.02), new THREE.Vector2(0.31, yTop + 0.05));
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4d7dd, metalness: 1, roughness: 0.28, envMapIntensity: 1.3 });
    bulb.add(new THREE.Mesh(new THREE.LatheGeometry(threadPts, 72), metalMat));

    // aislante y contacto
    const insul = new THREE.Mesh(
      new THREE.LatheGeometry(
        [new THREE.Vector2(0.3, -0.55), new THREE.Vector2(0.26, -0.6), new THREE.Vector2(0.17, -0.66), new THREE.Vector2(0.0001, -0.68)],
        48,
      ),
      new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.35, metalness: 0.1 }),
    );
    bulb.add(insul);
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xc9a85a, metalness: 1, roughness: 0.3 }),
    );
    tip.scale.y = 0.45;
    tip.position.y = -0.685;
    bulb.add(tip);

    // vástago de vidrio interior
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.09, 0.55, 24),
      new THREE.MeshPhysicalMaterial({ color: 0xe8f2ff, transparent: true, opacity: 0.35, roughness: 0.1, clearcoat: 1 }),
    );
    stem.position.y = 0.3;
    bulb.add(stem);

    // alambres soporte + filamento en W
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 1, roughness: 0.35 });
    const tube = (pts: THREE.Vector3[], r: number, mat: THREE.Material) =>
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 8, false), mat);
    bulb.add(tube([new THREE.Vector3(-0.03, 0.55, 0), new THREE.Vector3(-0.12, 0.78, 0), new THREE.Vector3(-0.22, 0.97, 0)], 0.008, wireMat));
    bulb.add(tube([new THREE.Vector3(0.03, 0.55, 0), new THREE.Vector3(0.12, 0.78, 0), new THREE.Vector3(0.22, 0.97, 0)], 0.008, wireMat));
    const filMat = new THREE.MeshStandardMaterial({ color: 0xe3262f, emissive: new THREE.Color(0xe3262f), emissiveIntensity: 0.35, roughness: 0.4 });
    const W = new THREE.CurvePath<THREE.Vector3>();
    const wp = [
      [-0.22, 0.97],
      [-0.11, 1.24],
      [0, 1.0],
      [0.11, 1.24],
      [0.22, 0.97],
    ].map((p) => new THREE.Vector3(p[0], p[1], 0));
    for (let i = 0; i < wp.length - 1; i++) W.add(new THREE.LineCurve3(wp[i], wp[i + 1]));
    bulb.add(new THREE.Mesh(new THREE.TubeGeometry(W, 120, 0.02, 8, false), filMat));

    // halo (sprite aditivo)
    const hc = document.createElement("canvas");
    hc.width = hc.height = 128;
    const g = hc.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,240,210,1)");
    grd.addColorStop(0.25, "rgba(255,200,120,0.55)");
    grd.addColorStop(0.6, "rgba(255,160,70,0.12)");
    grd.addColorStop(1, "rgba(255,140,60,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(hc),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    halo.scale.set(3.2, 3.2, 1);
    halo.position.y = 1.1;
    halo.renderOrder = 3;
    bulb.add(halo);

    const bulbLight = new THREE.PointLight(0xffc477, 0, 8, 2);
    bulbLight.position.y = 1.1;
    bulb.add(bulbLight);

    bulb.position.y = -0.57; // centra el bombillo en su pivote

    // jerarquía: anchor (posición) > idle (giro en reposo) > flip (voltear) > screw (enroscar)
    const anchor = new THREE.Group(),
      idle = new THREE.Group(),
      flip = new THREE.Group(),
      screw = new THREE.Group();
    screw.add(bulb);
    flip.add(screw);
    idle.add(flip);
    anchor.add(idle);
    scene.add(anchor);
    anchor.scale.setScalar(1.05);

    // ---------- portalámparas ----------
    const socket = new THREE.Group();
    const porcelain = new THREE.MeshStandardMaterial({ color: 0x1b1e24, roughness: 0.45, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.62, 48), porcelain);
    socket.add(body);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.355, 0.03, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 1, roughness: 0.3 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.28;
    socket.add(ring);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.18, 32), porcelain);
    cap.position.y = 0.4;
    socket.add(cap);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3, 12), new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.6 }));
    cord.position.y = 1.95;
    socket.add(cord);
    socket.scale.setScalar(1.25);
    scene.add(socket);

    // ---------- estado animable ----------
    const IDLE_Y = 1.14,
      SOCK_Y = 2.89,
      FINAL_Y = 1.69;
    const s = { float: 1, flip: 0, y: IDLE_Y, screw: 0, sock: 0, power: 0 };
    let spinOn = !reduce,
      t = 0;

    const warmCol = new THREE.Color(0xffb35c),
      redCol = new THREE.Color(0xe3262f);
    function apply() {
      anchor.position.y = s.y + Math.sin(t * 1.6) * 0.08 * s.float;
      idle.rotation.z = Math.sin(t * 0.9) * 0.05 * s.float;
      flip.rotation.x = s.flip * Math.PI;
      screw.rotation.y = s.screw;
      socket.position.y = SOCK_Y + (1 - s.sock) * 1.6;
      const p = s.power;
      filMat.color.copy(redCol).lerp(warmCol, p);
      filMat.emissive.copy(redCol).lerp(warmCol, p);
      filMat.emissiveIntensity = 0.35 + p * 9;
      glassMat.emissiveIntensity = p * 0.22;
      glassMat.opacity = 0.24 + p * 0.12;
      halo.material.opacity = p;
      bulbLight.intensity = p * 2.4;
      card!.style.setProperty("--p", p.toFixed(3));
      card!.style.setProperty("--f", (s.float * (1 - p)).toFixed(3));
    }

    const tl = gsap.timeline({ paused: true });
    tl.to(s, { float: 0, duration: 0.4, ease: "power2.out" }, 0)
      .to(s, { sock: 1, duration: 0.8, ease: "power3.out" }, 0.05)
      .to(s, { flip: 1, y: 1.3, duration: 0.7, ease: "power2.inOut" }, 0.05)
      .to(s, { y: FINAL_Y, screw: Math.PI * 4, duration: 0.95, ease: "power1.inOut" }, 0.75)
      .to(
        s,
        {
          keyframes: [
            { power: 0.7, duration: 0.05 },
            { power: 0.1, duration: 0.08 },
            { power: 0.85, duration: 0.05 },
            { power: 0.35, duration: 0.07 },
            { power: 1, duration: 0.35, ease: "power2.out" },
          ],
        },
        1.72,
      );
    tl.eventCallback("onReverseComplete", () => {
      spinOn = !reduce;
    });

    let on = false;
    // Cuándo se encendió: en el teléfono el toque dispara mouseenter/focus justo antes del clic (ver onClick).
    let encendidaEn = 0;
    function turnOn() {
      if (on) return;
      on = true;
      encendidaEn = performance.now();
      card!.classList.add(styles.on);
      spinOn = false;
      const tgt = Math.ceil(idle.rotation.y / Math.PI) * Math.PI;
      gsap.to(idle.rotation, { y: tgt, duration: 0.45, ease: "power2.out" });
      tl.timeScale(reduce ? 3 : 1).play();
    }
    function turnOff() {
      if (!on) return;
      on = false;
      card!.classList.remove(styles.on);
      tl.timeScale(reduce ? 3 : 1.5).reverse();
    }
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    // Computadora: el clic navega (el hover ya encendió). Teléfono: el 1er toque solo enciende; el 2º navega.
    const onClick = (e: MouseEvent) => {
      if (finePointer) return;
      if (!on || performance.now() - encendidaEn < 400) {
        e.preventDefault();
        turnOn();
      }
    };
    card.addEventListener("mouseenter", turnOn);
    card.addEventListener("mouseleave", turnOff);
    card.addEventListener("focus", turnOn);
    card.addEventListener("blur", turnOff);
    card.addEventListener("click", onClick);

    // ---------- tamaño ----------
    function resize() {
      const w = card!.clientWidth,
        h = card!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = 30;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(card);
    resize();

    // ---------- bucle ----------
    let last = performance.now();
    let raf = 0;
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += reduce ? 0 : dt;
      if (spinOn) idle.rotation.y += dt * 0.7;
      apply();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ---------- limpieza: nada queda vivo al cambiar de página ----------
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      card.removeEventListener("mouseenter", turnOn);
      card.removeEventListener("mouseleave", turnOff);
      card.removeEventListener("focus", turnOn);
      card.removeEventListener("blur", turnOff);
      card.removeEventListener("click", onClick);
      tl.kill();
      gsap.killTweensOf(idle.rotation);
      const liberar = (raiz: THREE.Object3D) =>
        raiz.traverse((obj) => {
          const malla = obj as THREE.Mesh | THREE.Sprite;
          if (malla.geometry) malla.geometry.dispose();
          const materiales = malla.material ? (Array.isArray(malla.material) ? malla.material : [malla.material]) : [];
          for (const m of materiales) {
            const conMapa = m as THREE.Material & { map?: THREE.Texture | null };
            conMapa.map?.dispose();
            m.dispose();
          }
        });
      liberar(scene);
      liberar(envScene);
      envTarget.dispose();
      scene.environment = null;
      renderer.dispose();
      card.classList.remove(styles.on);
      card.style.removeProperty("--p");
      card.style.removeProperty("--f");
    };
  }, []);

  const tarjeta = (
    <Link
      ref={cardRef}
      href={href}
      className={`${styles.card} ${escalar ? styles.escalable : ""} ${plexMono.variable}`}
      aria-label={`${titulo}: ${enFrase(descripcion)}`}
    >
      <div className={styles.dim} />
      <div className={styles.glow} />

      <svg className={styles.blueprint} viewBox="0 0 320 420" preserveAspectRatio="none" aria-hidden="true">
        <path d="M40 46 V30 H56" fill="none" stroke="rgba(190,215,245,.45)" strokeWidth="1.2" />
        <circle cx="160" cy="136" r="100" fill="none" stroke="rgba(190,215,245,.28)" strokeDasharray="2 4" />
        <line x1="250" y1="50" x2="250" y2="221" stroke="rgba(190,215,245,.5)" />
        <line x1="243" y1="50" x2="257" y2="50" stroke="rgba(190,215,245,.5)" />
        <line x1="243" y1="221" x2="257" y2="221" stroke="rgba(190,215,245,.5)" />
        <text x="264" y="136" transform="rotate(90 264 136)" textAnchor="middle">
          108 mm
        </text>
        <line x1="111" y1="22" x2="209" y2="22" stroke="rgba(190,215,245,.5)" />
        <line x1="111" y1="16" x2="111" y2="28" stroke="rgba(190,215,245,.5)" />
        <line x1="209" y1="16" x2="209" y2="28" stroke="rgba(190,215,245,.5)" />
        <path d="M95 22 l8 -4 v8 z" fill="#e3262f" />
        <text x="222" y="25">
          Ø 60 mm
        </text>
        <text x="40" y="140">
          A60 · E27
        </text>
      </svg>

      <canvas ref={canvasRef} className={styles.scene} aria-hidden="true" />

      {aviso && <div className={styles.fallback}>{aviso}</div>}

      <div className={styles.copy}>
        <div className={styles.rule} />
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
        <div className={styles.cta}>
          Ver categoría <span>→</span>
        </div>
      </div>
    </Link>
  );

  // Para escalar, el ancho de referencia (100cqw) es el de este contenedor.
  return escalar ? <div className={styles.contenedor}>{tarjeta}</div> : tarjeta;
}
