// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	server: {
		host: '0.0.0.0',
		port: 3000,
	},
	integrations: [react()],
	build: {
		// Inlines CSS directly into HTML to avoid render-blocking stylesheet roundtrips (FCP/LCP)
		inlineStylesheets: 'always',
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			cssCodeSplit: true,
			cssMinify: true,
			minify: 'esbuild',
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
							return 'vendor-react';
						}
						if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
							return 'vendor-motion';
						}
						if (id.includes('node_modules/gsap')) {
							return 'vendor-gsap';
						}
						if (id.includes('node_modules/lenis')) {
							return 'vendor-lenis';
						}
					},
				},
			},
		},
	},
});
