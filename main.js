import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PROJECTS, renderMockup, streakTexture } from './projects.js';

gsap.registerPlugin(ScrollTrigger);
const isTouch = matchMedia('(hover: none)').matches;
const lenis = new Lenis({ lerp: .1 }); window.__lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href'); e.preventDefault(); closeMenu(); lenis.scrollTo(id.length > 1 ? id : 0, { duration: 1.4 });
}));

/* ---------- menu ---------- */
const menuBtn = document.getElementById('menuBtn'), overlay = document.getElementById('overlay');
function closeMenu() { menuBtn.classList.remove('open'); overlay.classList.remove('open'); document.querySelector('.top').classList.toggle('inv', !!document.querySelector('.top').dataset.inv); }
menuBtn.addEventListener('click', () => { const o = !overlay.classList.contains('open'); menuBtn.classList.toggle('open', o); overlay.classList.toggle('open', o); document.querySelector('.top').classList.toggle('inv', o || !!document.querySelector('.top').dataset.inv); });

/* ---------- pointer / tilt (shared by all 3D) ---------- */
const P = { x: 0, y: 0, auto: isTouch };
addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { P.x = e.clientX / innerWidth * 2 - 1; P.y = e.clientY / innerHeight * 2 - 1; P.auto = false; } });
addEventListener('deviceorientation', e => {
  if (e.gamma == null) return; P.auto = false;
  P.x = THREE.MathUtils.clamp(e.gamma / 35, -1, 1); P.y = THREE.MathUtils.clamp((e.beta - 45) / 35, -1, 1);
});
function target(t) { return P.auto ? { x: Math.sin(t * .6) * .8, y: Math.sin(t * .45) * .45 } : P; }

/* ---------- cursor (hero) ---------- */
const cur = document.getElementById('cursor'), hero = document.getElementById('hero');
if (!isTouch) {
  const qx = gsap.quickTo(cur, 'x', { duration: .35 }), qy = gsap.quickTo(cur, 'y', { duration: .35 });
  addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY); });
  hero.addEventListener('pointerenter', () => cur.classList.add('on'));
  hero.addEventListener('pointerleave', () => cur.classList.remove('on'));
}

/* ---------- topographic contours ---------- */
const topo = document.getElementById('topo'), tc = topo.getContext('2d');
let TW, TH, heroVisible = true;
function sizeTopo() { const d = Math.min(devicePixelRatio, 2); TW = topo.clientWidth; TH = topo.clientHeight; topo.width = TW * d; topo.height = TH * d; tc.setTransform(d, 0, 0, d, 0, 0); }
sizeTopo(); addEventListener('resize', sizeTopo);
const field = (x, y, t) => Math.sin(x * .0042 + t * .09) * Math.cos(y * .0052 - t * .06) + .7 * Math.sin((x * .7 - y * .45) * .0055 + t * .05)
  + .5 * Math.cos(Math.hypot(x - TW * .32, y - TH * .62) * .0085 - t * .11) + .35 * Math.sin(Math.hypot(x - TW * .8, y - TH * .2) * .011 + t * .08);
