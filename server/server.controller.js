'use strict';
const rp       = require('request-promise');
const _        = require('lodash');
const request  = require('request');
const Promise  = require('bluebird');
const BRequest = Promise.promisify(request);

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

        let planets = _.reduce(temp, (tempPlanetInfo, currPlanet) => {
          tempPlanetInfo[currPlanet.name] = currPlanet.residents;
          return tempPlanetInfo;
        }, {});

        BPromise.map(_.keys(planets), planet => {

            let residentUrls = planets[planet] || [];

            return BPromise.map(residentUrls, url => {
                return rp({method: 'GET', url});
              })
              .then(allResponses => {
                planets[planet] = _.map(allResponses, response => {
                    return JSON.parse(response.body).name;
                  }) || 'No residents';
              });
          
          })
          .then(() => {
            res.json(planets);
          });

      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }


};