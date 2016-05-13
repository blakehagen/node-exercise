'use strict';

const swapiCtrl = require('./server.controller.js');

module.exports = (app) => {

  // ROUTES //
  app.route('/api/v1/character/:name')
    .get(swapiCtrl.getCharacter); // GET ONE CHARACTER //

  app.route('/api/v1/characters')
    .get(swapiCtrl.getCharacters); // GET CHARACTERS (50) and SORT //

  app.route('/api/v1/planetresidents')
    .get(swapiCtrl.getPlanetResidents); // GET PLANETS AND RESIDENTS //

};