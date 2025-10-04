// src/pages/Skills3D.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* =================== Reduced motion =================== */
function usePrefersReducedMotion(){
  const [val, setVal] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = e => setVal(!!e.matches);
    apply(mq);
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return val;
}

/* =================== Interactive layer =================== */
const INTERACT_LAYER = 1; // only planets live here; sun stays on default layer 0

/* =================== Your skills =================== */
/* Optional textures: put into /public/textures/ with names:
   <preset>_color.jpg/png, _normal, _roughness, _ao, _displacement (any missing is OK)
   Presets below are examples; change as you like (or set preset:null to skip textures).
*/
const SKILLS = [
  { id:"PHP",      percent:87, started:"2022", desc:"Backend APIs and tools with PHP. Solid on patterns and testing.",
    color:0x9aa3ff, image:"https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    planet:{ preset:"mercury" } },

  { id:"Laravel",  percent:80, started:"2023", desc:"REST, authentication, queues, and Blade/Livewire basics.",
    color:0xff7a66, image:"https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
    planet:{ preset:"venus" } },

  { id:"React",    percent:89, started:"2023", desc:"SPAs, hooks, routing, forms, and component patterns.",
    color:0x61dafb, image:"https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    planet:{ preset:"earth" } },

  { id:"HTML",     percent:97, started:"2021", desc:"Semantic HTML and accessibility-first structure.",
    color:0xff8c3a, image:"https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1200&auto=format&fit=crop",
    planet:{ preset:"mars" } },

  { id:"CSS",      percent:94, started:"2021", desc:"Layouts, animation, and 3D transforms with modern CSS.",
    color:0x6fb6ff, image:"https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop",
    planet:{ preset:"ice" } },

  { id:"Tailwind", percent:65, started:"2024", desc:"Design systems and utility-first workflows.",
    color:0x22d3ee, image:"https://images.unsplash.com/photo-1529243856184-fd5465488984?q=80&w=1200&auto=format&fit=crop",
    planet:{ preset:"gas" } },

  { id:"SQL",      percent:87, started:"2022", desc:"Schema design, queries, and performance basics (MySQL).",
    color:0xb48efc, image:"https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop",
    planet:{ preset:"rock1" } },

  { id:"Firebase", percent:50, started:"2024", desc:"Auth, Firestore, and realtime features.",
    color:0xffb74d, image:"https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    planet:{ preset:"saturn", rings:true } },
];

/* =================== Utility textures (canvas) =================== */
function makeRadialGlowTexture({ size=256, inner="#fff2c2", mid="#ffbb55", outer="rgba(255,255,255,0)" }={}){
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const r = size/2;
  const grd = g.createRadialGradient(r,r,0, r,r,r);
  grd.addColorStop(0.0, inner);
  grd.addColorStop(0.5, mid);
  grd.addColorStop(1.0, outer);
  g.fillStyle = grd; g.fillRect(0,0,size,size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function makeStreakTexture({ size=256 } = {}){
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d");
  const grd = ctx.createLinearGradient(0, size/2, size, size/2);
  grd.addColorStop(0.0, "rgba(255,255,255,0)");
  grd.addColorStop(0.2, "rgba(255,255,255,0.95)");
  grd.addColorStop(0.8, "rgba(255,255,255,0.85)");
  grd.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, size/2 - 6, size, 12);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* =================== Simplex noise for shaders =================== */
const NOISE = `
vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec2 mod289(vec2 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x * x0.x  + h.x  * x0.y;
  g.yz = a0.yz* x12.xz + h.yz* x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(1.6,1.2,-1.2,1.6);
  for (int i=0;i<5;i++){ v += a*snoise(p); p = r*p*1.3; a *= .55; }
  return v;
}
`;

/* =================== Cinematic Sun (non-interactive) =================== */
function createSunGroup(){
  const group = new THREE.Group();

  // Core (molten)
  const coreGeo = new THREE.SphereGeometry(1.6, 96, 96);
  const coreMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uColorA: { value: new THREE.Color("#ff6a00") },
      uColorB: { value: new THREE.Color("#ffd27a") },
      uGlow:   { value: 1.6 },
    },
    vertexShader: `
      varying vec3 vPos;
      void main(){
        vPos = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      ${NOISE}
      uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB; uniform float uGlow;
      varying vec3 vPos;
      void main(){
        vec2 p = vec2(atan(vPos.z, vPos.x)/3.1415926, asin(vPos.y));
        p *= 2.2;
        float n = fbm(p*2.0 + vec2(uTime*0.18, uTime*0.12));
        float cells = fbm(p*3.2 - vec2(uTime*0.07, uTime*0.09));
        float mixv = smoothstep(-0.3, 0.7, n + cells*0.6);
        vec3 color = mix(uColorA, uColorB, mixv);
        float bright = smoothstep(0.4, 0.95, mixv);
        vec3 col = color * (1.1 + bright * uGlow);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Corona
  const coronaGeo = new THREE.SphereGeometry(1.9, 96, 96);
  const coronaMat = new THREE.ShaderMaterial({
    uniforms: { uTime:{ value:0 }, uTint:{ value:new THREE.Color("#ffe7a3") }, uAlpha:{ value:0.95 } },
    vertexShader: `
      varying vec3 vNormal;
      void main(){
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      ${NOISE}
      varying vec3 vNormal; uniform float uTime; uniform vec3 uTint; uniform float uAlpha;
      void main(){
        float fres = pow(1.0 - abs(vNormal.z), 3.0);
        float rip  = fbm(vNormal.xy*4.0 + vec2(uTime*0.25, -uTime*0.23));
        float alpha = smoothstep(0.0,1.0, fres*1.4 + rip*0.35) * uAlpha;
        gl_FragColor = vec4(uTint, alpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent:true, depthWrite:false,
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  group.add(corona);

  // Rays (sprites)
  const rays1 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialGlowTexture({ inner:"#fff3c4", mid:"#ffcf76" }),
    transparent:true, depthWrite:false, opacity:.9, blending:THREE.AdditiveBlending
  }));
  rays1.scale.set(18,18,1);
  const rays2 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialGlowTexture({ inner:"#fff0b0", mid:"#ffbb55" }),
    transparent:true, depthWrite:false, opacity:.55, blending:THREE.AdditiveBlending
  }));
  rays2.scale.set(12,12,1);
  group.add(rays1, rays2);

  // Tiny embers
  const emberCount = 400;
  const emberGeo = new THREE.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  for (let i=0;i<emberCount;i++){
    const r = 2.2 + Math.random()*0.6;
    const ang = Math.random()*Math.PI*2;
    const y = (Math.random()-.5) * 0.8;
    emberPos[i*3+0] = Math.cos(ang)*r;
    emberPos[i*3+1] = y;
    emberPos[i*3+2] = Math.sin(ang)*r;
  }
  emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos,3));
  const embers = new THREE.Points(emberGeo, new THREE.PointsMaterial({
    size: 0.05, color: 0xffe0a8, transparent:true, opacity:0.9,
    blending: THREE.AdditiveBlending, depthWrite:false
  }));
  group.add(embers);

  // Sun light
  const light = new THREE.PointLight(0xffe1a0, 1.4, 100);
  group.add(light);

  // simple updater
  group.userData.update = (t) => {
    coreMat.uniforms.uTime.value   = t;
    coronaMat.uniforms.uTime.value = t;
    rays1.material.rotation =  t * 0.04;
    rays2.material.rotation = -t * 0.03;
    const s = 1.0 + Math.sin(t*0.8)*0.01;
    core.scale.setScalar(s);
    corona.scale.setScalar(s);
  };

  // stays on default layer 0 (non-interactive)
  return group;
}

