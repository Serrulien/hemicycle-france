'use strict';

// commonJS module

/**
 * Logger à filtre simpliste.
 * @module hemi/logger.class
 */

/**
 * @typedef NiveauFiltre
 * @property {number} TOUT Laisse tous les messages quelques soient leurs labels.
 * @property {number} DEBUG Laisse passer seulement les messages d'erreurs, warnings, informations et debuging.
 * @property {number} INFO Laisse passer seulement les messages d'erreurs, warnings et informations.
 * @property {number} WARN Laisse passer seulement les messages d'erreurs et warnings.
 * @property {number} ERREUR Laisse passer seulement les messages d'erreurs.
 * @property {number} RIEN Ne laisse passer aucun message.
 */

/**
 * Contient les valeurs pour chaque niveau de {@link module:hemi-logger~NiveauFiltre}.
 * @enum {module:hemi-logger~NiveauFiltre}
 */
const FILTRE = module.exports.FILTRE = {
    TOUT: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERREUR: 5,
    RIEN: 6
};

const NIVEAU_PAR_DEFAUT = FILTRE.INFO;

/**
 * Les classes CSS qui seront associées aux messages selon leur niveau.
 * @property {string} DEBUG
 * @property {string} INFO
 * @property {string} WARN
 * @property {string} ERREUR
 * 
 * @example
 * log.info("message");
 * // créer un noeud avec la classe FILTRE_CLASSE.INFO
 */
const FILTRE_CLASSE = module.exports.FILTRE_CLASSE = {
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERREUR: "err",
};

/**
 * @description Filtre un message selon son label. Un message peut avoir les [labels suivants]{@link module:hemi-logger~FILTRE}:
 * DEBUG, INFO, WARN ou ERREUR.
 * Le label du message est indiqué par la méthode d'appel. Ainsi [Logger.info]{@link module:hemi-logger~Logger#info} injecte le message
 * dans le logger instancié et lui attribut le label info.
 * 
 * Les méthodes [debug]{@link module:hemi-logger~Logger#debug}, [info]{@link module:hemi-logger~Logger#info},
 * [warn]{@link module:hemi-logger~Logger#warn} et [erreur]{@link module:hemi-logger~Logger#erreur} font appel à console.
 * 
 * @class
 * @param {module:hemi-logger~NiveauFiltre} [niveauDeFiltre=module:hemi-logger~FILTRE.INFO] -
 * 
 * @example
 * const Logger = require('[path]/hemi-logger');
 * const log = new Logger.Logger(Logger.FILTRE.WARN); // Seuls les messages dont le label est plus égale ou supérieur à WARN passeront
 * log.info("bonjour"); // ne passe pas
 * log.debug("version 4.5"); // ne passe pas
 * log.warn("IE non supporté"); // passe -> console.warn("IE non supporté")
 * log.erreur("Fichier non accessible"); // passe -> console.error("Fichier non accessible")
 */
function Logger(niveauDeFiltre)
{
    this.changerFiltre(niveauDeFiltre);
}

/**
 * @private
 * @description Valide le niveau de filtre.
 * 
 * @param {*} niveauDeFiltre - Le niveau de filtre à valider.
 * @returns {boolean} True si niveau est valide, sinon False.
 * 
 * @example
 * _estNiveauFiltreValide("a") // false
 * _estNiveauFiltreValide(FILTRE.TOUT) // true
 */
Logger.prototype._estNiveauFiltreValide = function(niveauDeFiltre)
{
    if(
        niveauDeFiltre == FILTRE.TOUT || niveauDeFiltre == FILTRE.INFO
        || niveauDeFiltre == FILTRE.WARN || niveauDeFiltre == FILTRE.DEBUG
        || niveauDeFiltre == FILTRE.RIEN || niveauDeFiltre == FILTRE.ERREUR)
    {
        return true;
    }
    else
    {
        return false;
    }
}

/**
 * @public
 * 
 * @description Change le niveau de filtre.
 * 
 * @param {module:hemi-logger~NiveauFiltre} nouvFiltre - Si la valeur n'est pas valide, alors met le niveau de filtre à [INFO]{@link module:hemi-logger~FILTRE}.
 *
 * @example
 * const Logger = require('[path]/hemi-logger');
 * const log = new Logger.Logger(Logger.FILTRE.WARN); // Seuls les messages dont le label est plus égale ou supérieur à WARN passeront
 * log.debug("version 4.5"); // ne passe pas
 * log.changerFiltre(Logger.FILTRE.RIEN);
 * log.erreur("Fichier non accessible"); // ne passe pas
 */
Logger.prototype.changerFiltre = function(nouvFiltre)
{
    if(this._estNiveauFiltreValide(nouvFiltre))
    {
        this.niveauDeFiltre = nouvFiltre;
    }
    else
    {
        this.niveauDeFiltre = NIVEAU_PAR_DEFAUT;
    }
}

