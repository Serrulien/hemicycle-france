const Hemi = require('../../js/hemi/core');
const internals = {
	constants: require('../../js/hemi/constants'),
	ligne: require('../../js/hemi/ligne.class'),
	logger: require('../../js/hemi/logger.class'),
};
const tinycolor = require('tinycolor2')

describe('creerLegende', () => {
	const fn = Hemi.creerLegende;

	describe('données de type catégorie', () => {

		test('affiche les associations de data (couleur + nom catégorie) mais pas la couleurSiegeAbsent', () => {
			document.body.innerHTML = "";
	
			const palette = {
				data: [
					internals.ligne.LignePaletteCategorie('H', undefined, 'red'),
					internals.ligne.LignePaletteCategorie('F', undefined, 'yellow'),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			expect(fn(document.body, palette)).toBeUndefined();
	
			const associations = document.body.querySelectorAll('.association');
			expect(associations).toHaveLength(2);
	
			expect(associations[0].querySelectorAll('.couleur')).toHaveLength(1);
			expect(associations[0].querySelectorAll('.signification')).toHaveLength(1);
			expect(window.getComputedStyle(associations[0].querySelector('.couleur')).backgroundColor).toBe(tinycolor(palette.data[0].couleur()).toRgbString());
			expect(associations[0].querySelector('.signification').innerText).toBe(palette.data[0].categorie());
	
			expect(associations[1].querySelectorAll('.couleur')).toHaveLength(1);
			expect(associations[1].querySelectorAll('.signification')).toHaveLength(1);
			expect(window.getComputedStyle(associations[1].querySelector('.couleur')).backgroundColor).toBe(tinycolor(palette.data[1].couleur()).toRgbString());
			expect(associations[1].querySelector('.signification').innerText).toBe(palette.data[1].categorie());
		});
	
		test('supprime les éléments déjà présent dans le conteneur, si pas d\'associations dans la palette ni de nuancier, alors le contenu du conteneur est vide', () => {
			document.body.innerHTML = "<ul><li><p>gergz</p><p>jiej</p></li><li></li></ul>";
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			expect(fn(document.body, palette)).toBeUndefined();
			expect(document.body.innerHTML).toBe('');
		});
	
		test('supprime les éléments déjà présent dans le conteneur, si pas d\'associations dans la palette mais un nuancier valide est présent, alors la légende contient les associations avec des les noms des catégories', () => {
			document.body.innerHTML = "<ul><li><p>gergz</p><p>jiej</p></li><li></li></ul>";
	
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 32, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 'RPU', numero: 33, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 'RPU', numero: 33, siege: 4}),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};

			const nuancier = Hemi.creerNuancierCouleurCategorie(donnees, palette, [1,2,3,4]);
	
			expect(fn(document.body, palette, nuancier)).toBeUndefined();

			const associations = document.body.querySelectorAll('.association');
			expect(associations).toHaveLength(2);
	
			expect(associations[0].querySelectorAll('.couleur')).toHaveLength(1);
			expect(associations[0].querySelectorAll('.signification')).toHaveLength(1);
			expect(associations[0].querySelector('.signification').innerText).toBe('catégorie n°1');
	
			expect(associations[1].querySelectorAll('.couleur')).toHaveLength(1);
			expect(associations[1].querySelectorAll('.signification')).toHaveLength(1);
			expect(associations[1].querySelector('.signification').innerText).toBe('catégorie n°2');

			expect(window.getComputedStyle(associations[0].querySelector('.couleur')).backgroundColor).not.toBe(window.getComputedStyle(associations[1].querySelector('.couleur')).backgroundColor);
		});
	});
	
	describe('données de type numérique', () => {

		test('affiche les dégradés de la palette mais pas la couleurSiegeAbsent', () => {
			document.body.innerHTML = "";
	
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 10, numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 9, numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 19, numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 20, numero: 35, siege: 4}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};
	
			const palette = {
				data: [
					internals.ligne.LignePaletteNumerique(0, 10, 0, {coulDepart: 'black', coulFin: 'white'}),
					internals.ligne.LignePaletteNumerique(10, 20, 0, {coulDepart: 'red', coulFin: 'yellow'}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};

			const nuancier = Hemi.creerNuancierNumerique(donnees, palette, [1,2,3,4]);

			expect(fn(document.body, palette, nuancier)).toBeUndefined();
	
			const associations = document.body.querySelectorAll('.association');
			expect(associations).toHaveLength(2);
	
			expect(associations[0].querySelectorAll('.degrade')).toHaveLength(1);
			expect(associations[0].querySelectorAll('.signification')).toHaveLength(1);
			expect(associations[0].querySelectorAll('.borne')).toHaveLength(2);
			expect(associations[0].querySelector('.signification').innerText).toBe('dégradé n°1');
			expect(associations[0].querySelector('.borne:nth-of-type(1)').innerText).toBe(palette.data[0].intervalle.borneInf());
			expect(associations[0].querySelector('.borne:nth-of-type(2)').innerText).toBe(palette.data[0].intervalle.borneSup());
			// expect(window.getComputedStyle(associations[0].querySelector('.degrade')).backgroundImage).toBe(palette.data[0].degrade.gradient().css());
			// https://github.com/jsdom/jsdom/issues/2166

			expect(associations[1].querySelectorAll('.degrade')).toHaveLength(1);
			expect(associations[1].querySelectorAll('.signification')).toHaveLength(1);
			expect(associations[1].querySelectorAll('.borne')).toHaveLength(2);
			expect(associations[1].querySelector('.signification').innerText).toBe('dégradé n°2');
			expect(associations[1].querySelector('.borne:nth-of-type(1)').innerText).toBe(palette.data[1].intervalle.borneInf());
			expect(associations[1].querySelector('.borne:nth-of-type(2)').innerText).toBe(palette.data[1].intervalle.borneSup());
			// expect(window.getComputedStyle(associations[1].querySelector('.degrade')).backgroundImage).toBe(palette.data[1].degrade.gradient().css());
			// https://github.com/jsdom/jsdom/issues/2166
		});

		test('si pas de palette mais données, alors on créer un unique dégradé regroupant l\'ensemble des valeurs effectives', () => {
			document.body.innerHTML = "";
	
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 10, numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 20, numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 30, numero: 33, siege: 3}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};

			const nuancier = Hemi.creerNuancierNumerique(donnees, palette, [1,2,3]);

			expect(fn(document.body, palette, nuancier)).toBeUndefined();
	
			const associations = document.body.querySelectorAll('.association');
			expect(associations).toHaveLength(1);

			const values = donnees.data.map(ligne => ligne.valeur()).sort((a,b) => a-b);
	
			expect(associations[0].querySelectorAll('.degrade')).toHaveLength(1);
			expect(associations[0].querySelectorAll('.signification')).toHaveLength(1);
			expect(associations[0].querySelectorAll('.borne')).toHaveLength(2);
			expect(associations[0].querySelector('.signification').innerText).toBe('dégradé n°1');
			expect(associations[0].querySelector('.borne:nth-of-type(1)').innerText).toBe(values[0]);
			expect(associations[0].querySelector('.borne:nth-of-type(2)').innerText).toBe(values[values.length-1]);
			// expect(window.getComputedStyle(associations[0].querySelector('.degrade')).backgroundImage).toBe(palette.data[0].degrade.gradient().css());
			// https://github.com/jsdom/jsdom/issues/2166
		});


		test.skip('jsdom pas de linear gradient dans background-image https://github.com/jsdom/jsdom/issues/2166', () => {

		});
	
	});

});