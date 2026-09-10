import React, { useEffect, useRef, useState, useCallback } from 'react';
import { OrbitalType, OrbitalVisualizationMode, QuantumNumbers, OrbitalState } from '../../types';
import {
  generateOrbitalPointCloud,
  evaluateOrbitalWavefunction,
  OrbitalPointSample,
} from '../../engines/physics/orbitalEngine';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2, Compass, Layers, Sparkles, Grid } from 'lucide-react';

interface Orbital3DCanvasProps {
  orbital: OrbitalState;
  mode: OrbitalVisualizationMode; // 'structure' | 'probability' | 'electron-density'
  showNodalPlanes?: boolean;
  showAxes?: boolean;
  reducedMotion?: boolean;
}

export const Orbital3DCanvas: React.FC<Orbital3DCanvasProps> = ({
  orbital,
  mode,
  showNodalPlanes = true,
  showAxes = true,
  reducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(!reducedMotion);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingThree, setIsLoadingThree] = useState<boolean>(true);

  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const orbitalGroupRef = useRef<any>(null);
  const guidesGroupRef = useRef<any>(null);
  const reqIdRef = useRef<number | null>(null);

  const cameraOrbitRef = useRef<{
    radius: number;
    theta: number;
    phi: number;
    target: { x: number; y: number; z: number };
  }>({
    radius: 14,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: { x: 0, y: 0, z: 0 },
  });

  const isDraggingRef = useRef(false);
  const isRightDragRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });

  const handleResetCamera = useCallback(() => {
    cameraOrbitRef.current = {
      radius: Math.max(10, orbital.n * 3.8),
      theta: Math.PI / 4,
      phi: Math.PI / 3,
      target: { x: 0, y: 0, z: 0 },
    };
    updateCameraPosition();
  }, [orbital.n]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi, target } = cameraOrbitRef.current;
    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target.x, target.y, target.z);
  };

  const handleZoom = (delta: number) => {
    cameraOrbitRef.current.radius = Math.max(4, Math.min(50, cameraOrbitRef.current.radius + delta));
    updateCameraPosition();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Pointer interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      isRightDragRef.current = e.button === 2;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      if (isRightDragRef.current) {
        const panSpeed = 0.015 * (cameraOrbitRef.current.radius / 15);
        cameraOrbitRef.current.target.x -= dx * panSpeed;
        cameraOrbitRef.current.target.y += dy * panSpeed;
      } else {
        const rotSpeed = 0.007;
        cameraOrbitRef.current.theta -= dx * rotSpeed;
        cameraOrbitRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraOrbitRef.current.phi - dy * rotSpeed));
      }
      updateCameraPosition();
    };

    const onPointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleZoom(e.deltaY * 0.02);
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  // Initialize Three.js dynamically
  useEffect(() => {
    let isCancelled = false;

    async function initThree() {
      try {
        const THREE = await import('three');
        if (isCancelled || !canvasRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth || 600;
        const height = containerRef.current.clientHeight || 450;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x060c13);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        cameraRef.current = camera;
        updateCameraPosition();

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const light1 = new THREE.DirectionalLight(0x38e1e7, 1.2);
        light1.position.set(10, 15, 10);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xd946ef, 0.9);
        light2.position.set(-10, -10, -10);
        scene.add(light2);

        const orbitalGroup = new THREE.Group();
        scene.add(orbitalGroup);
        orbitalGroupRef.current = orbitalGroup;

        const guidesGroup = new THREE.Group();
        scene.add(guidesGroup);
        guidesGroupRef.current = guidesGroup;

        const resizeObserver = new ResizeObserver((entries) => {
          if (!entries || entries.length === 0 || !rendererRef.current || !cameraRef.current) return;
          const entry = entries[0];
          const newWidth = entry.contentRect.width;
          const newHeight = entry.contentRect.height;
          if (newWidth > 0 && newHeight > 0) {
            cameraRef.current.aspect = newWidth / newHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newWidth, newHeight);
          }
        });
        resizeObserver.observe(containerRef.current);

        setIsLoadingThree(false);

        const animate = () => {
          reqIdRef.current = requestAnimationFrame(animate);

          if (autoRotate && !isDraggingRef.current && !reducedMotion) {
            cameraOrbitRef.current.theta += 0.004;
            updateCameraPosition();
          }

          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        };

        reqIdRef.current = requestAnimationFrame(animate);

        return () => {
          resizeObserver.disconnect();
        };
      } catch (err) {
        console.error('Failed to load Three.js:', err);
      }
    }

    initThree();

    return () => {
      isCancelled = true;
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (sceneRef.current) sceneRef.current.clear();
    };
  }, []);

  // Build Orbital Meshes
  useEffect(() => {
    if (isLoadingThree || !sceneRef.current) return;

    let isDisposed = false;

    async function buildOrbitalScene() {
      const THREE = await import('three');
      if (isDisposed) return;

      const orbitalGroup = orbitalGroupRef.current;
      const guidesGroup = guidesGroupRef.current;
      if (!orbitalGroup || !guidesGroup) return;

      // Clear previous
      while (orbitalGroup.children.length > 0) {
        const obj = orbitalGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
          else obj.material.dispose();
        }
        orbitalGroup.remove(obj);
      }

      while (guidesGroup.children.length > 0) {
        const obj = guidesGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        guidesGroup.remove(obj);
      }

      // 1. GUIDES: Coordinate Axes & Nodal Planes
      if (showAxes) {
        const axisLength = orbital.n * 2.6 + 2;
        const axes = new THREE.AxesHelper(axisLength);
        guidesGroup.add(axes);
      }

      if (showNodalPlanes && orbital.l > 0) {
        // Plane helper for angular nodal planes
        const planeSize = orbital.n * 4.5;
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshBasicMaterial({
          color: 0x64748b,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide,
          wireframe: false,
        });

        // Add subtle nodal plane according to orbital geometry
        if (orbital.l === 1) {
          // p orbital nodal plane is perpendicular to orientation
          const planeMesh = new THREE.Mesh(planeGeo, planeMat);
          if (orbital.m === 0) {
            // pz -> nodal plane is xy (z = 0)
            planeMesh.rotation.x = 0;
          } else if (orbital.m === 1) {
            // px -> nodal plane is yz (x = 0)
            planeMesh.rotation.y = Math.PI / 2;
          } else {
            // py -> nodal plane is xz (y = 0)
            planeMesh.rotation.x = Math.PI / 2;
          }
          guidesGroup.add(planeMesh);
        } else if (orbital.l === 2) {
          // d orbital planes (xy and yz for dxz, etc.)
          const p1 = new THREE.Mesh(planeGeo, planeMat);
          p1.rotation.x = Math.PI / 2;
          guidesGroup.add(p1);

          const p2 = new THREE.Mesh(planeGeo, planeMat);
          p2.rotation.y = Math.PI / 2;
          guidesGroup.add(p2);
        }
      }

      // 2. ORBITAL RENDERING BY MODE
      const { n, l, m } = orbital;
      const scaleFactor = 1.0 + n * 0.45;

      // Palette: Positive lobe = Electric Cyan, Negative lobe = Fuchsia Purple
      const posColor = 0x38e1e7;
      const negColor = 0xd946ef;

      if (mode === 'structure') {
        // Geometric boundary isosurface lobes
        if (l === 0) {
          // s Orbital: Sphere
          const sphereRadius = 1.8 * scaleFactor;
          const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
          const sphereMat = new THREE.MeshStandardMaterial({
            color: posColor,
            emissive: posColor,
            emissiveIntensity: 0.25,
            roughness: 0.2,
            transparent: true,
            opacity: 0.65,
          });
          orbitalGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

          // Inner radial node sphere if n > 1
          if (n > 1) {
            const innerRadius = sphereRadius * 0.45;
            const innerGeo = new THREE.SphereGeometry(innerRadius, 24, 24);
            const innerMat = new THREE.MeshStandardMaterial({
              color: negColor,
              emissive: negColor,
              emissiveIntensity: 0.35,
              roughness: 0.3,
              transparent: true,
              opacity: 0.8,
            });
            orbitalGroup.add(new THREE.Mesh(innerGeo, innerMat));
          }
        } else if (l === 1) {
          // p Orbital: Dual dumbbell lobes with opposite phase (+ cyan, - fuchsia)
          const lobeLength = 2.4 * scaleFactor;
          const lobeRadius = 1.0 * scaleFactor;

          const createLobe = (isPositive: boolean) => {
            const geo = new THREE.SphereGeometry(lobeRadius, 24, 24);
            geo.scale(1.0, 1.0, lobeLength / lobeRadius);
            const mat = new THREE.MeshStandardMaterial({
              color: isPositive ? posColor : negColor,
              emissive: isPositive ? posColor : negColor,
              emissiveIntensity: 0.25,
              roughness: 0.2,
              transparent: true,
              opacity: 0.72,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.z = (isPositive ? 1 : -1) * (lobeLength * 0.7);
            return mesh;
          };

          const pGroup = new THREE.Group();
          pGroup.add(createLobe(true));
          pGroup.add(createLobe(false));

          // Rotate to match axis (pz is default z, px is x, py is y)
          if (m === 1) {
            // px
            pGroup.rotation.y = Math.PI / 2;
          } else if (m === -1) {
            // py
            pGroup.rotation.x = -Math.PI / 2;
          }
          orbitalGroup.add(pGroup);
        } else if (l === 2) {
          // d Orbital
          if (m === 0) {
            // dz^2: Two axial lobes along Z + equatorial donut in XY
            const lobeGeo = new THREE.SphereGeometry(0.85 * scaleFactor, 24, 24);
            lobeGeo.scale(1, 1, 2.2);

            const posMat = new THREE.MeshStandardMaterial({
              color: posColor,
              emissive: posColor,
              emissiveIntensity: 0.3,
              transparent: true,
              opacity: 0.75,
            });

            const topLobe = new THREE.Mesh(lobeGeo, posMat);
            topLobe.position.z = 1.5 * scaleFactor;
            const btmLobe = new THREE.Mesh(lobeGeo, posMat);
            btmLobe.position.z = -1.5 * scaleFactor;

            // Equatorial Torus (opposite phase, negative sign)
            const torusGeo = new THREE.TorusGeometry(1.2 * scaleFactor, 0.4 * scaleFactor, 20, 48);
            const negMat = new THREE.MeshStandardMaterial({
              color: negColor,
              emissive: negColor,
              emissiveIntensity: 0.3,
              transparent: true,
              opacity: 0.75,
            });
            const torusMesh = new THREE.Mesh(torusGeo, negMat);

            orbitalGroup.add(topLobe);
            orbitalGroup.add(btmLobe);
            orbitalGroup.add(torusMesh);
          } else {
            // Cloverleaf: 4 lobes with alternating phases
            const dGroup = new THREE.Group();
            const lobeDist = 1.6 * scaleFactor;
            const lobeSize = 0.85 * scaleFactor;

            const lobeGeo = new THREE.SphereGeometry(lobeSize, 20, 20);
            lobeGeo.scale(1.2, 1.2, 1.8);

            const posMat = new THREE.MeshStandardMaterial({
              color: posColor,
              emissive: posColor,
              emissiveIntensity: 0.25,
              transparent: true,
              opacity: 0.72,
            });
            const negMat = new THREE.MeshStandardMaterial({
              color: negColor,
              emissive: negColor,
              emissiveIntensity: 0.25,
              transparent: true,
              opacity: 0.72,
            });

            // 4 lobes at 90 deg intervals
            for (let i = 0; i < 4; i++) {
              const angle = (i * Math.PI) / 2 + (m === 2 ? 0 : Math.PI / 4);
              const isPos = i % 2 === 0;
              const mesh = new THREE.Mesh(lobeGeo, isPos ? posMat : negMat);
              mesh.position.set(Math.cos(angle) * lobeDist, Math.sin(angle) * lobeDist, 0);
              mesh.lookAt(0, 0, 0);
              dGroup.add(mesh);
            }

            // Orientation
            if (m === 1) {
              // dxz
              dGroup.rotation.y = Math.PI / 2;
            } else if (m === -1) {
              // dyz
              dGroup.rotation.x = Math.PI / 2;
            }
            orbitalGroup.add(dGroup);
          }
        } else {
          // f Orbital: 8-lobed or multi-lobed representation
          const fGroup = new THREE.Group();
          const dist = 1.6 * scaleFactor;
          const lobeSize = 0.7 * scaleFactor;
          const lobeGeo = new THREE.SphereGeometry(lobeSize, 18, 18);

          const posMat = new THREE.MeshStandardMaterial({
            color: posColor,
            emissive: posColor,
            emissiveIntensity: 0.25,
            transparent: true,
            opacity: 0.75,
          });
          const negMat = new THREE.MeshStandardMaterial({
            color: negColor,
            emissive: negColor,
            emissiveIntensity: 0.25,
            transparent: true,
            opacity: 0.75,
          });

          // 8 octants with alternating parity
          let octIdx = 0;
          for (let sx of [-1, 1]) {
            for (let sy of [-1, 1]) {
              for (let sz of [-1, 1]) {
                const isPos = sx * sy * sz > 0;
                const mesh = new THREE.Mesh(lobeGeo, isPos ? posMat : negMat);
                mesh.position.set(sx * dist * 0.8, sy * dist * 0.8, sz * dist * 0.8);
                fGroup.add(mesh);
                octIdx++;
              }
            }
          }
          orbitalGroup.add(fGroup);
        }
      } else if (mode === 'probability') {
        // Point cloud sampling from exact wavefunction
        const samples: OrbitalPointSample[] = generateOrbitalPointCloud(n, l, m, 2400);

        const pointGeo = new THREE.BufferGeometry();
        const positions: number[] = [];
        const colors: number[] = [];

        const colorPos = new THREE.Color(0x38e1e7);
        const colorNeg = new THREE.Color(0xd946ef);

        samples.forEach((s) => {
          positions.push(s.x, s.y, s.z);
          const c = s.sign > 0 ? colorPos : colorNeg;
          colors.push(c.r, c.g, c.b);
        });

        pointGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        pointGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const pointMat = new THREE.PointsMaterial({
          size: 0.16,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
        });

        const pointsMesh = new THREE.Points(pointGeo, pointMat);
        orbitalGroup.add(pointsMesh);
      } else {
        // 'electron-density' mode: Volumetric cross section & radial distribution
        const gridRes = 30;
        const range = n * 3.2;
        const step = (range * 2) / gridRes;

        const densityGeo = new THREE.BufferGeometry();
        const positions: number[] = [];
        const colors: number[] = [];

        // Sample a cross section plane at y = 0
        for (let ix = -range; ix <= range; ix += step) {
          for (let iz = -range; iz <= range; iz += step) {
            const res = evaluateOrbitalWavefunction(n, l, m, ix, 0, iz);
            if (res.probability > 0.0001) {
              positions.push(ix, 0, iz);

              // Heatmap ramp: low (dark blue) -> mid (cyan) -> high (white/gold)
              const normP = Math.min(1.0, res.probability * 35.0);
              const col = new THREE.Color();
              if (normP < 0.5) {
                col.lerpColors(new THREE.Color(0x0f172a), new THREE.Color(0x38e1e7), normP * 2);
              } else {
                col.lerpColors(new THREE.Color(0x38e1e7), new THREE.Color(0xfef08a), (normP - 0.5) * 2);
              }

              colors.push(col.r, col.g, col.b);
            }
          }
        }

        densityGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        densityGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const densityMat = new THREE.PointsMaterial({
          size: 0.22,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,
        });

        const densityMesh = new THREE.Points(densityGeo, densityMat);
        orbitalGroup.add(densityMesh);

        // Core nucleus marker
        const coreGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        orbitalGroup.add(new THREE.Mesh(coreGeo, coreMat));
      }

      // Set optimal camera radius
      cameraOrbitRef.current.radius = Math.max(10, orbital.n * 3.8);
      updateCameraPosition();
    }

    buildOrbitalScene();

    return () => {
      isDisposed = true;
    };
  }, [orbital, mode, showNodalPlanes, showAxes, isLoadingThree]);

  return (
    <div
      ref={containerRef}
      id="orbital-3d-viewport-container"
      className="relative w-full h-full min-h-[380px] bg-[#060c13] rounded-xl overflow-hidden flex flex-col items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        id="orbital-three-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {isLoadingThree && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060c13]/90 z-20 pointer-events-none">
          <div className="w-10 h-10 border-2 border-fuchsia-500/30 border-t-fuchsia-400 rounded-full animate-spin" />
          <p className="mt-3 text-xs font-mono text-fuchsia-300">Computing Quantum Wavefunction...</p>
        </div>
      )}

      {/* Top Floating Info */}
      <div className="absolute top-3 left-3 z-10 bg-[#0b141e]/85 backdrop-blur-md border border-[#1b2d42] px-3 py-2 rounded-lg pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white font-mono">{orbital.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono">
            {orbital.type.toUpperCase()}-type
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono">
            E = {orbital.energyEv} eV
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{orbital.formula}</p>
      </div>

      {/* Floating HUD Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-[#0b141e]/85 backdrop-blur-md border border-[#1b2d42] p-1.5 rounded-lg shadow-lg">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Disable auto-rotation' : 'Enable auto-rotation'}
          className={`p-2 rounded-md text-xs transition cursor-pointer flex items-center justify-center ${
            autoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset camera view"
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-2.5)}
          title="Zoom in"
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(2.5)}
          title="Zoom out"
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Wave Phase Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-[#0b141e]/85 backdrop-blur-md border border-[#1b2d42] px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38e1e7]" />
          <span>+ Phase (ψ &gt; 0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#d946ef]" />
          <span>− Phase (ψ &lt; 0)</span>
        </div>
        {orbital.radialNodes > 0 && (
          <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-700 pl-2">
            <span>{orbital.radialNodes} radial node{orbital.radialNodes > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};
