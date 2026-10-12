import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface DepthImageProps {
	image: string;
	depthMap: string;
	alt?: string;
	className?: string;
	style?: React.CSSProperties;
	intensity?: number;
	lerp?: number;
	priority?: boolean;
}

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

// Shader limpo: SEM edgeMask, SEM filtros artificiais
// Apenas fotografia original + depth map + deslocamento ultra-sutil e controlado
const fragmentShader = `
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uMouse;
uniform float uIntensity;

varying vec2 vUv;

void main() {
    // 1. Mouse normalizado em torno do centro (-0.5 a 0.5)
    // No centro exato (0.5, 0.5), mouseOffset = (0.0, 0.0) -> ZERO deslocamento
    vec2 mouseOffset = uMouse - vec2(0.5);

    // 2. Leitura do depth map em escala de cinza
    float depth = texture2D(uDepth, vUv).r;

    // 3. Deslocamento proporcional à profundidade (sem curvas que deformem o corpo/camiseta)
    vec2 displacement = mouseOffset * depth * uIntensity;

    // 4. Reduz principalmente o deslocamento vertical (65% do horizontal)
    displacement.y *= 0.65;

    // 5. Limitação matemática estrita do deslocamento máximo de UV
    float maxDisplacement = 0.005;
    displacement = clamp(displacement, vec2(-maxDisplacement), vec2(maxDisplacement));

    // 6. Coordenadas clampadas rigorosamente
    vec2 uv = vUv + displacement;
    uv = clamp(uv, vec2(0.002), vec2(0.998));

    // 7. Amostragem direta e única da fotografia original
    gl_FragColor = texture2D(uImage, uv);
}
`;

function checkWebGLSupport(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const canvas = document.createElement('canvas');
		return !!(
			window.WebGLRenderingContext &&
			(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
		);
	} catch {
		return false;
	}
}

