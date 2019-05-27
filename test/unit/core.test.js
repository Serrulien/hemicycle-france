const Hemi = require('../../js/hemi/core');
const internals = {
	constants: require('../../js/hemi/constants'),
	ligne: require('../../js/hemi/ligne.class'),
	logger: require('../../js/hemi/logger.class'),
};
const tinycolor = require('tinycolor2');
const tinygradient = require('tinygradient');

describe('normalisation valeur dans intervalle', () => {
	const fn = Hemi.normaliser;

	test.each([
		[50, 100, 0, 0.5],
		[0, 100, 0, 0],
		[100, 100, 0, 1],
		[0, 100, -100, 0.5],
		[-100, 100, -100, 0],
		[-100, -200, 0, 0.5],
		[-100, -200, -100, -0],
		[100, 100, -100, 1],
		[50, 100, -100, 0.75],
	])(
		'%f dans %f %f doit valoir %f',
		(valeur, max, min, expected) => {
			expect(fn(valeur, max, min)).toBe(expected);
		}
	);
});

describe('listerDoublons', () => {

	test.each([
		[
			[],
			[],
			[]
		],
		[
			[
			['a', 0],
			['b', 0]
			],
			[0,1],
			[]
		],
		[
			[
			['a'],
			['b']
			],
			[0],
			[]
		],
		[
			[
			['a', 0],
			['a', 1]
			],
			[1],
			[]
		],
		[
			[
			['a'],
			['b']
			],
			[],
			[]
		],
		[
			[
			['a'],
			['a']
			],
			[0],
			[
			{value: ['a'], occurence: [0,1]}
			]
		],
		[
			[
			[['a','b'], 87845],
			[['a','b']],
			['a', 'b', 54787],
			['a', 'b', 8787]
			],
			[0],
			[
			{value: [['a','b']], occurence: [0,1]},
			{value: ['a'], occurence: [2,3]},
			]
		],
		[
			[
			['a', 0],
			['b', 0]
			],
			[1],
			[
			{value: [0], occurence: [0,1]}
			]
		],
		[
			[
			['a', 0],
			['a', 1]
			],
			[1],
			[]
		],
		[
			[
			['a', 0],
			['a', 0]
			],
			[0,1],
			[
			{value: ['a',0], occurence: [0,1]}
			]
		],
		[
			[
			['a', 1, 'A'],
			['b', 1, 'B'],
			['b', 1, 'B'],
			['c', 1, 'C'],
			['d', 1, 'D'],
			['d', 1, 'D'],
			],
			[0,1,2],
			[
			{value: ['b', 1, 'B'], occurence: [1,2]},
			{value: ['d', 1, 'D'], occurence: [4,5]},
			]
		],
	])(
		'retourne correctement les doublons selon la clePrimaire, sans effet de bord sur l\'input (%#)',
		(input, cpmIndex, expected) => {
			const inputSnapshot = JSON.stringify(input);
			expect(Hemi.listerDoublons(input, cpmIndex)).toEqual(expected);
			expect(JSON.stringify(input)).toBe(inputSnapshot);
		}
	);

	test('throw Error quand un des index de référence est n\'est pas valide dans data', () => {
		const input = [[]];
		const inputSnapshot = JSON.stringify(input);
		expect(() => {
			Hemi.listerDoublons(input, [0,1]);
		}).toThrow();
		expect(JSON.stringify(input)).toBe(inputSnapshot);
	});

});

describe('supprimeDoublons', () => {
	
	test.each([
		[
			[
			{cle: 'a', data: [0], ligne: 0},
			{cle: 'b', data: [1], ligne: 1}
			]
			,
			[
			{cle: 'a', data: [0], ligne: 0},
			{cle: 'b', data: [1], ligne: 1}
			]
		],
		[
			[
			{cle: 0, data: [0], ligne: 0},
			{cle: 1, data: [1], ligne: 1}
			]
			,
			[
			{cle: 0, data: [0], ligne: 0},
			{cle: 1, data: [1], ligne: 1}
			]
		],
		[
			[
			{cle: 'c', data: [0], ligne: 0},
			{cle: 'c', data: [1], ligne: 1}
			]
			,
			[
			{cle: 'c', data: [1], ligne: 1}
			]
		],
		[
			[
			{cle: 0, data: [0], ligne: 0},
			{cle: 0, data: [1], ligne: 1}
			]
			,
			[
			{cle: 0, data: [1], ligne: 1}
			]
		],
		[
			[
			{cle: 'a', data: [0], ligne: 0},
			{cle: 'a', data: [1], ligne: 1},
			{cle: 0, data: [2], ligne: 2},
			{cle: 'b', data: [3], ligne: 3},
			{cle: 'c', data: [4], ligne: 4},
			{cle: 'c', data: [5], ligne: 5},
			{cle: 'd', data: [6], ligne: 6},
			{cle: 0, data: [7], ligne: 7}
			]
			,
			[
			{cle: 'a', data: [1], ligne: 1},
			{cle: 'b', data: [3], ligne: 3},
			{cle: 'c', data: [5], ligne: 5},
			{cle: 'd', data: [6], ligne: 6},
			{cle: 0, data: [7], ligne: 7}
			]
		]
	])(
		'supprime correctement les doublons sans sideeffect',
		(input, expected) => {
			const inputSnapshot = JSON.stringify(input);
			const inputMap = input.map(function(inp){return [inp.cle, ...inp.data]});
			expect(Hemi.supprimeDoublons(input, Hemi.listerDoublons(inputMap, [0]))).toEqual(expected);
			expect(JSON.stringify(input)).toBe(inputSnapshot);
		}
	);
});

