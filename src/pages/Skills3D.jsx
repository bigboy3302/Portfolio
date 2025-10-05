import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ===== reduced motion ===== */
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

/* ===== raycast layer (planets only) ===== */
const INTERACT_LAYER = 1;

/* ===== skills (your data kept as-is) ===== */
const SKILLS = [
  { id:"PHP",      percent:87, started:"2022",
    desc:"Modern PHP: OOP and Composer, PSR standards, MVC patterns, building secure REST APIs, and testing with PHPUnit. Lots of real examples and clean code habits.",
    color:0x9aa3ff, image:"data:image/png;base64,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",
    planet:{ preset:"mercury" } },
  { id:"Laravel",  percent:80, started:"2023",
    desc:"Routing and controllers, Eloquent relationships and scopes, migrations/seeders, validation, policies/gates, queues/jobs, caching, API resources, tests, and smooth deployment.",
    color:0xff7a66, image:"data:image/png;base64,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",
    planet:{ preset:"venus" } },
  { id:"React",    percent:89, started:"2023",
    desc:"Thinking in components, core hooks (useState/useEffect/useMemo), controlled forms, lifting state, context, React Router, async data, and basic performance profiling.",
    color:0x61dafb, image:"https://img.freepik.com/premium-vector/ui-ux-agency-icon_990672-239.jpg?semt=ais_hybrid&w=740&q=80",
    planet:{ preset:"earth" } },
  { id:"HTML",     percent:97, started:"2022",
    desc:"Semantic tags and proper document structure, accessible forms, ARIA roles, landmarks, headings, and SEO basics so pages read well for people and screen readers.",
    color:0xff8c3a, image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEc9A_S6BPxCDRp5WjMFEfXrpCu1ya2OO-Lw&s",
    planet:{ preset:"mars" } },
  { id:"CSS",      percent:94, started:"2022",
    desc:"Flexbox and Grid layouts, responsive patterns, fluid type and spacing, variables, transitions/animations, 3D transforms, and debugging with browser devtools.",
    color:0x6fb6ff, image:"https://mgearon.com/wp-content/uploads/2014/08/CSS3-Logo.jpg",
    planet:{ preset:"ice" } },
  { id:"Tailwind", percent:65, started:"2023",
    desc:"Utility-first workflow, responsive/hover variants, extracting components, theming with config, using @apply wisely, and keeping class soup clean and readable.",
    color:0x22d3ee, image:"https://devonblog.com/wp-content/uploads/2022/06/tailwind-thumb.jpg",
    planet:{ preset:"gas" } },
  { id:"SQL",      percent:87, started:"2024",
    desc:"Design normalized schemas, write clear JOINs and aggregates, use indexes and read query plans, handle transactions, and avoid slow or unsafe query patterns.",
    color:0xb48efc, image:"https://cdn.prod.website-files.com/61ddd0b42c51f89b7de1e910/6697e5d70e6b50dbe5bbe3dd_6697e36f9a2e61c3f9a3c850_SQL.jpeg",
    planet:{ preset:"rock1" } },
  { id:"Firebase", percent:50, started:"2025",
    desc:"Self-taught via Google Cloud docs and YouTube: Auth (Email/OAuth), Firestore data modeling & security rules, realtime listeners, and basic Cloud Functions + Storage.",
    color:0xffb74d, image:"https://firebase.google.com/images/social.png",
    planet:{ preset:"saturn", rings:true } },
  { id:"Three.js", percent:30, started:"2025",
    desc:"Learning via YouTube courses: core setup (scene/camera/renderer), lighting & materials, orbit controls, texture workflows, model loading, and introductory shader work.",
    color:0x000002, image:"https://tiiny.host/blog/assets/images/1_adcnxab1qc_5kf8juxdeya.png",
    planet:{ preset:"rock4" } },
];

/* ===== tiny canvas textures ===== */
function makeRadialGlowTexture({ size=256, inner="#fff2c2", mid="#ffbb55", outer="rgba(255,255,255,0)" }={}) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"); const r = size/2;
  const grd = g.createRadialGradient(r,r,0, r,r,r);
  grd.addColorStop(0.0, inner); grd.addColorStop(0.5, mid); grd.addColorStop(1.0, outer);
  g.fillStyle = grd; g.fillRect(0,0,size,size);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}
