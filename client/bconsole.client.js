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

(function(global) {
    'use strict';

    var bconsole = {},
        socket = null,
        logCache= [],
        config = {
            libPath: 'js/socket.io.js',
            serverIp: '127.0.0.1'
        }
    ;

    // 
    bconsole = {
        // Pretty print objects to string.
        // Based on PhiLho's solution: 
        //  http://stackoverflow.com/questions/130404/javascript-data-formatting-pretty-printer
        __objectToString: function(obj, options) {
            options = options || {};
            var indent = options.indent || ' ',
                singleIndent = options.indent || '',
                newline = options.newline || '\n',
                skipFunctions = options.skipFunctions === undefined ? true : !!options.skipFunctions,
                result = ''
            ;

            for (var property in obj) {
                var value = obj[property];
                if (typeof value === 'string') {
                    value = '"' + value + '"';
                } else if (typeof value === 'object') {
                    if (value instanceof Array) {
                        value = JSON.stringify(value);
                    } else {
                        var od = this.__objectToString(value, {
                            indent: (indent + singleIndent),
                            newline: newline
                        });
                        
                        value = '{' + newline + od + indent + '}';
                    }
                } else if (typeof value === 'function' && skipFunctions) {
                    value = 'function() { ... }';
                }

                result += indent +  property + " : " + value + ',' + newline;
            }

            return result;
        },
        
        // Connect to the console nodejs server.
        __init: function() {
            var self = this;

            socket = io.connect(config.serverUrl);
            socket.emit('ready');

            socket.on('disconnect', function() {
                bconsole.log('socket.io disconnect');
            });

            socket.on('connecting', function(type) {
                bconsole.log('socket.io connecting via ' + type);
            });

            socket.on('reconnecting', function(ms) {
                bconsole.log('socket.io reconnecting in ' + (ms/1000) + ' seconds');
            });

            socket.on('connect', function() {
                bconsole.log('socket.io connect');
                while (logCache && logCache.length) {
                    self._log(logCache.shift());
                }
            });

            socket.on('connect_failed', function(arg) {
                bconsole.log('socket.io connected failed', arg);
            });

            socket.on('error', function() {
                bconsole.log('socket.io error');
            });
        },

        _log: function(message) {
            if (!socket) {
                logCache.push(message);
            } else {
                socket.emit('log', { message: message });
            }
        },

        init: function (options) {
            config = options || config;

            if (!window.io) {
                if (!config.libPath) {
                    throw new Error('Cannot find socket.io.js; path not defined in the configuration.');
                    return;
                }
                
                var scriptTag = document.createElement('script');

                // Load socket.io.js script dynamically.
                scriptTag.src = config.libPath;
                scriptTag.onreadystatechange = scriptTag.onload = function() {
                    bconsole.__init();
                };
                document.head.appendChild(scriptTag);
            } else {
                bconsole.__init();
            }
        },

        log: function() {
            var i = 0,
                str = '',
                arg = null;

            for (i = 0; i < arguments.length; i++) {
                arg = arguments[i];

                if (arg && typeof arg !== 'string' && arg.toString().indexOf('[object Object]') >= 0) {
                    str += ' ' + this.__objectToString(arg, { newline: '\n', indent:' ', singleIndent: ' ' });
                    str = '{\n' + str + '\n}';
                } else {
                    str += ' ' + arg;
                }
            }

            this._log(str);
        }
    };

    global.bconsole = bconsole;
})(this);