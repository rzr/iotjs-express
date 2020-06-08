/* -*- mode: js; js-indent-level:2;  -*-
 * SPDX-License-Identifier: MIT
 *
 * Copyright 2018-present Samsung Electronics France SAS, and other contributors
 *
 * This Source Code Form is subject to the terms of the MIT Licence
 * If a copy of the MIT was not distributed with this file
 * You can obtain one at:
 * https://spdx.org/licenses/MIT.html
 */

var http = require('http');


function receive(incoming, callback) {
  var data = '';
  incoming.on('data', function (chunk) {
    data += chunk;
  });

  incoming.on('end', function () {
    if (callback) {
      return callback(null, data);
    }

    return null;
  });
}

function request(options, callback) {
  if (typeof options === 'undefined') {
    options = {};
  }
  if (typeof options.hostname === 'undefined') {
    options.hostname = 'localhost';
  }
  if (typeof options.port === 'undefined') {
    options.port = 8080;
  }
  if (typeof options.path === 'undefined') {
    options.path = '/';
  }

  // Workaround bug
  if (!options.headers) {
    options.headers = {};
  }
  if (!options.headers.host) {
    options.headers.host = options.hostname;
  }

  http.request(options, function (res) {
    receive(res, callback);
  }).end();
}


module.exports.request = request;

// Main
if (module.parent === null) {
  var options = {};
  if (process.argv[2]) {
    options.port = Number(process.argv[2]);
  }
  if (process.argv[3]) {
    options.hostname = process.argv[3];
  }
  if (process.argv[4]) {
    options.path = process.argv[4];
  }
  request(options, function (res, data) {
    try {
      var object = JSON.parse(data);
      console.log(JSON.stringify(object));
    } catch (err) {
      console.log(data);
    }
  });
}