let lastTopo = 0;
function drawTopo(t) {
  const C = TW < 700 ? 16 : 14, nx = Math.ceil(TW / C) + 1, ny = Math.ceil(TH / C) + 1, v = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) v[j * nx + i] = field(i * C, j * C, t);
  tc.clearRect(0, 0, TW, TH);
  for (let L = -2.2, k = 0; L <= 2.2; L += .22, k++) {
    tc.beginPath(); tc.strokeStyle = k % 5 === 0 ? 'rgba(213,31,59,.30)' : 'rgba(244,241,234,.07)'; tc.lineWidth = k % 5 === 0 ? 1.1 : .8;
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = v[j * nx + i], b = v[j * nx + i + 1], c = v[(j + 1) * nx + i + 1], d = v[(j + 1) * nx + i];
      const idx = (a > L) | ((b > L) << 1) | ((c > L) << 2) | ((d > L) << 3); if (idx === 0 || idx === 15) continue;
      const x = i * C, y = j * C, f = (p, q) => (L - p) / (q - p);
      const T = [x + C * f(a, b), y], R = [x + C, y + C * f(b, c)], B = [x + C * f(d, c), y + C], Lf = [x, y + C * f(a, d)];
      const seg = (p, q) => { tc.moveTo(p[0], p[1]); tc.lineTo(q[0], q[1]); };
      switch (idx) {
        case 1: case 14: seg(Lf, T); break; case 2: case 13: seg(T, R); break; case 3: case 12: seg(Lf, R); break;
        case 4: case 11: seg(R, B); break; case 6: case 9: seg(T, B); break; case 7: case 8: seg(Lf, B); break;
        case 5: seg(Lf, T); seg(R, B); break; case 10: seg(T, R); seg(Lf, B); break;
      }
    }
    tc.stroke();
  }
}