function makeStreakTexture({ size=256 } = {}) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const ctx = c.getContext("2d");
  const grd = ctx.createLinearGradient(0, size/2, size, size/2);
  grd.addColorStop(0, "rgba(255,255,255,0)");
  grd.addColorStop(.2, "rgba(255,255,255,.95)");
  grd.addColorStop(.8, "rgba(255,255,255,.85)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd; ctx.fillRect(0, size/2 - 6, size, 12);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

/* ===== noise (sun shaders) ===== */
const NOISE = `
vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec2 mod289(vec2 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g; g.x  = a0.x * x0.x  + h.x  * x0.y;
  g.yz = a0.yz* x12.xz + h.yz* x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5; mat2 r = mat2(1.6,1.2,-1.2,1.6);
  for (int i=0;i<5;i++){ v += a*snoise(p); p = r*p*1.3; a *= .55; }
  return v;
}`;

/* ===== sun ===== */
function createSunGroup(scale=1){
  const g = new THREE.Group();

  const coreGeo = new THREE.SphereGeometry(1.6*scale, 96, 96);
  const coreMat = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0}, uColorA:{value:new THREE.Color("#ff6a00")}, uColorB:{value:new THREE.Color("#e9d6b1")}, uGlow:{value:1.6} },
    vertexShader: `varying vec3 vPos; void main(){ vPos=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      ${NOISE}
      uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB; uniform float uGlow;
      varying vec3 vPos;
      void main(){
        vec2 p = vec2(atan(vPos.z, vPos.x)/3.1415926, asin(vPos.y))*2.2;
        float n = fbm(p*2.0 + vec2(uTime*0.18, uTime*0.12));
        float cells = fbm(p*3.2 - vec2(uTime*0.07, uTime*0.09));
        float mixv = smoothstep(-0.3, 0.7, n + cells*0.6);
        vec3 color = mix(uColorA, uColorB, mixv);
        float bright = smoothstep(0.4, 0.95, mixv);
        gl_FragColor = vec4(color * (1.1 + bright*uGlow), 1.0);
      }`,
    blending: THREE.AdditiveBlending
  });
  const core = new THREE.Mesh(coreGeo, coreMat); g.add(core);

  const coronaGeo = new THREE.SphereGeometry(1.9*scale, 96, 96);
  const coronaMat = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0}, uTint:{value:new THREE.Color("#a89358")}, uAlpha:{value:0.95} },
    vertexShader: `varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      ${NOISE}
      varying vec3 vN; uniform float uTime; uniform vec3 uTint; uniform float uAlpha;
      void main(){ float fres = pow(1.0 - abs(vN.z), 3.0);
        float rip = fbm(vN.xy*4.0 + vec2(uTime*0.25, -uTime*0.23));
        float a = smoothstep(0.0,1.0, fres*1.4 + rip*0.35) * uAlpha;
        gl_FragColor = vec4(uTint, a);
      }`,
    blending: THREE.AdditiveBlending, transparent:true, depthWrite:false
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat); g.add(corona);

  const rays1 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialGlowTexture({ inner:"#807342", mid:"#ffcf76" }),
    transparent:true, depthWrite:false, opacity:.9, blending:THREE.AdditiveBlending
  }));
  rays1.scale.set(18*scale,18*scale,1);
  const rays2 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialGlowTexture({ inner:"#b4ac86", mid:"#ffbb55" }),
    transparent:true, depthWrite:false, opacity:.55, blending:THREE.AdditiveBlending
  }));
  rays2.scale.set(12*scale,12*scale,1);
  g.add(rays1, rays2);

  g.add(new THREE.PointLight(0xffe1a0, 1.4, 100));

  g.userData.update = (t) => {
    coreMat.uniforms.uTime.value = t;
    coronaMat.uniforms.uTime.value = t;
    rays1.material.rotation =  t * 0.04;
    rays2.material.rotation = -t * 0.03;
    const s = 1.0 + Math.sin(t*0.8)*0.01;
    core.scale.setScalar(s); corona.scale.setScalar(s);
  };

  return g;
}

