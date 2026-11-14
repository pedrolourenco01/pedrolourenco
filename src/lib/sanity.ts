import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const sanityClient = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID || 'u7pxy8ki',
	dataset: import.meta.env.SANITY_DATASET || 'production',
	apiVersion: import.meta.env.SANITY_API_VERSION || '2024-03-01',
	useCdn: false,
});

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: any) {
	if (!source) return null;
	return builder.image(source);
}

// Queries GROQ com tipagens seguras e fallback gracioso
export async function getSanityData() {
	try {
		const query = `{
			"hero": *[_type == "hero"][0],
			"projects": *[_type == "project"] | order(order asc),
			"services": *[_type == "services"][0],
			"about": *[_type == "about"][0],
			"contact": *[_type == "contact"][0]
		}`;

		const data = await sanityClient.fetch(query);
		return data;
	} catch (error) {
		console.warn('[Sanity] Could not fetch remote content, using fallback static content:', error);
		return null;
	}
}