/* ---------- three helpers ---------- */
function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  return r;
}
let envTex;
function env(r) { if (!envTex) { const pm = new THREE.PMREMGenerator(r); envTex = pm.fromScene(new RoomEnvironment(), .04).texture; } return envTex; }
function canvasTex(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* ---------- hero: helmet worn over the head ---------- */
const hc = document.getElementById('heroGL'), hr = makeRenderer(hc);
const hs = new THREE.Scene(); hs.environment = env(hr);
const hcam = new THREE.PerspectiveCamera(28, 1, .1, 60); hcam.position.set(0, 0, 10);
const shellMat = new THREE.MeshPhysicalMaterial({ color: 0xb3102a, roughness: .22, metalness: .15, clearcoat: 1, clearcoatRoughness: .06, side: THREE.FrontSide }); // FrontSide: inner faces culled so the face shows through the visor
const redMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d, roughness: .25, clearcoat: 1, clearcoatRoughness: .08 }); // black accents
const visorMat = new THREE.MeshPhysicalMaterial({ color: 0x030303, metalness: .55, roughness: .06, envMapIntensity: .9, clearcoat: 1, clearcoatRoughness: 0 }); // solid gloss black
const streakMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .28, blending: THREE.AdditiveBlending, depthWrite: false });
const sph = (r, ps, pl, ts, tl) => new THREE.SphereGeometry(r, 96, 64, ps, pl, ts, tl);
const PI = Math.PI, FRONT = PI / 2, WIN = .88, T0 = .98, T1 = 1.86, TN = 2.6;
// sculpt: chin bar pushes forward and narrows, neck opening tapers, back of shell drops lower
function sculpt(g) {
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const low = THREE.MathUtils.smoothstep(-v.y, .15, .85);
    if (v.z > 0) v.z *= 1 + .26 * low;                      // jaw / chin bar
    v.x *= 1 - .16 * low;                                    // taper to the neck
    if (v.z < 0) v.y -= .1 * low;                            // shell wraps lower at the back
    v.y *= 1.06;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
const mesh = (g, m) => new THREE.Mesh(sculpt(g), m);
const helmet = new THREE.Group();
helmet.add(
  mesh(sph(1, 0, PI * 2, 0, T0), shellMat),                                  // crown
  mesh(sph(1, FRONT + WIN, PI * 2 - WIN * 2, T0, T1 - T0), shellMat),        // sides + back around the eye-port
  mesh(sph(1, 0, PI * 2, T1, TN - T1), shellMat),                            // full lower ring: chin bar + nape
  mesh(sph(1.012, FRONT - .1, .2, .06, T0 - .02), redMat),                    // centre stripe front
  mesh(sph(1.012, PI * 1.5 - .1, .2, .06, TN - .2), redMat),                  // centre stripe back
  mesh(sph(1.01, FRONT + WIN + .05, PI * 2 - WIN * 2 - .1, T1 + .05, .05), redMat), // side pinstripe
  mesh(sph(1.008, 0, PI * 2, TN - .06, .06), redMat),                         // neck-roll trim
);
// chin vents
for (const dx of [-.16, 0, .16]) { const v = new THREE.Mesh(new THREE.BoxGeometry(.07, .2, .05), new THREE.MeshBasicMaterial({ color: 0xff3b52, toneMapped: false })); v.position.set(dx, -.62, 1.13); v.rotation.x = -.35; helmet.add(v); }
// smoked mirror visor + highlight streak
const visor = mesh(sph(1.03, FRONT - WIN - .06, WIN * 2 + .12, T0 - .05, T1 - T0 + .1), visorMat); visor.renderOrder = 2; helmet.add(visor);
const streak = mesh(sph(1.045, FRONT - .55, .55, T0 + .12, .05), streakMat); streak.renderOrder = 3;
const streakG = new THREE.Group(); streakG.add(streak); streakG.rotation.z = .42; helmet.add(streakG);
const streak2 = mesh(sph(1.045, FRONT - .2, .5, T0 + .24, .018), streakMat); streak2.renderOrder = 3; const s2 = new THREE.Group(); s2.add(streak2); s2.rotation.z = .42; helmet.add(s2);
// Tron-style neon: thin hot core + wider additive glow, both unlit (bloom faked with the glow shell)
const coreMat = new THREE.MeshBasicMaterial({ color: 0xffc9cf, toneMapped: false });
const glowMat = new THREE.MeshBasicMaterial({ color: 0xff1a35, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
function neon(ps, pl, ts, tl, w = .012) {
  const c = mesh(sph(1.02, ps, pl, ts, tl), coreMat); c.renderOrder = 4; helmet.add(c);
  const g = mesh(sph(1.03, ps - w * 2, pl + w * 4, Math.max(0, ts - w * 2.5), tl + w * 5), glowMat); g.renderOrder = 5; helmet.add(g);
}
const tv = .014;
neon(FRONT - WIN - .08, WIN * 2 + .16, T0 - .07, tv);                        // visor top edge
neon(FRONT - WIN - .08, WIN * 2 + .16, T1 + .06, tv);                        // visor bottom edge
neon(FRONT - WIN - .1, tv * 1.4, T0 - .07, T1 - T0 + .14);                    // visor side edges
neon(FRONT + WIN + .08, tv * 1.4, T0 - .07, T1 - T0 + .14);
neon(FRONT + .11, tv, .1, T0 - .2); neon(FRONT - .125, tv, .1, T0 - .2);      // twin crown lines
neon(FRONT + WIN + .2, PI * 2 - WIN * 2 - .4, 1.42, tv);                     // lateral line wrapping the back
neon(0, PI * 2, TN - .1, tv);                                                 // neck ring
neon(FRONT - .5, 1, 2.28, tv);                                                // chin bar contour
// fitted to the head in img/portrait.webp: head turned ~18° to camera-left, chin raised, slight roll
const BASE = { x: -.16, y: -.34, z: .1 };
const heroGroup = new THREE.Group(); heroGroup.add(helmet); hs.add(heroGroup);
hs.add(new THREE.HemisphereLight(0xffffff, 0x220508, .9));
const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 6); hs.add(key);
const rimL = new THREE.DirectionalLight(0xd51f3b, 3); rimL.position.set(-4, 1, -2); hs.add(rimL);
// head centre / width measured on img/portrait.webp (1053x1100): centre (0.42, 0.245) of the image, head ≈ 0.44 of image width
const HEAD = { x: .395, y: .27, r: .272 }; // centre (fraction of image) and helmet radius (fraction of image width)
// portrait plane in the same scene so the helmet layer aligns 1:1 with the DOM <img>
const portraitTex = new THREE.TextureLoader().load('img/portrait-suit.webp'); portraitTex.colorSpace = THREE.SRGBColorSpace;
const portraitPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: portraitTex, transparent: true, toneMapped: false, depthWrite: false }));
portraitPlane.renderOrder = -1; hs.add(portraitPlane);
hr.toneMapping = THREE.NoToneMapping;