/* =================== Realistic planets (PBR) =================== */
const texLoader = new THREE.TextureLoader();

function loadPlanetTextures(prefix) {
  const tryLoad = (name) =>
    new Promise((resolve) => {
      const jpg = `/textures/${prefix}_${name}.jpg`;
      const png = `/textures/${prefix}_${name}.png`;
      texLoader.load(
        jpg,
        t => { t.colorSpace = THREE.SRGBColorSpace; resolve(t); },
        undefined,
        () => texLoader.load(
          png,
          t2 => { t2.colorSpace = THREE.SRGBColorSpace; resolve(t2); },
          undefined,
          () => resolve(null)
        )
      );
    });

  return Promise.all([
    tryLoad("color"), tryLoad("normal"), tryLoad("roughness"),
    tryLoad("ao"), tryLoad("displacement"),
  ]).then(([color, normal, roughness, ao, displacement]) => {
    if (!color) {
      return Promise.all([tryLoad("albedo")]).then(([alb]) => ({
        color: alb, normal, roughness, ao, displacement
      }));
    }
    return { color, normal, roughness, ao, displacement };
  });
}

function makeAtmosphere(radius, tint = 0xa5f3fc, opacity = 0.22){
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTint: { value: new THREE.Color(tint) } },
    vertexShader: `
      varying vec3 vN;
      void main(){ vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: `
      varying vec3 vN; uniform vec3 uTint;
      void main(){ float fres = pow(1.0 - abs(vN.z), 3.0); gl_FragColor = vec4(uTint, fres); }
    `,
    blending: THREE.AdditiveBlending, transparent:true, depthWrite:false
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius*1.06, 48, 48), mat);
  m.renderOrder = 2; m.material.opacity = opacity;
  return m;
}

function makeRings(inner, outer, colorA="#f8fafc", colorB="#cbd5e1"){
  const g = new THREE.RingGeometry(inner, outer, 90, 1);
  const mat = new THREE.MeshBasicMaterial({ color:0xffffff, side:THREE.DoubleSide, transparent:true, opacity:.85 });
  const mesh = new THREE.Mesh(g, mat);
  mesh.rotation.x = Math.PI / 2.2;
  return mesh;
}

async function createRealisticPlanet({
  radius=0.48, texturePrefix=null, baseColor=0x8888aa,
  roughness=0.9, metalness=0.0, clearcoat=0.3, clearcoatRoughness=0.6,
  withAtmosphere=true, withRings=false, ringScale=2.4
}){
  const group = new THREE.Group();

  let material;
  if (texturePrefix){
    const t = await loadPlanetTextures(texturePrefix);
    material = new THREE.MeshPhysicalMaterial({
      map: t.color || null,
      normalMap: t.normal || null,
      roughnessMap: t.roughness || null,
      aoMap: t.ao || null,
      displacementMap: t.displacement || null,
      displacementScale: t.displacement ? 0.03 : 0,
      roughness, metalness,
      color: new THREE.Color(baseColor),           // tint textures
      emissive: new THREE.Color(baseColor),        // subtle self tint
      emissiveIntensity: 0.08,
      clearcoat, clearcoatRoughness,
      envMapIntensity: 0.35,
    });
  } else {
    material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(baseColor),
      roughness, metalness,
      emissive: new THREE.Color(baseColor),
      emissiveIntensity: 0.08,
      clearcoat, clearcoatRoughness,
      envMapIntensity: 0.25,
    });
  }

  const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 96), material);
  group.add(core);

  if (withAtmosphere) group.add(makeAtmosphere(radius));
  if (withRings) group.add(makeRings(radius*1.45, radius*ringScale));

  group.userData.core = core;
  group.userData.spin = 0.002;
  return group;
}

/* =================== Component =================== */
export default function Skills3D(){
  const mountRef = useRef(null);
  const overlayRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    const overlay = overlayRef.current;

    // Scene / Camera / Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f1a, 0.016);

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 150);
    camera.position.set(0, 1.2, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const key = new THREE.DirectionalLight(0xffffff, 0.45);
    key.position.set(3, 6, 4);
    scene.add(key);

    // Sun (non-interactive, stays on default layer 0)
    const sunGroup = createSunGroup();
    scene.add(sunGroup);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = 6; controls.maxDistance = 28;
    controls.target.set(0,0,0);

    // Skill planets
    const cloud = new THREE.Group(); scene.add(cloud);

    // Raycaster ONLY sees INTERACT_LAYER (planets)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(INTERACT_LAYER);
    const mouse = new THREE.Vector2(-2, -2);
    let hovered = null;
    let focusTarget = null;

    const radius = 6.0;
    const meshes = [];
    const labels = [];

    function goldenSpiralPoints(n, r){
      const pts = [];
      const inc = Math.PI * (3 - Math.sqrt(5));
      const off = 2 / n;
      for (let k = 0; k < n; k++){
        const y = k * off - 1 + off / 2;
        const phi = k * inc;
        const rad = Math.sqrt(1 - y*y);
        const x = Math.cos(phi) * rad;
        const z = Math.sin(phi) * rad;
        pts.push(new THREE.Vector3(x, y, z).multiplyScalar(r));
      }
      return pts;
    }
    const positions = goldenSpiralPoints(SKILLS.length, radius);

    // Build planets (async for textures)
    (async () => {
      for (let i=0;i<SKILLS.length;i++){
        const s = SKILLS[i];
        const planetGroup = await createRealisticPlanet({
          radius: 0.48,
          texturePrefix: s.planet?.preset || null,
          baseColor: s.color,
          withAtmosphere: true,
          withRings: !!s.planet?.rings,
          ringScale: 2.4,
        });
        planetGroup.position.copy(positions[i]);
        planetGroup.userData.skill = s;
        planetGroup.userData.spin = 0.002 + (i % 3) * 0.0018;

        // Make interactive
        planetGroup.traverse(o => o.layers.enable(INTERACT_LAYER));

        cloud.add(planetGroup);
        meshes.push(planetGroup);

        // Title label
        const el = document.createElement("div");
        el.className = "skill3d-label";
        el.innerHTML = `<span class="skill3d-title">${s.id}</span>`;
        overlay.appendChild(el);
        labels.push(el);
      }
    })();

    // Starfield
    const stars = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0x8b93a5, size: 0.02, sizeAttenuation: true })
    );
    const starCount = reduced ? 700 : 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i=0;i<starCount;i++){
      starPos[i*3+0] = (Math.random()-0.5) * 160;
      starPos[i*3+1] = (Math.random()-0.5) * 160;
      starPos[i*3+2] = (Math.random()-0.5) * 160;
    }
    stars.geometry.setAttribute("position", new THREE.BufferAttribute(starPos,3));
    scene.add(stars);

    // Shooting stars
    const streakTex = makeStreakTexture();
    const streakMat = new THREE.SpriteMaterial({ map: streakTex, transparent:true, depthWrite:false, opacity:0.9 });
    const streaks = [];
    const maxStreaks = reduced ? 2 : 5;
    function spawnStreak(){
      if (streaks.length >= maxStreaks) return;
      const sp = new THREE.Sprite(streakMat.clone());
      sp.scale.set(2 + Math.random()*2, 0.25, 1);
      const y = 2 + Math.random()*4;
      sp.position.set(-12, y + Math.random()*2, -6 - Math.random()*4);
      sp.userData.vel = new THREE.Vector3(0.45 + Math.random()*0.8, -0.25 - Math.random()*0.35, 0.2);
      sp.material.opacity = 0.0;
      scene.add(sp);
      streaks.push(sp);
    }

    // Meteors
    const meteorGeo = new THREE.IcosahedronGeometry(0.12, 0);
    const meteorMat = new THREE.MeshStandardMaterial({ color: 0xb0b7c3, roughness:0.9, metalness:0.05 });
    const meteors = [];
    const maxMeteors = reduced ? 2 : 6;
    function spawnMeteor(){
      if (meteors.length >= maxMeteors) return;
      const m = new THREE.Mesh(meteorGeo, meteorMat.clone());
      m.position.set(9 + Math.random()*6, 2 + Math.random()*4, -3 + Math.random()*6);
      m.userData.vel = new THREE.Vector3(-0.06 - Math.random()*0.12, -0.02 - Math.random()*0.06, -0.03 + Math.random()*0.06);
      m.userData.spin = new THREE.Vector3(Math.random()*0.02, Math.random()*0.02, Math.random()*0.02);
      scene.add(m);
      meteors.push(m);
    }

    // Pointer + click
    function onPointerMove(e){
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    renderer.domElement.addEventListener("click", () => {
      if (!hovered) return;
      const s = hovered.userData.skill;
      setSelected({ ...s });
      focusTarget = hovered.position.clone().normalize().multiplyScalar(radius + 4.2);
    });

    // Resize
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    /* =============== Animate =============== */
    let raf = 0; let t = 0; let shootTimer = 0; let meteorTimer = 0;

    function animate(){
      raf = requestAnimationFrame(animate);
      const dt = 0.016; t += dt;

      // Sun update
      sunGroup.userData.update?.(t);

      // World motion
      if (!reduced){ cloud.rotation.y += 0.0018; stars.rotation.y -= 0.00025; }
      meshes.forEach(m => { m.rotation.y += m.userData.spin; });

      // Hover (raycast only planets layer)
      raycaster.setFromCamera(mouse, camera);
      const ixs = raycaster.intersectObjects(cloud.children, true);
      const obj = ixs[0]?.object || null;
      let top = obj;
      while (top && top.parent !== cloud) top = top.parent;
      const hit = cloud.children.includes(top) ? top : null;

      if (hit !== hovered){
        if (hovered?.userData?.core) hovered.userData.core.material.emissiveIntensity = 0.08;
        hovered = hit;
        if (hovered?.userData?.core) hovered.userData.core.material.emissiveIntensity = 0.35;
        renderer.domElement.style.cursor = hovered ? "pointer" : "default";
      }

      // Focus camera when opening
      if (focusTarget){
        camera.position.lerp(focusTarget, 0.06);
        controls.target.lerp(new THREE.Vector3(0,0,0), 0.06);
        if (camera.position.distanceTo(focusTarget) < 0.05) focusTarget = null;
      }

      // Spawn FX
      shootTimer -= dt; meteorTimer -= dt;
      if (shootTimer <= 0){ spawnStreak(); shootTimer = (reduced ? 2.5 : 1.4) + Math.random()*1.2; }
      if (meteorTimer <= 0){ spawnMeteor(); meteorTimer = (reduced ? 6 : 3.5) + Math.random()*2; }

      // Update streaks
      for (let i=streaks.length-1;i>=0;i--){
        const s = streaks[i];
        s.position.add(s.userData.vel);
        s.material.opacity = Math.min(0.95, s.material.opacity + 0.06);
        if (s.position.x > 12 || s.position.y < -6 || s.position.z > 8){
          scene.remove(s); streaks.splice(i,1);
        }
      }
      // Update meteors
      for (let i=meteors.length-1;i>=0;i--){
        const m = meteors[i];
        m.position.add(m.userData.vel);
        m.rotation.x += m.userData.spin.x;
        m.rotation.y += m.userData.spin.y;
        m.rotation.z += m.userData.spin.z;
        if (m.position.x < -12 || m.position.y < -6 || m.position.z < -10){
          scene.remove(m); meteors.splice(i,1);
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // Screen-space labels
      for (let i=0;i<labels.length;i++){
        const p = meshes[i].position.clone().project(camera);
        const x = (p.x * 0.5 + 0.5) * mount.clientWidth;
        const y = (-p.y * 0.5 + 0.5) * mount.clientHeight;
        const out = p.z > 1 || p.z < -1;
        labels[i].style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        labels[i].style.opacity = out ? "0" : "1";
      }
    }
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      labels.forEach(el => overlay.removeChild(el));
    };
  }, [reduced]);

  // ESC closes modal
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="container" style={{ padding: "1rem 0" }} aria-label="3D Skills">
      <h2 className="display-xxl" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>
        Skills — 3D
      </h2>

      <div className="skill3d-wrap">
        <div ref={mountRef} className="skill3d-canvas" />
        <div ref={overlayRef} className="skill3d-overlay" aria-hidden="true" />
      </div>

      <p className="skill3d-help">
        Drag to orbit • Scroll to zoom • Click a planet for details
      </p>

      {selected && (
        <div className="skill3d-modal" role="dialog" aria-modal="true" aria-label={`${selected.id} details`}>
          <button className="skill3d-modal-backdrop" onClick={() => setSelected(null)} aria-label="Close" />
          <article className="skill3d-card" aria-live="polite">
            <div className="skill3d-card-media" style={{ backgroundImage: `url(${selected.image})` }} />
            <div className="skill3d-card-body">
              <h3 className="skill3d-heading">{selected.id}</h3>
              <div className="meta">Started <strong>{selected.started}</strong></div>
              <p className="desc">{selected.desc}</p>
              <div className="actions">
                <button className="button" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
