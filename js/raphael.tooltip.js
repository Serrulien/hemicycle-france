'use strict';

/**
 * Augmente Raphael avec un tooltip personnalisé.
 * Pourquoi créer un tooltip custom au lieu d'utiliser celui intégrer dans la bibliothèque ?
 *  - pour modifier le style du tooltip à notre guise.
 *  - choisir quand enlever le tooltip. Le tooltip natif s'enlève que l'on clique sur l'élément et mouseout.
 * Code inspiré du fichier raphael.tooltip.js utilisé sur http://www2.assemblee-nationale.fr/deputes/hemicycle.
 * @module raphael.tooltip
 */

const Raphael = require('raphael');

/**
 * @description Initialise l'objet tooltip.
 * @param {string} textContent - Le message.
 * @example
 * none
 */
function initTooltip(textContent)
{
	this.tp = {
		paper: undefined,
		message: textContent
	};
}

/**
 * @description Supprime l'objet tooltip.
 * @example
 * none
 */
function deleteTooltip()
{
	this.tp.paper.remove();
	delete this.tp;
}

/**
 * @description Insère les éléments SVG affichant le tooltip (rect, text ...).
 * @example
 * none
 */
function createTip()
{
	this.paper.setStart();

	// Create background
	const frameEl = this.paper.rect(0, 0, 0, 0, 5);

	// Create text element
	const textEl = this.paper.text(5, 0, this.tp.message).attr({'text-anchor':'start', 'font-size':11});

	const bbox = textEl.getBBox();

	// Resize the background to fit the text
	frameEl.attr({width:bbox.width + 10, height: bbox.height+10, fill: '#E5F6FE', 'stroke-width':1, stroke:'#ADD9ED'});

	// Move the text vertically to position it correctly
	textEl.attr({y: Math.round(bbox.height/2)+5});

	this.tp.paper = this.paper.setFinish();
}

function onMouseMove(event)
{
	const svg = this.paper.canvas;

	// pos du curseur au sein du svg
	let posCursorX = event.clientX  - svg.getBoundingClientRect().left;
	let posCursorY = event.clientY  - svg.getBoundingClientRect().top;

	// le bord gauche du tooltip est centré sous le curseur
	// +28 en Y pour que le tooltip ne soit pas caché par le curseur
	// limitation : si le bord du svg est trop proche du curseur, alors le tooltip sera coupé en deux.

	// impossible que le tooltip soit coupé par la gauche de part sa position sous le curseur.
	// même chose pour le haut du tooltip
	// il peut donc être coupé par le bas ou la droite
	const svgVB = svg.viewBox.baseVal;
	const tooltipBBox = this.tp.paper.getBBox();

	const ecartVerticalCurseurTooltip = 28;

	const diffX = posCursorX + tooltipBBox.width - (svgVB.x + svgVB.width);
	const diffY = posCursorY + tooltipBBox.height - (svgVB.y + svgVB.height) + ecartVerticalCurseurTooltip;
	if (diffX > 0)
		posCursorX -= diffX;
	if (diffY > 0)
		posCursorY -= diffY;

	// on ne vérifie pas si un premier décalage résulte en un une position valide (typiquement un svg avec width faible)
	// si le tooltip est coupé en bas, il est possible qu'il soit derrière le curseur.

	const trans = 't' + (posCursorX) + ',' + (posCursorY + ecartVerticalCurseurTooltip); // format particulier https://dmitrybaranovskiy.github.io/raphael/reference.html#Element.transform
	this.tp.paper.transform(trans);
	this.tp.paper.toFront();
}

function onMouseIn(textContent)
{
	if (!this.tp) {
		initTooltip.call(this, textContent);
		this.mousemove(onMouseMove);
	}
	createTip.call(this);
}

function onMouseOut()
{
	deleteTooltip.call(this);
}

/**
 * @public
 * 
 * @description Créer un tooltip avec le message donné. Ne supprime pas le tooltip "title" natif.
 * Le tooltip est créé lors du mousin et détruit lors du mouseout.
 * @param {string} textContent - Le message à afficher dans le tooltip.
 * 
 * @example
 * const el = paper.rect(...args);
 * el.tooltip("mon texte");
 */
Raphael.el.tooltip = function(textContent) {
	this.tpHandles = {
		mousein: onMouseIn.bind(this, textContent),
		mouseout: onMouseOut.bind(this)
	};
	
	this.hover(
		this.tpHandles.mousein,
		this.tpHandles.mouseout
	);

	return this;
};

Raphael.el.removeTooltip = function() {
	this.unmousemove(onMouseMove);
	this.unhover(this.tpHandles.mousein, this.tpHandles.mouseout);
	delete this.tpHandles;
};