describe('convertirEnNumber', () => {
	const fn = Hemi.convertirEnNumber;

	test('throw quand la paramètre n\'est pas un string', () => {
		expect(() => {fn([])}).toThrow();
		expect(() => {fn({})}).toThrow();
		expect(() => {fn(1)}).toThrow();
		expect(() => {fn(function(){})}).toThrow();
	});

	test('throw quand la paramètre n\'est pas un string représentant un Number', () => {
		expect(() => {fn('')}).toThrow();
		expect(() => {fn('zefzeg')}).toThrow();
		expect(() => {fn('05f')}).toThrow();
	});

	test.each([['1', 1], ['2', 2]])(
		'convertit %s en Number',
		(input, expected) => {
			expect(fn(input)).toBe(expected);
		}
	);

});

describe('estNumeroSiegeValide', () => {
	const fn = Hemi.estNumeroSiegeValide;

	test.each([
		[1, true],
		[2, true],
		[3, true],
		[650, true]
	])(
		'le numéro existe %i',
		(input, expected) => {
			expect(fn(input)).toBe(expected);
		}
	);

	test.each([
		[0, false],
		[4, false],
		[651, false],
		["1", false]
	])(
		'le numéro n\'existe pas %i',
		(input, expected) => {
			expect(fn(input)).toBe(expected);
		}
	);
});

describe('gardeSiegeUtilises', () => {
	const fn = Hemi.gardeSiegesUtilises;

	test('retourne l\'input quand toutes les places valides', () => {
		const input = [
			internals.ligne.LigneDonneesFactory({numero: 0, siege: 1}),
			internals.ligne.LigneDonneesFactory({numero: 1, siege: 2})
		];
		const inputSnapshot = JSON.stringify(input);
		expect(fn(input)).toEqual({data: input, invalide: []});
		expect(JSON.stringify(input)).toBe(inputSnapshot);
	});

	test('retourne vide quand toutes les places fausses', () => {
		const input = [
			internals.ligne.LigneDonneesFactory({numero: 0, siege: 4}),
			internals.ligne.LigneDonneesFactory({numero: 1, siege: -1}),
		];
		const inputSnapshot = JSON.stringify(input);
		expect(fn(input)).toEqual({
			data: [],
			invalide: [
				{index: 0, ligne: input[0]},
				{index: 1, ligne: input[1]},
			]
		});
		expect(JSON.stringify(input)).toBe(inputSnapshot);
	});

	test('mix valides + fausses', () => {
		const input = [
			internals.ligne.LigneDonneesFactory({numero: 0, siege: 1}),
			internals.ligne.LigneDonneesFactory({numero: 1, siege: 4}),
			internals.ligne.LigneDonneesFactory({numero: 2, siege: 2}),
			internals.ligne.LigneDonneesFactory({numero: 3, siege: -1}),
		];
		const inputSnapshot = JSON.stringify(input);
		expect(fn(input)).toEqual({
			data: [input[0], input[2]],
			invalide: [
				{index: 1, ligne: input[1]},
				{index: 3, ligne: input[3]},
			]
		});
		expect(JSON.stringify(input)).toBe(inputSnapshot);
	});

});

describe('intersectionPalette', () => {
	
	test.each([
		[
			[]
			,
			[]
		],
		[
			[
			new internals.ligne.LignePaletteNumerique(0, 1),
			new internals.ligne.LignePaletteNumerique(1, 2),
			]
			,
			[]
		],
		[
			[
			new internals.ligne.LignePaletteNumerique(-10, 0),
			new internals.ligne.LignePaletteNumerique(1, 2),
			new internals.ligne.LignePaletteNumerique(2, 10),
			]
			,
			[]
		],
		[
			[
			new internals.ligne.LignePaletteNumerique(0, 0.59),
			new internals.ligne.LignePaletteNumerique(0.59, 10),
			]
			,
			[]
		]
	])(
		'pas d\'intersection (n%#)',
		(input, expected) => {
			const inputSnapshot = JSON.stringify(input);
			expect(Hemi.intersectionPalette(input)).toEqual(expected);
			expect(JSON.stringify(input)).toBe(inputSnapshot);
		}
	);

	test.each([
		[
			[
			new internals.ligne.LignePaletteNumerique(0, 10),
			new internals.ligne.LignePaletteNumerique(0, 10),
			]
			,
			[
			{left: {borneInf: 0, borneSup: 10}, leftIndex: 0, right: [1]},
			{left: {borneInf: 0, borneSup: 10}, leftIndex: 1, right: [0]},
			]
		],
		[
			[
			new internals.ligne.LignePaletteNumerique(0, 10),
			new internals.ligne.LignePaletteNumerique(0, 1),
			]
			,
			[
			{left: {borneInf: 0, borneSup: 10}, leftIndex: 0, right: [1]},
			{left: {borneInf: 0, borneSup: 1}, leftIndex: 1, right: [0]}
			]
		],
		[
			[
			new internals.ligne.LignePaletteNumerique(0, 1),
			new internals.ligne.LignePaletteNumerique(0, 10),
			new internals.ligne.LignePaletteNumerique(10, 20),
			new internals.ligne.LignePaletteNumerique(4, 10),
			]
			,
			[
			{left: {borneInf: 0, borneSup: 1}, leftIndex: 0, right: [1]},
			{left: {borneInf: 0, borneSup: 10}, leftIndex: 1, right: [0,3]},
			{left: {borneInf: 4, borneSup: 10}, leftIndex: 3, right: [1]}
			]
		]
		,
		[
			[
			new internals.ligne.LignePaletteNumerique(0, 10),
			new internals.ligne.LignePaletteNumerique(0, 2),
			new internals.ligne.LignePaletteNumerique(2, 10),
			new internals.ligne.LignePaletteNumerique(10, 20),
			new internals.ligne.LignePaletteNumerique(20, 30),
			new internals.ligne.LignePaletteNumerique(25, 35),
			]
			,
			[
			{left: {borneInf: 0, borneSup: 10}, leftIndex: 0, right: [1,2]},
			{left: {borneInf: 0, borneSup: 2}, leftIndex: 1, right: [0]},
			{left: {borneInf: 2, borneSup: 10}, leftIndex: 2, right: [0]},
			{left: {borneInf: 20, borneSup: 30}, leftIndex: 4, right: [5]},
			{left: {borneInf: 25, borneSup: 35}, leftIndex: 5, right: [4]}
			]
		]
	])(
		'intersection présente (n%#)',
		(input, expected) => {
			const inputSnapshot = JSON.stringify(input);
			expect(Hemi.intersectionPalette(input)).toEqual(expected);
			expect(JSON.stringify(input)).toBe(inputSnapshot);
		}
	);
});

