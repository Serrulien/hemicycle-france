const Ligne = require('../../js/hemi/ligne.class');
const internals = {
    constants: require('../../js/hemi/constants'),
};

describe('LigneDonneesFactory', () => {

    test('valeur() retourne la valeur passée dans le constructeur puis la valeur locale après changement', () => {
        const ligne = Ligne.LigneDonneesFactory({numero: 1, valeur: 'hey', siege: 2});
        expect(ligne.valeur()).toBe('hey');
        expect(ligne.valeur('ho')).toBe(undefined);
        expect(ligne.valeur()).toBe('ho');
    });

    test('siege() retourne la valeur passée dans le constructeur puis la valeur locale après changement', () => {
        const ligne = Ligne.LigneDonneesFactory({numero: 1, valeur: 'hey', siege: 2});
        expect(ligne.siege()).toBe(2);
        expect(ligne.siege(3)).toBe(undefined);
        expect(ligne.siege()).toBe(3);
    });

    test('numero() retourne la valeur passée dans le constructeur puis la valeur locale après changement', () => {
        const ligne = Ligne.LigneDonneesFactory({numero: 1, valeur: 'hey', siege: 2});
        expect(ligne.numero()).toBe(1);
        expect(ligne.numero(2)).toBe(undefined);
        expect(ligne.numero()).toBe(2);
    });
    
});

describe('LigneDonnees', () => {

    test('la construction fonctionne', () => {
        const ligne1 = Ligne.LigneDonnees();
        expect(ligne1).toBeTruthy();

        const ligne2 = Ligne.LigneDonnees([]);
        expect(ligne2).toBeTruthy();

        const ligne3 = Ligne.LigneDonnees([], 1);
        expect(ligne3).toBeTruthy();
    });

    test('numero() retourne la valeur passée dans le constructeur puis la valeur locale après changement', () => {
        const ligne = Ligne.LigneDonnees([3], 1);
        expect(ligne.numero()).toBe(1);
        expect(ligne.numero(2)).toBe(undefined);
        expect(ligne.numero()).toBe(2);
    });

    test('contenu() retourne la valeur passée dans le constructeur puis la valeur locale après changement', () => {
        const ligne = Ligne.LigneDonnees([3], 1);
        expect(ligne.contenu()).toEqual([3]);
        expect(ligne.contenu(2)).toBe(undefined);
        expect(ligne.contenu()).toBe(2);
    });

});

describe('LignePaletteCategorie', () => {

    test.each([
        [[]],
        [['LREM']],
        [['LREM', 1]],
        [['LREM', 1, 'red']],
    ])(
        'la construction fonctionne',
        (input) => {
            const ligne = Ligne.LignePaletteCategorie(...input);
            expect(ligne).toBeTruthy();
            expect(ligne.type).toBe(internals.constants.TYPE_DONNEE.CATEGORIE);
        }
    );

    test('le contenu passé dans la factory est le bon', () => {
        const ligne = Ligne.LignePaletteCategorie('LREM', 1, 'red');
        expect(ligne.categorie()).toBe('LREM');
        expect(ligne.numero()).toBe(1);
        expect(ligne.couleur()).toBe('red');
    });

    test('le contenu est à jour après modification', () => {
        const ligne = Ligne.LignePaletteCategorie('LREM', 1, 'red');

        expect(ligne.categorie('REPU')).toBe(undefined);
        expect(ligne.categorie()).toBe('REPU');

        expect(ligne.numero(2)).toBe(undefined);
        expect(ligne.numero()).toBe(2);
        
        expect(ligne.couleur('blue')).toBe(undefined);
        expect(ligne.couleur()).toBe('blue');
    });

});

