// SPDX-License-Identifier: MIT

/**
@licence MIT License

@copyright 2019 Julien SERRURIER

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

// fichier d'entrée de browserify

const Raphael = require('raphael');
require('./raphael.tooltip'); // pas besoin de garder une référence car le module modifie Raphael.el
const Papa = require('papaparse');
const internals = {
	core: require('./hemi/core'),
	constants: require('./hemi/constants'),
	logger: require('./hemi/logger.class'),
	logging: require('./hemi/logging'),
	ligne: require('./hemi/ligne.class'),
};
const _ = {
	remove: require('lodash/remove'),
	isEqual: require('lodash/isEqual'),
	range: require('lodash/range'),
	max: require('lodash/max'),
}
const tinycolor = require('tinycolor2');

const version = '__VERSION__'; // remplacé par package.json/version au build
console.info('hemicycle version: ' + version);

if (!Raphael.svg)
{
	alert('Your browser does not support vector graphics!');
	throw Error("Your browser does not support vector graphics!");
}

/** @type {import('./hemi/core').Palette} */
let palette = undefined;

/** @type {import('./hemi/core').Donnees} */
let donnees = undefined;

const loggerData = new internals.logger.LoggerVisuel(internals.logger.FILTRE.INFO, document.getElementById("dataLog"));

const loggerPalette = new internals.logger.LoggerVisuel(internals.logger.FILTRE.INFO, document.getElementById("paletteLog"));

/**
 * @type{external:Raphael~Paper}
 */
let hemicycle;

/**
 * Contient tous les path svg raphaël pour dessiner l'hémicycle (donc les places, murs, enceintes ...).
 * Cf hemis.js/dessinerHemicycle() pour plus d'information.
 * @type {Object.<string, external:Raphael~Element>}
 */
let tracesHemicycle = undefined;


// change l'axe de la légende : horizontal ou vertical
document.getElementById('formulaireLegende').addEventListener('change', function(ev) {
	const possibleValues = ['vertical', 'horizontal'];
	const legende = document.getElementById('legende');
	possibleValues.forEach(classe => legende.classList.remove(classe));
	// la classe par défaut est la valeur du radio button checked
	legende.classList.add(ev.target.value);
});