describe('extraireElements', () => {
	const fn = Hemi.extraireElements;
	
	test('ne retourne aucun extrait quand pas de colonnes selectionnées (array)', () => {
		const input = [0,1,2,3];
		const snapshot = JSON.stringify(input);

		expect(fn(input, [])).toEqual({extrait: [], valide:[], invalide: []});

		expect(JSON.stringify(input)).toBe(snapshot);
	});

	test('ne retourne aucun extrait quand pas de colonnes selectionnées (object)', () => {
		const input = {a:0,b:1};
		const snapshot = JSON.stringify(input);

		expect(fn(input, [])).toEqual({extrait: [], valide:[], invalide: []});

		expect(JSON.stringify(input)).toBe(snapshot);
	});

	test('retourne dans extrait seulement les colonnes voulues (array)', () => {
		const input = ['a','b','c','d'];
		const snapshot = JSON.stringify(input);

		expect(fn(input, [3,1,2])).toEqual({extrait: ['d','b','c'], valide:[3,1,2], invalide: []});

		expect(JSON.stringify(input)).toBe(snapshot);
	});

	test('retourne dans extrait seulement les colonnes voulues (object)', () => {
		const input = {a:'A',b:'B',c:'C'};
		const snapshot = JSON.stringify(input);

		expect(fn(input, ['c','b'])).toEqual({extrait: ['C','B'], valide:['c','b'], invalide: []});

		expect(JSON.stringify(input)).toBe(snapshot);
	});

	test('retourne dans extrait seulement les colonnes voulues et dans invalide les colonnes non atteignables (array)', () => {
		const input = ['a','b','c','d'];
		const snapshot = JSON.stringify(input);

		expect(fn(input, [3,1,999,2])).toEqual({extrait: ['d','b','c'], valide:[3,1,2], invalide: [999]});

		expect(JSON.stringify(input)).toBe(snapshot);
	});

	test('retourne dans extrait seulement les colonnes voulues et dans invalide les colonnes non atteignables (object)', () => {
		const input = {a:'A',b:'B',c:'C'};
		const snapshot = JSON.stringify(input);

		expect(fn(input, ['c','?','b'])).toEqual({extrait: ['C','B'], valide:['c','b'], invalide: ['?']});

		expect(JSON.stringify(input)).toBe(snapshot);
	});

});

describe('extraireColonnesCSV', () => {
	const fn = Hemi.extraireColonnesCSV;

	expect.extend({
		toEqualLigneDonneeAvecErreur(given, other) {

			const pass = this.equals(given.numero(), other.numero())
					&& this.equals(given.contenu(), other.contenu())
					&& this.equals(given.erreur, other.erreur);

			return {
				pass
			}
		}
	});

	test('data vide renvoi array vide', () => {
		const data = [];
		const inputSnapshot = JSON.stringify(data);

		expect(fn(data, [1])).toEqual([]);
		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});

	test('col 1 et 2 sur 2 sans erreurs', () => {

		const data = [
			["a", "0"],
			["b", "1"]
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, [0, 1]);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['a', '0'], 0), {erreur: []}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['b', '1'], 1), {erreur: []}));
			
		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});

	test('col 1 et 3 sur 3 sans erreurs', () => {

		const data = [
			["a", "?", "0"],
			["b", "!", "1"]
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, [0, 2]);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['a', '0'], 0), {erreur: []})),
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['b', '1'], 1), {erreur: []}));

		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});
	
	test('col 1,2 et 3 sur 2 avec erreur sur toutes les lignes', () => {
		const data = [
			["a", "0"],
			["b", "1"]
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, [0, 1, 2]);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['a', '0'], 0), {erreur: [2]}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['b', '1'], 1), {erreur: [2]}));

		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});

	test('col 1,2 et 3 sur 2 avec erreur à la 2è ligne', () => {
		const data = [
			["a", "0", "!"],
			["b", "1"]
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, [0, 1, 2]);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['a', '0', '!'], 0), {erreur: []}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['b', '1'], 1), {erreur: [2]}));

		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});

	test('col 4 et 3 sur 3 avec erreurs sur toutes les lignes', () => {
		const data = [
			["a", "0", "!"],
			["b", "1", "?"]
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, [3, 2]);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['!'], 0), {erreur: [3]}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['?'], 1), {erreur: [3]}));

		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});

	test('col 5 et 4 sur 3 avec erreurs sur toutes les lignes', () => {
		const data = [
			["a", "0", "!"],
			["b", "1", "?"]
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, [4, 3]);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees([], 0), {erreur: [4,3]}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees([], 1), {erreur: [4,3]}));

		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});

	test('col a et b sur 2 sans erreurs', () => {
		const data = [
			{a: "0", b: "1"},
			{a: "2", b: "3"}
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, ["a", "b"]);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['0', '1'], 0), {erreur: []}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['2', '3'], 1), {erreur: []}));
		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});
	
	test('col a, b et c sur 3 sans erreurs', () => {
		const data = [
			{a: "0", b: "1", c: "?"},
			{a: "2", b: "3", c: "?"}
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, ["a", "b",'c']);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['0', '1', '?'], 0), {erreur: []}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['2', '3', '?'], 1), {erreur: []}));

		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});
	
	test('col a,b et c sur 2 avec erreurs sur toutes les lignes', () => {
		const data = [
			{a: "0", b: "1"},
			{a: "2", b: "3"}
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, ["a", "b",'c']);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['0', '1'], 0), {erreur: ['c']}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['2', '3'], 1), {erreur: ['c']}));

		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});
	
	test('col b et c sur 2 avec erreur sur 2è ligne', () => {
		const data = [
			{a: "0", b: "1", c: "4"},
			{a: "2", b: "3"}
		];
		const inputSnapshot = JSON.stringify(data);

		const res = fn(data, ["a", "b",'c']);
		expect(res[0]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['0', '1', '4'], 0), {erreur: []}));
		expect(res[1]).toEqualLigneDonneeAvecErreur(Object.assign(internals.ligne.LigneDonnees(['2', '3'], 1), {erreur: ['c']}));

		expect(JSON.stringify(data)).toBe(inputSnapshot);
	});

});

