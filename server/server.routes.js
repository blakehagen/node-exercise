'use strict';

const swapiCtrl = require('./server.controller.js');

module.exports = (app) => {

  app.route('/api/v1/character/:name')
    .get(swapiCtrl.getCharacter);

  app.route('/api/v1/characters')
    .get(swapiCtrl.getCharacters);

  app.route('/api/v1/planetresidents')
    .get(swapiCtrl.getPlanetResidents);
  
};