document.getElementById("export").addEventListener('click', function() {
	hemicycle.setStart();
	
	/** Coordonnées dans Document */
	const hautGaucheEnceinte = {
		x: document.querySelector("#hemicycle svg").getBoundingClientRect().left + window.scrollX,
		y: document.querySelector("#hemicycle svg").getBoundingClientRect().top + window.scrollY
	}

	// Duplique chaque .association (et éléments enfants) en équivalent SVG dans la même position
	const legende = document.getElementById('legende');

	// PB : comment on ajoute caractère par caractère, il se peut que
	// l'on casse en mot là ou le moteur css ne le casse pas
	// car il y a la place pour insérer les n premiers caractères
	// sur la ligne
	// Marche plutôt bien avec les chiffres car il n'y a pas de mot
	// mais peut casser le lisibilté avec des phrases
	// Et les éléments doivent être inline, c'est à dire que leur hauteur
	// est en fonction du contenu textuel de l'élément, si l'élément à une
	// hauteur prédéfinie le comportement est inconnu.
	function textContentNormalise(element)
	{
		// car SVG 1.1 ne gère pas les blocs text multilignes
		const text = element.textContent || element.innerText;
		const chars = text.split('');
		
		element.innerHTML = chars.length ? chars[0] + '' : ' ';
		let oldHeight = element.clientHeight;

		// 2 -> un saut de ligne avant la lettre chars[2], donc entre chars[1] et chars[2]
		const indexBreaks = [];
		
		for(let ind = 1; ind < chars.length; ++ind)
		{
			element.innerHTML += chars[ind];

			if ( element.clientHeight > oldHeight ) {
				indexBreaks.push(ind);
				oldHeight = element.clientHeight;
			}
		}

		if(indexBreaks.length === 0)
			return text;

		let finalStr = '';
		indexBreaks.forEach(function(val, ind, arr) {
			if(ind === 0)
				finalStr += text.substring(0, val) + '\n';
			else if(ind === arr.length-1)
				finalStr += text.substring(arr[ind-1], val) + '\n' + text.substring(val);
			else
				finalStr += text.substring(arr[ind-1], val) + '\n';
		});

		return finalStr;
	}

	function renderText(textElement, justifyRight)
	{
		const textBB = textElement.getBoundingClientRect();

		const coords = {
			x: (textBB.left - hautGaucheEnceinte.x) + window.scrollX,
			y: (textBB.top - hautGaucheEnceinte.y) + window.scrollY,
			cx: (textBB.left - hautGaucheEnceinte.x) + window.scrollX + textBB.width/2,
			cy: (textBB.top - hautGaucheEnceinte.y) + window.scrollY + textBB.height/2
		};

		const textContent = textContentNormalise(textElement);

		let text;
		if(justifyRight)
		{
			text = hemicycle.text(
				coords.x + textBB.width, // x
				coords.cy, // y
				textContent
			);
		}
		else
		{
			text = hemicycle.text(
				coords.x , // x
				coords.cy , // y
				textContent
			);
		}
		
		text.attr({
			'font-size': textElement.style.fontSize || window.getComputedStyle(textElement).fontSize,
			'font-family': textElement.style.fontFamily || window.getComputedStyle(textElement).fontFamily,
			'text-anchor': (justifyRight) ? 'end' : 'start' // petit workaround car raphael aligne le text différement
		});
	}

	const associations = document.querySelectorAll(".association");
	for(const association of associations)
	{
		if ( legende.classList.contains(internals.constants.TYPE_DONNEE.NUMERIQUE) )
		{
			const logo = association.querySelector(".degrade");

			const rawGradient = window.getComputedStyle(logo).backgroundImage;
			const couleurs = rawGradient.match(/rgb\(\d+, \d+, \d+\)/g);

			const logoBB = logo.getBoundingClientRect();
			
			/** Coordonnées dans le référentiel du svg */
			const logoCoords = {
				x: (logoBB.left - hautGaucheEnceinte.x) + window.scrollX,
				y: (logoBB.top - hautGaucheEnceinte.y) + window.scrollY,
				largueur: logoBB.width,
				hauteur: logoBB.height
			}

			// ce format dans le fill de attr permet de créer un <linearGradient> dans <defs>
			// cependant le lien dynamique réalisé par raphael est pourri car il cible le document par son url au lieu d'utiliser un lien relatif
			const gradientString = "0-" + tinycolor(couleurs[0]).toHexString() + "-" + tinycolor(couleurs[1]).toHexString();
			const rect = hemicycle.rect(logoCoords.x, logoCoords.y, logoCoords.largueur, logoCoords.hauteur).attr({fill: gradientString, stroke: null});
			rect.node.setAttribute('fill', 'url(#'+rect.gradient.id+')');

			renderText(association.querySelector(".borne"), 'end');
			renderText(association.querySelector(".borne:nth-of-type(2)"));
			renderText(association.querySelector(".signification"));
		}
		else if ( legende.classList.contains(internals.constants.TYPE_DONNEE.CATEGORIE) )
		{
			const logo = association.querySelector(".couleur");		
			const logoBB = logo.getBoundingClientRect();
			
			/** Coordonnées dans le référentiel du svg */
			const logoCoords = {
				x: (logoBB.left - hautGaucheEnceinte.x) + window.scrollX,
				y: (logoBB.top - hautGaucheEnceinte.y) + window.scrollY,
				largueur: logoBB.height,
				hauteur: logoBB.width
			}

			hemicycle.rect(logoCoords.x, logoCoords.y, logoCoords.largueur, logoCoords.hauteur).attr({fill: window.getComputedStyle(logo)['background-color'], stroke: null});			
			renderText(association.querySelector(".signification"));
		}
		else
		{
			throw new Error('type inconnu');
		}
	
	}

	const set = hemicycle.setFinish();

	const addHeight = (set.length > 0) ? _.max(set.items.map(el => el.getBBox().y2)) - hemicycle.height : 0;

	const url = internals.core.SVGtoFile(hemicycle.canvas,
		{
			height: hemicycle.height + addHeight + "",
			width: hemicycle.width + ""
		}
	);

	const anchor = document.createElement("a");
	anchor.setAttribute('href', url);
	anchor.setAttribute('download', "hemicycle.svg");
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);

	window.URL.revokeObjectURL(url);

	set.remove();
});

