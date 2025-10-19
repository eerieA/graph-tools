import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Not using adapter-auto. We use adapter-static to produce static files for Tauri
		adapter: adapter({			
			// fallback page for SPA-style navigation
			fallback: 'index.html'
		})
	}
};

export default config;
