'use strict';

/**
 * Contient diverses fonctions retournant un message lisible par l'utilisateur.
 * @module hemi/logging
 */

const internals = {
	constants: require('./constants'),
};

/**
 * @description Traduit l'erreur résultante du parsing d'un fichier CSV par une belle phrase.
 * @param {external:PapaParse~Error} erreurStruct - Structure errors de Papaparse https://www.papaparse.com/docs#errors.
 * @returns {string} Le message d'erreur traduit.
 * 
 * @example
 * none
 */
function humanizeErreurPapaparse(erreurStruct)
{
	let message = undefined;
	if(erreurStruct == undefined)
		return "Une erreur inconnue est survenue.";

	if(erreurStruct.type === "Quotes")
	{
		if(erreurStruct.code === "MissingQuotes")
		{
			message = "Un des champs n'a pas de guillemet fermante à la ligne n°" + (erreurStruct.row+1) + ".";
		}
		else if(erreurStruct.code === "InvalidQuotes")
		{
			message = "Un des champs cité est malformé à la ligne n°" + (erreurStruct.row+1) + ".";
		}
	}
	else if(erreurStruct.type === "Delimiter")
	{
		if(erreurStruct.code === "UndetectableDelimiter")
		{
			message = "Impossible de déterminer le séparateur de colonne. Assigné par défaut à \",\".";
		}
	}
	else if(erreurStruct.type === "FieldMismatch")
	{
		if(erreurStruct.code === "TooFewFields")
		{
			const numbs = erreurStruct.message.match(/\d+/gm);
			// on s'attend à extraire 2 nombres
			if(numbs.length == 2)
			message = "La ligne n°" + (erreurStruct.row+1) + " n'a pas assez de champs: " + numbs[0] + " attendus mais seulement " + (numbs[1] == 1 ? '1 lu' : (numbs[1]+' lus') ) + ".";
		}
		else if(erreurStruct.code === "TooManyFields")
		{
			const numbs = erreurStruct.message.match(/\d+/gm);
			// on s'attend à extraire 2 nombres
			if(numbs.length == 2)
			message = "La ligne n°" + (erreurStruct.row+1) + " a trop de champs: " + numbs[0] + " attendus mais " + numbs[1] + " lus.";
		}
	}

	if(message == undefined && 'row' in erreurStruct)
		message = "Une erreur inconnue est survenue à la ligne n°" + (erreurStruct.row+1) + ".";

	return message;
    
}
module.exports.humanizeErreurPapaparse = humanizeErreurPapaparse;

/** 
 * @description Gère le logging des erreurs d'extraction de colonne de extraireColonnesCSV.
 * @param {any[]} data - Data après extraireColonnesCSV.
 * @param {import('hemi-logger').Logger} loggerOutput - La sortie.
 * @returns {boolean} `true` quand au moins une erreur d'extraction est survenue dans n'importe quelle ligne de `data`.
 * @example
 * none
 */
function erreurExtraction(data, loggerOutput)
{
	let nbErreur = 0;

	data.forEach(function(ligne){
		ligne.erreur.forEach(function(colonneRecherchee){
			const numeroLigne = ligne.numero();
			let message;
			if(typeof colonneRecherchee === "string") // nom de la colonne
			{
				message = 'La colonne "' + colonneRecherchee + '" n\'est pas présente dans la ligne n°' + (numeroLigne+1) + '.';
			}
			else // index de la colonne
			{
				let phraseColonnes;
				switch (ligne.contenu().length) {
					case 0:
						phraseColonnes = "Cette dernière ne contient aucune colonne.";
						break;
					case 1:
						phraseColonnes = "Cette dernière contient une seule colonne.";
						break;
					default:
						phraseColonnes = "Cette dernière contient " + (ligne.contenu().length) + " colonnes.";
						break;
				}

				message = 'La colonne n°'
					+ (colonneRecherchee+1) + " n'est pas présente dans la ligne n°" + (numeroLigne+1) + ". "
					+ phraseColonnes;
			}
			
			loggerOutput.erreur(message);
			++nbErreur;
		});
	});

	return nbErreur > 0;
}
module.exports.erreurExtraction = erreurExtraction;

