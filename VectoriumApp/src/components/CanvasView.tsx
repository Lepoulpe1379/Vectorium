import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useVectorStore } from "../store/useVectorStore";
import { toFloat } from "../engine/mathCore";
import { solveEigen2x2 } from "../engine/eigen";

export const CanvasView: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    const currentMatrix = useVectorStore((state) => state.currentMatrix);
    const showEigenvectors = useVectorStore((state) => state.showEigenvectors);

    useEffect(() => {
        if (!mountRef.current) return;

        // SCENE SETUP
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#0f131a");

        const viewSize = 10;
        const aspectRatio = width / height;
        const camera = new THREE.OrthographicCamera(-aspectRatio * viewSize / 2, aspectRatio * viewSize / 2, viewSize / 2, -viewSize / 2, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // GRID
        const gridGroup = new THREE.Group();
        const gridMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        const gridSize = 50;

        for (let i = -gridSize; i <= gridSize; i += 1) {
            const matV = i === 0 ? axisMaterial : gridMaterial;
            const geomV = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, -gridSize, 0), new THREE.Vector3(i, gridSize, 0)]);
            gridGroup.add(new THREE.Line(geomV, matV));

            const matH = i === 0 ? axisMaterial : gridMaterial;
            const geomH = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-gridSize, i, 0), new THREE.Vector3(gridSize, i, 0)]);
            gridGroup.add(new THREE.Line(geomH, matH));
        }
        scene.add(gridGroup);

        // BASIS VECTORS
        const createArrow = (dir: THREE.Vector3, color: number) => {
            const hex = color;
            return new THREE.ArrowHelper(dir.clone().normalize(), new THREE.Vector3(0, 0, 0), dir.length(), hex, 0.2, 0.2);
        };

        const iVector = createArrow(new THREE.Vector3(1, 0, 0), 0xff3b30);
        const jVector = createArrow(new THREE.Vector3(0, 1, 0), 0x34c759);
        iVector.position.z = 0.1; jVector.position.z = 0.1;
        scene.add(iVector); scene.add(jVector);

        // EIGENVECTOR LINES
        // 用于贯穿屏幕的两条发光线
        const eigenMaterial = new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.8, linewidth: 2 });
        const eigenLine1 = new THREE.Line(new THREE.BufferGeometry(), eigenMaterial);
        const eigenLine2 = new THREE.Line(new THREE.BufferGeometry(), eigenMaterial);
        eigenLine1.position.z = -0.1; eigenLine2.position.z = -0.1;
        scene.add(eigenLine1); scene.add(eigenLine2);
        eigenLine1.visible = false; eigenLine2.visible = false;

        const handleResize = () => {
            if (!mountRef.current) return;
            const newAspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.left = -newAspect * viewSize / 2;
            camera.right = newAspect * viewSize / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        (mountRef as any).threeObjects = {
            gridGroup, iVector, jVector, eigenLine1, eigenLine2
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current?.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // UPDATE STATE LOGIC
    useEffect(() => {
        if (!(mountRef as any).threeObjects) return;
        const { gridGroup, iVector, jVector, eigenLine1, eigenLine2 } = (mountRef as any).threeObjects;

        const a11 = toFloat(currentMatrix[0][0]);
        const a12 = toFloat(currentMatrix[0][1]);
        const a21 = toFloat(currentMatrix[1][0]);
        const a22 = toFloat(currentMatrix[1][1]);

        const transformMatrix = new THREE.Matrix4();
        transformMatrix.set(
            a11, a12, 0, 0,
            a21, a22, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        gridGroup.matrixAutoUpdate = false;
        gridGroup.matrix.copy(transformMatrix);

        const newIDir = new THREE.Vector3(a11, a21, 0); const newJDir = new THREE.Vector3(a12, a22, 0);
        iVector.setDirection(newIDir.clone().normalize()); iVector.setLength(newIDir.length(), 0.2, 0.2);
        jVector.setDirection(newJDir.clone().normalize()); jVector.setLength(newJDir.length(), 0.2, 0.2);

        // Render Eigenvectors when toggled
        eigenLine1.visible = false; eigenLine2.visible = false;

        if (showEigenvectors) {
            const eigens = solveEigen2x2(currentMatrix);
            const lines = [eigenLine1, eigenLine2];

            let lineIndex = 0;
            for (const e of eigens) {
                if (!e.isComplex && typeof e.value === 'number' && !isNaN(e.value)) {
                    for (const vec of e.vectors) {
                        if (lineIndex < 2) {
                            const geom = new THREE.BufferGeometry().setFromPoints([
                                new THREE.Vector3(vec[0] * -50, vec[1] * -50, 0),
                                new THREE.Vector3(vec[0] * 50, vec[1] * 50, 0)
                            ]);
                            lines[lineIndex].geometry.dispose();
                            lines[lineIndex].geometry = geom;
                            lines[lineIndex].visible = true;
                            lineIndex++;
                        }
                    }
                }
            }
            // 对于纯虚数特征值的提示特效可以稍后在 Renderer 里加入 postprocessing 或叠加 HTML UI 来做
        }
    }, [currentMatrix, showEigenvectors]);

    return (
        <div className="flex-1 h-full relative bg-vectorium-bg overflow-hidden cursor-crosshair">
            <div ref={mountRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};