describe('LignePaletteNumerique', () => {

    test('construction fonctionne', () => {
        const ligne1 = Ligne.LignePaletteNumerique(0, 1, 2, {coulDepart: 'red', coulFin: 'blue'});
        expect(ligne1).toBeTruthy();
        expect(ligne1.type).toBe(internals.constants.TYPE_DONNEE.NUMERIQUE);
    });

    test('le contenu passé dans la factory est le bon', () => {
        const ligne = Ligne.LignePaletteNumerique(0, 1, 2, {coulDepart: 'red', coulFin: 'blue'});
        expect(ligne.intervalle.borneInf()).toBe(0);
        expect(ligne.intervalle.borneSup()).toBe(1);
        expect(ligne.numero()).toBe(2);
        expect(ligne.degrade.coulDepart()).toBe('red');
        expect(ligne.degrade.coulFin()).toBe('blue');
        expect(ligne.degrade.gradient().rgbAt(0).toName()).toBe('red');
        expect(ligne.degrade.gradient().rgbAt(1).toName()).toBe('blue');
    });

    test('mis à jour des attributs après modification', () => {
        const ligne = Ligne.LignePaletteNumerique(0, 1, 2, {coulDepart: 'red', coulFin: 'blue'});

        expect(ligne.intervalle.borneInf(10)).toBe(undefined);
        expect(ligne.intervalle.borneInf()).toBe(10);

        expect(ligne.intervalle.borneSup(20)).toBe(undefined);
        expect(ligne.intervalle.borneSup()).toBe(20);

        expect(ligne.numero(3)).toBe(undefined);
        expect(ligne.numero()).toBe(3);

        expect(ligne.degrade.coulDepart('green')).toBe(undefined);
        expect(ligne.degrade.coulDepart()).toBe('green');

        expect(ligne.degrade.coulFin('pink')).toBe(undefined);
        expect(ligne.degrade.coulFin()).toBe('pink');

        expect(ligne.degrade.gradient().rgbAt(0).toName()).toBe('green');
        expect(ligne.degrade.gradient().rgbAt(1).toName()).toBe('pink');
    });

    test('si la définition du dégradé n\'est pas en argument alors par défaut le dégradé commence à black et fini à white', () => {
        const ligne = Ligne.LignePaletteNumerique(0, 1, 2);
        expect(ligne.degrade.coulDepart()).toBe('black');
        expect(ligne.degrade.coulFin()).toBe('white');
    });

    test('si les couleurs du dégradé ne sont pas en argument alors par défaut le dégradé commence à black et fini à white', () => {
        const ligne = Ligne.LignePaletteNumerique(0, 1, 2, {});
        expect(ligne.degrade.coulDepart()).toBe('black');
        expect(ligne.degrade.coulFin()).toBe('white');
    });

    test('une valeur est-elle contenue dans l\'intervalle', () => {
        const ligne1 = Ligne.LignePaletteNumerique(3, 4, 2, {coulDepart: '', coulFin: ''});
        expect(ligne1.intervalle.contient(3)).toBe(true);
        expect(ligne1.intervalle.contient(3.5)).toBe(true);
        expect(ligne1.intervalle.contient(3.9)).toBe(true);
        
        expect(ligne1.intervalle.contient(2)).toBe(false);
        expect(ligne1.intervalle.contient(4)).toBe(false);
        expect(ligne1.intervalle.contient(5)).toBe(false);
    });

    test('intersection avec un autre intervalle', () => {
        const ligne1 = Ligne.LignePaletteNumerique(3, 4, 2);
        expect(ligne1.intersecteAvec(Ligne.LignePaletteNumerique(3, 4, 2))).toBe(true);
        expect(ligne1.intersecteAvec(Ligne.LignePaletteNumerique(0, 4, 2))).toBe(true);
        expect(ligne1.intersecteAvec(Ligne.LignePaletteNumerique(0, 3.5, 2))).toBe(true);
        expect(ligne1.intersecteAvec(Ligne.LignePaletteNumerique(3, 4, 2))).toBe(true);

        expect(ligne1.intersecteAvec(Ligne.LignePaletteNumerique(0, 1, 2))).toBe(false);
        expect(ligne1.intersecteAvec(Ligne.LignePaletteNumerique(0, 3, 2))).toBe(false);
        expect(ligne1.intersecteAvec(Ligne.LignePaletteNumerique(4, 5, 2))).toBe(false);
    });

    test('toString de l\'intervalle', () => {
        expect(Ligne.LignePaletteNumerique(3, 4, 2).intervalle.toString()).toBe('[3 ; 4[');
    });

});
