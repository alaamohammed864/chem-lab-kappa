import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AtomicStructureModel, Nucleon, ElectronParticle } from '../../engines/physics/atomicStructureEngine';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2, Eye, Compass } from 'lucide-react';

interface Atom3DCanvasProps {
  model: AtomicStructureModel;
  showNucleus?: boolean;
  showShells?: boolean;
  showElectrons?: boolean;
  showLabels?: boolean;
  reducedMotion?: boolean;
  speedMultiplier?: number;
  onSelectShell?: (shellIndex: number) => void;
}

export const Atom3DCanvas: React.FC<Atom3DCanvasProps> = ({
  model,
  showNucleus = true,
  showShells = true,
  showElectrons = true,
  showLabels = true,
  reducedMotion = false,
  speedMultiplier = 1.0,
  onSelectShell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(!reducedMotion);
  const [autoRotate, setAutoRotate] = useState<boolean>(!reducedMotion);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingThree, setIsLoadingThree] = useState<boolean>(true);
  const [activeShellIndex, setActiveShellIndex] = useState<number | null>(null);

  // References for Three.js objects to avoid unnecessary re-renders
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const reqIdRef = useRef<number | null>(null);

  // Group references
  const rootGroupRef = useRef<any>(null);
  const nucleusGroupRef = useRef<any>(null);
  const shellsGroupRef = useRef<any>(null);
  const electronsGroupRef = useRef<any>(null);

  // Orbital state references
  const electronMeshesRef = useRef<{ mesh: any; data: ElectronParticle }[]>([]);
  const cameraOrbitRef = useRef<{
    radius: number;
    theta: number; // azimuth (around Y)
    phi: number; // polar (from Y top)
    target: { x: number; y: number; z: number };
  }>({
    radius: 28,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: { x: 0, y: 0, z: 0 },
  });

  const isDraggingRef = useRef(false);
  const isRightDragRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    cameraOrbitRef.current = {
      radius: Math.max(20, (model.shells.length + 1) * 4.5),
      theta: Math.PI / 4,
      phi: Math.PI / 3,
      target: { x: 0, y: 0, z: 0 },
    };
    updateCameraPosition();
  }, [model.shells.length]);

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
    cameraOrbitRef.current.radius = Math.max(8, Math.min(80, cameraOrbitRef.current.radius + delta));
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

  // Pointer interaction for orbit and pan
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
        // Pan
        const panSpeed = 0.02 * (cameraOrbitRef.current.radius / 20);
        cameraOrbitRef.current.target.x -= dx * panSpeed;
        cameraOrbitRef.current.target.y += dy * panSpeed;
      } else {
        // Orbit
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
      } catch {
        // ignore
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.03;
      handleZoom(zoomFactor);
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

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

  // Initialize Three.js dynamically (lazy loaded)
  useEffect(() => {
    let isCancelled = false;

    async function initThree() {
      try {
        const THREE = await import('three');
        if (isCancelled || !canvasRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth || 600;
        const height = containerRef.current.clientHeight || 450;

        // Create Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Deep space background
        scene.background = new THREE.Color(0x070d14);

        // Subtle ambient space fog
        scene.fog = new THREE.FogExp2(0x070d14, 0.012);

        // Perspective Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        cameraRef.current = camera;
        updateCameraPosition();

        // WebGL Renderer with pixel ratio optimization
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0x38e1e7, 1.2);
        dirLight1.position.set(15, 20, 15);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.8);
        dirLight2.position.set(-15, -10, -15);
        scene.add(dirLight2);

        // Root Group
        const rootGroup = new THREE.Group();
        scene.add(rootGroup);
        rootGroupRef.current = rootGroup;

        // Nucleus Group
        const nucleusGroup = new THREE.Group();
        rootGroup.add(nucleusGroup);
        nucleusGroupRef.current = nucleusGroup;

        // Shells Group
        const shellsGroup = new THREE.Group();
        rootGroup.add(shellsGroup);
        shellsGroupRef.current = shellsGroup;

        // Electrons Group
        const electronsGroup = new THREE.Group();
        rootGroup.add(electronsGroup);
        electronsGroupRef.current = electronsGroup;

        // Resize observer
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

        // Start render loop
        let lastTime = performance.now();

        const animate = (time: number) => {
          reqIdRef.current = requestAnimationFrame(animate);
          const dt = (time - lastTime) / 1000;
          lastTime = time;

          // Auto-rotate scene if enabled
          if (autoRotate && !isDraggingRef.current && !reducedMotion) {
            cameraOrbitRef.current.theta += 0.003 * speedMultiplier;
            updateCameraPosition();
          }

          // Advance electron orbital motion
          if (isPlaying && !reducedMotion) {
            const currentSpeed = speedMultiplier;
            electronMeshesRef.current.forEach(({ mesh, data }) => {
              data.angle += data.speed * currentSpeed * dt * 2.0;

              // Calculate position on inclined orbital ellipse
              const r = data.radius;
              const localX = r * Math.cos(data.angle);
              const localZ = r * Math.sin(data.angle);

              // Apply inclination and azimuth rotation matrix
              const cosInc = Math.cos(data.inclination);
              const sinInc = Math.sin(data.inclination);
              const cosAz = Math.cos(data.azimuth);
              const sinAz = Math.sin(data.azimuth);

              // 3D rotation
              const tiltedY = localZ * sinInc;
              const tiltedZ = localZ * cosInc;

              const worldX = localX * cosAz - tiltedZ * sinAz;
              const worldZ = localX * sinAz + tiltedZ * cosAz;
              const worldY = tiltedY;

              mesh.position.set(worldX, worldY, worldZ);
            });
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
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  // Populate 3D Geometries whenever model or visual flags change
  useEffect(() => {
    if (isLoadingThree || !sceneRef.current) return;

    let isDisposed = false;

    async function buildScene() {
      const THREE = await import('three');
      if (isDisposed) return;

      const nucleusGroup = nucleusGroupRef.current;
      const shellsGroup = shellsGroupRef.current;
      const electronsGroup = electronsGroupRef.current;

      if (!nucleusGroup || !shellsGroup || !electronsGroup) return;

      // Clear previous meshes cleanly
      while (nucleusGroup.children.length > 0) {
        const obj = nucleusGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
          else obj.material.dispose();
        }
        nucleusGroup.remove(obj);
      }

      while (shellsGroup.children.length > 0) {
        const obj = shellsGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        shellsGroup.remove(obj);
      }

      while (electronsGroup.children.length > 0) {
        const obj = electronsGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        electronsGroup.remove(obj);
      }
      electronMeshesRef.current = [];

      // 1. NUCLEUS (Protons & Neutrons)
      if (showNucleus && model.nucleons.length > 0) {
        const protonGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const neutronGeo = new THREE.SphereGeometry(0.35, 16, 16);

        // Proton Material: High-energy electric cyan / crimson
        const protonMat = new THREE.MeshStandardMaterial({
          color: 0x38e1e7,
          emissive: 0x008899,
          emissiveIntensity: 0.5,
          roughness: 0.25,
          metalness: 0.2,
        });

        // Neutron Material: Neutral Slate / Warm Amber
        const neutronMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0x78350f,
          emissiveIntensity: 0.3,
          roughness: 0.4,
          metalness: 0.1,
        });

        model.nucleons.forEach((nuc: Nucleon) => {
          const mesh = new THREE.Mesh(nuc.type === 'proton' ? protonGeo : neutronGeo, nuc.type === 'proton' ? protonMat : neutronMat);
          mesh.position.set(nuc.x, nuc.y, nuc.z);
          nucleusGroup.add(mesh);
        });

        // Subtle nuclear halo glow
        const haloGeo = new THREE.SphereGeometry(Math.max(1.2, Math.pow(model.atomicNumber, 0.33) * 0.9), 24, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x38e1e7,
          transparent: true,
          opacity: 0.08,
          wireframe: true,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        nucleusGroup.add(haloMesh);
      }

      // 2. ELECTRON SHELLS (Concentric Rings & Orbits)
      if (showShells) {
        model.shells.forEach((shell, idx) => {
          const isActive = activeShellIndex === idx;

          // Ring geometry in XZ plane
          const ringGeo = new THREE.RingGeometry(shell.radius - 0.04, shell.radius + 0.04, 64);
          ringGeo.rotateX(Math.PI / 2);

          const ringMat = new THREE.MeshBasicMaterial({
            color: isActive ? 0x00f2fe : 0x244260,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: isActive ? 0.9 : 0.4,
          });

          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          shellsGroup.add(ringMesh);

          // Inclined orbital guide rings for electrons on this shell
          const distinctInclinations = new Set<number>(
            model.electronParticles.filter((p) => p.shellIndex === idx).map((p) => p.inclination)
          );

          distinctInclinations.forEach((inc: number) => {
            const subRingGeo = new THREE.BufferGeometry();
            const points: any[] = [];
            const segments = 64;
            for (let i = 0; i <= segments; i++) {
              const a = (i / segments) * Math.PI * 2;
              const lx = shell.radius * Math.cos(a);
              const lz = shell.radius * Math.sin(a);
              const cosInc = Math.cos(inc);
              const sinInc = Math.sin(inc);
              points.push(new THREE.Vector3(lx, lz * sinInc, lz * cosInc));
            }
            subRingGeo.setFromPoints(points);

            const subRingMat = new THREE.LineBasicMaterial({
              color: isActive ? 0x38e1e7 : 0x1a334d,
              transparent: true,
              opacity: isActive ? 0.6 : 0.25,
            });
            const subRingLine = new THREE.Line(subRingGeo, subRingMat);
            shellsGroup.add(subRingLine);
          });
        });
      }

      // 3. ELECTRONS (Glowing particles)
      if (showElectrons && model.electronParticles.length > 0) {
        const electronGeo = new THREE.SphereGeometry(0.24, 16, 16);

        model.electronParticles.forEach((particle) => {
          const isShellActive = activeShellIndex === particle.shellIndex;
          const electronMat = new THREE.MeshStandardMaterial({
            color: isShellActive ? 0xffffff : 0x60a5fa,
            emissive: isShellActive ? 0x38e1e7 : 0x2563eb,
            emissiveIntensity: isShellActive ? 1.0 : 0.7,
            roughness: 0.1,
          });

          const mesh = new THREE.Mesh(electronGeo, electronMat);

          // Initial position
          const r = particle.radius;
          const lx = r * Math.cos(particle.angle);
          const lz = r * Math.sin(particle.angle);
          const cosInc = Math.cos(particle.inclination);
          const sinInc = Math.sin(particle.inclination);
          const cosAz = Math.cos(particle.azimuth);
          const sinAz = Math.sin(particle.azimuth);

          const ty = lz * sinInc;
          const tz = lz * cosInc;
          const wx = lx * cosAz - tz * sinAz;
          const wz = lx * sinAz + tz * cosAz;
          const wy = ty;

          mesh.position.set(wx, wy, wz);
          electronsGroup.add(mesh);

          electronMeshesRef.current.push({
            mesh,
            data: particle,
          });
        });
      }

      // Adjust camera distance to fit all shells comfortably
      const maxRadius = model.shells.length > 0 ? model.shells[model.shells.length - 1].radius : 6;
      cameraOrbitRef.current.radius = Math.max(16, maxRadius * 2.3);
      updateCameraPosition();
    }

    buildScene();

    return () => {
      isDisposed = true;
    };
  }, [model, showNucleus, showShells, showElectrons, activeShellIndex, isLoadingThree]);

  return (
    <div
      ref={containerRef}
      id="atom-3d-viewport-container"
      className="relative w-full h-full min-h-[380px] bg-[#070d14] rounded-xl overflow-hidden flex flex-col items-center justify-center select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        id="atom-three-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Loading Indicator */}
      {isLoadingThree && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070d14]/90 z-20 pointer-events-none">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="mt-3 text-xs font-mono text-cyan-300">Initializing 3D Quantum Engine...</p>
        </div>
      )}

      {/* Floating HUD Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-[#0b141e]/85 backdrop-blur-md border border-[#1b2d42] p-1.5 rounded-lg shadow-lg">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause orbital motion' : 'Resume orbital motion'}
          className={`p-2 rounded-md text-xs transition cursor-pointer flex items-center justify-center ${
            isPlaying ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Disable auto-rotation' : 'Enable auto-rotation'}
          className={`p-2 rounded-md text-xs transition cursor-pointer flex items-center justify-center ${
            autoRotate ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset camera viewpoint"
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-3)}
          title="Zoom in"
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(3)}
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

      {/* Shell Overlay Pills (Top Left) */}
      {showLabels && model.shells.length > 0 && (
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[70%] pointer-events-auto">
          {model.shells.map((shell, idx) => {
            const isSelected = activeShellIndex === idx;
            return (
              <button
                key={shell.name}
                onClick={() => {
                  const next = isSelected ? null : idx;
                  setActiveShellIndex(next);
                  if (onSelectShell && next !== null) onSelectShell(next);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-[#0b141e]/80 border-[#182c40] text-slate-300 hover:border-cyan-500/40 hover:bg-[#111f2e]'
                }`}
              >
                <span className="font-bold text-white">{shell.name}</span>
                <span className="text-slate-400 text-[10px]">({shell.electrons}e⁻)</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Particle Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-[#0b141e]/85 backdrop-blur-md border border-[#1b2d42] px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38e1e7]" />
          <span>Protons ({model.protons})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
          <span>Neutrons ({model.neutrons})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          <span>Electrons ({model.electrons})</span>
        </div>
      </div>

      {/* Viewport Instructions (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-[#0b141e]/80 px-2.5 py-1 rounded-md border border-[#182c40] pointer-events-none">
        <span>Drag to rotate</span>
        <span>•</span>
        <span>Right-drag to pan</span>
        <span>•</span>
        <span>Scroll to zoom</span>
      </div>
    </div>
  );
};
