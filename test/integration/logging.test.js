const internals = {
    constants: require('../../js/hemi/constants'),
    logging: require('../../js/hemi/logging'),
    logger: require('../../js/hemi/logger.class'),
    hemi: require('../../js/hemi/core'),
};

const papaparse = require('papaparse');

describe('erreurExtraction', () => {
	const fn = internals.logging.erreurExtraction;

	const logger = new internals.logger.Logger();
	const mock = jest.fn();
	logger.erreur = mock;

	test('pas d\'erreur à output', () => {
		const data = [
			["a", "?", "0"],
			["b", "!", "1"]
		];

		const res = internals.hemi.extraireColonnesCSV(data, [0,1]);

		expect(fn(res, logger)).toBe(false);
		expect(mock).not.toHaveBeenCalled();
	});

	test('la colonne recherchée n\'est pas dans la ligne avec les indexes', () => {
		const data = [
			["a", "?", "0"],
			["b", "!"],
			["b"],
			[]
		];

		const res = internals.hemi.extraireColonnesCSV(data, [4,3,2,1,0]);

		expect(fn(res, logger)).toBe(true);
		expect(mock).toHaveBeenCalled();
		expect(mock.mock.calls.length).toBe(14);
		expect(mock.mock.calls).toEqual([
			["La colonne n°5 n'est pas présente dans la ligne n°1. Cette dernière contient 3 colonnes."],
			["La colonne n°4 n'est pas présente dans la ligne n°1. Cette dernière contient 3 colonnes."],
			["La colonne n°5 n'est pas présente dans la ligne n°2. Cette dernière contient 2 colonnes."],
			["La colonne n°4 n'est pas présente dans la ligne n°2. Cette dernière contient 2 colonnes."],
			["La colonne n°3 n'est pas présente dans la ligne n°2. Cette dernière contient 2 colonnes."],
			["La colonne n°5 n'est pas présente dans la ligne n°3. Cette dernière contient une seule colonne."],
			["La colonne n°4 n'est pas présente dans la ligne n°3. Cette dernière contient une seule colonne."],
			["La colonne n°3 n'est pas présente dans la ligne n°3. Cette dernière contient une seule colonne."],
			["La colonne n°2 n'est pas présente dans la ligne n°3. Cette dernière contient une seule colonne."],
			["La colonne n°5 n'est pas présente dans la ligne n°4. Cette dernière ne contient aucune colonne."],
			["La colonne n°4 n'est pas présente dans la ligne n°4. Cette dernière ne contient aucune colonne."],
			["La colonne n°3 n'est pas présente dans la ligne n°4. Cette dernière ne contient aucune colonne."],
			["La colonne n°2 n'est pas présente dans la ligne n°4. Cette dernière ne contient aucune colonne."],
			["La colonne n°1 n'est pas présente dans la ligne n°4. Cette dernière ne contient aucune colonne."],
		]);
	});

	test('la colonne recherchée n\'est pas dans la ligne avec les noms de propriétés', () => {
		const data = [
			{a: 0, b: 1, c: 2},
			{a: 0, b: 1},
			{a: 0},
			{},
		];

		const res = internals.hemi.extraireColonnesCSV(data, ['e','d','c','b','a']);

		expect(fn(res, logger)).toBe(true);
		expect(mock).toHaveBeenCalled();
		expect(mock.mock.calls.length).toBe(14);
		expect(mock.mock.calls).toEqual([
			["La colonne \"e\" n'est pas présente dans la ligne n°1."],
			["La colonne \"d\" n'est pas présente dans la ligne n°1."],
			["La colonne \"e\" n'est pas présente dans la ligne n°2."],
			["La colonne \"d\" n'est pas présente dans la ligne n°2."],
			["La colonne \"c\" n'est pas présente dans la ligne n°2."],
			["La colonne \"e\" n'est pas présente dans la ligne n°3."],
			["La colonne \"d\" n'est pas présente dans la ligne n°3."],
			["La colonne \"c\" n'est pas présente dans la ligne n°3."],
			["La colonne \"b\" n'est pas présente dans la ligne n°3."],
			["La colonne \"e\" n'est pas présente dans la ligne n°4."],
			["La colonne \"d\" n'est pas présente dans la ligne n°4."],
			["La colonne \"c\" n'est pas présente dans la ligne n°4."],
			["La colonne \"b\" n'est pas présente dans la ligne n°4."],
			["La colonne \"a\" n'est pas présente dans la ligne n°4."],
		]);
	});
	
});

describe('humanizeErreurPapaparse', () => {
    const fn = internals.logging.humanizeErreurPapaparse;

    describe('Quotes: ', () => {
        
        test('missing quotes', () => {
            const res = papaparse.parse('a,"b,c\nd,e,f');
            expect(res.errors.length).toBe(1);
            expect(fn(res.errors[0])).toBe("Un des champs n'a pas de guillemet fermante à la ligne n°1.");
        });

        test('invalid quotes', () => {
            const res = papaparse.parse('"a,"b,c"\nd,e,f');
            expect(res.errors.length).toBe(1);
            expect(fn(res.errors[0])).toBe("Un des champs cité est malformé à la ligne n°1.");
        });

    });

    describe('Delimiter: ', () => {
        
        test('UndetectableDelimiter', () => {
            const res = papaparse.parse('');
            expect(res.errors.length).toBe(1);
            expect(fn(res.errors[0])).toBe("Impossible de déterminer le séparateur de colonne. Assigné par défaut à \",\".");
        });

    });

    describe('FieldMismatch: ', () => {
        
        test('TooFewFields pluriel pluriel', () => {
            const res = papaparse.parse('A,B,C\r\na,b', {header: true});
            expect(res.errors.length).toBe(1);
            expect(fn(res.errors[0])).toBe("La ligne n°1 n'a pas assez de champs: 3 attendus mais seulement 2 lus.");
        });

        test('TooFewFields pluriel singulier', () => {
            const res = papaparse.parse('A,B,C\r\na', {header: true});
            expect(res.errors.length).toBe(1);
            expect(fn(res.errors[0])).toBe("La ligne n°1 n'a pas assez de champs: 3 attendus mais seulement 1 lu.");
        });

        test('TooManyFields pluriel pluriel', () => {
            const res = papaparse.parse('A,B,C\r\na,b,c,d,e\r\nf,g,h', {header: true});
            expect(res.errors.length).toBe(1);
            expect(fn(res.errors[0])).toBe("La ligne n°1 a trop de champs: 3 attendus mais 5 lus.");
        });

    });

    describe('message par défaut', () => {
        
        test('avec numéro de ligne', () => {
            expect(fn({row: 0})).toBe("Une erreur inconnue est survenue à la ligne n°1.");    
        });

        test('sans numéro de ligne', () => {
            expect(fn()).toBe("Une erreur inconnue est survenue.");
        });

    });

});