function nombreLigneExploitable(taille)
{
    switch (taille) {
        case 0:
            return 'Suite au raffinement, le fichier renseigné ne contient aucune association exploitable.';
        case 1:
            return 'Suite au raffinement, 1 association est exploitable.';
        default:
            return 'Suite au raffinement, ' + taille + ' associations sont exploitables.';
    }   
}
module.exports.nombreLigneExploitable = nombreLigneExploitable;

function erreurConversionEnNumber(numeroLigne, valeur, prefix)
{
    return prefix + 'de la ligne n°' + (numeroLigne+1) + ' valant "' + valeur + '" n\'est pas convertible en nombre.';
}

function erreurConversionDonneeLigne(numeroLigne, toConvert)
{
    return erreurConversionEnNumber(numeroLigne, toConvert, 'La donnée ');
}
module.exports.erreurConversionDonneeLigne = erreurConversionDonneeLigne;

function erreurConversionSiegeLigne(numeroLigne, toConvert)
{
    return erreurConversionEnNumber(numeroLigne, toConvert, 'Le numéro de siège ');
}
module.exports.erreurConversionSiegeLigne = erreurConversionSiegeLigne;

function erreurConversionBorneInf(numeroLigne, toConvert)
{
    return erreurConversionEnNumber(numeroLigne, toConvert, 'La borne inférieure ');
}
module.exports.erreurConversionBorneInf = erreurConversionBorneInf;

function erreurConversionBorneSup(numeroLigne, toConvert)
{
    return erreurConversionEnNumber(numeroLigne, toConvert, 'La borne supérieure ');
}
module.exports.erreurConversionBorneSup = erreurConversionBorneSup;

function numeroSiegeInvalide(numeroLigne, numeroSiege)
{
    return 'Le numéro de siège de la ligne n°' + (numeroLigne+1) + ' valant "' + numeroSiege + '" n\'est pas un numéro de siège valide.';
}
module.exports.numeroSiegeInvalide = numeroSiegeInvalide;

function interruptionImportPalette()
{
    return "Import de la palette interrompu.";
}
module.exports.interruptionImportPalette = interruptionImportPalette;

function interruptionImportDonnees()
{
    return "Import du fichier de données interrompu.";
}
module.exports.interruptionImportDonnees = interruptionImportDonnees;

function borneSupInferieureABorneInf(numeroLigne)
{
    return 'La valeur de la colonne "' + internals.constants.HEADER_PALETTE.NUMERIQUE.BORNE_SUP +
	'" doit être strictement inférieure à celle de la colonne "' + internals.constants.HEADER_PALETTE.NUMERIQUE.BORNE_INF +
	'" à la ligne n°' + (numeroLigne+1) + '.';
}
module.exports.borneSupInferieureABorneInf = borneSupInferieureABorneInf;

function couleurInvalide(numeroLigne, couleur)
{
    return 'La couleur valant "' + couleur + '" n\'est pas valide à la ligne n°' + (numeroLigne+1) + '.'
}
module.exports.couleurInvalide = couleurInvalide;

function couleurInvalideDegradeDepart(numeroLigne, couleur)
{
    return 'La couleur de départ du dégradé valant "' + couleur + '" n\'est pas valide à la ligne n°' + (numeroLigne+1) + '.'
}
module.exports.couleurInvalideDegradeDepart = couleurInvalideDegradeDepart;

function couleurInvalideDegradeFin(numeroLigne, couleur)
{
    return 'La couleur de fin du dégradé valant "' + couleur + '" n\'est pas valide à la ligne n°' + (numeroLigne+1) + '.'
}
module.exports.couleurInvalideDegradeFin = couleurInvalideDegradeFin;
