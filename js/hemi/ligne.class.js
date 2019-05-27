'use strict';

/**
 * Ligne
 * @module hemi/ligne.class
 */

const HemiConstants = require('./constants');
const tinygradient = require('tinygradient');

function estNumerote (numero)
{
	return {
		_numero: numero,
		numero: function(value) { 
			if(arguments.length > 0)
				this._numero = value;
			else
				return this._numero;
			},
	}
}

function aCouleur (couleur)
{
	return {
		_couleur: couleur,
		couleur: function(value) { 
			if(arguments.length > 0)
				this._couleur = value;
			else
				return this._couleur;
			},
	}
}

function aDegradeCouleur (coulDepart, coulFin)
{
	return {
		degrade: {
			_coulDepart: coulDepart,
			coulDepart: function(value) { 
				if(arguments.length > 0) {
					this._coulDepart = value;
					this.updateGradient();
				}
				else
					return this._coulDepart;
				},
			_coulFin: coulFin,
			coulFin: function(value) { 
				if(arguments.length > 0) {
					this._coulFin = value;
					this.updateGradient();
				}
				else
					return this._coulFin;
				},
			_gradient: tinygradient(coulDepart, coulFin),
			/** Retourne un objet tinygradient. */
			gradient: function() { return this._gradient },
			updateGradient: function () { this._gradient = tinygradient(this._coulDepart, this._coulFin) }
		}
	}
}

/**
 * @description Prédicat: les intervalles intersectent-ils ?
 * Borne inférieure inclue et borne supérieure exclue.
 * @param {any} borneInf - La borne inférieure du premier.
 * @param {any} borneSup - La borne supérieure du premier.
 * @param {any} borneInfOther - La borne inférieure du deuxième.
 * @param {any} borneSupOther - La borne supérieure du deuxième.
 * @returns {boolean} True si intersection sinon false.
 * 
 * @example
 * intersecte(0,3,2,5)
 */
function intersecte(borneInf, borneSup, borneInfOther, borneSupOther)
{
	// Borne inférieure inclue et borne supérieure exclue.
	// intersection si a.debut < b.end && a.end > b.debut
	return (borneInf < borneSupOther) && (borneSup > borneInfOther);
}

function contient(bornInf, borneSup, valeur)
{
	return (valeur >= bornInf) && (valeur < borneSup);
}

function borneIntervalle (borneInf, borneSup)
{
	return {
		intervalle: {
			_borneInf: borneInf,
			borneInf: function(value) { 
				if(arguments.length > 0)
					this._borneInf = value;
				else
					return this._borneInf;
				},
			_borneSup: borneSup,
			borneSup: function(value) { 
				if(arguments.length > 0)
					this._borneSup = value;
				else
					return this._borneSup;
				},
			toString: function() {return '[' + this._borneInf + ' ; ' + this._borneSup + '['},
			contient: function (valeur) {
				return contient(this._borneInf, this._borneSup, valeur)
			},
		}
	}
}

function detecteIntersection ()
{
	return {
		intersecteAvec: function (other) {
			return intersecte(this.intervalle._borneInf, this.intervalle._borneSup, other.intervalle._borneInf, other.intervalle._borneSup)
		},
	}
}

/**
 * @class LigneDonnees
 * @description Ah.
 * @param {*} contenu 
 * @param {*} numero 
 * 
 * @example
 * LigneDonnees([0,1], 0)
 */
function LigneDonnees(contenu, numero)
{
	const ligne = {
		_contenu: contenu,
		contenu: function(value) { 
			if(arguments.length > 0)
				this._contenu = value;
			else
				return this._contenu;
			},
	}
	
	return Object.assign(ligne, estNumerote(numero));
}
module.exports.LigneDonnees = LigneDonnees;

/**
 * @class LigneDonneesFactory
 * @description Ah.
 * @param {object} config
 * @param {any} config.numero
 * @param {any} config.valeur
 * @param {any} config.siege
 * 
 * @example
 * LigneDonneesFactory({numero: 0, valeur: 39, siege: 4})
 */
function LigneDonneesFactory(config)
{
	const ligne = {
		_contenu: [config.valeur, config.siege],
		valeur: function(value) { 
			if(arguments.length > 0)
				this._contenu[0] = value;
			else
				return this._contenu[0];
			},
		siege: function(value) { 
			if(arguments.length > 0)
				this._contenu[1] = value;
			else
				return this._contenu[1];
			},
	}
	
	return Object.assign(ligne, estNumerote(config.numero));
}
module.exports.LigneDonneesFactory = LigneDonneesFactory;

/**
 * @class LignePaletteNumerique
 * @description Ah.
 * @param {*} borneInf 
 * @param {*} borneSup 
 * @param {*} numero 
 * @param {object} degradeDef
 * @param {string} degradeDef.coulDepart
 * @param {string} degradeDef.coulFin
 * 
 * @example
 * LignePaletteNumerique(0,10,5,{coulDepart:'red', coulFin:'blue'})
 */
function LignePaletteNumerique(borneInf, borneSup, numero, degradeDef)
{
	const ligne = {
		type: HemiConstants.TYPE_DONNEE.NUMERIQUE,
	}

	if(degradeDef == null)
		degradeDef = {};

	if(!degradeDef.coulDepart)
		degradeDef.coulDepart = 'black';
	if(!degradeDef.coulFin)
		degradeDef.coulFin = 'white';
	
	return Object.assign(ligne,
		estNumerote(numero),
		aDegradeCouleur(degradeDef.coulDepart, degradeDef.coulFin),
		borneIntervalle(borneInf, borneSup),
		detecteIntersection()
		);
}
module.exports.LignePaletteNumerique = LignePaletteNumerique;

function LignePaletteCategorie(categorie, numero, couleur)
{
	const ligne = {
		_categorie: categorie,
		categorie: function(value) { 
			if(arguments.length > 0)
				this._categorie = value;
			else
				return this._categorie;
			},
		type: HemiConstants.TYPE_DONNEE.CATEGORIE
	}
	
	return Object.assign(ligne,
		estNumerote(numero),
		aCouleur(couleur));
}
module.exports.LignePaletteCategorie = LignePaletteCategorie;
