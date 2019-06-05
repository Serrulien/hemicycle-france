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

	this.mousemove(function(event) {
		if ( event.pageX == null && event.clientX != null ) {
			event.pageX = event.clientX + (event && event.scrollLeft || document.body.scrollLeft || 0);
			event.pageY = event.clientY + (event && event.scrollTop || document.body.scrollTop || 0);
		}

		let dif = -250;
		if(this.getBBox().x < 420)
		{
			dif = 70;
		}

		let hemicycle = document.getElementById("hemicycle");
		let offsetLeft = hemicycle.offsetLeft;
		let offsetTop = hemicycle.offsetTop;

		let trans = '"T' + (event.pageX + dif - offsetLeft) + ',' + (event.pageY - offsetTop) + '"';

		this.tp.paper.transform(trans);
		this.tp.paper.toFront();
	});

	this.hover(
		function(){ // mousein
			if (!this.tp) {
				initTooltip.call(this, textContent);
			}
			createTip.call(this);
		},
		function(){ // mouseout
			deleteTooltip.call(this);
		}
	);

	return this;
}
