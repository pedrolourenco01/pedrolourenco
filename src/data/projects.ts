export interface ResponsiveMedia {
	base: string;
	widths: [number, number];
	width: number;
	height: number;
	sizes: string;
}

export interface Project {
	title: string;
	description: { pt: string; en: string };
	image?: string;
	imageOpt?: ResponsiveMedia;
	video?: string;
	videoPoster?: string;
	href: string;
	gridClass?: string;
	objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
	objectPosition?: string;
	pixelColor?: string;
	pixelTextColor?: string;
	year?: string;
	tag?: { pt: string; en: string };
	order?: number;
	bgColor?: string;
}

export const defaultProjects: Project[] = [
	{
		title: "VerdeVivo",
		description: {
			pt: "Paisagismo autoral com uma presença digital imersiva.",
			en: "Bespoke landscape architecture with an immersive digital presence."
		},
		image: "/images/optimized/work-verdevivo-laptop-1024.jpg",
		imageOpt: {
			base: "/images/optimized/work-verdevivo-laptop",
			widths: [640, 1024],
			width: 1024,
			height: 571,
			sizes: "(max-width: 900px) 100vw, 58vw"
		},
		href: "https://verdevivo-green.vercel.app/",
		gridClass: "card-row1-left", // Linha 1 - Esquerda: Mais largo (7 colunas)
		pixelColor: "#2E5E3F", // Verde Vivo
		year: "2026",
		tag: { pt: "[PAISAGISMO & ARQUITETURA]", en: "[LANDSCAPE ARCHITECTURE]" },
		order: 1
	},
	{
		title: "Nosta",
		description: {
			pt: "Design de produto e visualização 3D interativa em alta fidelidade.",
			en: "Product design and high-fidelity interactive 3D visualization."
		},
		video: "/videos/work-camera-360-dist.mp4",
		videoPoster: "/images/optimized/work-camera-360-dist-poster.webp",
		href: "https://nosta-35mm.vercel.app/",
		gridClass: "card-row1-right", // Linha 1 - Direita: Menor (5 colunas)
		pixelColor: "#4A2C1D", // Marrom Chocolate
		year: "2026",
		tag: { pt: "[PRODUTO 3D & HARDWARE]", en: "[3D PRODUCT & HARDWARE]" },
		order: 2
	},
	{
		title: "CRESSI",
		description: {
			pt: "Experiência digital imersiva e e-commerce para equipamentos de mergulho.",
			en: "Immersive digital experience and e-commerce for diving equipment."
		},
		video: "/videos/work-cressi-opt.mp4",
		videoPoster: "/images/optimized/cressi-video-poster.webp",
		href: "https://cressi.vercel.app/",
		gridClass: "card-row2-left", // Linha 2 - Esquerda: Menor (5 colunas)
		pixelColor: "#000000", // Fundo Preto
		pixelTextColor: "#FFFFFF", // Letras Brancas
		year: "2026",
		tag: { pt: "[E-COMMERCE & MERGULHO]", en: "[E-COMMERCE & DIVING]" },
		order: 3
	},
	{
		title: "Malamud & Tassara",
		description: {
			pt: "Soluções jurídicas com tradição, precisão e autoridade visual.",
			en: "Legal solutions delivered with heritage, precision, and visual authority."
		},
		image: "/images/optimized/work-malamud-laptop-1024.jpg",
		imageOpt: {
			base: "/images/optimized/work-malamud-laptop",
			widths: [640, 1024],
			width: 1024,
			height: 571,
			sizes: "(max-width: 900px) 100vw, 58vw"
		},
		href: "https://malamud.vercel.app/",
		gridClass: "card-row2-right", // Linha 2 - Direita: Mais largo (7 colunas)
		pixelColor: "#261F1B", // Malamud
		year: "2026",
		tag: { pt: "[ADVOCACIA CORPORATIVA]", en: "[CORPORATE LAW]" },
		order: 4
	}
];

export function assignGridClasses(projects: Project[]): Project[] {
	return projects.map((project, index) => {
		const isEvenRow = Math.floor(index / 2) % 2 === 0;
		const gridClass = isEvenRow
			? (index % 2 === 0 ? 'card-row1-left' : 'card-row1-right')
			: (index % 2 === 0 ? 'card-row2-left' : 'card-row2-right');

		return {
			...project,
			gridClass
		};
	});
}

export function mergeProjects(
	defaults: Project[],
	sanityProjects: any[] | null | undefined,
	urlBuilder?: (source: any) => { url: () => string } | null
): Project[] {
	// Começa com cópia profunda dos projetos padrão
	const result: Project[] = defaults.map((p, idx) => ({
		...p,
		description: { ...p.description },
		tag: p.tag ? { ...p.tag } : undefined,
		imageOpt: p.imageOpt ? { ...p.imageOpt } : undefined,
		order: typeof p.order === 'number' ? p.order : idx + 1
	}));

	if (!sanityProjects || !Array.isArray(sanityProjects) || sanityProjects.length === 0) {
		return assignGridClasses(result);
	}

	for (const sp of sanityProjects) {
		if (!sp || !sp.title) continue;

		const spTitleNorm = sp.title.trim().toLowerCase();
		const existingIdx = result.findIndex(
			(p) => p.title.trim().toLowerCase() === spTitleNorm
		);

		const imageUrl = sp.image && urlBuilder ? urlBuilder(sp.image)?.url() : (typeof sp.image === 'string' ? sp.image : undefined);
		const videoUrl = sp.videoFile?.asset?.url || sp.videoUrl;
		const videoPosterUrl = sp.videoPoster && urlBuilder ? urlBuilder(sp.videoPoster)?.url() : undefined;

		if (existingIdx >= 0) {
			const existing = result[existingIdx];
			// Atualiza projeto existente sem duplicar
			result[existingIdx] = {
				...existing,
				title: sp.title || existing.title,
				description: {
					pt: sp.descriptionPt || existing.description.pt,
					en: sp.descriptionEn || existing.description.en
				},
				tag: {
					pt: sp.tagPt || existing.tag?.pt || '',
					en: sp.tagEn || existing.tag?.en || ''
				},
				year: sp.year || existing.year || '2026',
				href: sp.href || existing.href,
				pixelColor: sp.pixelColor || existing.pixelColor,
				pixelTextColor: sp.pixelTextColor || existing.pixelTextColor,
				order: typeof sp.order === 'number' ? sp.order : existing.order,
				// Se o Sanity especificou vídeo ou imagem, substitui a mídia; se não, preserva a existente
				...(videoUrl ? { video: videoUrl, videoPoster: videoPosterUrl || existing.videoPoster } : {}),
				...(imageUrl && !videoUrl ? { image: imageUrl, video: undefined, videoPoster: undefined, imageOpt: undefined } : {})
			};
		} else {
			// Adiciona novo projeto do Sanity
			result.push({
				title: sp.title,
				description: {
					pt: sp.descriptionPt || '',
					en: sp.descriptionEn || ''
				},
				tag: {
					pt: sp.tagPt || '[PROJETO]',
					en: sp.tagEn || '[PROJECT]'
				},
				year: sp.year || '2026',
				href: sp.href || '#',
				pixelColor: sp.pixelColor || '#EE5037',
				pixelTextColor: sp.pixelTextColor,
				image: imageUrl,
				video: videoUrl,
				videoPoster: videoPosterUrl,
				order: typeof sp.order === 'number' ? sp.order : result.length + 1
			});
		}
	}

	// Ordena por ordem crescente (order)
	result.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

	// Atribui o grid assimétrico (7x5, 5x7) dinamicamente para todos os itens
	return assignGridClasses(result);
}

