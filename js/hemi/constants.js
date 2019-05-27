'use strict';
// commonsJS module

/**
 * Déclare diverses constantes.
 * @module hemi/constants
 */

/** 
 * La liste des numéros des sièges non utilisés, c.à.d un numéro qui ne référence pas un siège physique dans l'Hemicycle.
 * @type {number[]}
 * @readonly
 */
module.exports.NUMEROS_SIEGES_NON_UTILISES = [4,29,34,37,42,46,55,61,65,69,74,107,115,121,131,142,159,160,161,194,202,208,218,229,246,247,252,275,283,289,299,310,316,328,355,363,369,379,390,396,408,435,443,449,459,470,476,477,521,529,535,545,556,562,563,575,579,598,605,608,613,617,622,631,635,641,646,647];

/** 
 * La liste des numéros des sièges utilisés, c.à.d un numéro qui référence un siège physique dans l'Hemicycle.
 * @type {number[]}
 * @readonly
 */
module.exports.NUMEROS_SIEGES_UTILISES = [1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,31,32,33,35,36,38,39,40,41,43,44,45,47,48,49,50,51,52,53,54,56,57,58,59,60,62,63,64,66,67,68,70,71,72,73,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,108,109,110,111,112,113,114,116,117,118,119,120,122,123,124,125,126,127,128,129,130,132,133,134,135,136,137,138,139,140,141,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,195,196,197,198,199,200,201,203,204,205,206,207,209,210,211,212,213,214,215,216,217,219,220,221,222,223,224,225,226,227,228,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,248,249,250,251,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,276,277,278,279,280,281,282,284,285,286,287,288,290,291,292,293,294,295,296,297,298,300,301,302,303,304,305,306,307,308,309,311,312,313,314,315,317,318,319,320,321,322,323,324,325,326,327,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,356,357,358,359,360,361,362,364,365,366,367,368,370,371,372,373,374,375,376,377,378,380,381,382,383,384,385,386,387,388,389,391,392,393,394,395,397,398,399,400,401,402,403,404,405,406,407,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,436,437,438,439,440,441,442,444,445,446,447,448,450,451,452,453,454,455,456,457,458,460,461,462,463,464,465,466,467,468,469,471,472,473,474,475,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,522,523,524,525,526,527,528,530,531,532,533,534,536,537,538,539,540,541,542,543,544,546,547,548,549,550,551,552,553,554,555,557,558,559,560,561,564,565,566,567,568,569,570,571,572,573,574,576,577,578,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,599,600,601,602,603,604,606,607,609,610,611,612,614,615,616,618,619,620,621,623,624,625,626,627,628,629,630,632,633,634,636,637,638,639,640,642,643,644,645,648,649,650];

/**
 * Le nom des colonnes attendues par le csv décrivant la palette de couleur.
 * @type {object}
 * @readonly
 * @property {object} NUMERIQUE Noms des colonnes attendues pour une palette numérique.
 * @property {string} NUMERIQUE.BORNE_INF Nom de la colonne contenant la borne inférieure de l'intervalle.
 * @property {string} NUMERIQUE.BORNE_SUP Nom de la colonne contenant la borne supérieure de l'intervalle.
 * @property {string} NUMERIQUE.COULEUR_DEPART Nom de la colonne contenant la couleur de départ du dégradé.
 * @property {string} NUMERIQUE.COULEUR_FIN Nom de la colonne contenant la couleur de fin du dégradé.
 * @property {object} CATEGORIE Noms des colonnes attendues pour une palette catégorique.
 * @property {string} CATEGORIE.NOM Nom de la colonne contenant les catégories.
 * @property {string} CATEGORIE.COULEUR Nom de la colonne contenant les couleurs.
 */
module.exports.HEADER_PALETTE = {
	NUMERIQUE: {
		BORNE_INF: 'min',
		BORNE_SUP: 'max',
		COULEUR_DEPART: 'couleur_dep',
		COULEUR_FIN: 'couleur_fin',
	},
	CATEGORIE: {
		NOM: 'categorie',
		COULEUR: 'couleur'
	}
};

/**
 * Les différents type de représentation supportés.
 * @readonly
 * @property {string} NUMERIQUE la colonne data représente un nombre et la palette décrit des intervalles (borne inf, borne max), chacun associé à une couleur.
 * @property {string} CATEGORIE la colonne data représente une chaîne de caractères et la palette associe ces précédentes chaînes à une couleur.
 */
module.exports.TYPE_DONNEE = {
	CATEGORIE: "categorie",
	NUMERIQUE: "numerique"
};

/**
 * Diverses constantes pour le visuel de l'application.
 * @type {object}
 * @readonly
 * @property {object} COULEUR Couleurs utilisés dans le visuel de l'Hemicycle.
 * @property {string} COULEUR.PRIMAIRE Couleur primaire (couleur de remplissage des sièges).
 * @property {string} COULEUR.SECONDAIRE Couleur secondaire (couleur de contour des sièges).
 * @property {string} COULEUR.MINISTRE Couleur de remplissage des sièges des ministres.
 * @property {string} COULEUR.COMMISSION Couleur de remplissage des sièges de la commission.
 * @property {string} COULEUR.ENCEINTE Couleur de remplissage de l'enceinte.
 * @property {object} STROKE Attributs des contours.
 * @property {nu:ber} STROKE.EPAISSEUR Epaisseur du contour.
 * @property {string} STROKE.JOINTURE Methode de jointure des contours.
 */
module.exports.VISUEL = {
	COULEUR: {
		PRIMAIRE: "#CBCBCB",
		SECONDAIRE: "#FFFFFF",
		MINISTRE: "#003C68",
		COMMISSION: "#3B88B2",
		ENCEINTE: "#9C9C9C"
	},
	STROKE: {
		EPAISSEUR: 0.3,
		JOINTURE: "round"
	}
};