/* ---- ink-bleed reveal: ping-pong mask sim + composite ---- */
const NOISE = `
vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);}vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
i=m289(i);vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 nm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
const rtOpts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
let maskA = new THREE.WebGLRenderTarget(4, 4, rtOpts), maskB = new THREE.WebGLRenderTarget(4, 4, rtOpts);
const layerRT = new THREE.WebGLRenderTarget(4, 4, { samples: 4 }); layerRT.texture.colorSpace = THREE.SRGBColorSpace;
const quad = new THREE.PlaneGeometry(2, 2), ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const simMat = new THREE.ShaderMaterial({
  uniforms: { prev: { value: null }, mouse: { value: new THREE.Vector2(-9, -9) }, last: { value: new THREE.Vector2(-9, -9) }, aspect: { value: 1 }, t: { value: 0 }, radius: { value: .07 }, amount: { value: 0 }, dt: { value: 1 }, keep: { value: 0 }, px: { value: new THREE.Vector2() } },
  vertexShader: VERT, fragmentShader: NOISE + `
  uniform sampler2D prev; uniform vec2 mouse, last, px; uniform float aspect, t, radius, amount, dt, keep; varying vec2 vUv;
  float seg(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.,1.); return length(pa-ba*h); }
  void main(){
    vec2 uv = vUv;
    vec2 flow = vec2(snoise(vec3(uv*3.2, t*.15)), snoise(vec3(uv*3.2+11., t*.15))) * px * 1.6;
    vec4 c = texture2D(prev, uv - flow);
    vec4 n1 = texture2D(prev, uv+vec2(px.x,0.)), n2 = texture2D(prev, uv-vec2(px.x,0.)), n3 = texture2D(prev, uv+vec2(0.,px.y)), n4 = texture2D(prev, uv-vec2(0.,px.y));
    float avg = (n1.r+n2.r+n3.r+n4.r)*.25;
    float hold = max(c.g, max(max(n1.g,n2.g),max(n3.g,n4.g)) * .97); // G: hold timer
    float v = mix(c.r, max(c.r, avg), .55);                            // ink bleed (as before)
    hold -= dt / 60.;                                                  // ~1.0 s hold
    if (hold <= 0.) v -= dt / (.5 * 60.);                              // then ~0.5 s fade
    else v = v * pow(.996, dt);
    vec2 A = vec2(aspect, 1.);
    float d = seg(uv*A, last*A, mouse*A);
    float r = radius * (1. + .45*snoise(vec3(uv*9., t*.6)));
    float b = smoothstep(r, r*.15, d) * amount;
    v += b; if (b > .02) hold = 1.;
    gl_FragColor = vec4(clamp(v, 0., 1.), clamp(hold, 0., 1.), 0., 1.);
  }` });
const compMat = new THREE.ShaderMaterial({
  uniforms: { mask: { value: null }, layer: { value: layerRT.texture }, t: { value: 0 } }, transparent: true,
  vertexShader: VERT, fragmentShader: NOISE + `
  uniform sampler2D mask, layer; uniform float t; varying vec2 vUv;
  void main(){
    float n = snoise(vec3(vUv*7., t*.25))*.5 + snoise(vec3(vUv*22., t*.4))*.25;
    float m = texture2D(mask, vUv).r + n*.18;
    float a = smoothstep(.17, .3, m);
    float rim = smoothstep(.12, .17, m) * (1. - smoothstep(.17, .26, m));
    vec4 c = texture2D(layer, vUv);
    vec3 col = c.rgb * a + vec3(.6, .04, .1) * rim * .6 * c.a;
    gl_FragColor = vec4(col, max(c.a * a, rim * .6 * c.a));
    #include <colorspace_fragment>
  }` });
const simScene = new THREE.Scene(); simScene.add(new THREE.Mesh(quad, simMat));
const compScene = new THREE.Scene(); compScene.add(new THREE.Mesh(quad, compMat));
const FORCE = new URLSearchParams(location.search).has('reveal'); // ?reveal = show full reveal layer (alignment check)
const ink = { x: -9, y: -9, lx: -9, ly: -9, amt: 0, last: 0, active: false };
function inkAt(cx, cy, amt) {
  const r = hc.getBoundingClientRect(); const x = (cx - r.left) / r.width, y = 1 - (cy - r.top) / r.height;
  if (!ink.active) { ink.lx = x; ink.ly = y; } ink.x = x; ink.y = y; ink.active = true;
  ink.amt = Math.min(.75, ink.amt + amt); ink.last = performance.now();
}
hero.addEventListener('pointermove', e => { const r = hc.getBoundingClientRect(); const dx = (e.clientX - ink.px || 0), dy = (e.clientY - ink.py || 0); ink.px = e.clientX; ink.py = e.clientY; inkAt(e.clientX, e.clientY, Math.min(.25, Math.hypot(dx, dy) / r.height * 4) + .04); });
hero.addEventListener('pointerdown', e => inkAt(e.clientX, e.clientY, .5));
hero.addEventListener('pointerleave', () => { ink.active = false; ink.px = null; });
// idle auto-demo on touch screens
let demoT = 0;
function autoDemo(t) {
  if (!isTouch || performance.now() - ink.last < 4000) return;
  if (!demoT) demoT = t; const k = t - demoT; if (k > 7) { demoT = 0; ink.active = false; return; }
  if (k > 2.2) { ink.active = false; return; }
  const pr = document.querySelector('.portrait img').getBoundingClientRect();
  const a = k * 2.4; inkAt(pr.left + pr.width * (HEAD.x + Math.cos(a) * .12), pr.top + pr.height * (HEAD.y + Math.sin(a * 1.3) * .08), .12); ink.last = performance.now() - 4001;
}
function stepInk(t) {
  autoDemo(t);
  simMat.uniforms.dt.value = Math.min(10, (t - (stepInk.t || t)) * 60) || 1; stepInk.t = t;
  simMat.uniforms.prev.value = maskA.texture; simMat.uniforms.t.value = t;
  simMat.uniforms.mouse.value.set(ink.active ? ink.x : -9, ink.active ? ink.y : -9);
  simMat.uniforms.last.value.set(ink.active ? ink.lx : -9, ink.active ? ink.ly : -9);
  simMat.uniforms.amount.value = ink.active ? ink.amt : 0;
  simMat.uniforms.keep.value = ink.active && performance.now() - ink.last < 150 ? 1 : 0;
  simMat.uniforms.radius.value = .045 + ink.amt * .09;
  ink.lx = ink.x; ink.ly = ink.y; ink.amt *= .82;
  if (FORCE) { hr.setRenderTarget(maskB); hr.setClearColor(0xffffff, 1); hr.clear(); } else { hr.setRenderTarget(maskB); hr.render(simScene, ortho); }
  [maskA, maskB] = [maskB, maskA];
  hr.setRenderTarget(layerRT); hr.setClearColor(0, 0); hr.clear(); hr.render(hs, hcam);
  hr.setRenderTarget(null); hr.clear();
  compMat.uniforms.mask.value = maskA.texture; compMat.uniforms.t.value = t;
  hr.render(compScene, ortho);
}
function sizeHero() {
  const w = hc.clientWidth, h = hc.clientHeight; hr.setSize(w, h, false); hcam.aspect = w / h; hcam.updateProjectionMatrix();
  const d = hr.getPixelRatio(); layerRT.setSize(w * d, h * d);
  const mw = Math.ceil(w / 3), mh = Math.ceil(h / 3); maskA.setSize(mw, mh); maskB.setSize(mw, mh);
  simMat.uniforms.px.value.set(1 / mw, 1 / mh); simMat.uniforms.aspect.value = w / h;
  const img = document.querySelector('.portrait img'), hrc = hero.getBoundingClientRect();
  // layout box without transforms (intro tween / scroll scale): offset* is transform-free
  const fig = img.parentElement, pw = img.offsetWidth, ph = img.offsetHeight;
  const left = fig.offsetLeft - fig.offsetWidth / 2 + img.offsetLeft, top = fig.offsetTop + img.offsetTop;
  // object-fit:contain + bottom — compute the drawn image box
  const ar = 1053 / 1100; let dw = pw, dh = pw / ar; if (dh > ph) { dh = ph; dw = ph * ar; }
  const ix = left + (pw - dw) / 2, iy = top + (ph - dh);
  const vh = 2 * hcam.position.z * Math.tan(THREE.MathUtils.degToRad(hcam.fov / 2)), vw = vh * hcam.aspect, k = vw / w;
  portraitPlane.scale.set(dw * k, dh * k, 1); portraitPlane.position.set((ix + dw / 2 - w / 2) * k, (h / 2 - iy - dh / 2) * k, -0.001);
  const sx = ix + dw * HEAD.x, sy = iy + dh * HEAD.y;
  heroGroup.position.set((sx - w / 2) * k, (h / 2 - sy) * k, 0);
  heroGroup.scale.setScalar(dw * HEAD.r * k);
}
/* ---------- toolkit: grid of 3D objects ---------- */
const TOOLS = [
  { n: 'Ps', name: 'Photoshop', sub: 'Retouch · comps', col: '#0b2a4a', fg: '#31a8ff', geo: () => new RoundedBoxGeometry(1.5, 1.5, 1.5, 6, .16) },
  { n: 'Fg', name: 'Figma', sub: 'UI · systems', col: '#2c1a4d', fg: '#c7a8ff', geo: () => new RoundedBoxGeometry(1.1, 2.1, .14, 6, .06), device: 1 },
  { n: 'Cc', name: 'CapCut', sub: 'Short-form video', col: '#f2f2f0', fg: '#111211', geo: () => new RoundedBoxGeometry(1.8, 1.2, 1.2, 6, .1) },
  { n: 'Ca', name: 'Canva', sub: 'Fast social kits', col: '#3b0a12', fg: '#ff8a9a', geo: () => new RoundedBoxGeometry(1.6, 1.6, .5, 6, .2) },
  { n: '</>', name: 'HTML / CSS / JS', sub: 'Front-end builds', col: '#e86a33', fg: '#151514', geo: () => new RoundedBoxGeometry(2.2, 1.4, .12, 6, .05), device: 1 },
  { n: 'AI', name: 'AI image / video', sub: 'Concept · motion', col: '#d51f3b', fg: '#f4f1ea', geo: () => new RoundedBoxGeometry(1.35, 1.35, 1.35, 8, .5) },
];
const tk = [], grid = document.getElementById('tkGrid');
TOOLS.forEach((T, i) => {
  const cell = document.createElement('div'); cell.className = 'tk';
  cell.innerHTML = `<span class="no">0${i + 1}</span><canvas></canvas><div class="lbl"><span>${T.name}</span><span>${T.sub}</span></div>`;
  grid.appendChild(cell);
  const r = makeRenderer(cell.querySelector('canvas')), s = new THREE.Scene(); s.environment = env(r);
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 50); cam.position.z = 7;
  const face = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = T.col; x.fillRect(0, 0, w, h);
    if (T.device) { x.fillStyle = '#0c0c0c'; x.fillRect(0, 0, w, h); x.fillStyle = T.col; x.fillRect(w * .04, h * .04, w * .92, h * .92); }
    x.fillStyle = T.fg; x.font = `400 ${T.n.length > 2 ? 150 : 210}px "Instrument Serif"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(T.n, w / 2, h * .5);
    x.font = '500 26px "JetBrains Mono"'; x.fillText(T.name.toUpperCase(), w / 2, h * .82);
  });
  const side = new THREE.MeshPhysicalMaterial({ color: T.col, roughness: .3, clearcoat: 1, clearcoatRoughness: .15, metalness: T.device ? .5 : 0 });
  const front = new THREE.MeshPhysicalMaterial({ map: face, roughness: .3, clearcoat: 1, clearcoatRoughness: .1 });
  const m = new THREE.Mesh(T.geo(), [side, side, side, side, front, front]);
  s.add(m, new THREE.HemisphereLight(0xffffff, 0x222222, 1));
  const L = new THREE.DirectionalLight(0xffffff, 2); L.position.set(2, 3, 4); s.add(L);
  const rim = new THREE.DirectionalLight(0xd51f3b, 1.6); rim.position.set(-3, -1, -5); s.add(rim);
  tk.push({ r, s, cam, m, cell, phase: i * .7 });
});
function sizeTk() { tk.forEach(o => { const w = o.cell.clientWidth, h = o.cell.clientHeight; o.r.setSize(w, h, false); o.cam.aspect = w / h; o.cam.updateProjectionMatrix(); o.cam.position.z = w / h < 1 ? 8.5 : 7; }); }
let tkVisible = false;
new IntersectionObserver(([e]) => tkVisible = e.isIntersecting).observe(grid);
new IntersectionObserver(([e]) => heroVisible = e.isIntersecting).observe(hero);
if (isTouch) document.getElementById('tkHint').textContent = 'Tilt your phone — everything follows.';

