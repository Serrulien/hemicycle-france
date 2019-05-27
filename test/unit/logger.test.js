global.console.error = jest.fn();
global.console.warn = jest.fn();
global.console.info = jest.fn();
global.console.log = jest.fn();
global.console.debug = jest.fn();

const Logger = require('../../js/hemi/logger.class');

describe('Logger', () => {

    beforeEach(() => {
        global.console.error.mockClear();
        global.console.warn.mockClear();
        global.console.info.mockClear();
        global.console.log.mockClear();
        global.console.debug.mockClear();
    });

    test.each([
        [89787],
        ['ALL'],
        [undefined],
        [null],
        [console.log]
    ])(
        'constructeur : le niveau de filtre %p est invalide et fallback sur TOUT',
        (nvFiltre) => {
            const log = new Logger.Logger(nvFiltre);
            expect(log.niveauDeFiltre).toBe(Logger.FILTRE.INFO);
        }
    );

    test('constructeur : le niveau de filtre non passé, fallback sur TOUT ', () => {
        const log = new Logger.Logger();
            expect(log.niveauDeFiltre).toBe(Logger.FILTRE.INFO);
    });

    test.each([
        [Logger.FILTRE.TOUT],
        [Logger.FILTRE.WARN],
        [Logger.FILTRE.DEBUG],
        [Logger.FILTRE.ERREUR],
        [Logger.FILTRE.RIEN],
        [Logger.FILTRE.INFO]
    ])(
        'constructeur : le niveau de filtre %p est valide',
        (nvFiltre) => {
            const log = new Logger.Logger(nvFiltre);
            expect(log.niveauDeFiltre).toBe(nvFiltre);
        }
    );

    test('le log avec filtre rien ne laisse passer aucun message', () => {
        const log = new Logger.Logger(Logger.FILTRE.RIEN);
        log.info('');
        expect(global.console.info).not.toHaveBeenCalled();
        log.warn('');
        expect(global.console.warn).not.toHaveBeenCalled();
        log.debug('');
        expect(global.console.debug).not.toHaveBeenCalled();
        log.erreur('');
        expect(global.console.error).not.toHaveBeenCalled();
    });

    test('log.info par défaut sur la console', () => {
        const log = new Logger.Logger(Logger.FILTRE.TOUT);
        log.info('info');
        expect(global.console.info).toHaveBeenCalled();
        expect(console.info.mock.calls.length).toBe(1);
        expect(console.info.mock.calls[0]).toEqual(['info']);
    });

    test('log.warn par défaut sur la console', () => {
        const log = new Logger.Logger(Logger.FILTRE.TOUT);
        log.warn('warn');
        expect(global.console.warn).toHaveBeenCalled();
        expect(console.warn.mock.calls.length).toBe(1);
        expect(console.warn.mock.calls[0]).toEqual(['warn']);
    });

    test('log.erreur par défaut sur la console', () => {
        const log = new Logger.Logger(Logger.FILTRE.TOUT);
        log.erreur('erreur');
        expect(global.console.error).toHaveBeenCalled();
        expect(console.error.mock.calls.length).toBe(1);
        expect(console.error.mock.calls[0]).toEqual(['erreur']);
    });

    test('log.debug par défaut sur la console', () => {
        const log = new Logger.Logger(Logger.FILTRE.TOUT);
        log.debug('debug');
        expect(global.console.debug).toHaveBeenCalled();
        expect(console.debug.mock.calls.length).toBe(1);
        expect(console.debug.mock.calls[0]).toEqual(['debug']);
    });

});

describe('LoggerVisuel', () => {
    
    test('reset supprime les noeuds DOM', () => {
        document.body.innerHTML = "";
        const log = new Logger.LoggerVisuel(Logger.FILTRE.TOUT, document.body);

        expect(log.liste.children.length).toBe(0);

        log.info("msg");
        log.info("msg");

        expect(log.liste.children.length).toBe(2);

        log.reset();

        expect(log.liste.children.length).toBe(0);
    });

    test('liste retourne le <ul>', () => {
        document.body.innerHTML = "";
        const log = new Logger.LoggerVisuel(Logger.FILTRE.TOUT, document.body);

        expect(document.body.innerHTML).toBe("<ul></ul>");

        expect(document.body.querySelector('ul')).toBe(log.liste);
    });

    describe('les méthodes de log créent des noeuds <li> avec une classe particulière', () => {
        test('info', () => {
            document.body.innerHTML = "";
            const log = new Logger.LoggerVisuel(Logger.FILTRE.TOUT, document.body);
            log.info('msg');
            expect(document.body.innerHTML).toBe('<ul><li class="' + Logger.FILTRE_CLASSE.INFO + '">msg</li></ul>');
        });

        test('erreur', () => {
            document.body.innerHTML = "";
            const log = new Logger.LoggerVisuel(Logger.FILTRE.TOUT, document.body);
            log.erreur('msg');
            expect(document.body.innerHTML).toBe('<ul><li class="' + Logger.FILTRE_CLASSE.ERREUR + '">msg</li></ul>');
        });

        test('warn', () => {
            document.body.innerHTML = "";
            const log = new Logger.LoggerVisuel(Logger.FILTRE.TOUT, document.body);
            log.warn('msg');
            expect(document.body.innerHTML).toBe('<ul><li class="' + Logger.FILTRE_CLASSE.WARN + '">msg</li></ul>');
        });

        test('debug', () => {
            document.body.innerHTML = "";
            const log = new Logger.LoggerVisuel(Logger.FILTRE.TOUT, document.body);
            log.debug('msg');
            expect(document.body.innerHTML).toBe('<ul><li class="' + Logger.FILTRE_CLASSE.DEBUG + '">msg</li></ul>');
        });
    });
    


});


