import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@websim/remotion/player";
import { BingoCardClip } from "./composition.jsx";
import * as THREE from "three";
const exampleCard = [
  ["1", "18", "31", "48", "63"],
  ["2", "16", "30", "52", "66"],
  ["5", "20", "FREE", "57", "72"],
  ["12", "21", "39", "51", "68"],
  ["7", "24", "34", "46", "70"]
];
function HeaderSmall() {
  const letters = ["B", "I", "N", "G", "O"];
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 8, justifyContent: "center", marginBottom: 12 }, children: letters.map((L) => /* @__PURE__ */ jsxDEV(
    "div",
    {
      style: {
        width: 92,
        height: 92,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
        border: `4px solid #2b2b2b`,
        fontSize: 48,
        fontWeight: 900,
        color: "#1b1b1b",
        fontFamily: "Arial, Helvetica, sans-serif"
      },
      children: L
    },
    L,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 21,
      columnNumber: 9
    },
    this
  )) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 19,
    columnNumber: 5
  }, this);
}
function BingoCage({ width = 560, height = 420, tappable = true }) {
  const mountRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    cageGroup: null,
    balls: [],
    spinning: false,
    rotationSpeed: 0,
    lastTime: 0,
    acc: 0
  });
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 2e3);
    camera.position.set(0, 80, 420);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    const dir = new THREE.DirectionalLight(16777215, 0.9);
    dir.position.set(100, 200, 100);
    scene.add(dir);
    scene.add(new THREE.AmbientLight(16777215, 0.6));
    const cageGroup = new THREE.Group();
    cageGroup.position.y = 80;
    scene.add(cageGroup);
    const R = 120;
    const frameMat = new THREE.MeshStandardMaterial({
      color: 9211798,
      // soft steel gray
      metalness: 0.95,
      roughness: 0.25
    });
    const sideRadius = 6;
    const sideHeight = 220;
    const leftSupport = new THREE.Mesh(
      new THREE.CylinderGeometry(sideRadius, sideRadius, sideHeight, 16),
      frameMat
    );
    leftSupport.position.set(-R - 40, -30, 0);
    cageGroup.add(leftSupport);
    const rightSupport = leftSupport.clone();
    rightSupport.position.x = R + 40;
    cageGroup.add(rightSupport);
    const baseBar = new THREE.Mesh(
      new THREE.BoxGeometry(2 * (R + 60), 10, 40),
      frameMat
    );
    baseBar.position.set(0, -sideHeight / 2 - 30, 0);
    cageGroup.add(baseBar);
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, R * 2 + 40, 24),
      frameMat
    );
    axle.rotation.z = Math.PI / 2;
    cageGroup.add(axle);
    const handleStem = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 40, 16),
      frameMat
    );
    handleStem.rotation.z = Math.PI / 2;
    handleStem.position.set(R + 40, 0, 0);
    cageGroup.add(handleStem);
    const handleKnob = new THREE.Mesh(
      new THREE.SphereGeometry(10, 16, 12),
      frameMat
    );
    handleKnob.position.set(R + 65, 0, 0);
    cageGroup.add(handleKnob);
    const barMat = new THREE.MeshStandardMaterial({
      color: 11975878,
      // lighter steel for cage wires
      metalness: 1,
      roughness: 0.22
    });
    const wireGroup = new THREE.Group();
    const latRings = 8;
    const lonRings = 10;
    const segments = 96;
    const barRadius = R * 0.03;
    for (let i = 0; i < latRings; i++) {
      const v = i / (latRings - 1) * Math.PI - Math.PI / 2;
      const y = Math.sin(v) * R;
      const rAtLat = Math.cos(v) * R;
      if (rAtLat <= 0.5 * barRadius) continue;
      const ringGeom = new THREE.TorusGeometry(rAtLat, barRadius, 16, segments);
      const ring = new THREE.Mesh(ringGeom, barMat);
      ring.position.y = y;
      wireGroup.add(ring);
    }
    for (let i = 0; i < lonRings; i++) {
      const phi = i / lonRings * Math.PI * 2;
      const ringGeom = new THREE.TorusGeometry(R, barRadius, 16, segments);
      const ring = new THREE.Mesh(ringGeom, barMat);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.y = phi;
      wireGroup.add(ring);
    }
    wireGroup.rotation.y = Math.PI / 10;
    cageGroup.add(wireGroup);
    const balls = [];
    const BALL_RADIUS = 8;
    const ballGeom = new THREE.SphereGeometry(BALL_RADIUS, 16, 12);
    const ballMat = new THREE.MeshStandardMaterial({ color: 16768358, metalness: 0.2, roughness: 0.6 });
    const groupColors = [16739179, 7062015, 16768358, 10420129, 13868799];
    const BALL_COUNT = 75;
    for (let i = 0; i < BALL_COUNT; i++) {
      const mat = ballMat.clone();
      const number = i + 1;
      const group = Math.floor((number - 1) / 15);
      mat.color = new THREE.Color(groupColors[group % groupColors.length]);
      const m = new THREE.Mesh(ballGeom, mat);
      const radiusLimit = R - (BALL_RADIUS + 6);
      const thetaBase = group / 5 * Math.PI * 2;
      const theta = thetaBase + (Math.random() - 0.5) * (Math.PI * 0.28);
      const phi = Math.random() * Math.PI;
      const r = Math.random() * (radiusLimit * 0.7);
      const pos = new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * r,
        (Math.random() - 0.3) * r * 0.6,
        Math.sin(theta) * Math.sin(phi) * r
      );
      m.position.copy(pos).add(new THREE.Vector3(0, cageGroup.position.y, 0));
      const label = (i + 1).toString();
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 3);
      const tex = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const labelPlane = new THREE.Mesh(new THREE.PlaneGeometry(BALL_RADIUS * 1.6, BALL_RADIUS * 1.6), labelMat);
      labelPlane.position.set(0, 0, BALL_RADIUS + 0.5);
      m.add(labelPlane);
      scene.add(m);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8);
      balls.push({ mesh: m, vel, mass: 0.02, radius: BALL_RADIUS, labelPlane });
    }
    stateRef.current = { scene, camera, renderer, cageGroup, wireGroup, balls, spinning: false, rotationSpeed: 0, R, acc: 0 };
    const FIXED_DT = 1 / 60;
    const GRAVITY = new THREE.Vector3(0, -900, 0);
    const restitution = 0.9;
    const maxSpeed = 80;
    const positionCorrection = 0.8;
    const animate = (time) => {
      const s = stateRef.current;
      if (!s) return;
      const now = time / 1e3;
      let dt = Math.min(0.032, now - (s.lastTime || now));
      s.lastTime = now;
      s.acc += dt;
      if (s.spinning) {
        s.rotationSpeed = Math.min(8, s.rotationSpeed + dt * 7.5);
      } else {
        s.rotationSpeed = Math.max(0, s.rotationSpeed - dt * 5.5);
      }
      s.wireGroup.rotation.x += s.rotationSpeed * dt;
      while (s.acc >= FIXED_DT) {
        const angularVel = new THREE.Vector3(s.rotationSpeed * 0.6, 0, 0);
        for (let i = 0; i < s.balls.length; i++) {
          const b = s.balls[i];
          b.vel.addScaledVector(GRAVITY, FIXED_DT);
          const cageCenter2 = s.cageGroup.getWorldPosition(new THREE.Vector3());
          const rel = new THREE.Vector3().subVectors(b.mesh.position, cageCenter2);
          const tangential = new THREE.Vector3().copy(angularVel).cross(rel);
          b.vel.addScaledVector(tangential, 0.05);
          b.vel.multiplyScalar(0.996);
          b.mesh.position.addScaledVector(b.vel, FIXED_DT);
        }
        const cageCenter = s.cageGroup.getWorldPosition(new THREE.Vector3());
        const R_inner = s.R - (BALL_RADIUS + 4);
        for (let i = 0; i < s.balls.length; i++) {
          const b = s.balls[i];
          const rel = new THREE.Vector3().subVectors(b.mesh.position, cageCenter);
          const dist = rel.length();
          const n = dist > 0 ? rel.clone().normalize() : new THREE.Vector3(1, 0, 0);
          if (dist > R_inner) {
            const penetration = dist - R_inner;
            b.mesh.position.addScaledVector(n, -penetration * positionCorrection);
            const vn = n.clone().multiplyScalar(b.vel.dot(n));
            const vt = b.vel.clone().sub(vn);
            b.vel.copy(vt).sub(vn.multiplyScalar(restitution));
            b.vel.multiplyScalar(0.998);
          }
        }
        for (let i = 0; i < s.balls.length; i++) {
          for (let j = i + 1; j < s.balls.length; j++) {
            const A = s.balls[i];
            const B = s.balls[j];
            const n = new THREE.Vector3().subVectors(A.mesh.position, B.mesh.position);
            let dist = n.length();
            const minDist = A.radius + B.radius;
            if (dist < 1e-6) {
              n.set(Math.random() * 0.01 + 0.01, 0.01, 0.01);
              dist = n.length();
            }
            if (dist < minDist) {
              n.divideScalar(dist);
              const penetration = minDist - dist;
              const totalMass = A.mass + B.mass;
              const corr = n.clone().multiplyScalar(penetration * positionCorrection);
              A.mesh.position.addScaledVector(corr, B.mass / totalMass);
              B.mesh.position.addScaledVector(corr, -(A.mass / totalMass));
              const rv = new THREE.Vector3().subVectors(A.vel, B.vel);
              const velAlongNormal = rv.dot(n);
              if (velAlongNormal < 0) {
                const e = Math.min(restitution, restitution);
                const jImpulse = -(1 + e) * velAlongNormal / (1 / A.mass + 1 / B.mass);
                const impulse = n.clone().multiplyScalar(jImpulse);
                A.vel.addScaledVector(impulse, 1 / A.mass);
                B.vel.addScaledVector(impulse, -1 / B.mass);
              }
              A.vel.multiplyScalar(0.997);
              B.vel.multiplyScalar(0.997);
            }
          }
        }
        for (let i = 0; i < s.balls.length; i++) {
          const b = s.balls[i];
          if (b.vel.length() > maxSpeed) b.vel.setLength(maxSpeed);
        }
        s.acc -= FIXED_DT;
      }
      for (let i = 0; i < s.balls.length; i++) {
        const b = s.balls[i];
        const worldPos = new THREE.Vector3();
        b.mesh.getWorldPosition(worldPos);
        const labelWorldPos = b.labelPlane.getWorldPosition(new THREE.Vector3());
        b.labelPlane.lookAt(camera.position);
      }
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [width, height]);
  const handleTap = () => {
    const s = stateRef.current;
    if (!s) return;
    s.spinning = true;
    s.rotationSpeed = Math.max(2.2, s.rotationSpeed + 3 + Math.random() * 3);
    s.balls.forEach((b) => {
      b.vel.add(new THREE.Vector3((Math.random() - 0.5) * 6, Math.random() * 3 + 1.5, (Math.random() - 0.5) * 6));
    });
    setTimeout(() => {
      const s2 = stateRef.current;
      if (s2) s2.spinning = false;
    }, 900 + Math.random() * 900);
  };
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "center" }, children: /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: mountRef,
      onClick: () => {
        if (tappable) handleTap();
      },
      onTouchStart: () => {
        if (tappable) handleTap();
      },
      style: { width, height, borderRadius: 12, overflow: "hidden", touchAction: "manipulation", cursor: "pointer" }
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 422,
      columnNumber: 7
    },
    this
  ) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 421,
    columnNumber: 5
  }, this);
}
function InteractiveApp() {
  const [actions, setActions] = useState([]);
  const [playerKey, setPlayerKey] = useState(0);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const handleCellTap = (r, c) => {
    const t = Date.now();
    const next = [...actions, { r, c, t }];
    setActions(next);
  };
  const clearActions = () => {
    setActions([]);
    setIsReplayMode(false);
    setPlayerKey((k) => k + 1);
  };
  const matchForPlayer = useMemo(() => {
    if (!isReplayMode) return { card: exampleCard, highlights: [], durationInFrames: 150 };
    if (actions.length === 0) return { card: exampleCard, highlights: [], durationInFrames: 150 };
    const sorted = [...actions].sort((a, b) => a.t - b.t);
    const t0 = sorted[0].t;
    const actionsWithFrame = sorted.map((a, idx) => {
      const msOffset = a.t - t0;
      const frameFromTime = Math.round(msOffset / 1e3 * 30);
      const frame = Math.max(0, frameFromTime + idx * 6);
      return { r: a.r + 1, c: a.c, frame };
    });
    const maxFrame = actionsWithFrame.reduce((m, a) => Math.max(m, a.frame), 0);
    const durationInFrames = Math.max(150, maxFrame + 30);
    const lettersRow = ["B", "I", "N", "G", "O"];
    const cardWithHeader = [lettersRow, ...exampleCard];
    return { card: cardWithHeader, replayActions: actionsWithFrame, durationInFrames };
  }, [isReplayMode, actions]);
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", height: "100%", gap: 12, alignItems: "center", padding: 12, boxSizing: "border-box", justifyContent: "center" }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, boxSizing: "border-box", background: "#fff", borderRadius: 12, padding: 12 }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      width: "100%",
      height: 640,
      marginTop: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa",
      borderRadius: 12,
      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
      overflow: "hidden"
    }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      width: 620,
      padding: 28,
      borderRadius: 20,
      background: "#fff",
      transform: "scale(0.55)",
      transformOrigin: "center center",
      boxSizing: "content-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { width: 560, height: 420, display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 12 }, children: /* @__PURE__ */ jsxDEV(BingoCage, { width: 520, height: 360 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 500,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 499,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(HeaderSmall, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 503,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 8, justifyContent: "center", marginTop: 6 }, children: exampleCard.map(
        (row, rIdx) => row.map((cell, cIdx) => {
          const isFree = typeof cell === "string" && cell.toLowerCase().includes("free");
          const tapped = actions.some((a) => a.r === rIdx && a.c === cIdx);
          return /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => handleCellTap(rIdx, cIdx),
              style: {
                width: 92,
                height: 92,
                borderRadius: 12,
                border: "3px solid #2b2b2b",
                background: isFree ? "#efefef" : "#fff",
                fontWeight: 700,
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                color: "#111",
                fontFamily: "Arial, Helvetica, sans-serif"
              },
              children: [
                tapped && /* @__PURE__ */ jsxDEV("div", { style: {
                  position: "absolute",
                  width: 74,
                  height: 74,
                  borderRadius: 999,
                  background: "#ff6b6b",
                  opacity: 0.95,
                  zIndex: 0
                } }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 532,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { zIndex: 1, fontSize: 20 }, children: isFree ? "FREE" : cell }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 542,
                  columnNumber: 23
                }, this)
              ]
            },
            `${rIdx}-${cIdx}`,
            true,
            {
              fileName: "<stdin>",
              lineNumber: 510,
              columnNumber: 21
            },
            this
          );
        })
      ) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 504,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 486,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 474,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 472,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }, children: /* @__PURE__ */ jsxDEV(
      Player,
      {
        component: BingoCardClip,
        durationInFrames: matchForPlayer.durationInFrames || 150,
        fps: 30,
        compositionWidth: 1080,
        compositionHeight: 1920,
        loop: true,
        controls: true,
        inputProps: { match: matchForPlayer },
        autoplay: true,
        style: { width: "100%", height: "100%" }
      },
      playerKey + (isReplayMode ? "-replay" : ""),
      false,
      {
        fileName: "<stdin>",
        lineNumber: 557,
        columnNumber: 11
      },
      this
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 556,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 555,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, boxSizing: "border-box", padding: 12, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setIsReplayMode(true);
              setPlayerKey((k) => k + 1);
            },
            style: { padding: "8px 12px", borderRadius: 8, background: "#1b9fff", color: "#fff", border: "none", fontSize: 14 },
            children: "Render Replay"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 576,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: clearActions,
            style: { padding: "8px 12px", borderRadius: 8, background: "#eee", border: "none", fontSize: 14 },
            children: "Clear"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 582,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 575,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", fontSize: 12 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700, marginBottom: 6 }, children: "Recorded actions JSON" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 591,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("pre", { style: { whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f7f7f7", padding: 8, borderRadius: 6, maxHeight: 420, overflow: "auto" }, children: JSON.stringify(actions, null, 2) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 592,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 590,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 574,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 470,
    columnNumber: 5
  }, this);
}
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(InteractiveApp, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 601,
  columnNumber: 51
}));
