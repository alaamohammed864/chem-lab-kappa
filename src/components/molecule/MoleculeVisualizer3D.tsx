// 3D Molecular Visualizer using Three.js / WebGL
// Pure visualization component completely decoupled from chemical data structures.
// Supports Ball & Stick, Space-Filling (CPK / Van der Waals), and Wireframe stick rendering.

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MoleculeData, MoleculeAtom } from '../../data/moleculesData';
import {
  getCPKColor,
  getCovalentRadius,
  getVanDerWaalsRadius,
  computeCentroid,
  computeBoundingRadius,
} from '../../engines/chemistry/moleculeEngine';

export type MoleculeRenderMode = 'ball-and-stick' | 'space-filling' | 'wireframe';

interface MoleculeVisualizer3DProps {
  molecule: MoleculeData;
  renderMode: MoleculeRenderMode;
  autoRotate?: boolean;
  showLabels?: boolean;
  showDipole?: boolean;
  onSelectAtom?: (atom: MoleculeAtom | null) => void;
}

export const MoleculeVisualizer3D: React.FC<MoleculeVisualizer3DProps> = ({
  molecule,
  renderMode,
  autoRotate = false,
  showLabels = false,
  showDipole = false,
  onSelectAtom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const molGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [hoveredAtom, setHoveredAtom] = useState<MoleculeAtom | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Drag rotation state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Atom raycast mapping
  const atomMeshesRef = useRef<{ mesh: THREE.Mesh; atom: MoleculeAtom }[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(10, 15, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.6); // subtle cyan/blue fill
    dirLight2.position.set(-10, -8, -10);
    scene.add(dirLight2);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (molGroupRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          molGroupRef.current.rotation.y += 0.008;
        }

        // Apply friction to manual drag rotation
        if (!isDraggingRef.current) {
          molGroupRef.current.rotation.y += rotVelocityRef.current.y;
          molGroupRef.current.rotation.x += rotVelocityRef.current.x;
          rotVelocityRef.current.x *= 0.92;
          rotVelocityRef.current.y *= 0.92;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      container.innerHTML = '';
    };
  }, []);

  // Re-build 3D Molecular Model whenever molecule, renderMode, or display options change
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    // Remove old molecule group
    if (molGroupRef.current) {
      scene.remove(molGroupRef.current);
      molGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
      molGroupRef.current = null;
    }

    atomMeshesRef.current = [];

    const molGroup = new THREE.Group();
    molGroupRef.current = molGroup;
    scene.add(molGroup);

    const atoms = molecule.atoms;
    const bonds = molecule.bonds;
    const centroid = computeCentroid(atoms);
    const boundingR = computeBoundingRadius(atoms, centroid);

    // Camera framing based on bounding radius
    const dist = Math.max(5.5, boundingR * 2.8 + (renderMode === 'space-filling' ? 1.5 : 0.5));
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);

    // Cache atom positions centered at origin
    const centeredMap = new Map<string, THREE.Vector3>();
    atoms.forEach((a) => {
      centeredMap.set(a.id, new THREE.Vector3(a.x - centroid[0], a.y - centroid[1], a.z - centroid[2]));
    });

    // 1. Build Atoms
    atoms.forEach((atom) => {
      const pos = centeredMap.get(atom.id)!;
      const hexColor = getCPKColor(atom.element);
      const color = new THREE.Color(hexColor);

      let radius: number;
      if (renderMode === 'space-filling') {
        radius = getVanDerWaalsRadius(atom.element) * 0.72;
      } else if (renderMode === 'ball-and-stick') {
        radius = Math.max(0.24, getCovalentRadius(atom.element) * 0.52);
      } else {
        // Wireframe
        radius = 0.12;
      }

      const sphereGeo = new THREE.SphereGeometry(radius, 32, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.28,
        metalness: 0.15,
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(pos);
      molGroup.add(sphere);

      atomMeshesRef.current.push({ mesh: sphere, atom });
    });

    // 2. Build Bonds (Ball & Stick and Wireframe)
    if (renderMode !== 'space-filling') {
      bonds.forEach((bond) => {
        const p1 = centeredMap.get(bond.sourceAtomId);
        const p2 = centeredMap.get(bond.targetAtomId);
        if (!p1 || !p2) return;

        const dir = new THREE.Vector3().subVectors(p2, p1);
        const length = dir.length();
        const orientation = new THREE.Matrix4();

        // Direction vector normalized
        const normDir = dir.clone().normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const axis = new THREE.Vector3().crossVectors(up, normDir).normalize();
        const angle = Math.acos(Math.max(-1, Math.min(1, up.dot(normDir))));
        orientation.makeRotationAxis(axis, angle);

        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        // Cylinder radius and count
        const bondRadius = renderMode === 'wireframe' ? 0.04 : 0.09;
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.4,
          metalness: 0.1,
        });

        if (bond.order === 2) {
          // Double bond: two parallel cylinders offset perpendicular to bond direction
          const offsetVec = new THREE.Vector3(0, 0, 1).cross(normDir);
          if (offsetVec.lengthSq() < 0.001) offsetVec.set(1, 0, 0).cross(normDir);
          offsetVec.normalize().multiplyScalar(0.12);

          [-1, 1].forEach((sign) => {
            const cylGeo = new THREE.CylinderGeometry(bondRadius * 0.85, bondRadius * 0.85, length, 16);
            const cyl = new THREE.Mesh(cylGeo, bondMat);
            cyl.applyMatrix4(orientation);
            cyl.position.copy(mid).addScaledVector(offsetVec, sign);
            molGroup.add(cyl);
          });
        } else if (bond.order === 3) {
          // Triple bond: center + two side cylinders
          const offsetVec = new THREE.Vector3(0, 0, 1).cross(normDir);
          if (offsetVec.lengthSq() < 0.001) offsetVec.set(1, 0, 0).cross(normDir);
          offsetVec.normalize().multiplyScalar(0.16);

          [0, -1, 1].forEach((sign) => {
            const cylGeo = new THREE.CylinderGeometry(bondRadius * 0.75, bondRadius * 0.75, length, 16);
            const cyl = new THREE.Mesh(cylGeo, bondMat);
            cyl.applyMatrix4(orientation);
            cyl.position.copy(mid).addScaledVector(offsetVec, sign);
            molGroup.add(cyl);
          });
        } else {
          // Single bond or aromatic
          const cylGeo = new THREE.CylinderGeometry(bondRadius, bondRadius, length, 16);
          const cyl = new THREE.Mesh(cylGeo, bondMat);
          cyl.applyMatrix4(orientation);
          cyl.position.copy(mid);
          molGroup.add(cyl);
        }
      });
    }

    // 3. Optional Dipole Moment Vector Arrow
    if (showDipole && molecule.dipoleMomentDebye > 0.1) {
      const arrowDir = new THREE.Vector3(0, 0, 1).normalize();
      const arrowOrigin = new THREE.Vector3(0, 0, 0);
      const arrowLength = Math.min(3.5, molecule.dipoleMomentDebye * 1.2);
      const arrowHelper = new THREE.ArrowHelper(arrowDir, arrowOrigin, arrowLength, 0x06b6d4, 0.4, 0.25);
      molGroup.add(arrowHelper);
    }
  }, [molecule, renderMode, showDipole]);

  // Pointer interactions for 3D orbital drag and zoom
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    rotVelocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;

    if (isDraggingRef.current && molGroupRef.current) {
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      const vy = deltaX * 0.008;
      const vx = deltaY * 0.008;

      molGroupRef.current.rotation.y += vy;
      molGroupRef.current.rotation.x += vx;

      rotVelocityRef.current = { x: vx, y: vy };
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    }

    // Raycast for atom hover
    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    if (cameraRef.current && atomMeshesRef.current.length > 0) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const meshes = atomMeshesRef.current.map((item) => item.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const found = atomMeshesRef.current.find((item) => item.mesh === intersects[0].object);
        if (found) {
          setHoveredAtom(found.atom);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          return;
        }
      }
    }

    setHoveredAtom(null);
    setTooltipPos(null);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (cameraRef.current) {
      const zoomFactor = e.deltaY * 0.005;
      cameraRef.current.position.z = Math.max(2.5, Math.min(25, cameraRef.current.position.z + zoomFactor));
    }
  };

  const handleClick = () => {
    if (hoveredAtom && onSelectAtom) {
      onSelectAtom(hoveredAtom);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleClick}
      className="w-full h-full min-h-[320px] relative cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-xl bg-gradient-to-b from-[#060b11] via-[#09111c] to-[#04070c]"
    >
      {/* Floating Hover Tooltip */}
      {hoveredAtom && tooltipPos && (
        <div
          style={{
            left: `${Math.min(tooltipPos.x + 12, (containerRef.current?.clientWidth || 400) - 180)}px`,
            top: `${Math.max(tooltipPos.y - 45, 10)}px`,
          }}
          className="pointer-events-none absolute z-20 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-500/40 text-xs shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: getCPKColor(hoveredAtom.element) }}
            />
            <span>
              {hoveredAtom.element} ({hoveredAtom.id})
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Pos: [{hoveredAtom.x.toFixed(2)}, {hoveredAtom.y.toFixed(2)}, {hoveredAtom.z.toFixed(2)}] Å
          </div>
          {hoveredAtom.hybridization && (
            <div className="text-[10px] text-cyan-400 font-mono">Hybridization: {hoveredAtom.hybridization}</div>
          )}
        </div>
      )}

      {/* Render Mode Badge */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-900/80 border border-slate-700/80 text-cyan-400">
          {renderMode.replace('-', ' ')}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900/80 border border-slate-700/80">
          {molecule.atoms.length} Atoms / {molecule.bonds.length} Bonds
        </span>
      </div>
    </div>
  );
};
