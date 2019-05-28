const internals = {
    constants: require('../../js/hemi/constants'),
    logging: require('../../js/hemi/logging'),
    logger: require('../../js/hemi/logger.class'),
    hemi: require('../../js/hemi/core'),
    ligne: require('../../js/hemi/ligne.class'),
};

describe('nombreLigneExploitable', () => {
    const fn = internals.logging.nombreLigneExploitable;

    test('taille de 0', () => {
        expect(fn(0)).toBe('Suite au raffinement, le fichier renseigné ne contient aucune association exploitable.');
    });

    test('taille de 1', () => {
        expect(fn(1)).toBe('Suite au raffinement, 1 association est exploitable.');
    });

    test('taille > 1', () => {
        expect(fn(2)).toBe('Suite au raffinement, 2 associations sont exploitables.');
    });
});

describe('erreurConversionEnNumber', () => {

    test('du siège: affiche la ligne et la valeur d\'origine', () => {
        expect(internals.logging.erreurConversionSiegeLigne(1, 'err'))
            .toBe('Le numéro de siège de la ligne n°2 valant "err" n\'est pas convertible en nombre.');
    });

    test('d\'un champs quelconque: affiche la ligne et la valeur d\'origine', () => {
        expect(internals.logging.erreurConversionDonneeLigne(1, 'err'))
            .toBe('La donnée de la ligne n°2 valant "err" n\'est pas convertible en nombre.');
    });
});

test('numeroSiegeInvalide', () => {
    expect(internals.logging.numeroSiegeInvalide(1,'err'))
        .toBe('Le numéro de siège de la ligne n°2 valant "err" n\'est pas un numéro de siège valide.');
});

test('erreurConversionBorneInf', () => {
    expect(internals.logging.erreurConversionBorneInf(1,'err'))
        .toBe('La borne inférieure de la ligne n°2 valant "err" n\'est pas convertible en nombre.');
});

test('erreurConversionBorneSup', () => {
    expect(internals.logging.erreurConversionBorneSup(1,'err'))
        .toBe('La borne supérieure de la ligne n°2 valant "err" n\'est pas convertible en nombre.');
});

test('interruptionImportPalette', () => {
    expect(internals.logging.interruptionImportPalette())
        .toBe("Import de la palette interrompu.");
});

test('interruptionImportDonnees', () => {
    expect(internals.logging.interruptionImportDonnees())
        .toBe("Import du fichier de données interrompu.");
});

test('couleurInvalide', () => {
    expect(internals.logging.couleurInvalide(1, "coul"))
		.toBe('La couleur valant "coul" n\'est pas valide à la ligne n°2.');
});

test('couleurInvalideDegradeDepart', () => {
    expect(internals.logging.couleurInvalideDegradeDepart(1, "coul"))
		.toBe('La couleur de départ du dégradé valant "coul" n\'est pas valide à la ligne n°2.');
});

test('couleurInvalideDegradeFin', () => {
    expect(internals.logging.couleurInvalideDegradeFin(1, "coul"))
		.toBe('La couleur de fin du dégradé valant "coul" n\'est pas valide à la ligne n°2.');
});

test('borneSupInferieureABorneInf', () => {
    expect(internals.logging.borneSupInferieureABorneInf(1))
		.toBe('La valeur de la colonne "' + internals.constants.HEADER_PALETTE.NUMERIQUE.BORNE_SUP +
        '" doit être strictement inférieure à celle de la colonne "' + internals.constants.HEADER_PALETTE.NUMERIQUE.BORNE_INF +
        '" à la ligne n°2.');
});

test('nombreColonneLu ', () => {
    const fn = internals.logging.nombreColonneLu;

    expect(fn(0)).toBe('Aucune colonne lue.');
    expect(fn(1)).toBe('1 colonne lue.');
    expect(fn(2)).toBe('2 colonnes lues.');
});