describe('creerNuancierCouleurCategorie', () => {
	const fn = Hemi.creerNuancierCouleurCategorie;

	test('throw quand donnees et palette pas de type categorie', () => {
		const donnees = {
			data: [],
			type: '??'
		};

		const palette = {
			data: [],
			type: '??'
		};

		expect(() => fn(donnees, palette, [])).toThrow();
	});

	test('throw quand donnees et palette pas du même type', () => {
		const donnees = {
			data: [],
			type: internals.constants.TYPE_DONNEE.CATEGORIE
		};

		const palette = {
			data: [],
			type: internals.constants.TYPE_DONNEE.NUMERIQUE
		};

		expect(() => fn(donnees, palette, [])).toThrow();
	});

	describe('donnees.data et palette.data vides', () => {
		
		test('colorie tous les numéros attendus avec la couleur par défaut', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [0,1,5,7])).toEqual(
				{
					association: new Map([
						[0, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[7, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansCouleur: [],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [0,1,5,7],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeCouleurCategorieAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les numéros attendus avec la couleur palette.couleurSiegeAbsent', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [0,1,5,7])).toEqual(
				{
					association: new Map([
						[0, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[7, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansCouleur: [],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [0,1,5,7],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeCouleurCategorieAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('numérosAttendus vide => pas d\'associaton', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [])).toEqual(
				{
					association: new Map([]),
					lignesDeDonneeSansCouleur: [],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeCouleurCategorieAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});
	});

	describe('donnees.data non vide mais palette.data vide', () => {
		
		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec comme couleur le résultat de genererCouleurCategorie + couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 'REPU', numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 'VERT', numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 'RPU', numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: 'SOC', numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 37, siege: 7}),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};

			const genCoul = jest.fn().mockImplementation(() => [tinycolor('red'), tinycolor('blue'), tinycolor('green')]);
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette,  [1,4,3,6,7], genCoul)).toEqual(
				{
					association: new Map([
						[1, {couleur: tinycolor('red').toHexString(), _tag: 0, ligneDonnee: donnees.data[0], lignePalette: undefined}],
						[4, {couleur: tinycolor('blue').toHexString(), _tag: 0, ligneDonnee: donnees.data[3], lignePalette: undefined}],
						[3, {couleur: tinycolor('green').toHexString(), _tag: 0, ligneDonnee: donnees.data[2], lignePalette: undefined}],
						[6, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[7, {couleur: tinycolor('red').toHexString(), _tag: 0, ligneDonnee: donnees.data[5], lignePalette: undefined}],
					]),
					lignesDeDonneeSansCouleur: [donnees.data[0], donnees.data[3], donnees.data[2], donnees.data[5]],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [6],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[1], donnees.data[4]],
					lignesDeDonneeCouleurCategorieAleatoire: [donnees.data[0], donnees.data[3], donnees.data[2], donnees.data[5]],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);

			expect(genCoul).toHaveBeenCalled();
			expect(genCoul.mock.calls.length).toBe(1);
			expect(genCoul.mock.calls[0]).toEqual([['LREM','RPU','VERT']]);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec une couleur aléatoire quand genererCouleurCategorie n\'est pas donnée + couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 'REPU', numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 'VERT', numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 'RPU', numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: 'SOC', numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 37, siege: 7}),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			const res = fn(donnees, palette, [1,4,3,6,7]);
			expect(res).toBeTruthy();

			expect(res).toEqual(
				{
					association: new Map([
						[1, {couleur: expect.any(String), _tag: 0, ligneDonnee: donnees.data[0], lignePalette: undefined}],
						[4, {couleur: expect.any(String), _tag: 0, ligneDonnee: donnees.data[3], lignePalette: undefined}],
						[3, {couleur: expect.any(String), _tag: 0, ligneDonnee: donnees.data[2], lignePalette: undefined}],
						[6, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[7, {couleur: res.association.get(1).couleur, _tag: 0, ligneDonnee: donnees.data[5], lignePalette: undefined}],
					]),
					lignesDeDonneeSansCouleur: [donnees.data[0], donnees.data[3], donnees.data[2], donnees.data[5]],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [6],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[1], donnees.data[4]],
					lignesDeDonneeCouleurCategorieAleatoire: [donnees.data[0], donnees.data[3], donnees.data[2], donnees.data[5]],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec comme couleur le résultat de genererCouleurCategorie sans couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 'REPU', numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 'VERT', numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 'RPU', numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: 'SOC', numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 37, siege: 7}),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};

			const genCoul = jest.fn().mockImplementation(() => [tinycolor('red'), tinycolor('blue'), tinycolor('green')]);
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [1,4,3,6,7], genCoul)).toEqual(
				{
					association: new Map([
						[1, {couleur: tinycolor('red').toHexString(), _tag: 0, ligneDonnee: donnees.data[0], lignePalette: undefined}],
						[4, {couleur: tinycolor('blue').toHexString(), _tag: 0, ligneDonnee: donnees.data[3], lignePalette: undefined}],
						[3, {couleur: tinycolor('green').toHexString(), _tag: 0, ligneDonnee: donnees.data[2], lignePalette: undefined}],
						[6, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[7, {couleur: tinycolor('red').toHexString(), _tag: 0, ligneDonnee: donnees.data[5], lignePalette: undefined}],
					]),
					lignesDeDonneeSansCouleur: [donnees.data[0], donnees.data[3], donnees.data[2], donnees.data[5]],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [6],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[1], donnees.data[4]],
					lignesDeDonneeCouleurCategorieAleatoire: [donnees.data[0], donnees.data[3], donnees.data[2], donnees.data[5]],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);

			expect(genCoul).toHaveBeenCalled();
			expect(genCoul.mock.calls.length).toBe(1);
			expect(genCoul.mock.calls[0]).toEqual([['LREM','RPU','VERT']]);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('numerosAttendus vide => pas d\'association de couleur', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 'REPU', numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 'VERT', numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 'RPU', numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: 'SOC', numero: 36, siege: 5}),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};

			const genCoul = jest.fn();
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [], genCoul)).toEqual(
				{
					association: new Map([]),
					lignesDeDonneeSansCouleur: [],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [],
					lignesDeDonneeSansNumeroAttendu: donnees.data,
					lignesDeDonneeCouleurCategorieAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);

			expect(genCoul).not.toHaveBeenCalled();
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});
	});

	describe('donnees.data et palette.data non vides', () => {
		
		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec les couleurs de la palette avec couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 'REPU', numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 'VERT', numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 'RPU', numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: 'SOC', numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 37, siege: 11}),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [
					internals.ligne.LignePaletteCategorie('REPU', 0, 'red'),
					internals.ligne.LignePaletteCategorie('LREM', 1, 'pink'),
					internals.ligne.LignePaletteCategorie('???', 2, 'blue'),
					internals.ligne.LignePaletteCategorie('!!!', 4, 'green'),
					internals.ligne.LignePaletteCategorie('&&&', 5, 'black'),
					internals.ligne.LignePaletteCategorie('%%%', 6, 'white'),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};

			const genCoul = jest.fn();
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [10,5,3,2,9,1,8,11], genCoul)).toEqual(
				{
					association: new Map([
						[10, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: 0, ligneDonnee: donnees.data[4], lignePalette: undefined}],
						[3, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: 0, ligneDonnee: donnees.data[2], lignePalette: undefined}],
						[2, {couleur: 'red', _tag: 2, ligneDonnee: donnees.data[1], lignePalette: palette.data[0]}],
						[9, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: 'pink', _tag: 2, ligneDonnee: donnees.data[0], lignePalette: palette.data[1]}],
						[8, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[11, {couleur: 'pink', _tag: 2, ligneDonnee: donnees.data[5], lignePalette: palette.data[1]}],
					]),
					lignesDeDonneeSansCouleur: [donnees.data[4], donnees.data[2]],
					associationsDePaletteNonUtilisees: [palette.data[2], palette.data[3], palette.data[4], palette.data[5]],
					numerosAttendusNonReferences: [10, 9, 8],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[3]],
					lignesDeDonneeCouleurCategorieAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [donnees.data[1], donnees.data[0], donnees.data[5]],
				}
			);

			expect(genCoul).not.toHaveBeenCalled();
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec les couleurs de la palette sans couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 'REPU', numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 'VERT', numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 'RPU', numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: 'SOC', numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 'LREM', numero: 37, siege: 11}),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [
					internals.ligne.LignePaletteCategorie('REPU', 0, 'red'),
					internals.ligne.LignePaletteCategorie('LREM', 1, 'pink'),
					internals.ligne.LignePaletteCategorie('???', 2, 'blue'),
					internals.ligne.LignePaletteCategorie('!!!', 4, 'green'),
					internals.ligne.LignePaletteCategorie('&&&', 5, 'black'),
					internals.ligne.LignePaletteCategorie('%%%', 6, 'white'),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
			};

			const genCoul = jest.fn();
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [10,5,3,2,9,1,8,11], genCoul)).toEqual(
				{
					association: new Map([
						[10, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: 0, ligneDonnee: donnees.data[4], lignePalette: undefined}],
						[3, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: 0, ligneDonnee: donnees.data[2], lignePalette: undefined}],
						[2, {couleur: 'red', _tag: 2, ligneDonnee: donnees.data[1], lignePalette: palette.data[0]}],
						[9, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: 'pink', _tag: 2, ligneDonnee: donnees.data[0], lignePalette: palette.data[1]}],
						[8, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[11, {couleur: 'pink', _tag: 2, ligneDonnee: donnees.data[5], lignePalette: palette.data[1]}],
					]),
					lignesDeDonneeSansCouleur: [donnees.data[4], donnees.data[2]],
					associationsDePaletteNonUtilisees: [palette.data[2], palette.data[3], palette.data[4], palette.data[5]],
					numerosAttendusNonReferences: [10, 9, 8],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[3]],
					lignesDeDonneeCouleurCategorieAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [donnees.data[1], donnees.data[0], donnees.data[5]],
				}
			);

			expect(genCoul).not.toHaveBeenCalled();
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});


	});

	describe('donnees.data vide et palette.data non vide', () => {

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec les couleurs de la palette avec couleurSiegeAbsent', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [
					internals.ligne.LignePaletteCategorie('REPU', 0, 'red'),
					internals.ligne.LignePaletteCategorie('LREM', 1, 'pink'),
					internals.ligne.LignePaletteCategorie('???', 2, 'blue'),
					internals.ligne.LignePaletteCategorie('!!!', 4, 'green'),
					internals.ligne.LignePaletteCategorie('&&&', 5, 'black'),
					internals.ligne.LignePaletteCategorie('%%%', 6, 'white'),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
				couleurSiegeAbsent: 'coulSA'
			};

			const genCoul = jest.fn();
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [1,2,4], genCoul)).toEqual(
				{
					association: new Map([
						[1, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[2, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[4, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansCouleur: [],
					associationsDePaletteNonUtilisees: palette.data,
					numerosAttendusNonReferences: [1, 2, 4],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeCouleurCategorieAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);

			expect(genCoul).not.toHaveBeenCalled();
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec les couleurs de la palette sans couleurSiegeAbsent', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.CATEGORIE
			};
	
			const palette = {
				data: [
					internals.ligne.LignePaletteCategorie('REPU', 0, 'red'),
					internals.ligne.LignePaletteCategorie('LREM', 1, 'pink'),
					internals.ligne.LignePaletteCategorie('???', 2, 'blue'),
					internals.ligne.LignePaletteCategorie('!!!', 4, 'green'),
					internals.ligne.LignePaletteCategorie('&&&', 5, 'black'),
					internals.ligne.LignePaletteCategorie('%%%', 6, 'white'),
				],
				type: internals.constants.TYPE_DONNEE.CATEGORIE,
			};

			const genCoul = jest.fn();
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [1,2,4], genCoul)).toEqual(
				{
					association: new Map([
						[1, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[2, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[4, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansCouleur: [],
					associationsDePaletteNonUtilisees: palette.data,
					numerosAttendusNonReferences: [1, 2, 4],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeCouleurCategorieAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);

			expect(genCoul).not.toHaveBeenCalled();
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});


	});

});

describe('creerNuancierNumerique', () => {
	const fn = Hemi.creerNuancierNumerique;

	const degradeDefault = tinygradient('red', 'blue');

	test('throw quand donnees et palette pas de type numerique', () => {
		const donnees = {
			data: [],
			type: '??'
		};

		const palette = {
			data: [],
			type: '??'
		};

		expect(() => fn(donnees, palette, [])).toThrow();
	});

	test('throw quand donnees et palette pas du même type', () => {
		const donnees = {
			data: [],
			type: internals.constants.TYPE_DONNEE.CATEGORIE
		};

		const palette = {
			data: [],
			type: internals.constants.TYPE_DONNEE.NUMERIQUE
		};

		expect(() => fn(donnees, palette, [])).toThrow();
	});

	describe('donnees.data et palette.data vides', () => {
		
		test('colorie tous les numéros attendus avec la couleur par défaut', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [0,1,5,7])).toEqual(
				{
					association: new Map([
						[0, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[7, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansDegrade: [],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [0,1,5,7],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeDegradeAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les numéros attendus avec la couleur palette.couleurSiegeAbsent', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [0,1,5,7])).toEqual(
				{
					association: new Map([
						[0, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[7, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansDegrade: [],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [0,1,5,7],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeDegradeAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('numérosAttendus vide => pas d\'associaton', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [])).toEqual(
				{
					association: new Map([]),
					lignesDeDonneeSansDegrade: [],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeDegradeAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});
	});

	describe('donnees.data non vide mais palette.data vide', () => {
		
		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec un dégradé global dans min max par défaut des valeurs des sièges + couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 10, numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 20, numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 30, numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: -30, numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 37, siege: 7}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 38, siege: 8}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 39, siege: 12}),
					internals.ligne.LigneDonneesFactory({valeur: 150, numero: 40, siege: 13}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [10,5,3,2,9,1,8,11])).toEqual(
				{
					association: new Map([
						[10, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: degradeDefault.rgbAt(Hemi.normaliser(donnees.data[4].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[4], lignePalette: undefined}],
						[3, {couleur: degradeDefault.rgbAt(Hemi.normaliser(donnees.data[2].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[2], lignePalette: palette.data[0]}],
						[2, {couleur: degradeDefault.rgbAt(Hemi.normaliser(donnees.data[1].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[1], lignePalette: palette.data[2]}],
						[9, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: degradeDefault.rgbAt(Hemi.normaliser(donnees.data[0].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[0], lignePalette: palette.data[1]}],
						[8, {couleur: degradeDefault.rgbAt(Hemi.normaliser(donnees.data[6].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[6], lignePalette: palette.data[0]}],
						[11, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansDegrade: [donnees.data[4], donnees.data[2], donnees.data[1], donnees.data[0], donnees.data[6]],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [10, 9, 11],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[3], donnees.data[5], donnees.data[7], donnees.data[8]],
					lignesDeDonneeDegradeAleatoire: [donnees.data[4], donnees.data[2], donnees.data[1], donnees.data[0], donnees.data[6]],
					lignesDeDonneeAvecAssociationPalette: [],
					min: -30,
					max: 20,
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec un dégradé custom dans min max par défaut des valeurs des sièges + couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 10, numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 20, numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 30, numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: -30, numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 37, siege: 7}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 38, siege: 8}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 39, siege: 12}),
					internals.ligne.LigneDonneesFactory({valeur: 150, numero: 40, siege: 13}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};

			const degradeCustom = tinygradient('blue', 'pink');
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [10,5,3,2,9,1,8,11], degradeCustom)).toEqual(
				{
					association: new Map([
						[10, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: degradeCustom.rgbAt(Hemi.normaliser(donnees.data[4].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[4], lignePalette: undefined}],
						[3, {couleur: degradeCustom.rgbAt(Hemi.normaliser(donnees.data[2].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[2], lignePalette: palette.data[0]}],
						[2, {couleur: degradeCustom.rgbAt(Hemi.normaliser(donnees.data[1].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[1], lignePalette: palette.data[2]}],
						[9, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: degradeCustom.rgbAt(Hemi.normaliser(donnees.data[0].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[0], lignePalette: palette.data[1]}],
						[8, {couleur: degradeCustom.rgbAt(Hemi.normaliser(donnees.data[6].valeur(), 20, -30)).toHexString(), _tag: 0, ligneDonnee: donnees.data[6], lignePalette: palette.data[0]}],
						[11, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansDegrade: [donnees.data[4], donnees.data[2], donnees.data[1], donnees.data[0], donnees.data[6]],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [10, 9, 11],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[3], donnees.data[5], donnees.data[7], donnees.data[8]],
					lignesDeDonneeDegradeAleatoire: [donnees.data[4], donnees.data[2], donnees.data[1], donnees.data[0], donnees.data[6]],
					lignesDeDonneeAvecAssociationPalette: [],
					min: -30,
					max: 20,
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('numerosAttendus vide => pas d\'association de couleur', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 10, numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 20, numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 30, numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: -30, numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 37, siege: 7}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 38, siege: 8}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 39, siege: 12}),
					internals.ligne.LigneDonneesFactory({valeur: 150, numero: 40, siege: 13}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};
	
			const palette = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [])).toEqual(
				{
					association: new Map([]),
					lignesDeDonneeSansDegrade: [],
					associationsDePaletteNonUtilisees: [],
					numerosAttendusNonReferences: [],
					lignesDeDonneeSansNumeroAttendu: donnees.data,
					lignesDeDonneeDegradeAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});
	});

	describe('donnees.data et palette.data non vides', () => {
		
		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec les couleurs de la palette avec couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 10, numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 20, numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 30, numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: -30, numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 37, siege: 7}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 38, siege: 8}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 39, siege: 12}),
					internals.ligne.LigneDonneesFactory({valeur: 150, numero: 40, siege: 13}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};
	
			const palette = {
				data: [
					internals.ligne.LignePaletteNumerique(0, 10, 0, {coulDepart: 'black', coulFin: 'white'}),
					internals.ligne.LignePaletteNumerique(10, 20, 0, {coulDepart: 'red', coulFin: 'yellow'}),
					internals.ligne.LignePaletteNumerique(20, 30, 0, {coulDepart: 'blue', coulFin: 'green'}),
					internals.ligne.LignePaletteNumerique(-200, -100, 0, {coulDepart: 'pink', coulFin: 'cyan'}),
					internals.ligne.LignePaletteNumerique(100, 200, 0, {coulDepart: 'pink', coulFin: 'cyan'}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [10,5,3,2,9,1,8,11])).toEqual(
				{
					association: new Map([
						[10, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: 0, ligneDonnee: donnees.data[4], lignePalette: undefined}],
						[3, {couleur: tinygradient('black', 'white').rgbAt(0.5).toHexString(), _tag: 2, ligneDonnee: donnees.data[2], lignePalette: palette.data[0]}],
						[2, {couleur: tinycolor('blue').toHexString(), _tag: 2, ligneDonnee: donnees.data[1], lignePalette: palette.data[2]}],
						[9, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: tinycolor('red').toHexString(), _tag: 2, ligneDonnee: donnees.data[0], lignePalette: palette.data[1]}],
						[8, {couleur: tinycolor('black').toHexString(), _tag: 2, ligneDonnee: donnees.data[6], lignePalette: palette.data[0]}],
						[11, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansDegrade: [donnees.data[4]],
					associationsDePaletteNonUtilisees: [palette.data[3], palette.data[4]],
					numerosAttendusNonReferences: [10, 9, 11],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[3], donnees.data[5], donnees.data[7], donnees.data[8]],
					lignesDeDonneeDegradeAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [donnees.data[2], donnees.data[1], donnees.data[0], donnees.data[6]],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec les couleurs de la palette sans couleurSiegeAbsent', () => {
			const donnees = {
				data: [
					internals.ligne.LigneDonneesFactory({valeur: 10, numero: 32, siege: 1}),
					internals.ligne.LigneDonneesFactory({valeur: 20, numero: 33, siege: 2}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 34, siege: 3}),
					internals.ligne.LigneDonneesFactory({valeur: 30, numero: 35, siege: 4}),
					internals.ligne.LigneDonneesFactory({valeur: -30, numero: 36, siege: 5}),
					internals.ligne.LigneDonneesFactory({valeur: 5, numero: 37, siege: 7}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 38, siege: 8}),
					internals.ligne.LigneDonneesFactory({valeur: 0, numero: 39, siege: 12}),
					internals.ligne.LigneDonneesFactory({valeur: 150, numero: 40, siege: 13}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};
	
			const palette = {
				data: [
					internals.ligne.LignePaletteNumerique(0, 10, 0, {coulDepart: 'black', coulFin: 'white'}),
					internals.ligne.LignePaletteNumerique(10, 20, 0, {coulDepart: 'red', coulFin: 'yellow'}),
					internals.ligne.LignePaletteNumerique(20, 30, 0, {coulDepart: 'blue', coulFin: 'green'}),
					internals.ligne.LignePaletteNumerique(-200, -100, 0, {coulDepart: 'pink', coulFin: 'cyan'}),
					internals.ligne.LignePaletteNumerique(100, 200, 0, {coulDepart: 'pink', coulFin: 'cyan'}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [10,5,3,2,9,1,8,11])).toEqual(
				{
					association: new Map([
						[10, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[5, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: 0, ligneDonnee: donnees.data[4], lignePalette: undefined}],
						[3, {couleur: tinygradient('black', 'white').rgbAt(0.5).toHexString(), _tag: 2, ligneDonnee: donnees.data[2], lignePalette: palette.data[0]}],
						[2, {couleur: tinycolor('blue').toHexString(), _tag: 2, ligneDonnee: donnees.data[1], lignePalette: palette.data[2]}],
						[9, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[1, {couleur: tinycolor('red').toHexString(), _tag: 2, ligneDonnee: donnees.data[0], lignePalette: palette.data[1]}],
						[8, {couleur: tinycolor('black').toHexString(), _tag: 2, ligneDonnee: donnees.data[6], lignePalette: palette.data[0]}],
						[11, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansDegrade: [donnees.data[4]],
					associationsDePaletteNonUtilisees: [palette.data[3], palette.data[4]],
					numerosAttendusNonReferences: [10, 9, 11],
					lignesDeDonneeSansNumeroAttendu: [donnees.data[3], donnees.data[5], donnees.data[7], donnees.data[8]],
					lignesDeDonneeDegradeAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [donnees.data[2], donnees.data[1], donnees.data[0], donnees.data[6]],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});
	});

	describe('donnees.data vide et palette.data non vide', () => {

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec les couleurs de la palette avec couleurSiegeAbsent', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};

			const palette = {
				data: [
					internals.ligne.LignePaletteNumerique(0, 10, 0, {coulDepart: 'black', coulFin: 'white'}),
					internals.ligne.LignePaletteNumerique(10, 20, 0, {coulDepart: 'red', coulFin: 'yellow'}),
					internals.ligne.LignePaletteNumerique(20, 30, 0, {coulDepart: 'blue', coulFin: 'green'}),
					internals.ligne.LignePaletteNumerique(-200, -100, 0, {coulDepart: 'pink', coulFin: 'cyan'}),
					internals.ligne.LignePaletteNumerique(100, 200, 0, {coulDepart: 'pink', coulFin: 'cyan'}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
				couleurSiegeAbsent: 'coulSA'
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [1,2,4])).toEqual(
				{
					association: new Map([
						[1, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[2, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[4, {couleur: palette.couleurSiegeAbsent, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansDegrade: [],
					associationsDePaletteNonUtilisees: palette.data,
					numerosAttendusNonReferences: [1, 2, 4],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeDegradeAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});

		test('colorie tous les sièges (dont le numéro de siège est dans numerosAttendus) avec les couleurs de la palette sans couleurSiegeAbsent', () => {
			const donnees = {
				data: [],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE,
			};
	
			const palette = {
				data: [
					internals.ligne.LignePaletteNumerique(0, 10, 0, {coulDepart: 'black', coulFin: 'white'}),
					internals.ligne.LignePaletteNumerique(10, 20, 0, {coulDepart: 'red', coulFin: 'yellow'}),
					internals.ligne.LignePaletteNumerique(20, 30, 0, {coulDepart: 'blue', coulFin: 'green'}),
					internals.ligne.LignePaletteNumerique(-200, -100, 0, {coulDepart: 'pink', coulFin: 'cyan'}),
					internals.ligne.LignePaletteNumerique(100, 200, 0, {coulDepart: 'pink', coulFin: 'cyan'}),
				],
				type: internals.constants.TYPE_DONNEE.NUMERIQUE
			};
	
			const donneesSnapshot = JSON.stringify(donnees);
			const paletteSnapshot = JSON.stringify(palette);
	
			expect(fn(donnees, palette, [1,2,4])).toEqual(
				{
					association: new Map([
						[1, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[2, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
						[4, {couleur: internals.constants.VISUEL.COULEUR.PRIMAIRE, _tag: -1, ligneDonnee: undefined, lignePalette: undefined}],
					]),
					lignesDeDonneeSansDegrade: [],
					associationsDePaletteNonUtilisees: palette.data,
					numerosAttendusNonReferences: [1, 2, 4],
					lignesDeDonneeSansNumeroAttendu: [],
					lignesDeDonneeDegradeAleatoire: [],
					lignesDeDonneeAvecAssociationPalette: [],
				}
			);
	
			expect(JSON.stringify(donnees)).toBe(donneesSnapshot);
			expect(JSON.stringify(palette)).toBe(paletteSnapshot);
		});
	});
});

describe('couleurAleatoire', () => {
	test('hexa', () => {
		const coul = Hemi.couleurAleatoire();
		expect(coul).toMatch(/^#[0-9A-F]{6}$/);

		const coul2 = Hemi.couleurAleatoire();
		expect(coul !== coul2).toBe(true);
	});
});

describe('validerCouleur', () => {
	test.each([
		['red'],
		['blue'],
		['lightblue'],
		['antiquewhite'],
		['rgb(0,0,0)'],
		['rgb(0, 0, 0)'],
		['hsl(0,100%,16%)'],
		['hsl(0, 100%, 16%)'],
		['hsla(0, 100%, 0%, .5)'],
		['transparent'],
		['#f09f'],
		['#ff0099ff'],
		['#FF0099FF'],
		['rgba(51, 170, 51, .1)'],
	])(
		'cette couleur {%s} doit être valide',
		(input) => {
			expect(Hemi.validerCouleur(input)).toBe(true);
		}
	);

	test.each([
		['rouge'],
		['bleu'],
	])(
		'cette couleur doit être invalide',
		(input) => {
			expect(Hemi.validerCouleur(input)).toBe(false);
		}
	);

});
