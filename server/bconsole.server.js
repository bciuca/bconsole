// The MIT License (MIT)
// 
// Copyright (c) <year> <copyright holders>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//
// Author: Bogdan Ciuca, https://github.com/bciuca/bconsole
// January 2014

'use strict';

var app = require('express.io')(),
    os = require('os'),
    fs = require('fs'),
    timestamp = Date.now(),
    defaultConfig = {
        logPath: '../logs/',
        logFileNamePrefix: 'log',
        port: 7076,
        verbose: true
    },
    config = getConfig(),
    localIps = getLocalIPs() || [];

Object.defineProperties(defaultConfig, {
    logFullPath : {
        get: function() {
            return defaultConfig.logPath + defaultConfig.logFileNamePrefix + '_' + timestamp + '.txt';
        }
    }
});

writeLog('bconsole Started ' + (new Date().toString()));
writeLog('Server IP' + (localIps.length ? 's' : '') + ':\n   ' + localIps.join('\n   '));


function getTimeStamp() {
    var zeroFill = function(val, total) {
        if (total === 3) {
            return val < 10 ? '00' + val : val < 100 ? '0' + val : val;
        } else if (total == 2) {
            return val < 10 ? '0' + val : val;
        } else {
            return val;
        }
    },
        date = new Date(),
        yyyy = date.getFullYear(),
        MM = zeroFill(date.getMonth() + 1, 2),
        dd = zeroFill(date.getDate(), 2),
        hh = zeroFill(date.getHours(), 2),
        mm = zeroFill(date.getMinutes(), 2),
        ss = zeroFill(date.getSeconds(), 2),
        mmm = zeroFill(date.getMilliseconds(), 3)
    ;

    return yyyy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss + ':' + mmm;
}


function getLocalIPs() {
    var interfaces = os.networkInterfaces(),
        addresses = [];
    for (var key in interfaces) {
        interfaces[key].forEach(function(obj){
            if (obj.family === 'IPv4') {
                addresses.push(key + ': ' + obj.address);
            }
        });
    }

    return addresses;
}

function getConfig() {
    try {
        var cfg = fs.readFileSync('../config/config.json');
        if (!cfg) {
            return defaultConfig;
        } else {
            cfg = JSON.parse(cfg);
            return extend(defaultConfig, cfg);
        }
    } catch (err) {
        console.error('error getting config:', err);
        return defaultConfig;
    }
}
 
function writeLog(message) {
    if (!message) return;

    var logPath = config.logPath 
        + config.logFileNamePrefix 
        + '_' + Date.now() + '.txt';

    message = getTimeStamp() + '| ' + message;

    if (config.verbose) {
        console.log(message);
    }
    message += '\n';
    fs.appendFileSync(config.logFullPath, message);
}

function extend(obj, source) {
    for (var prop in source) {
        obj[prop] = source[prop];
    }
    return obj;
}

app.http().io();

app.io.route('ready', function(req) {
    writeLog('"ready" received from:\n\tsocket id: ' + req.io.socket.id +
        '\n\tuser-agent: ' + req.headers['user-agent'] +
        '\n\treferer: ' + req.headers.referer
    );
});

app.io.route('log', function(req) {
    writeLog(req.data.message);
});

app.listen(config.port);