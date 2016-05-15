'use strict';
const rp      = require('request-promise');
const _       = require('lodash');
const request = require('request');
const Promise = require('bluebird');
const BRequest  = Promise.promisify(request);

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

    Promise.map(_.range(1, 6), (pageNum) => {
      let options = _.cloneDeep(BASE_OPTIONS);
      options.uri = options.uri + pageNum;
      return BRequest(options);
    }).then((results) => {

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

    const BASE_OPTIONS = {
      method: 'GET',
      uri: 'http://swapi.co/api/planets/?limit=10&page='
    };

    Promise.map(_.range(1, 8), (pageNum) => {
      let options = _.cloneDeep(BASE_OPTIONS);
      options.uri = options.uri + pageNum;
      return BRequest(options);
    }).then((results) => {

        let temp = _.reduce(results, (aggregatedPlanets, responsePage) => {
          return aggregatedPlanets.concat(JSON.parse(responsePage.body).results)
        }, []);

        let planets = {};
        for (let i = 0; i < temp.length; i++) {
          planets[temp[i].name] = temp[i].residents;
          temp.splice(i, 1);
          i--;
        }

        let reqNumber = 0;
        for (let p in planets) {
          reqNumber = reqNumber + planets[p].length;
        }
      
        let counter = 0;
        for (let planet in planets) {
          if (!_.isEmpty(planets[planet])) {
            planets[planet].map((uri)=> {
              rp({method: 'GET', uri: uri}).then((response) => {
                let name = (JSON.parse(response).name);
                counter++;
                let substr = 'http';
                for (let i = 0; i < planets[planet].length; i++) {
                  if (planets[planet][i].indexOf(substr) > -1) {
                    planets[planet].splice(i, 1);
                    i--;
                  }
                }
                planets[planet].push(name);
              })
            });
          } else {
            planets[planet] = 'No known residents'
          }
        }

        let checkIfDone = setInterval( () => {
          if (counter === reqNumber) {
            res.json(planets);
            clearInterval(checkIfDone)
          }
        }, 1000);

      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }


};