/* ===== planet helpers ===== */
const texLoader = new THREE.TextureLoader();
function tryLoadTexture(pathA, pathB){
  return new Promise((resolve)=> {
    texLoader.load(
      pathA,
      t => { t.colorSpace = THREE.SRGBColorSpace; resolve(t); },
      undefined,
      () => texLoader.load(pathB, t2 => { t2.colorSpace = THREE.SRGBColorSpace; resolve(t2); }, undefined, () => resolve(null))
    );
  });
}
async function loadPlanetTextures(prefix){
  if (!prefix) return {};
  const [color, normal, roughness, ao, displacement] = await Promise.all([
    tryLoadTexture(`/textures/${prefix}_color.jpg`, `/textures/${prefix}_color.png`),
    tryLoadTexture(`/textures/${prefix}_normal.jpg`, `/textures/${prefix}_normal.png`),
    tryLoadTexture(`/textures/${prefix}_roughness.jpg`, `/textures/${prefix}_roughness.png`),
    tryLoadTexture(`/textures/${prefix}_ao.jpg`, `/textures/${prefix}_ao.png`),
    tryLoadTexture(`/textures/${prefix}_displacement.jpg`, `/textures/${prefix}_displacement.png`),
  ]);
  return { color, normal, roughness, ao, displacement };
}
function makeAtmosphere(radius, tint = 0xa5f3fc, opacity = 0.22){
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTint: { value: new THREE.Color(tint) } },
    vertexShader: `varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vN; uniform vec3 uTint; void main(){ float f=pow(1.0-abs(vN.z),3.0); gl_FragColor=vec4(uTint,f); }`,
    blending: THREE.AdditiveBlending, transparent:true, depthWrite:false
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius*1.06, 48, 48), mat);
  m.renderOrder = 2; m.material.opacity = opacity;
  return m;
}
function makeRings(inner, outer){
  const g = new THREE.RingGeometry(inner, outer, 90, 1);
  const mat = new THREE.MeshBasicMaterial({ color:0xffffff, side:THREE.DoubleSide, transparent:true, opacity:.85 });
  const mesh = new THREE.Mesh(g, mat);
  mesh.rotation.x = Math.PI / 2.2;
  return mesh;
}
async function createPlanet({ radius=0.48, preset=null, baseColor=0x8888aa, withAtmosphere=true, withRings=false, ringScale=2.4 }){
  const group = new THREE.Group();
  const t = await loadPlanetTextures(preset);
  const mat = new THREE.MeshPhysicalMaterial({
    map: t.color || null,
    normalMap: t.normal || null,
    roughnessMap: t.roughness || null,
    aoMap: t.ao || null,
    displacementMap: t.displacement || null,
    displacementScale: t.displacement ? 0.03 : 0,
    roughness: 0.9, metalness: 0.0,
    color: new THREE.Color(baseColor),
    emissive: new THREE.Color(baseColor), emissiveIntensity: 0.08,
    clearcoat: 0.3, clearcoatRoughness: 0.6,
    envMapIntensity: 0.35,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 96), mat);
  group.add(core);
  if (withAtmosphere) group.add(makeAtmosphere(radius));
  if (withRings) group.add(makeRings(radius*1.45, radius*ringScale));
  group.userData.core = core;
  return group;
}