function resize() { sizeHero(); sizeTk(); }
addEventListener('resize', resize);

/* ---------- render loop ---------- */
const rot = { x: 0, y: 0 }, clock = new THREE.Clock();
gsap.ticker.add(() => {
  const t = clock.getElapsedTime(), tg = target(t);
  rot.x += (tg.y * .45 - rot.x) * .07; rot.y += (tg.x * .9 - rot.y) * .07;
  if (heroVisible) {
    if (t - lastTopo > 1 / 30) { drawTopo(t); lastTopo = t; }
    helmet.rotation.set(BASE.x + THREE.MathUtils.clamp(rot.x * .2, -.08, .08), BASE.y + THREE.MathUtils.clamp(rot.y * .25, -.2, .2), BASE.z - rot.y * .02);
    stepInk(t);
  }
  if (tkVisible) tk.forEach(o => { o.m.rotation.set(rot.x + .2, rot.y - .35, 0); o.m.position.y = Math.sin(t * 1.1 + o.phase) * .07; o.r.render(o.s, o.cam); });
});

/* ---------- text splitting ---------- */
function split(el) {
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(s => { if (!s) return; if (/^\s+$/.test(s)) f.append(' '); else { const w = document.createElement('span'); w.className = 'w'; w.innerHTML = `<span class="wi">${s}</span>`; f.append(w); } }); c.replaceWith(f); }
    else walk(c);
  });
  walk(el); return el.querySelectorAll('.wi');
}

