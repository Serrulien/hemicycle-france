const Hemi = require('../../js/hemi/core');
const HemiConstants = require('../../js/hemi/constants');
const Raphael = require('raphael');
const jsdom = require('jsdom');

describe.skip('dessinerHemicycle', () => {
	test('contient toutes les places valides et autres éléments', () => {
		const test = new jsdom.JSDOM('<div id="SVG"></div>')
		const win = test.window;
		Raphael.setWindow(win);
	
		// eslint-disable-next-line no-unused-vars
		const hemicycle = new Raphael(win.document.getElementById('SVG'), 900, 1200);

		const res = Hemi.dessinerHemicycle(hemicycle);
		for(const num of HemiConstants.NUMEROS_SIEGES_UTILISES)
		{
			expect(res.hasOwnProperty('s'+num)).toBe(true);
		}

		for(const num of HemiConstants.NUMEROS_SIEGES_NON_UTILISES)
		{
			expect(res.hasOwnProperty('s'+num)).toBe(false);
		}

		expect(res.hasOwnProperty('enceinte')).toBe(true);
		expect(res.hasOwnProperty('bancs')).toBe(true);
		expect(res.hasOwnProperty('bancsDevant')).toBe(true);
		expect(res.hasOwnProperty('perchoir')).toBe(true);
		expect(res.hasOwnProperty('ministres')).toBe(true);
		expect(res.hasOwnProperty('commissions')).toBe(true);
	});
});