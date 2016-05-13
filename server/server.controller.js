'use strict';
const rp      = require('request-promise');
const _       = require('lodash');
const request = require('request');
const Promise = require('bluebird');
var BRequest  = Promise.promisify(request);

module.exports = {

  // GET CHARACTER DATA //
  getCharacter: (req, res) => {

    let name = req.params.name;
    let id;

    if (name === 'luke') {
      id = 1;
    } else if (name === 'leia') {
      id = 5;
    } else if (name === 'han') {
      id = 14;
    } else if (name === 'rey') {
      id = 85;
    }

    let options = {
      uri: 'http://swapi.co/api/people/' + id,
      json: true
    };
    rp(options).then((data) => {
        res.render('character', data);
      })
      .catch((err) => {
        res.render('error', err);
      });
  },

  // GET CHARACTERS (50) AND SORT //
  getCharacters: (req, res) => {

    const BASE_OPTIONS = {
      method: 'GET',
      uri: 'http://swapi.co/api/people/?limit=10&page='
    };

    Promise.map(_.range(1, 6), function (pageNum) {
      let options = _.cloneDeep(BASE_OPTIONS);
      options.uri = options.uri + pageNum;
      return BRequest(options);
    }).then(function (results) {

        let chars = _.reduce(results, (aggregatedChars, responsePage) => {

          return aggregatedChars.concat(JSON.parse(responsePage.body).results)
        }, []);

        if (req.query.sort === 'mass') {
          chars = _.sortBy(chars, (o) => {
            o.mass   = parseFloat(o.mass.replace(',', ''));
            o.height = parseFloat(o.height);
            return o.mass;
          });

        } else if (req.query.sort === 'height') {
          chars = _.sortBy(chars, (o) => {
            o.mass   = parseFloat(o.mass.replace(',', ''));
            o.height = parseFloat(o.height);
            return o.height;
          });
        } else {
          chars = _.sortBy(chars, (o) => {
            o.mass   = parseFloat(o.mass.replace(',', ''));
            o.height = parseFloat(o.height);
            return o.name;
          });
        }

        res.json(chars);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  },

  // GET PLANETS AND RESPECTIVE RESIDENTS //
  getPlanetResidents: (req, res) => {

    let options = {
      uri: 'http://swapi.co/api/planets/',
      json: true
    };

    rp(options).then((data) => {
        console.log(data.results);
      })
      .catch((err) => {
        res.status(500).json(err);
      });


  }


};