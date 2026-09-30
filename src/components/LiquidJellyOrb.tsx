import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const noiseGLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m*=m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){
  float value=0.0;float amplitude=0.55;
  mat3 rotation=mat3(0.00,0.80,0.60,-0.80,0.36,-0.48,-0.60,-0.48,0.64);
  for(int i=0;i<4;i++){value+=amplitude*snoise(p);p=rotation*p*2.02+vec3(0.17,-0.11,0.13);amplitude*=0.5;}
  return value;
}
`;

const blobVertexShader = `
uniform float uTime; uniform float uEnergy;
varying vec3 vObjectPosition; varying vec3 vWorldPosition; varying vec3 vWorldNormal; varying float vNoise;
${noiseGLSL}
void main(){
  vec3 p=position; float time=uTime*0.42; vec3 samplePoint=normalize(position)*2.35;
  float broadNoise=snoise(samplePoint+vec3(time,-time*0.71,time*0.46));
  float detailNoise=snoise(samplePoint*2.1+vec3(-time*0.82,time*0.55,-time*0.34));
  float liquidNoise=broadNoise+detailNoise*0.42;
  float ripple=sin(position.y*5.4-uTime*1.65+liquidNoise*2.8);
  float displacement=liquidNoise*0.034+ripple*0.011;
  p+=normal*displacement*(1.0+uEnergy*0.78);
  vec4 world=modelMatrix*vec4(p,1.0);
  vObjectPosition=p; vWorldPosition=world.xyz; vWorldNormal=normalize(mat3(modelMatrix)*normal); vNoise=liquidNoise;
  gl_Position=projectionMatrix*viewMatrix*world;
}
`;

const liquidFragmentShader = `
uniform float uTime; uniform float uEnergy; uniform vec2 uPointer;
uniform vec3 uDeepColor; uniform vec3 uElectricColor; uniform vec3 uLiquidColor; uniform vec3 uIceColor;
varying vec3 vObjectPosition; varying vec3 vWorldPosition; varying vec3 vWorldNormal; varying float vNoise;
${noiseGLSL}
mat2 rotate2d(float angle){float s=sin(angle);float c=cos(angle);return mat2(c,-s,s,c);}
void main(){
  vec3 p=vObjectPosition*2.3; p.xz*=rotate2d(uTime*0.12); p.xy*=rotate2d(-uTime*0.08);
  vec3 drift=vec3(uTime*0.13,-uTime*0.18,uTime*0.105);
  float warpA=fbm(p*1.08+drift);
  float warpB=fbm(p*1.72-drift*1.37+vec3(warpA*1.4));
  float flow=fbm(p*2.35+vec3(warpA,warpB,-warpA)*1.75+drift*0.8);
  float angle=atan(p.z,p.x);
  float ribbonWave=sin(p.y*5.0+angle*2.25+warpA*4.2-uTime*1.35);
  float ribbons=pow(max(0.0,1.0-abs(ribbonWave)),4.5);
  float cells=smoothstep(0.08,0.72,flow+warpB*0.46);
  float sparks=pow(max(0.0,flow*0.5+warpA*0.5+0.44),6.0);
  vec3 normal=normalize(vWorldNormal); vec3 viewDirection=normalize(cameraPosition-vWorldPosition);
  float facing=clamp(dot(normal,viewDirection),0.0,1.0); float fresnel=pow(1.0-facing,2.75);
  
  vec3 color=mix(uDeepColor,uElectricColor,cells);
  color=mix(color,uLiquidColor,ribbons*0.66);
  color+=uElectricColor*max(vNoise,0.0)*0.42;
  color+=uIceColor*sparks*(0.6+uEnergy*0.65);
  color+=mix(uElectricColor,uLiquidColor,facing)*fresnel*0.82;
  float pointerGlow=max(0.0,dot(normalize(vObjectPosition),normalize(vec3(uPointer,0.72))));
  pointerGlow=pow(pointerGlow,10.0);
  color+=uIceColor*pointerGlow*(0.16+uEnergy*0.36);
  color*=0.86+facing*0.28;
  gl_FragColor=vec4(color,0.98);
}
`;

const glassFragmentShader = `
uniform float uTime; uniform float uEnergy;
uniform vec3 uBlueColor; uniform vec3 uCyanColor; uniform vec3 uWhiteColor;
varying vec3 vObjectPosition; varying vec3 vWorldPosition; varying vec3 vWorldNormal; varying float vNoise;
void main(){
  vec3 normal=normalize(vWorldNormal); vec3 viewDirection=normalize(cameraPosition-vWorldPosition);
  vec3 lightDirection=normalize(vec3(-0.55,0.82,0.95)); vec3 reflectedLight=reflect(-lightDirection,normal);
  float facing=clamp(dot(normal,viewDirection),0.0,1.0); float fresnel=pow(1.0-facing,3.15);
  float sharpHighlight=pow(max(dot(reflectedLight,viewDirection),0.0),86.0);
  float broadHighlight=pow(max(dot(reflectedLight,viewDirection),0.0),13.0);
  float lowerRim=pow(max(dot(normal,normalize(vec3(0.35,-0.75,0.52))),0.0),8.0);
  
  vec3 color=uBlueColor*fresnel*1.18;
  color+=uCyanColor*broadHighlight*0.36;
  color+=uWhiteColor*sharpHighlight*(1.4+uEnergy*0.55);
  color+=uBlueColor*lowerRim*0.28;
  color+=uCyanColor*max(vNoise,0.0)*fresnel*0.16;
  float alpha=0.035+fresnel*0.47;
  alpha+=broadHighlight*0.10+sharpHighlight*0.74;
  alpha+=lowerRim*0.08;
  gl_FragColor=vec4(color,clamp(alpha,0.0,0.92));
}
`;

function seededRandom(i: number) {
  const v = Math.sin(i * 78.233 + 19.19) * 43758.5453;
  return v - Math.floor(v);
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

interface LiquidJellyOrbProps {
  size?: number;
  onClick?: () => void;
  agentColor?: string;
}

export const LiquidJellyOrb: React.FC<LiquidJellyOrbProps> = ({
  size = 108,
  onClick,
  agentColor = "#00f0ff",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Default clean cyan/electric blue palette from user's prototype
  const deepRef = useRef(new THREE.Color(0.005, 0.035, 0.14));
  const electricRef = useRef(new THREE.Color(0.015, 0.28, 1.0));
  const liquidRef = useRef(new THREE.Color(0.10, 0.78, 1.0));
  const iceRef = useRef(new THREE.Color(0.72, 0.94, 1.0));
  const glassBlueRef = useRef(new THREE.Color(0.10, 0.48, 1.0));
  const glassCyanRef = useRef(new THREE.Color(0.27, 0.84, 1.0));
  const glassWhiteRef = useRef(new THREE.Color(0.86, 0.97, 1.0));

  // Dynamically update palette when agent changes, preserving the electric clarity
  useEffect(() => {
    if (!agentColor || agentColor === "#00f0ff" || agentColor === "#3b82f6" || agentColor === "#4ee8ff") {
      deepRef.current.setRGB(0.005, 0.035, 0.14);
      electricRef.current.setRGB(0.015, 0.28, 1.0);
      liquidRef.current.setRGB(0.10, 0.78, 1.0);
      iceRef.current.setRGB(0.72, 0.94, 1.0);
      glassBlueRef.current.setRGB(0.10, 0.48, 1.0);
      glassCyanRef.current.setRGB(0.27, 0.84, 1.0);
      glassWhiteRef.current.setRGB(0.86, 0.97, 1.0);
    } else {
      const base = new THREE.Color(agentColor);
      deepRef.current.copy(base).multiplyScalar(0.15);
      electricRef.current.copy(base);
      liquidRef.current.copy(base).lerp(new THREE.Color(1, 1, 1), 0.38);
      iceRef.current.copy(base).lerp(new THREE.Color(1, 1, 1), 0.78);
      glassBlueRef.current.copy(base).multiplyScalar(0.8);
      glassCyanRef.current.copy(base).lerp(new THREE.Color(1, 1, 1), 0.4);
      glassWhiteRef.current.setRGB(0.92, 0.97, 1.0);
    }
  }, [agentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let animId: number;
    let isDisposed = false;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
    camera.position.set(0, 0, 4.15);

    const group = new THREE.Group();
    scene.add(group);

    const fluidUniforms = {
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uDeepColor: { value: deepRef.current.clone() },
      uElectricColor: { value: electricRef.current.clone() },
      uLiquidColor: { value: liquidRef.current.clone() },
      uIceColor: { value: iceRef.current.clone() },
    };

    const glassUniforms = {
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uBlueColor: { value: glassBlueRef.current.clone() },
      uCyanColor: { value: glassCyanRef.current.clone() },
      uWhiteColor: { value: glassWhiteRef.current.clone() },
    };

    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: fluidUniforms,
      vertexShader: blobVertexShader,
      fragmentShader: liquidFragmentShader,
      transparent: true,
      depthWrite: true,
    });

    const glassMaterial = new THREE.ShaderMaterial({
      uniforms: glassUniforms,
      vertexShader: blobVertexShader,
      fragmentShader: glassFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const sphereGeo = new THREE.SphereGeometry(1, 96, 96);

    const fluidMesh = new THREE.Mesh(sphereGeo, fluidMaterial);
    fluidMesh.scale.setScalar(0.955);
    group.add(fluidMesh);

    // Knot ribbons from prototype
    const ribbons = new THREE.Group();
    ribbons.scale.setScalar(0.93);
    const knotMat1 = new THREE.MeshBasicMaterial({
      color: 0x40b8ff,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const knot1 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.57, 0.012, 180, 7, 2, 3), knotMat1);
    knot1.rotation.set(0.7, 0.25, 0.15);
    ribbons.add(knot1);

    const knotMat2 = new THREE.MeshBasicMaterial({
      color: 0xa8efff,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const knot2 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.56, 0.009, 160, 6, 3, 4), knotMat2);
    knot2.rotation.set(-0.42, 0.78, -0.4);
    knot2.scale.setScalar(0.82);
    ribbons.add(knot2);
    group.add(ribbons);

    // 92 Sparkle particles from prototype
    const count = 92;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = Math.cbrt(seededRandom(i * 3 + 1)) * 0.84;
      const theta = seededRandom(i * 3 + 2) * Math.PI * 2;
      const z = seededRandom(i * 3 + 3) * 2 - 1;
      const ring = Math.sqrt(1 - z * z);
      positions[i * 3] = radius * ring * Math.cos(theta);
      positions[i * 3 + 1] = radius * z;
      positions[i * 3 + 2] = radius * ring * Math.sin(theta);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x8eeaff,
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    const glassMesh = new THREE.Mesh(sphereGeo, glassMaterial);
    glassMesh.scale.setScalar(1.035);
    group.add(glassMesh);

    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x65bdff,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      toneMapped: false,
    });
    const rimMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), rimMat);
    rimMesh.scale.setScalar(1.062);
    group.add(rimMesh);

    let hovered = false;
    let burst = 0;
    const pointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();

    function resize() {
      if (!wrap || !canvas) return;
      const w = wrap.clientWidth || size;
      const h = wrap.clientHeight || size;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    function updatePointer(clientX: number, clientY: number) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    function hitTest() {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([fluidMesh, glassMesh]);
      return hits.length > 0;
    }

    const onPointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      hovered = hitTest();
      if (canvas) canvas.style.cursor = hovered ? "pointer" : "default";
    };

    const onPointerLeave = () => {
      hovered = false;
      if (canvas) canvas.style.cursor = "default";
    };

    const onPointerDown = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      if (hitTest()) {
        burst = 1.05;
        if (onClick) onClick();
      }
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerdown", onPointerDown);

    const startTime = performance.now();
    let lastTime = startTime;
    let scale = 1;

    function animate() {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;
      const elapsed = (now - startTime) * 0.001;
      const targetEnergy = hovered ? 0.62 : 0.14;
      burst = Math.max(0, burst - dt * 1.55);
      const energy = Math.min(1.25, targetEnergy + burst);

      // Smooth color interpolation
      fluidUniforms.uDeepColor.value.lerp(deepRef.current, 0.08);
      fluidUniforms.uElectricColor.value.lerp(electricRef.current, 0.08);
      fluidUniforms.uLiquidColor.value.lerp(liquidRef.current, 0.08);
      fluidUniforms.uIceColor.value.lerp(iceRef.current, 0.08);

      glassUniforms.uBlueColor.value.lerp(glassBlueRef.current, 0.08);
      glassUniforms.uCyanColor.value.lerp(glassCyanRef.current, 0.08);
      glassUniforms.uWhiteColor.value.lerp(glassWhiteRef.current, 0.08);

      knotMat1.color.lerp(liquidRef.current, 0.08);
      knotMat2.color.lerp(iceRef.current, 0.08);
      particleMat.color.lerp(iceRef.current, 0.08);
      rimMat.color.lerp(glassBlueRef.current, 0.08);

      fluidUniforms.uTime.value = elapsed;
      fluidUniforms.uEnergy.value = damp(fluidUniforms.uEnergy.value, energy, 5.2, dt);
      fluidUniforms.uPointer.value.lerp(pointer, 0.065);

      glassUniforms.uTime.value = elapsed;
      glassUniforms.uEnergy.value = damp(glassUniforms.uEnergy.value, energy, 5.2, dt);

      const targetScale = hovered ? 1.055 : 1;
      scale = damp(scale, targetScale, 6.5, dt);
      group.scale.setScalar(scale);
      group.rotation.y = damp(group.rotation.y, pointer.x * 0.22 + elapsed * 0.055, 3.2, dt);
      group.rotation.x = damp(group.rotation.x, -pointer.y * 0.17 + Math.sin(elapsed * 0.5) * 0.04, 3.2, dt);

      ribbons.rotation.x += dt * 0.075;
      ribbons.rotation.y -= dt * 0.105;
      ribbons.rotation.z = Math.sin(elapsed * 0.31) * 0.22;

      particles.rotation.y += dt * 0.16;
      particles.rotation.x = Math.sin(elapsed * 0.22) * 0.24;
      particleMat.opacity = 0.58 + Math.sin(elapsed * 2.2) * 0.13;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);

      sphereGeo.dispose();
      fluidMaterial.dispose();
      glassMaterial.dispose();
      knotMat1.dispose();
      knotMat2.dispose();
      knot1.geometry.dispose();
      knot2.geometry.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      rimMat.dispose();
      rimMesh.geometry.dispose();
      renderer.dispose();
    };
  }, [onClick, size]);

  return (
    <div
      ref={wrapRef}
      className="liquid-orb-wrap"
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        ["--orb-size" as any]: `${size}px`,
      }}
      onClick={onClick}
      title="Liquid Jelly Energy Orb (Klicken zum Umschalten der Core-Geometrie)"
    >
      <div className="liquid-orb" aria-label="Interactive liquid energy orb">
        <div className="liquid-orb-glow" />
        <canvas ref={canvasRef} id="orbCanvas" />
      </div>
    </div>
  );
};
