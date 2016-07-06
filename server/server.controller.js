'use strict';
const _        = require('lodash');
const request  = require('request');
const Promise  = require('bluebird');
const BRequest = Promise.promisify(request);

module.exports = {


  // GET CHARACTER BY NAME //
  getCharacter: (req, res) => {

    let characterHash = [
      {
        name: 'luke',
        id: 1
      },
      {
        name: 'han',
        id: 14
      },
      {
        name: 'leia',
        id: 5
      }, {
        name: 'rey',
        id: 85
      }
    ];

    let options = {
      url: 'http://swapi.co/api/people/' + _.find(characterHash, {"name": req.params.name}).id
    };

    BRequest(options).then((response) => {
      let charData = JSON.parse(response.body);
      res.status(200).json(charData);
    });
  },

  getCharacters: (req, res)=> {
  },

  getPlanetResidents: (req, res) => {
  }

};