/* ---------- scroll choreography ---------- */
function setupScroll() {
  // hero intro
  gsap.from('.portrait', { yPercent: 18, opacity: 0, duration: 1.4, ease: 'power3.out' }); gsap.from(hc, { opacity: 0, duration: 1.4 });
  gsap.from('.hero-big span', { yPercent: 60, opacity: 0, duration: 1.4, stagger: .1, ease: 'power3.out' });
  
  // stacked card: hero stays pinned, dark section slides over
  ScrollTrigger.create({ trigger: hero, start: 'top top', end: () => '+=' + hero.offsetHeight, pin: true, pinSpacing: false });
  gsap.fromTo(hero, { scale: 1, filter: 'brightness(1)' }, { scale: .92, filter: 'brightness(.55)', ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'top top', scrub: true } });
  gsap.fromTo('.streaks', { backgroundPositionX: 0 }, { backgroundPositionX: -1800, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.streaks', { backgroundPositionX: '-=900', duration: 30, repeat: -1, ease: 'none' });
  // quote words
  gsap.from(split(document.querySelector('.quote')), { yPercent: 110, duration: 1, stagger: .035, ease: 'power3.out', scrollTrigger: { trigger: '.quote', start: 'top 78%' } });
  gsap.from('.inset img', { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: { trigger: '.about-row', start: 'top 80%' } });
  gsap.from('.about-txt p', { y: 30, opacity: 0, duration: 1, scrollTrigger: { trigger: '.about-row', start: 'top 80%' } });
  // signature draws itself
  gsap.timeline({ scrollTrigger: { trigger: '.sig', start: 'top 90%', end: 'top 45%', scrub: .6 } })
    .to('#sig', { strokeDashoffset: 0, ease: 'none', duration: 1 }).to('#sig', { fillOpacity: 1, duration: .3 }, '-=.15');
  ScrollTrigger.create({ trigger: '#about', start: 'top 80px', end: 'max', onToggle: st => document.querySelector('.top').classList.toggle('solid', st.isActive) });
  // header colour on dark sections
  const top = document.querySelector('.top');
  document.querySelectorAll('.dark').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 40px', end: 'bottom 40px',
    onToggle: st => { top.dataset.inv = st.isActive ? '1' : ''; top.classList.toggle('inv', st.isActive || overlay.classList.contains('open')); } }));
  // highlighter blocks
  gsap.from(split(document.querySelector('.st')), { opacity: .15, stagger: .02, ease: 'none', scrollTrigger: { trigger: '.st', start: 'top 85%', end: 'bottom 60%', scrub: true } });
  document.querySelectorAll('.hl').forEach(h => gsap.fromTo(h, { '--p': 0 }, { '--p': 1, ease: 'power2.inOut', scrollTrigger: { trigger: h, start: 'top 82%', end: 'top 52%', scrub: .5 } }));
  // bg to light gray, then back
  gsap.timeline({ scrollTrigger: { trigger: '#work', start: 'top 85%', end: 'top 25%', scrub: true } }).fromTo(document.body, { backgroundColor: '#08090c' }, { backgroundColor: '#15161a', ease: 'none' });
  gsap.from('.work-head > *', { y: 40, opacity: 0, stagger: .1, duration: 1, scrollTrigger: { trigger: '.work-head', start: 'top 80%' } });
  document.querySelectorAll('.tile').forEach((t, i) => {
    gsap.from(t.querySelector('.ti'), { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: t, start: 'top 90%' } });
    if (innerWidth > 800) gsap.to(t, { y: (i % 3 - 1) * -60, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.col h3', { yPercent: 40, opacity: 0, stagger: .15, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.services', start: 'top 75%' } });
  gsap.from('.col li', { x: -20, opacity: 0, stagger: .04, duration: .7, scrollTrigger: { trigger: '.services', start: 'top 65%' } });
  gsap.from('.tk', { opacity: 0, y: 60, stagger: .08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: grid, start: 'top 80%' } });
  gsap.from('.big', { yPercent: 30, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });
}

/* ---------- build ---------- */
async function init() {
  await document.fonts.ready;
  await document.querySelector('.portrait img').decode().catch(() => {});
  document.querySelector('.streaks').style.backgroundImage = `url(${streakTexture()})`;
  const gal = document.getElementById('gal');
  PROJECTS.forEach((p, i) => {
    const f = document.createElement('figure'); f.className = 'tile'; f.style.gridColumn = p.col; f.style.marginTop = p.y + 'vw';
    f.innerHTML = `<div class="ti"><img alt="${p.title} — ${p.client} (placeholder)" width="${p.w}" height="${p.h}"></div><figcaption><span>${String(i + 1).padStart(2, '0')} · ${p.title}</span><span>${p.client}</span></figcaption>`;
    f.querySelector('img').src = renderMockup(p); gal.appendChild(f);
  });
    resize(); setupScroll();
  const clockEl = document.getElementById('clock');
  const tick = () => clockEl.textContent = 'Taguig ' + new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' }).format(new Date()) + ' GMT+8';
  tick(); setInterval(tick, 30000);
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
init();