/* ===== component ===== */
export default function Skills3D(){
  const mountRef = useRef(null);
  const overlayRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    const overlay = overlayRef.current;

    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;
    const isMobile = W() < 640;
    const ORBIT_RADIUS = isMobile ? 4.2 : 6.0;
    const SUN_SCALE    = isMobile ? 0.8 : 1.0;

    // scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f1a, 0.016);

    const camera = new THREE.PerspectiveCamera(isMobile ? 60 : 55, W()/H(), 0.1, 150);
    camera.position.set(0, isMobile ? 0.8 : 1.2, isMobile ? 11 : 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const key = new THREE.DirectionalLight(0xffffff, 0.45);
    key.position.set(3, 6, 4); scene.add(key);

    // sun
    const sunGroup = createSunGroup(SUN_SCALE); scene.add(sunGroup);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = isMobile ? 4.5 : 6;
    controls.maxDistance = isMobile ? 16   : 28;
    controls.target.set(0,0,0);

    // planets group
    const cloud = new THREE.Group(); scene.add(cloud);

    // raycaster (planets only)
    const raycaster = new THREE.Raycaster(); raycaster.layers.set(INTERACT_LAYER);
    const mouse = new THREE.Vector2(-2, -2);
    let hovered = null;
    let focusTarget = null;

    const labels = [];

    function goldenSpiralPoints(n, r){
      const pts = []; const inc = Math.PI * (3 - Math.sqrt(5)); const off = 2 / n;
      for (let k=0;k<n;k++){
        const y = k * off - 1 + off/2; const phi = k * inc;
        const rad = Math.sqrt(1 - y*y);
        const x = Math.cos(phi) * rad; const z = Math.sin(phi) * rad;
        pts.push(new THREE.Vector3(x, y, z).multiplyScalar(r));
      }
      return pts;
    }
    const positions = goldenSpiralPoints(SKILLS.length, ORBIT_RADIUS);

    // build planets
    (async () => {
      for (let i=0;i<SKILLS.length;i++){
        const s = SKILLS[i];
        const planet = await createPlanet({
          radius: isMobile ? 0.42 : 0.48,
          preset: s.planet?.preset || null,
          baseColor: s.color,
          withAtmosphere: true,
          withRings: !!s.planet?.rings,
          ringScale: isMobile ? 2.0 : 2.4,
        });
        planet.position.copy(positions[i]);
        planet.userData.skill = s;
        planet.userData.spin = 0.002 + (i % 3) * 0.0016;

        planet.traverse(o => o.layers.enable(INTERACT_LAYER)); // interactive

        cloud.add(planet);

        // label (title + %)
        const el = document.createElement("div");
        el.className = "skill3d-label";
        el.style.opacity = "0";
        el.innerHTML = `
          <span class="skill3d-title">${s.id}</span>
          <span class="skill3d-pct" aria-label="Proficiency">${s.percent}%</span>
        `;
        overlay.appendChild(el);
        labels.push(el);
      }
    })();

    // --- STARS ---
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

    // --- SHOOTING STARS ---
    const streakTex = makeStreakTexture();
    const streakMat = new THREE.SpriteMaterial({ map: streakTex, transparent:true, depthWrite:false, opacity:0.9, blending:THREE.AdditiveBlending });
    const streaks = [];
    const maxStreaks = reduced ? 4 : 10;
    function spawnStreak(){
      if (streaks.length >= maxStreaks) return;
      const sp = new THREE.Sprite(streakMat.clone());
      sp.scale.set(2 + Math.random()*2.6, 0.25, 1);
      const y = 2 + Math.random()*6;
      sp.position.set(-12, y + Math.random()*2, -8 - Math.random()*6);
      sp.userData.vel = new THREE.Vector3(0.55 + Math.random()*1.0, -0.28 - Math.random()*0.35, 0.25 + Math.random()*0.2);
      sp.material.opacity = 0.0;
      scene.add(sp); streaks.push(sp);
    }

    // --- METEORS (static + flying rocks only) ---
    const meteorGeo = new THREE.IcosahedronGeometry(0.16, 1);
    const meteorMat = new THREE.MeshStandardMaterial({ color: 0xb0b7c3, roughness:0.9, metalness:0.05 });

    // static meteors (parked)
    const staticMeteors = [];
    const staticCount = reduced ? 3 : 6;
    for (let i=0;i<staticCount;i++){
      const m = new THREE.Mesh(meteorGeo, meteorMat.clone());
      m.position.set(
        -8 + Math.random()*16,
        -2 + Math.random()*6,
        -6 + Math.random()*10
      );
      m.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      m.userData.spin = new THREE.Vector3(Math.random()*0.002, Math.random()*0.002, Math.random()*0.002);
      scene.add(m); staticMeteors.push(m);
    }

    // flying meteors (no flame)
    const flyMeteors = [];
    const maxFly = reduced ? 2 : 5;

    function spawnFlyMeteor(){
      if (flyMeteors.length >= maxFly) return;

      const group = new THREE.Group();

      // rock
      const rock = new THREE.Mesh(meteorGeo, meteorMat.clone());
      group.add(rock);

      // start position & velocity
      group.position.set(
        9 + Math.random()*6, // start right
        2 + Math.random()*5,
        -3 + Math.random()*6
      );
      const vel = new THREE.Vector3(
        -0.12 - Math.random()*0.15,
        -0.03 - Math.random()*0.06,
        -0.01 + Math.random()*0.05
      );
      group.userData = {
        vel,
        rot: new THREE.Vector3(
          Math.random()*0.03, Math.random()*0.03, Math.random()*0.03
        )
      };

      scene.add(group);
      flyMeteors.push(group);
    }

    // pointer
    function onPointerMove(e){
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", () => {
      if (!hovered) return;
      setSelected({ ...hovered.userData.skill });
      focusTarget = hovered.position.clone().normalize().multiplyScalar(ORBIT_RADIUS + (isMobile ? 3.2 : 4.2));
    });

    // resize
    const ro = new ResizeObserver(() => {
      renderer.setSize(W(), H());
      camera.aspect = W()/H(); camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const worldPos = new THREE.Vector3(); // reused vector

    /* ===== animate ===== */
    let raf = 0, t = 0, shootTimer = 0, meteorTimer = 0, flyTimer = 0;

    function animate(){
      raf = requestAnimationFrame(animate);
      const dt = 0.016; t += dt;

      sunGroup.userData.update?.(t);

      if (!reduced){ cloud.rotation.y += 0.0018; stars.rotation.y -= 0.00025; }
      cloud.children.forEach(m => (m.rotation.y += m.userData.spin || 0));

      // hover
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(cloud.children, true);
      let top = hits[0]?.object || null;
      while (top && top.parent !== cloud) top = top.parent;
      const hit = cloud.children.includes(top) ? top : null;
      if (hit !== hovered){
        if (hovered?.userData?.core) hovered.userData.core.material.emissiveIntensity = 0.08;
        hovered = hit;
        if (hovered?.userData?.core) hovered.userData.core.material.emissiveIntensity = 0.35;
        renderer.domElement.style.cursor = hovered ? "pointer" : "default";
      }

      // focus camera once after click
      if (focusTarget){
        camera.position.lerp(focusTarget, 0.06);
        if (controls.target && typeof controls.target.lerp === "function") {
          controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.06);
        }
        if (camera.position.distanceTo(focusTarget) < 0.05) focusTarget = null;
      }

      // spawns
      shootTimer -= dt; meteorTimer -= dt; flyTimer -= dt;
      if (shootTimer <= 0){ spawnStreak(); shootTimer = (reduced ? 1.6 : 0.9) + Math.random()*0.8; }
      if (meteorTimer <= 0){ /* statics are pre-seeded */ meteorTimer = 99; }
      if (flyTimer <= 0){ spawnFlyMeteor(); flyTimer = (reduced ? 4.5 : 2.2) + Math.random()*1.4; }

      // update streaks
      for (let i=streaks.length-1;i>=0;i--){
        const s = streaks[i];
        s.position.add(s.userData.vel);
        s.material.opacity = Math.min(0.95, s.material.opacity + 0.06);
        s.material.opacity *= 0.995; // gentle fade
        if (s.position.x > 14 || s.position.y < -8 || s.position.z > 10 || s.material.opacity < 0.08){
          scene.remove(s); streaks.splice(i,1);
        }
      }

      // update static meteors (slow spin)
      for (let i=0;i<staticMeteors.length;i++){
        const m = staticMeteors[i];
        m.rotation.x += m.userData.spin.x;
        m.rotation.y += m.userData.spin.y;
        m.rotation.z += m.userData.spin.z;
      }

      // update flying meteors (rocks only)
      for (let i=flyMeteors.length-1;i>=0;i--){
        const g = flyMeteors[i];
        g.position.add(g.userData.vel);
        g.rotation.x += g.userData.rot.x;
        g.rotation.y += g.userData.rot.y;
        g.rotation.z += g.userData.rot.z;

        if (g.position.x < -14 || g.position.y < -8 || g.position.z < -12){
          scene.remove(g); flyMeteors.splice(i,1);
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // -------- LABELS (world position → screen) --------
      for (let i=0;i<labels.length;i++){
        const planet = cloud.children[i]; if (!planet) continue;

        planet.getWorldPosition(worldPos);
        const v = worldPos.project(camera);

        const x = (v.x * 0.5 + 0.5) * W();
        const y = (-v.y * 0.5 + 0.5) * H();

        const margin = 24;
        const outOfBounds =
          x < -margin || x > W()+margin || y < -margin || y > H()+margin;

        labels[i].style.transform =
          `translate(-50%, -50%) translate(${clamp(x,-9999,9999)}px, ${clamp(y,-9999,9999)}px)`;
        labels[i].style.opacity = outOfBounds ? "0" : "1";
      }
    }
    animate();

    // cleanup
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      labels.forEach(el => overlay.removeChild(el));
    };
  }, [reduced]);

  // esc closes modal
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="container" style={{ padding: "1rem 0" }} aria-label="3D Skills">
      <h2 className="display-xxl" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>
        Skills
      </h2>

      <div className="skill3d-wrap">
        <div ref={mountRef} className="skill3d-canvas" />
        <div ref={overlayRef} className="skill3d-overlay" aria-hidden="true" />
      </div>

      <p className="skill3d-help">Drag to orbit • Scroll to zoom • Tap a planet for details</p>

      {selected && (
        <div className="skill3d-modal" role="dialog" aria-modal="true" aria-label={`${selected.id} details`}>
          <button className="skill3d-modal-backdrop" onClick={() => setSelected(null)} aria-label="Close" />
          <article className="skill3d-card" aria-live="polite">
            <div className="skill3d-card-media" style={{ backgroundImage: `url(${selected.image})` }} />
            <div className="skill3d-card-body">
              <div className="skill3d-card-head">
                <h3 className="skill3d-heading">{selected.id}</h3>
                <span className="skill3d-badge">{selected.percent}%</span>
              </div>

              <div className="skill3d-progress" aria-label="Proficiency">
                <div className="skill3d-progress-fill" style={{ width: `${selected.percent}%` }} />
              </div>

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