export function DepthImage({
	image,
	depthMap,
	alt = 'Pedro Lourenço',
	className = '',
	style = {},
	intensity = 0.0046, // Aumentado em +30% para relevo e profundidade 3D mais vívidos
	lerp = 0.038, // Suavização fluida
	priority = true,
}: DepthImageProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [hasWebGL, setHasWebGL] = useState(true);

	useEffect(() => {
		if (!checkWebGLSupport()) {
			setHasWebGL(false);
			return;
		}

		const container = containerRef.current;
		if (!container) return;

		// Limpa qualquer elemento prévio no container
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		// Cria Renderer WebGL ÚNICO
		let renderer: THREE.WebGLRenderer;
		try {
			renderer = new THREE.WebGLRenderer({
				alpha: true,
				antialias: true,
				powerPreference: 'high-performance',
			});
		} catch (e) {
			console.warn('Erro ao inicializar WebGLRenderer:', e);
			setHasWebGL(false);
			return;
		}

		const width = container.clientWidth || 800;
		const height = container.clientHeight || 600;

		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(width, height);
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		renderer.domElement.style.display = 'block';
		renderer.domElement.style.pointerEvents = 'none';

		container.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		const textureLoader = new THREE.TextureLoader();
		textureLoader.setCrossOrigin('anonymous');

		// Inicia mouse exatamente no centro (0.5, 0.5)
		const currentMouse = { x: 0.5, y: 0.5 };
		const targetMouse = { x: 0.5, y: 0.5 };

		const uniforms = {
			uImage: { value: null as THREE.Texture | null },
			uDepth: { value: null as THREE.Texture | null },
			uMouse: { value: new THREE.Vector2(0.5, 0.5) },
			uIntensity: { value: intensity },
		};

		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			transparent: true,
			depthTest: false,
			depthWrite: false,
		});

		const geometry = new THREE.PlaneGeometry(2, 2);
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		let texturesLoaded = 0;
		let isDirty = true;
		let isLoopRunning = false;
		let isIntersecting = true;
		let animationFrameId: number | null = null;

		const onTextureReady = () => {
			texturesLoaded++;
			if (texturesLoaded >= 2) {
				isDirty = true;
				startRenderLoop();
			}
		};

		textureLoader.load(
			image,
			(tex) => {
				tex.minFilter = THREE.LinearFilter;
				tex.magFilter = THREE.LinearFilter;
				tex.generateMipmaps = false;
				uniforms.uImage.value = tex;
				onTextureReady();
			},
			undefined,
			(err) => {
				console.error('Erro ao carregar fotografia original:', err);
				setHasWebGL(false);
			}
		);

		textureLoader.load(
			depthMap,
			(tex) => {
				tex.minFilter = THREE.LinearFilter;
				tex.magFilter = THREE.LinearFilter;
				tex.generateMipmaps = false;
				uniforms.uDepth.value = tex;
				onTextureReady();
			},
			undefined,
			(err) => {
				console.error('Erro ao carregar depth map:', err);
				setHasWebGL(false);
			}
		);

		// ResizeObserver com rAF para evitar loop notifications
		let resizeRaf: number;
		const handleResize = () => {
			if (!container) return;
			const w = container.clientWidth;
			const h = container.clientHeight;
			if (w > 0 && h > 0) {
				renderer.setSize(w, h);
				isDirty = true;
				wakeRenderLoop();
			}
		};

		const resizeObserver = new ResizeObserver(() => {
			cancelAnimationFrame(resizeRaf);
			resizeRaf = requestAnimationFrame(handleResize);
		});
		resizeObserver.observe(container);

		// Eventos de Mouse (Desktop)
		const handleMouseMove = (e: MouseEvent) => {
			targetMouse.x = e.clientX / window.innerWidth;
			targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
			isDirty = true;
			wakeRenderLoop();
		};

		const handleMouseLeave = () => {
			targetMouse.x = 0.5;
			targetMouse.y = 0.5;
			isDirty = true;
			wakeRenderLoop();
		};

		// Eventos de Touch (Mobile)
		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches.length === 0) return;
			const touch = e.touches[0];
			targetMouse.x = touch.clientX / window.innerWidth;
			targetMouse.y = 1.0 - (touch.clientY / window.innerHeight);
			isDirty = true;
			wakeRenderLoop();
		};

		const handleTouchEnd = () => {
			targetMouse.x = 0.5;
			targetMouse.y = 0.5;
			isDirty = true;
			wakeRenderLoop();
		};

		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
		window.addEventListener('touchmove', handleTouchMove, { passive: true });
		window.addEventListener('touchend', handleTouchEnd, { passive: true });

		// IntersectionObserver para pausar GPU quando fora de tela
		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				isIntersecting = entry.isIntersecting;
				if (isIntersecting) {
					isDirty = true;
					wakeRenderLoop();
				}
			},
			{ threshold: 0.05 }
		);
		intersectionObserver.observe(container);

		function startRenderLoop() {
			if (isLoopRunning) return;
			isLoopRunning = true;
			tick();
		}

		function wakeRenderLoop() {
			if (!isLoopRunning && isIntersecting && texturesLoaded >= 2) {
				isLoopRunning = true;
				tick();
			}
		}

		function tick() {
			if (!isIntersecting) {
				isLoopRunning = false;
				return;
			}

			// Interpolação suave (lerp)
			const dx = targetMouse.x - currentMouse.x;
			const dy = targetMouse.y - currentMouse.y;

			currentMouse.x += dx * lerp;
			currentMouse.y += dy * lerp;

			uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);

			renderer.render(scene, camera);

			// Idle sleep quando o cursor estiver em repouso
			if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001 && !isDirty) {
				isLoopRunning = false;
				animationFrameId = null;
				return;
			}

			isDirty = false;
			animationFrameId = requestAnimationFrame(tick);
		}

		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			cancelAnimationFrame(resizeRaf);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);

			resizeObserver.disconnect();
			intersectionObserver.disconnect();

			geometry.dispose();
			material.dispose();
			if (uniforms.uImage.value) uniforms.uImage.value.dispose();
			if (uniforms.uDepth.value) uniforms.uDepth.value.dispose();
			renderer.dispose();

			if (renderer.domElement.parentElement) {
				renderer.domElement.parentElement.removeChild(renderer.domElement);
			}
		};
	}, [image, depthMap, intensity, lerp]);

	// Fallback: se WebGL não for suportado, exibe apenas a imagem
	if (!hasWebGL) {
		return (
			<img
				src={image}
				alt={alt}
				className={className}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'contain',
					objectPosition: 'center bottom',
					...style,
				}}
				loading={priority ? 'eager' : 'lazy'}
				fetchPriority={priority ? 'high' : 'auto'}
			/>
		);
	}

	// Com WebGL ativo, APENAS o container com o Canvas WebGL existe
	return (
		<div
			ref={containerRef}
			className={`depth-image-container ${className}`}
			style={{
				position: 'relative',
				width: '100%',
				height: '100%',
				overflow: 'hidden',
				display: 'flex',
				alignItems: 'flex-end',
				justifyContent: 'center',
				...style,
			}}
			role="img"
			aria-label={alt}
		/>
	);
}

export default DepthImage;
