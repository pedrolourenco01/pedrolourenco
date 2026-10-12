import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export interface TextAnimation17Options {
	delay?: number;
	duration?: number;
	stagger?: number;
	ease?: string;
	trigger?: Element | string | null;
	start?: string;
	once?: boolean;
}

export function initTextAnimation17(
	target: Element | string,
	options: TextAnimation17Options = {}
) {
	const {
		delay = 0,
		duration = 1,
		stagger = 0.1,
		ease = 'power4.out',
		trigger = null,
		start = 'top 75%',
		once = true,
	} = options;

	const elements: HTMLElement[] =
		typeof target === 'string'
			? Array.from(document.querySelectorAll<HTMLElement>(target))
			: [target as HTMLElement];

	if (!elements.length) return;

	elements.forEach((element) => {
		if (!element) return;

		// Revert any previous split on the element
		if ((element as any)._splitText17) {
			try {
				(element as any)._splitText17.revert();
			} catch (_) {}
		}

		try {
			const split = SplitText.create(element, {
				type: 'lines',
				mask: 'lines',
				linesClass: 'line++',
				lineThreshold: 0.1,
			});

			if (!split || !split.lines || !split.lines.length) return;
			(element as any)._splitText17 = split;

			// Convert CSS text-indent into padding-left of the first line (exact VanceLib #17 logic)
			const computedStyle = window.getComputedStyle(element);
			const textIndent = computedStyle.textIndent;
			if (textIndent && textIndent !== '0px') {
				split.lines[0].style.paddingLeft = textIndent;
				element.style.textIndent = '0px';
			}

			// VanceLib #17 initial position & reveal animation
			gsap.set(split.lines, { y: '100%' });

			gsap.to(split.lines, {
				y: '0%',
				duration,
				stagger,
				ease,
				delay,
				scrollTrigger: {
					trigger: (trigger as any) || element,
					start,
					once,
				},
			});
		} catch (err) {
			console.error('[TextAnimation17] Error initializing split:', err);
		}
	});
}