/**
 * @private
 * 
 * @description Retourne true si le niveau de filtre du message passe celui du logger.
 * @param {module:hemi-logger~NiveauFiltre} niveauMessage - Le niveau du message à vérifier.
 * @returns {boolean} - Retourne true si le niveau de filtre du message passe celui du logger.
 * 
 * @example
 * none
 */
Logger.prototype._passeFiltre = function(niveauMessage)
{
    return niveauMessage >= this.niveauDeFiltre;
};


/**
 * Injecte un message labellisé [INFO]{@link module:hemi-logger~NiveauFiltre} 
 * @method info
 * @param {string} message
 * @memberof module:hemi-logger~Logger
 * @instance
 * 
 * @example
 * log.info("message");
 */

/**
 * Injecte un message labellisé [DEBUG]{@link module:hemi-logger~NiveauFiltre} 
 * @method debug
 * @param {string} message
 * @memberof module:hemi-logger~Logger
 * @instance
 * 
 * @example
 * log.debug("message");
 */

/**
 * Injecte un message labellisé [WARN]{@link module:hemi-logger~NiveauFiltre} 
 * @method warn
 * @param {string} message
 * @memberof module:hemi-logger~Logger
 * @instance
 * 
 * @example
 * log.warn("message");
 */

/**
 * Injecte un message labellisé [ERREUR]{@link module:hemi-logger~NiveauFiltre} 
 * @method erreur
 * @param {string} message
 * @memberof module:hemi-logger~Logger
 * @instance
 * 
 * @example
 * log.debug("message");
 */

[
    ["_debugImpl", console.debug],
    ["_infoImpl", console.info],
    ["_erreurImpl", console.error],
    ["_warnImpl", console.warn]
].forEach((val) => {
    Logger.prototype[val[0]] = function(...args)
    {
        val[1](...args);
    }
});

[
    ["debug", "_debugImpl", FILTRE.DEBUG],
    ["info", "_infoImpl", FILTRE.INFO],
    ["erreur", "_erreurImpl", FILTRE.ERREUR],
    ["warn", "_warnImpl", FILTRE.WARN]
].forEach((val) => {
    Logger.prototype[val[0]] = function(...args)
    {
        if(this._passeFiltre(val[2]))
        {
            return this[val[1]](...args);
        }
    }
});

/**
 * @class
 * @augments module:hemi-logger~Logger
 * @description Logger dont les messages deviennent des éléments du DOM.
 * @param {module:hemi-logger~NiveauFiltre} niveauFiltre - Si la valeur n'est pas valide, alors met le niveau de filtre à [INFO]{@link module:hemi-logger~FILTRE}.
 * @param {HTMLElement} conteneur - L'élément parent qui va contenir les messages.
 * 
 * @example
 * new LoggerVisuel(FILTER.TOUT, document.getElementById("conteneur"));
 */
function LoggerVisuel(niveauFiltre, conteneur)
{
    Logger.call(this, niveauFiltre);
    this.conteneur = conteneur;
    this.liste = document.createElement("ul");
    conteneur.append(this.liste);
}

LoggerVisuel.prototype = Object.create(Logger.prototype);
LoggerVisuel.prototype.constructor = LoggerVisuel;

/**
 * @description Créer un <li> et y applique une classe selon le label du message.
 * le comportement est indéfini si niveau est un {@link module:hemi-logger~NiveauFiltre} non valide.
 * @param {module:hemi-logger~NiveauFiltre} niveau - Le niveau du message.
 * @returns {HTMLUListElement} <li class="[?]"></li>.
 * 
 * @example
 * none
 */
LoggerVisuel.prototype._creerNoeudLog = function(niveau)
{
    const balise = document.createElement("li");

    let classeDuNiveau = "";
    switch(niveau)
    {
        case FILTRE.INFO: classeDuNiveau = FILTRE_CLASSE.INFO; break;
        case FILTRE.ERREUR: classeDuNiveau = FILTRE_CLASSE.ERREUR; break;
        case FILTRE.DEBUG: classeDuNiveau = FILTRE_CLASSE.DEBUG; break;
        case FILTRE.WARN: classeDuNiveau = FILTRE_CLASSE.WARN; break;
    }

    balise.classList.add(classeDuNiveau);
    return balise;
}

/**
 * @description Supprimer tous les noeuds de log. 
 * @example
 * log.reset();
 */
LoggerVisuel.prototype.reset = function()
{
    while (this.liste.firstChild) {
        this.liste.removeChild(this.liste.firstChild);
    }
}

;[
    // nom de la méthode qui gère le log pour le niveau de filtre, le niveau de filtre du noeud à créer
    ["_debugImpl", FILTRE.DEBUG],
    ["_infoImpl", FILTRE.INFO],
    ["_erreurImpl", FILTRE.ERREUR],
    ["_warnImpl", FILTRE.WARN]
].forEach((val) => {
    LoggerVisuel.prototype[val[0]] = function(message)
    {
        const noeud = this._creerNoeudLog(val[1]);
        noeud.appendChild(document.createTextNode(message));
        this.liste.appendChild(noeud);
        return noeud;
    }
});

module.exports.Logger = Logger;
module.exports.LoggerVisuel = LoggerVisuel;