window.addEventListener("load", function()
{

	document.getElementById('formulaireDataImport').addEventListener('submit', function(ev){
		ev.preventDefault();

		/*
		On va lire la première ligne du fichier CSV de façon à savoir quoi mettre dans les selects permettant de choisir les colonnes
		Si le fichier a un entête, alors on affichere le nom des colonnes sinon le numéro des colonnes
		*/

		const fichier = ev.target.querySelector("input[name=fichierData]").files[0];
		const fichierAEntete = ev.target.querySelector("#dataOptionEntete").checked;

		internals.core.lectureCSV(
			fichier,
			{
				delimiter: ev.target.querySelector("#dataOptionFichierDelimiteur").disabled ? "" : ev.target.querySelector("#dataOptionFichierDelimiteur").value,
				newline: ev.target.querySelector("#dataOptionFichierSautLigne").disabled ? "" : ev.target.querySelector("#dataOptionFichierSautLigne").value,
				quoteChar: ev.target.querySelector("#dataOptionFichierQuoteChar").value,
				escapeChar: ev.target.querySelector("#dataOptionFichierEchappement").value,
				header: false,
				transformHeader: undefined,
				dynamicTyping: false,
				preview: 1,
				encoding: "",
				comments: false,
				skipEmptyLines: true, // skip les lignes vides, comme par ex si le fichier se termine par une ligne vide
				delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
			})
		// eslint-disable-next-line no-unused-vars
		.then(function({data, errors, meta}){
			loggerData.reset();

			if(errors && errors.length > 0)
			{
				throw errors;
			}
			return data;
		})
		.catch(function(errors){
			document.querySelectorAll('#formulaireData button, #formulaireData input[type=file]').forEach(el => el.disabled = true);
			errors.forEach(function(error){
				loggerData.erreur(internals.logging.humanizeErreurPapaparse(error));
			})
			loggerData.info(internals.logging.interruptionImportDonnees());
			return;
		})
		.then(function(data){
			if(!data)
				return;

			const nbColonne = data[0].length;
			loggerData.info(internals.logging.nombreColonneLu(nbColonne));

			const selects = [document.getElementById('dataColonneSiege'), document.getElementById('dataColonne')];
			selects.forEach(function(select){
				select.options.length = 0;
			});
			
			const nomsColonnes = (fichierAEntete) ? data[0] : _.range(1, nbColonne+1);
			nomsColonnes.forEach(function(colonne){
				const option = document.createElement("option");
				option.value = colonne;
				option.text = colonne;
				selects.forEach(x => x.add(option.cloneNode(true)));
			});

			selects.forEach(x => x.selectedIndex = 0);

			document.querySelectorAll('#formulaireData button, #formulaireData input[type=file]').forEach(el => el.disabled = false);
		})
		.catch(function(err){
			document.querySelectorAll('#formulaireData button, #formulaireData input[type=file]').forEach(el => el.disabled = true);
			loggerData.erreur(internals.logging.interruptionImportDonnees() + " Une erreur inconnue est survenue.");
			loggerData.debug('un throw catché, voir console');
			console.error(err);
		});
	});	

	[
		"dataOptionFichierDelimiteurAuto",
		"dataOptionFichierSautLigneAuto",
		"paletteOptionFichierDelimiteurAuto",
		"paletteOptionFichierSautLigneAuto"
	].forEach(function (val) {
		document.getElementById(val).addEventListener("change",
			function (ev) {
				const cibleSwitch = document.getElementById(ev.target.getAttribute("data-switch"));
	
				if(ev.target.checked)
					cibleSwitch.setAttribute("disabled", "");
				else
					cibleSwitch.removeAttribute("disabled");
			}
		)
	});

	hemicycle = new Raphael(document.getElementById('hemicycle'), 850, 600);
	// affiche clairement l'attribut viewbox du svg
	hemicycle.setViewBox();
	
	tracesHemicycle = internals.core.dessinerHemicycle(hemicycle);

	// ajoute le tooltip, la couleur et les attributs pour chaque siège
	for (const objKey in tracesHemicycle) 
	{
		let svg = tracesHemicycle[objKey];
		svg.couleur = svg.attr("fill"); // svg.couleur la couleur originale

		// si la clé désigne une valeur devant être un élément raphael associé à une place d'un député
		// en effet, les clés ne respectant pas sont par exemple commissions, enceinte ..
		if (objKey.match(/^s[0-9]/))
		{
			svg.attr({title: "place n° " + objKey.substr(1)});
			internals.core.aper(svg, "place n° " + svg.data("num"));
		}
		else
		{
			internals.core.aper(svg, svg.data("nom"));
		}

		if (objKey.match(/^s[0-9]/) || objKey == "commissions" || objKey == "ministres")
		{
			svg.attr({cursor: "pointer"});

			svg.mouseover(function()
			{
				if (objKey.match(/^s[0-9]/)) 
				{
					this.animate({fill: "#B53333", stroke: "#B53333"}, 300); // rouge
					
				}
				this.attr({title: ''}); 
			});

			svg.mouseout(function () 
			{
				if (objKey.match(/^s[0-9]/)) // si du bon format, càd si l'élément est une place
				{
					this.attr({title: "place n° " + this.data("num")}); // on remet le contenu de l'élément fils <title> par soucis d'accessibilité
					this.animate({fill: this.couleur, stroke: internals.constants.VISUEL.COULEUR.SECONDAIRE}, 300); // couleur originale, état de veille	
				}
				else
				{
					this.attr({title: this.data("nom")}); // on remet le contenu de l'élément fils <title> par soucis d'accessibilité
				}
			});
		}
	}
	

	function jointureDataPalette()
	{
		if(palette == null)
			palette = {data:[], type: donnees.type};

		// if (palette.type !== donnees.type) {
		// 	alert("palette et données par du même type. Relire le fichier importé il y a le plus longtemps");
		// 	throw new Error("palette et données par du même type. Relire le fichier importé il y a le plus longtemps");
		// }

		function colorierTracesAvecNuancier(nuancier)
		{
			nuancier.association.forEach(function (valeur, cle) {

				const svg = tracesHemicycle['s'+cle];
				if (svg == undefined)
					throw new Error("le numéro de siège n'est pas dans tracesHemicycle alors qu'il devrait y être");

				const couleur = valeur.couleur;

				svg.couleur = couleur;
				svg.attr({fill: couleur, stroke: internals.constants.VISUEL.COULEUR.SECONDAIRE});
			});
		}

		let nuancier;
		if (donnees.type === internals.constants.TYPE_DONNEE.CATEGORIE)
		{
			nuancier = internals.core.creerNuancierCouleurCategorie(donnees, palette, internals.constants.NUMEROS_SIEGES_UTILISES);
			colorierTracesAvecNuancier(nuancier);
		}
		else if (donnees.type === internals.constants.TYPE_DONNEE.NUMERIQUE)
		{
			nuancier = internals.core.creerNuancierNumerique(donnees, palette, internals.constants.NUMEROS_SIEGES_UTILISES);
			colorierTracesAvecNuancier(nuancier);
		}
		else
		{
			throw new Error("type inconnu");
		}

		const typeData = document.querySelector("#dataType").value;
		const legende = document.getElementById('legende');
		for(const type of Object.values(internals.constants.TYPE_DONNEE)) {legende.classList.remove(type)}
		legende.classList.add(typeData);


		internals.core.creerLegende(document.getElementById('legende'), palette, nuancier);
	}

	document.querySelector("#formulaireData").addEventListener("submit", function(ev)
	{
		try {
			ev.preventDefault();

			donnees = {};
			loggerData.reset();

			const fichier = document.querySelector("#formulaireDataImport input[name=fichierData]").files[0];
			const fichierAEntete = document.getElementById("dataOptionEntete").checked;
			const typeData = ev.target.querySelector("#dataType").value;

			internals.core.lectureCSV(
				fichier,
				{
					delimiter: document.getElementById("dataOptionFichierDelimiteur").disabled ? "" : document.getElementById("dataOptionFichierDelimiteur").value,
					newline: document.getElementById("dataOptionFichierSautLigne").disabled ? "" : document.getElementById("#dataOptionFichierSautLigne").value,
					quoteChar: document.getElementById("dataOptionFichierQuoteChar").value,
					escapeChar: document.getElementById("dataOptionFichierEchappement").value,
					header: fichierAEntete,
					transformHeader: undefined,
					dynamicTyping: false,
					preview: 0,
					encoding: "",
					comments: false,
					skipEmptyLines: true, // skip les lignes vides, comme par ex si le fichier se termine par une ligne vide
					delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
				})
			// eslint-disable-next-line no-unused-vars
			.then(function({data, errors, meta}){
					const selectionColonneSiege = (fichierAEntete) ? ev.target.querySelector("#dataColonneSiege").value : parseInt(ev.target.querySelector("#dataColonneSiege").value) - 1;
					const selectionColonneData = (fichierAEntete) ? ev.target.querySelector("#dataColonne").value : parseInt(ev.target.querySelector("#dataColonne").value) - 1;

					if(errors && errors.length)
					{
						errors.forEach(function(err){
							loggerData.erreur(internals.logging.humanizeErreurPapaparse(err));
						});
						loggerData.info(internals.logging.interruptionImportDonnees());
						return;
					}

					/**
					 * Contient le contenu parsé du fichier data. undefined si aucune données valides
					 */
					let donneesBrut = internals.core.extraireColonnesCSV(data, [selectionColonneData, selectionColonneSiege]);

					// GESTION ERREUR LORS DE L'EXTRACTION DES COLONNES
					{
						if(internals.logging.erreurExtraction(donneesBrut, loggerData))
						{
							loggerData.info(internals.logging.interruptionImportDonnees());
							return; 
						}
					}
					// FIN GESTION ERREUR LORS DE L'EXTRACTION DES COLONNES


					donneesBrut = donneesBrut.map(x => internals.ligne.LigneDonneesFactory({numero: x.numero(), valeur: x.contenu()[0], siege: x.contenu()[1]}));


					// CONVERSION DES NUMEROS DE SIEGES
					{
						const sansErreur = donneesBrut.every(function (ligne) {
							// return true quand conversion ok, sinon false
							try {
								ligne.siege(internals.core.convertirEnNumber(ligne.siege()));
								return true;
							} catch (error) {
								loggerData.erreur(internals.logging.erreurConversionSiegeLigne(ligne.numero(), ligne.siege()));
								return false;
							}
						});

						if (!sansErreur)
						{
							loggerData.info(internals.logging.interruptionImportDonnees());
							return;
						}
					}
					// FIN CONVERSION DES NUMEROS DE SIEGES



					// CONVERSION DE LA COLONNE DATA
					if (typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
					{
						const sansErreur = donneesBrut.every(function (ligne) {
							// return true quand conversion ok, sinon false
							try {
								ligne.valeur(internals.core.convertirEnNumber(ligne.valeur()));
								return true;
							} catch (error) {
								loggerData.erreur(internals.logging.erreurConversionDonneeLigne(ligne.numero(), ligne.valeur()));
								return false;
							}
						});

						if (!sansErreur)
						{
							loggerData.info(internals.logging.interruptionImportDonnees());
							return;
						}
					}
					// FIN CONVERSION DE LA COLONNE DATA



					// FILTRE LES NUMEROS DE SIEGE NON VALIDES
					{
						const filtre = internals.core.gardeSiegesUtilises(donneesBrut);
						
						if(filtre.invalide.length > 0)
						{
							filtre.invalide.forEach(function(obj){
								const mess = internals.logging.numeroSiegeInvalide(obj.ligne.numero(), obj.ligne.siege()) + '. Cette ligne est oubliée.';
								loggerData.warn(mess);
							});
						}

						donneesBrut = filtre.data;
					}
					// FIN FILTRE LES NUMEROS DE SIEGE NON VALIDES



					// FILTRE LES LIGNES AYANT LES MEMES NUMEROS DE SIEGE
					{
						const doublons = internals.core.listerDoublons(
							donneesBrut.map((x) => [x.siege()]),
							[0]
						);

						doublons.forEach(function(doublon){
							const numLignesCSV = doublon.occurence.map(w => donneesBrut[w].numero()+1);

							const mess = 'Le siège n°' + doublon.value[0] + ' est assigné ' + doublon.occurence.length + ' fois (lignes n°' + (numLignesCSV.join(', ')) + '). '
								+ 'Garde seulement la dernière assignation (ligne n°' + numLignesCSV[numLignesCSV.length-1] + ').';
							loggerData.warn(mess);
						});

						donneesBrut = internals.core.supprimeDoublons(donneesBrut, doublons);
					}
					// FIN FILTRE LES LIGNES AYANT LES MEMES NUMEROS DE SIEGE

					

					donnees.data = donneesBrut;
					if (typeData === internals.constants.TYPE_DONNEE.CATEGORIE)
					{
						donnees.type = internals.constants.TYPE_DONNEE.CATEGORIE;
					}
					else if (typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
					{
						donnees.type = internals.constants.TYPE_DONNEE.NUMERIQUE;
					}
					else
					{
						throw new Error("typeData inconnu");
					}

					loggerData.info(internals.logging.nombreLigneExploitable(donnees.data.length));

					console.info(donnees);

					jointureDataPalette();
			}).catch(function(err){
				loggerPalette.erreur(internals.logging.interruptionImportPalette() + " Une erreur inconnue est survenue.");
				loggerPalette.debug('un throw catché, voir console');
				console.error(err);
			});
		} catch (error) {
			loggerData.erreur(internals.logging.interruptionImportDonnees() + " Une erreur inconnue est survenue.");
			loggerData.debug('un throw catché, voir console');
			console.error(error);
		}
	}); // fin eventListener formulaire Data

	document.querySelector("#formulairePalette").addEventListener("submit", function(ev)
	{
		try {
			ev.preventDefault();

			palette = {};
			loggerPalette.reset();

			const fichier = ev.target.querySelector("input[name=fichierPalette]").files[0];

			const typeData = document.querySelector("#dataType").value;

			const aEntete = ev.target.querySelector("#paletteOptionEntete").checked;

			internals.core.lectureCSV(fichier, {
				delimiter: ev.target.querySelector("#paletteOptionFichierDelimiteur").disabled ? "" : ev.target.querySelector("#paletteOptionFichierDelimiteur").value,
				newline: ev.target.querySelector("#paletteOptionFichierSautLigne").disabled ? "" : ev.target.querySelector("#paletteOptionFichierSautLigne").value,
				quoteChar: ev.target.querySelector("#paletteOptionFichierQuoteChar").value,
				escapeChar: ev.target.querySelector("#paletteOptionFichierEchappement").value,
				header: aEntete,
				transformHeader: undefined,
				dynamicTyping: false,
				preview: 0,
				encoding: "",
				comments: false,
				skipEmptyLines: true, // skip les lignes vides, comme par ex si le fichier se termine par une ligne vide
				delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
			})
			.then(function({data, errors}){
				if(errors && errors.length)
				{
					errors.forEach(function(err){
						const message = internals.logging.humanizeErreurPapaparse(err);
						loggerPalette.erreur(message);
					})
					loggerPalette.info(internals.logging.interruptionImportPalette());
					return;
				}

				let paletteBrut = null;

				if (typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
				{
					paletteBrut = (aEntete) ?
						internals.core.extraireColonnesCSV(data, [internals.constants.HEADER_PALETTE.NUMERIQUE.BORNE_INF, internals.constants.HEADER_PALETTE.NUMERIQUE.BORNE_SUP, internals.constants.HEADER_PALETTE.NUMERIQUE.COULEUR_DEPART, internals.constants.HEADER_PALETTE.NUMERIQUE.COULEUR_FIN])
						: internals.core.extraireColonnesCSV(data, [0, 1, 2, 3]);
				}
				else if (typeData === internals.constants.TYPE_DONNEE.CATEGORIE)
				{
					paletteBrut = (aEntete) ?
						internals.core.extraireColonnesCSV(data, [internals.constants.HEADER_PALETTE.CATEGORIE.NOM, internals.constants.HEADER_PALETTE.CATEGORIE.COULEUR])
						: internals.core.extraireColonnesCSV(data, [0, 1]);
				}
				else
				{
					throw new Error("typeData inconnu");
				}



				// GESTION ERREUR LORS DE L'EXTRACTION DES COLONNES
				{
					if (internals.logging.erreurExtraction(paletteBrut, loggerPalette))
					{
						loggerPalette.info(internals.logging.interruptionImportPalette());
						return;
					}
				}
				// FIN GESTION ERREUR LORS DE L'EXTRACTION DES COLONNES


				if (typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
				{
					paletteBrut = paletteBrut.map(x => {
						const contenu = x.contenu();
						return internals.ligne.LignePaletteNumerique(contenu[0], contenu[1], x.numero(), {coulDepart: contenu[2], coulFin: contenu[3]});
					});
				}
				else if (typeData === internals.constants.TYPE_DONNEE.CATEGORIE)
				{
					paletteBrut = paletteBrut.map(x => {
						const contenu = x.contenu();
						return internals.ligne.LignePaletteCategorie(contenu[0], x.numero(), contenu[1]);
					});
				}



				// FILTRE LES LIGNES DOUBLONS
				{
					let mappingValeurLigne;
					if (typeData === internals.constants.TYPE_DONNEE.CATEGORIE)
					{
						mappingValeurLigne = paletteBrut.map(function(ligneObj){return [ligneObj.categorie()]});
					}
					else if (typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
					{
						mappingValeurLigne = paletteBrut.map(function(ligneObj){return [[ligneObj.intervalle.borneInf(), ligneObj.intervalle.borneSup()]]});
					}
					else
					{
						throw new Error("type non supporté");
					}

					const doublons = internals.core.listerDoublons(
						mappingValeurLigne,
						[0]
					);

					doublons.forEach(function(doublon){
						const numLignesCSV = doublon.occurence.map(w => (paletteBrut[w].numero())+1);
						const ligneSelectionnee = paletteBrut[doublon.occurence[doublon.occurence.length-1]];

						let mess;
						if (typeData === internals.constants.TYPE_DONNEE.CATEGORIE)
						{
							mess = ((doublon.value[0] === "") ? 'La couleur des sièges absents ' : 'La catégorie "' + doublon.value[0] +'" ' ) 
								+ 'est assignée ' + doublon.occurence.length + ' fois (lignes n°' + (numLignesCSV.join(', ')) + '). '
								+ 'Garde seulement la dernière assignation (ligne n°' + numLignesCSV[numLignesCSV.length-1] + ') de couleur "' + ligneSelectionnee.couleur() + '".';
						}
						else
						{
							if(doublon.value[0][0] === "" && doublon.value[0][1] === "")
							{
								mess = 'La couleur des sièges absents est assignée ' + doublon.occurence.length + ' fois (lignes n°' + (numLignesCSV.join(', ')) + '). Garde seulement la dernière assignation (ligne n°' + numLignesCSV[numLignesCSV.length-1] + ') de couleur "' + ligneSelectionnee.degrade.coulDepart() + '".';	
							}
							else
							{
								mess = 'L\'intervalle ' + ligneSelectionnee.intervalle.toString() + ' est assignée ' + doublon.occurence.length + ' fois (lignes n°' + (numLignesCSV.join(', ')) + '). Garde seulement la dernière assignation (ligne n°' + numLignesCSV[numLignesCSV.length-1] + ') ayant un dégradé de "' + ligneSelectionnee.degrade.coulDepart() + '" vers "' + ligneSelectionnee.degrade.coulFin() + '".';
							}
						}
						
						loggerPalette.warn(mess);
					});

					paletteBrut = internals.core.supprimeDoublons(paletteBrut, doublons);
				}
				// FIN FILTRE LES LIGNES DOUBLONS



				// FILTRE LES COULEURS VALIDES
				{
					if (typeData === internals.constants.TYPE_DONNEE.CATEGORIE)
					{
						const lignesCouleurInvalides = paletteBrut.filter(function(ligne) {
							return !internals.core.validerCouleur(ligne.couleur());
						});
		
						if(lignesCouleurInvalides.length > 0)
						{
							lignesCouleurInvalides.forEach(function(ligne) {
								loggerPalette.erreur(internals.logging.couleurInvalide(ligne.numero(), ligne.couleur()));
							});
							loggerPalette.info(internals.logging.interruptionImportPalette());
							return;
						}
					}
					else if ((typeData === internals.constants.TYPE_DONNEE.NUMERIQUE))
					{
						const erreurs = [];
						paletteBrut.forEach(function(ligne) {
							if(!internals.core.validerCouleur(ligne.degrade.coulDepart()))
								erreurs.push({coulDepart: true, ligne});
							if(!internals.core.validerCouleur(ligne.degrade.coulFin()))
								erreurs.push({coulFin: true, ligne});
						});
		
						if(erreurs.length > 0)
						{
							erreurs.forEach(function(obj) {
								if (obj.coulDepart)
									loggerPalette.erreur(internals.logging.couleurInvalideDegradeDepart(obj.ligne.numero(), obj.ligne.degrade.coulDepart()));
								else if (obj.coulFin)
									loggerPalette.erreur(internals.logging.couleurInvalideDegradeFin(obj.ligne.numero(), obj.ligne.degrade.coulFin()));
								else
									throw new Error('cas inconnu');
							});
							loggerPalette.info(internals.logging.interruptionImportPalette());
							return;
						}
					}
					else
					{
						throw new Error("type inconnu");
					}
				}
				// FIN FILTRE LES COULEURS VALIDES


				// FILTRE LES LIGNES SANS DATA, CàD LES LIGNES DEFINISSANT LA COULEUR POUR LES SIEGES ABSENTS
				// effet de bord sur paletteBrut, voir https://lodash.com/docs/4.17.11#remove
				// on enlève les lignes sans data de paletteBrut
				{
					const ligneCouleurSansData = _.remove(paletteBrut, function(ligne) {
						switch (typeData) {
							case internals.constants.TYPE_DONNEE.NUMERIQUE:
								return (ligne.intervalle.borneInf() === "") && (ligne.intervalle.borneSup() === "");
							case internals.constants.TYPE_DONNEE.CATEGORIE:
								return (ligne.categorie() === "");
							default:
								throw new Error("type ligne inconnu");
						}
					});

					if(ligneCouleurSansData.length === 0)
					{
						loggerPalette.info("Aucune couleur pour les sièges absents renseignée. Assignation par défaut à " + internals.constants.VISUEL.COULEUR.PRIMAIRE + ".");
						palette.couleurSiegeAbsent = internals.constants.VISUEL.COULEUR.PRIMAIRE;
					}
					else
					{
						let couleur;
						const element = ligneCouleurSansData[ligneCouleurSansData.length-1];
						switch (typeData) {
							case internals.constants.TYPE_DONNEE.NUMERIQUE:
								couleur = element.degrade.coulDepart();
								break;
							case internals.constants.TYPE_DONNEE.CATEGORIE:
								couleur = element.couleur();
								break;
							default:
								throw new Error("typeData inconnu");
						}
						palette.couleurSiegeAbsent = couleur;
					}

				}
				// FIN FILTRE LES LIGNES ABSENTS



				// CONVERSION DES COLONNES BORNE_INF ET BORNE_SUP SI LA PALETTE EST NUMERIQUE
				if (typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
				{
					const erreurs = [];
					paletteBrut.forEach(function (ligne) {
						try {
							ligne.intervalle.borneInf(internals.core.convertirEnNumber(ligne.intervalle.borneInf()));
						} catch (error) {
							erreurs.push({borneInf: true, ligne});
						}

						try {
							ligne.intervalle.borneSup(internals.core.convertirEnNumber(ligne.intervalle.borneSup()));
						} catch (error) {
							erreurs.push({borneSup: true, ligne});
						}
					});

					if (erreurs.length > 0)
					{
						erreurs.forEach(function(err) {
							if (err.borneInf)
								loggerPalette.erreur(internals.logging.erreurConversionBorneInf(err.ligne.numero(), err.ligne.intervalle.borneInf()));
							else if (err.borneSup)
								loggerPalette.erreur(internals.logging.erreurConversionBorneSup(err.ligne.numero(), err.ligne.intervalle.borneSup()));
							else
								throw new Error('cas inconnu');
						});

						loggerPalette.info(internals.logging.interruptionImportPalette());
						return;
					}
				}
				// FIN CONVERSION DES COLONNES BORNE_INF ET BORNE_SUP SI LA PALETTE EST NUMERIQUE



				// FILTRE LES LIGNES OU BORNES_INF SUPERIEURE OU EGALE A BORNES_SUP
				if(typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
				{
					/** ensemble des lignes où borne_inf >= borne_sup */
					const decroissants = paletteBrut.filter(function(ligne){
						return ligne.intervalle.borneInf() >= ligne.intervalle.borneSup();
					});

					// const numLignesSaufLePremier = decroissants.slice(1, decroissants.length).map(function(el){return el.ligne+1});

					decroissants.forEach(function(ligne){
						loggerPalette.erreur(internals.logging.borneSupInferieureABorneInf(ligne.numero()));
					});

					if(decroissants.length > 0)
					{
						loggerPalette.info(internals.logging.interruptionImportPalette());
						return;
					}
				}
				// FILTRE LES LIGNES OU BORNES_INF SUPERIEURE OU EGALE A BORNES_SUP



				// FILTRE LES INTERSECTIONS ENTRE LES INTERVALLES
				if(typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
				{
					const intersections = internals.core.intersectionPalette(paletteBrut);

					if(intersections.length > 0)
					{
						intersections.forEach(function(intersec) {
							const numLigneLeft = paletteBrut[intersec.leftIndex].numero();
							const numsLignesRight = intersec.right.map(function(el){return paletteBrut[el].numero()+1});

							const message = "l'intervalle " + paletteBrut[intersec.leftIndex].intervalle.toString() + " de la ligne n°" + (numLigneLeft+1) + " intersecte avec "
								+ ((numsLignesRight.length === 1)
									? ("celui de la ligne n°" + numsLignesRight[0])
									: ("ceux des lignes n°" + numsLignesRight.join(", "))
								)
								+ ".";

							loggerPalette.erreur(message);
						});

						loggerPalette.info(internals.logging.interruptionImportPalette());
						return;
					}
				}
				// FIN FILTRE LES INTERSECTIONS ENTRE LES INTERVALLES


				if(typeData === internals.constants.TYPE_DONNEE.NUMERIQUE)
				{
					palette.data = paletteBrut;
					palette.type = internals.constants.TYPE_DONNEE.NUMERIQUE;
				}
				else if(typeData === internals.constants.TYPE_DONNEE.CATEGORIE)
				{
					palette.data = paletteBrut;
					palette.type = internals.constants.TYPE_DONNEE.CATEGORIE;
				}
				else
				{
					throw new Error("typeData inconnu");
				}

				loggerPalette.info(internals.logging.nombreLigneExploitable(palette.data.length));

				jointureDataPalette();
			}).catch(function(err){
				loggerPalette.erreur(internals.logging.interruptionImportPalette() + " Une erreur inconnue est survenue.");
				loggerPalette.debug('un throw catché, voir console');
				console.error(err);
			});
		} catch ( error ) {
			loggerPalette.erreur(internals.logging.interruptionImportPalette() + " Une erreur inconnue est survenue.");
			loggerPalette.debug('un throw catché, voir console');
			console.error(error);
		}
	}); // fin eventListener formulaire Palette

	let attenteEl = document.querySelector("#attente");
	attenteEl.parentNode.removeChild(attenteEl);
	
}, false);
