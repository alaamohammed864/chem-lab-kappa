// Reusable 3D Crystal Unit Cell Visualizer using Three.js & WebGL
// Fully supports Simple Cubic (SC), Body-Centered Cubic (BCC), Face-Centered Cubic (FCC), and Hexagonal Close-Packed (HCP)

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getAtomicCoordinates, AtomFractionalCoordinate } from '../../engines/materials/crystallographyEngine';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Layers, Eye, RefreshCw } from 'lucide-react';

export type CrystalPackingMode = 'ball-and-stick' | 'hard-sphere';
export type LatticeExtentMode = 'single' | 'supercell'; // 1x1x1 vs 2x2x2

interface CrystalVisualizer3DProps {
  systemId: 'sc' | 'bcc' | 'fcc' | 'hcp' | string;
  latticeA: number; // Å
  latticeC?: number; // Å (HCP)
  activeMillerPlane?: [number, number, number] | null; // e.g. [1, 1, 1]
  heightClass?: string;
  autoRotateInit?: boolean;
}

export const CrystalVisualizer3D: React.FC<CrystalVisualizer3DProps> = ({
  systemId,
  latticeA,
  latticeC,
  activeMillerPlane = null,
  heightClass = 'h-[360px] sm:h-[420px]',
  autoRotateInit = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [packingMode, setPackingMode] = useState<CrystalPackingMode>('ball-and-stick');
  const [extentMode, setExtentMode] = useState<LatticeExtentMode>('single');
  const [autoRotate, setAutoRotate] = useState(autoRotateInit);
  const [showWireframe, setShowWireframe] = useState(true);
  const [showPlane, setShowPlane] = useState(true);

  // Mouse orbit controls state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(4, 3.5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(10, 15, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6); // Cyan rim light
    dirLight2.position.set(-10, -8, -10);
    scene.add(dirLight2);

    // 5. Build unit cell group
    const crystalGroup = new THREE.Group();
    groupRef.current = crystalGroup;
    scene.add(crystalGroup);

    buildLatticeMesh(crystalGroup, systemId, packingMode, extentMode, showWireframe, activeMillerPlane, showPlane);

    // 6. Animation loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (autoRotate && groupRef.current && !isDraggingRef.current) {
        groupRef.current.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update lattice whenever parameters or modes change
  useEffect(() => {
    if (!groupRef.current) return;
    // Clear previous children
    while (groupRef.current.children.length > 0) {
      const obj = groupRef.current.children[0];
      groupRef.current.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    }
    buildLatticeMesh(
      groupRef.current,
      systemId,
      packingMode,
      extentMode,
      showWireframe,
      activeMillerPlane,
      showPlane
    );
  }, [systemId, packingMode, extentMode, showWireframe, activeMillerPlane, showPlane]);

  // Helper: Build Unit Cell and Supercell geometry
  function buildLatticeMesh(
    group: THREE.Group,
    sys: string,
    mode: CrystalPackingMode,
    extent: LatticeExtentMode,
    wireframe: boolean,
    plane: [number, number, number] | null,
    renderPlane: boolean
  ) {
    const isHCP = sys === 'hcp';
    const isHardSphere = mode === 'hard-sphere';

    // Atomic radius in visual units (normalized unit cell scale ~ 2.0 units across)
    const scale = 2.0;
    let visualAtomRadius = 0.22; // default ball-and-stick

    if (isHardSphere) {
      if (sys === 'sc') visualAtomRadius = scale / 2; // a = 2R -> R = a/2
      else if (sys === 'bcc') visualAtomRadius = (scale * Math.sqrt(3)) / 4; // a*sqrt(3)/4
      else if (sys === 'fcc') visualAtomRadius = scale / (2 * Math.SQRT2); // a/(2*sqrt(2))
      else if (sys === 'hcp') visualAtomRadius = scale / 2;
    }

    const sphereGeom = new THREE.SphereGeometry(visualAtomRadius, 24, 24);

    // Color materials based on lattice system & atom site
    const cornerMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf, // Teal
      metalness: 0.3,
      roughness: 0.2,
    });
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber (BCC body center)
      metalness: 0.4,
      roughness: 0.2,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Sky blue (FCC face centers)
      metalness: 0.3,
      roughness: 0.2,
    });
    const interiorMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7, // Purple (HCP interior)
      metalness: 0.4,
      roughness: 0.2,
    });

    // Helper to place atom
    const addAtom = (pos: THREE.Vector3, site: AtomFractionalCoordinate['site']) => {
      let mat = cornerMat;
      if (site === 'body-center') mat = centerMat;
      else if (site === 'face-center') mat = faceMat;
      else if (site === 'interior') mat = interiorMat;

      const mesh = new THREE.Mesh(sphereGeom, mat);
      mesh.position.copy(pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    };

    if (isHCP) {
      // Hexagonal prism coordinates
      const a = scale;
      const c = scale * 1.633;
      const offsets = extent === 'supercell' ? [-0.5, 0.5] : [0];

      offsets.forEach((oz) => {
        const baseZ = oz * c - c / 2;
        const angles = [0, 60, 120, 180, 240, 300];

        // Bottom basal plane (z = 0)
        addAtom(new THREE.Vector3(0, baseZ, 0), 'basal-center');
        angles.forEach((deg) => {
          const rad = (deg * Math.PI) / 180;
          addAtom(new THREE.Vector3(a * Math.cos(rad), baseZ, a * Math.sin(rad)), 'corner');
        });

        // Top basal plane (z = c)
        addAtom(new THREE.Vector3(0, baseZ + c, 0), 'basal-center');
        angles.forEach((deg) => {
          const rad = (deg * Math.PI) / 180;
          addAtom(new THREE.Vector3(a * Math.cos(rad), baseZ + c, a * Math.sin(rad)), 'corner');
        });

        // Midplane 3 interior atoms (z = c/2)
        const midAngles = [30, 150, 270];
        const rMid = a / Math.sqrt(3);
        midAngles.forEach((deg) => {
          const rad = (deg * Math.PI) / 180;
          addAtom(
            new THREE.Vector3(rMid * Math.cos(rad), baseZ + c / 2, rMid * Math.sin(rad)),
            'interior'
          );
        });

        // Wireframe prism edges
        if (wireframe) {
          const lineMat = new THREE.LineBasicMaterial({ color: 0x14b8a6, opacity: 0.6, transparent: true });

          // Hexagon loops
          const botPts = angles.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return new THREE.Vector3(a * Math.cos(rad), baseZ, a * Math.sin(rad));
          });
          botPts.push(botPts[0].clone());

          const topPts = angles.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return new THREE.Vector3(a * Math.cos(rad), baseZ + c, a * Math.sin(rad));
          });
          topPts.push(topPts[0].clone());

          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(botPts), lineMat));
          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(topPts), lineMat));

          // Vertical columns
          for (let i = 0; i < 6; i++) {
            const colPts = [botPts[i], topPts[i]];
            group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(colPts), lineMat));
          }
        }
      });
    } else {
      // Cubic systems (SC, BCC, FCC)
      const a = scale;
      const baseCoords = getAtomicCoordinates(sys);
      const cells = extent === 'supercell' ? [0, 1] : [0];

      // Centering offset
      const offsetCenter = extent === 'supercell' ? a : a / 2;

      // Deduplicate coordinates for supercell
      const seenKey = new Set<string>();

      cells.forEach((cx) => {
        cells.forEach((cy) => {
          cells.forEach((cz) => {
            baseCoords.forEach((coord) => {
              const wx = (coord.x + cx) * a - offsetCenter;
              const wy = (coord.y + cy) * a - offsetCenter;
              const wz = (coord.z + cz) * a - offsetCenter;
              const key = `${wx.toFixed(2)},${wy.toFixed(2)},${wz.toFixed(2)}`;
              if (!seenKey.has(key)) {
                seenKey.add(key);
                addAtom(new THREE.Vector3(wx, wy, wz), coord.site);
              }
            });

            // Wireframe box for each unit cell
            if (wireframe) {
              const boxGeom = new THREE.BoxGeometry(a, a, a);
              const edges = new THREE.EdgesGeometry(boxGeom);
              const lineMat = new THREE.LineBasicMaterial({
                color: 0x14b8a6,
                transparent: true,
                opacity: 0.5,
              });
              const line = new THREE.LineSegments(edges, lineMat);
              line.position.set(
                (cx + 0.5) * a - offsetCenter,
                (cy + 0.5) * a - offsetCenter,
                (cz + 0.5) * a - offsetCenter
              );
              group.add(line);
            }
          });
        });
      });

      // Miller plane visualizer
      if (plane && renderPlane && extent === 'single') {
        const [h, k, l] = plane;
        // Plane passing through cell corners/intercepts
        if (h !== 0 || k !== 0 || l !== 0) {
          const planeGeom = new THREE.PlaneGeometry(a * 1.5, a * 1.5);
          const planeMat = new THREE.MeshStandardMaterial({
            color: 0xf43f5e,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
          });
          const planeMesh = new THREE.Mesh(planeGeom, planeMat);

          // Orient plane normal to (h, k, l)
          const normal = new THREE.Vector3(h, k, l).normalize();
          planeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
          group.add(planeMesh);
        }
      }
    }
  }

  // Mouse interaction handlers for smooth orbital rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !groupRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    groupRef.current.rotation.y += deltaX * 0.01;
    groupRef.current.rotation.x += deltaY * 0.01;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const zoomFactor = e.deltaY * 0.003;
    cameraRef.current.position.z = Math.max(2.5, Math.min(15, cameraRef.current.position.z + zoomFactor));
  };

  const resetCamera = () => {
    if (!cameraRef.current || !groupRef.current) return;
    cameraRef.current.position.set(4, 3.5, 5);
    cameraRef.current.lookAt(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
  };

  return (
    <div className={`relative w-full ${heightClass} bg-gradient-to-b from-[#08121c] to-[#04080e] rounded-xl border border-[#162738] overflow-hidden select-none`}>
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Packing & Extent Mode Badges */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#091420]/90 backdrop-blur-md p-1 rounded-lg border border-[#1b3046] text-[11px] font-mono">
          <button
            onClick={() => setPackingMode('ball-and-stick')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              packingMode === 'ball-and-stick'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ball & Stick
          </button>
          <button
            onClick={() => setPackingMode('hard-sphere')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              packingMode === 'hard-sphere'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hard Sphere
          </button>
        </div>

        {/* Supercell & View Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#091420]/90 backdrop-blur-md p-1 rounded-lg border border-[#1b3046] text-xs">
          <button
            onClick={() => setExtentMode(extentMode === 'single' ? 'supercell' : 'single')}
            title="Toggle 1x1x1 vs 2x2x2 Unit Cells"
            className={`px-2 py-1 rounded font-mono text-[11px] transition cursor-pointer ${
              extentMode === 'supercell'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {extentMode === 'single' ? '1×1 Cell' : '2×2×2 Lattice'}
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto Rotation"
            className={`p-1.5 rounded transition cursor-pointer ${
              autoRotate ? 'text-teal-300 bg-teal-950/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetCamera}
            title="Reset Camera View"
            className="p-1.5 rounded text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Info HUD */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
        <div className="bg-[#091420]/85 px-2.5 py-1 rounded-md border border-[#162738] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>Drag to orbit • Scroll to zoom</span>
        </div>

        {activeMillerPlane && (
          <div className="bg-[#091420]/85 px-2.5 py-1 rounded-md border border-[#162738] text-rose-300">
            Miller Plane ({activeMillerPlane.join('')})
          </div>
        )}
      </div>
    </div>
  );
};
