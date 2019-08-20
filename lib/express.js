/* -*- mode: js; js-indent-level:2;  -*-
 * SPDX-License-Identifier: MIT
 *
 * Copyright 2018-present Samsung Electronics France SAS, and other contributors
 *
 * This Source Code Form is subject to the terms of the MIT Licence
 * If a copy of the MIT was not distributed with this file
 * You can obtain one at:
 * https://spdx.org/licenses/MIT.html
 *
 * Reimplimentation of Express API for IoT.js
 *
 */

var console = require('console');
// Disable logs here by editing to '!console.log'
var verbose = !console.log || function () {};

function Express() {
  var that = this;

  this.routes = {
    DELETE: {},
    GET: {},
    POST: {},
    PUT: {}
  };

  this.values = {};

  this.extendsServerResponse = function (res) {
    if (!res.status) {
      res.status = function (code) {
        var message = 'Error: ' + code;
        switch (code) {
          case 404:
            message += ' (Not Found)';
            break;
          default:
            message += ' (Unknown)';
            break;
        }
        message += '\n';
        res.setHeader('Content-Length', Buffer.byteLength(message));
        res.writeHead(code);
        res.write(message);

        return res;
      };

    }
    verbose('Use default CORS');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, HEAD, PUT, POST, DELETE'
    );

    if (that.values['x-powered-by']) {
      res.setHeader('X-Powered-By', that.values['x-powered-by']);
    }

    if (!res.json) {
      res.json = function (object) {
        var message = JSON.stringify(object);
        res.setHeader('Content-Length', Buffer.byteLength(message));

        return res.end(message);
      };
    }

    return res;
  };

  this.receive = function (req, res, callback) {
    var data = '';
    req.on('data', function (chunk) {
      data += chunk;

      return data;
    });
    req.on('end', function () {
      verbose(data);
      try {
        req.body = JSON.parse(data);
      } catch (err) {
        req.body = data;
      }
      if (!req.params) {
        req.params = {};
      }
      if (callback) {
        return callback(req, res);
      }

      return data;
    });

    return null;
  };

  this.parse = function (req, pattern) {
    if (req.url.split('/').length !== pattern.split('/').length) {
      return false;
    }

    var result = {};
    var re = /:[^/]+/g;
    var ids = pattern.match(re);
    re = pattern.replace('/', '\\/');
    re = '^'.concat(re, '$');

    for (var id in ids) {
      id = ids[id];
      re = re.replace(id, '([^/]+)');
    }

    re = new RegExp(re, 'g');

    if (!req.url.match(re)) {
      return false;
    }

    for (var idx in ids) {
      var value = req.url.replace(re, '$'.concat(Number(idx) + 1));

      if (value) {
        result[ids[idx].substring(1)] = value;
      }
    }

    req.params = result;

    if (ids && Object.keys(result) &&
        Object.keys(result).length !== ids.length) {
      return false;
    }

    return true;
  };

  this.handleRequest = function (req, res, pattern, callback) {
    if (req.method === 'GET') {
      if (callback) {
        return callback(req, res);
      }
    } else if (req.method === 'PUT' || req.method === 'POST') {
      that.receive(req, res, callback);
    } else {
      throw new Error('Error: method non implemented: ' + req.method);
    }

    return null;
  };

  this.get = function (pattern, callback) {
    that.routes.GET[pattern] = callback;
  };

  this.put = function (pattern, callback) {
    that.routes.PUT[pattern] = callback;
  };

  this.post = function (pattern, callback) {
    that.routes.POST[pattern] = callback;
  };

  this.del = function (pattern, callback) {
    that.routes.DELETE[pattern] = callback;
  };

  this.request = function (req, res) {
    res = that.extendsServerResponse(res);
    verbose('log: request: '.concat(req.url));
    req.params = {};
    for (var pattern in that.routes[req.method]) {
      if (that.parse(req, pattern)) {
        var callback = that.routes[req.method][pattern];

        return that.handleRequest(req, res, pattern, callback);
      }
    }

    return res.status(404);
  };
  this.set = function(name, value) {
    if (name === 'x-powered-by' && typeof value === 'undefined') {
      value = 'iotjs-express';
    }
    that.values[name] = value;
  };
}

module.exports = function () {
  return new Express();
};


if (module.parent === null) {
  verbose('log: Starting app...');
  var http = require('http');
  var port = 8888;
  if (process.argv[2]) {
    port = Number(process.argv[2]);
  }
  var app = new Express();
  var self = http.createServer(app.request);
  self.listen(port);
}

