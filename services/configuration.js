'use strict';

var jobScheduling = require('./jobScheduling.js');

var mocks = require('./hacks.js');

exports.mockMode = 0;

exports.init = function(app){

	this.mockMode = 1;

	// Crea 2 jugadores en modo Mock, solo para asignar KEYS para buscar despues en el RSS
	//mocks.mockCreatePlayer();

	jobScheduling.addSources();
	jobScheduling.scheduleRss();

}