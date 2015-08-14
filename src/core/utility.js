(function (plane) {

    var string = {
        format: function (str, args) {
            return str.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] !== 'undefined' ? args[number] : match;
            });
        },
        contains: function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        },
        hashCode: function (str) {
            // http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
            var hash = 0, i, chr, len;
            if (str.length === 0)
                return hash;
            for (i = 0, len = str.length; i < len; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },
        fromKeyPress: function (keyCode) {

            // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
            var keys = {
                '8': 'Backspace',
                '9': 'Tab',
                '13': 'Enter',
                '16': 'Shift',
                '17': 'Control',
                '18': 'Alt',
                '19': 'Pause/Break',
                '20': 'CapsLock',
                '27': 'Esc',
                '32': 'Spacebar',
                '33': 'PageUp',
                '34': 'PageDown',
                '35': 'End',
                '36': 'Home',
                '37': 'LeftArrow',
                '38': 'UpArrow',
                '39': 'RightArrow',
                '40': 'DownArrow',
                '45': 'Insert',
                '46': 'Delete',
                '48': '0',
                '49': '1',
                '50': '2',
                '51': '3',
                '52': '4',
                '53': '5',
                '54': '6',
                '55': '7',
                '56': '8',
                '57': '9',
                '65': 'A',
                '66': 'B',
                '67': 'C',
                '68': 'D',
                '69': 'E',
                '70': 'F',
                '71': 'G',
                '72': 'H',
                '73': 'I',
                '74': 'J',
                '75': 'K',
                '76': 'L',
                '77': 'M',
                '78': 'N',
                '79': 'O',
                '80': 'P',
                '81': 'Q',
                '82': 'R',
                '83': 'S',
                '84': 'T',
                '85': 'U',
                '86': 'V',
                '87': 'W',
                '88': 'X',
                '89': 'Y',
                '90': 'Z',
                '96': '0',
                '97': '1',
                '98': '2',
                '99': '3',
                '100': '4',
                '101': '5',
                '102': '6',
                '103': '7',
                '104': '8',
                '105': '9',
                '112': 'F1',
                '113': 'F2',
                '114': 'F3',
                '115': 'F4',
                '116': 'F5',
                '117': 'F6',
                '118': 'F7',
                '119': 'F8',
                '120': 'F9',
                '121': 'F10',
                '122': 'F11',
                '123': 'F12',
                '124': 'F13',
                '144': 'NumLock',
                '145': 'ScrollLock',
                '186': ';:',
                '187': '+=',
                '189': '-_',
                '190': '.',
                '194': '.',
                '191': '/?',
                '192': '`~'
            };

            return keys[keyCode];
        }
    };


    var math = {
        uuid: function (length, radix) {
            // http://www.ietf.org/rfc/rfc4122.txt
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
                uuid = [],
                i;
            radix = radix || chars.length;

            if (length) {
                for (i = 0; i < length; i++)
                    uuid[i] = chars[0 | Math.random() * radix];
            } else {
                var r;

                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }

            return uuid.join('').toLowerCase();
        },
        parseFloat: function (float, decimal) {
            return Number(parseFloat(float).toFixed(decimal));
        },
        // Converts from degrees to radians.
        radians: function (degrees) {
            return degrees * (Math.PI / 180);
        },
        // Converts from radians to degrees.
        degrees: function (radians) {
            return radians * (180 / Math.PI);
        }
    };


    var object = {
        inherits: function (f, p) {
            //f.prototype = p.prototype;
            // O OBJETO INSTANCIADO!!!
            f.prototype = new p();
            f.constructor = f;
            return f;
        },
        /*
         * Copy the enumerable properties of p to o, and return o
         * If o and p have a property by the same name, o's property is overwritten
         * This function does not handle getters and setters or copy attributes
         */
        extend: function (o, p) {
            for (var prop in p) { // For all props in p.
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor
                // 2014.08.08 11:00 - lilo - alteração para funcionar com propriedas e função "not own (prototype chain)" do objeto
                var desc = Object.getOwnPropertyDescriptor(p, prop);
                if (desc) {
                    Object.defineProperty(o, prop, desc); // add the property to o.
                } else {
                    o[prop] = p[prop];
                }
            }
            return this;
            // 2014.11.27 2047 - lilo - method chaining
            // return o;
        },
        /*
         * Copy the enumerable properties of p to o, and return o
         * If o and p have a property by the same name, o's property is left alone
         * This function does not handle getters and setters or copy attributes
         */
        merge: function (o, p) {
            for (var prop in p) { // For all props in p
                if (o.hasOwnProperty[prop])
                    continue; // Except those already in o
                o[prop] = p[prop]; // add the property to o
            }
            return o;
        },
        event: (function () {

            function Event() {
                this.listeners = {};
            }

            Event.prototype.listen = function (event, handler) {
                (this.listeners[event] = this.listeners[event] || []).push(handler);
            };

            Event.prototype.notify = function (event, data) {
                if (this.listeners[event] !== undefined) {
                    for (var callback in this.listeners[event]) {
                        this.listeners[event][callback].call(this, data);
                    }
                }
            };

            Event.prototype.unListen = function (event, handler) {
                if (this.listeners[event] !== undefined) {
                    var index = this.listeners[event].indexOf(handler);
                    if (index !== -1) {
                        this.listeners[event].splice(index, 1);
                    }
                }
            };

            Event.create = function () {
                return new Event();
            };

            return Event;

        })()
    };

    var conversion = {
        // http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
        toType: function (obj) {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        },
        toJson: function (obj) {
            return '';
        },
        toObject: function (obj) {
            return {};
        },
        toArray: function (obj) {
            var array = [];
            // iterate backwards ensuring that length is an UInt32
            for (var i = obj.length >>> 0; i--; ) {
                array[i] = obj[i];
            }
            return array;
        }
    };

    var array = {
        find: function (array, item) {
            return array[array.indexOf(item)];
        },
        split: function (a, n) {
            var len = a.length,
                out = [],
                i = 0;
            while (i < len) {
                var size = Math.ceil((len - i) / n--);
                out.push(a.slice(i, i + size));
                i += size;
            }
            return out;
        },
        diff: function (a, b) {

            var onlyInA = a.filter(function (current) {
                return b.filter(function (current_b) {
                    return (current_b.snap.x === current.snap.x) && (current_b.snap.y === current.snap.y);
                }).length === 0;
            });

            var onlyInB = b.filter(function (current) {
                return a.filter(function (current_a) {
                    return (current_a.snap.x === current.snap.x) && (current_a.snap.y === current.snap.y);
                }).length === 0;
            });

            return onlyInA.concat(onlyInB);
        }
    };

    // do livro - Segredos do Ninja JavaScript - John Resig - pag. 264
    var thread = {
        id: 0,
        threads: [],
        add: function (handler) {
            this.threads.push(handler);
        },
        start: function () {
            if (this.id)
                return;

            (function runNext() {
                if (thread.threads.length > 0) {
                    for (var i = 0; i < thread.threads.length; i++) {
                        if (thread.threads[i]() === false) {
                            thread.threads.splice(i, 1);
                            i--;
                        }
                    }
                }
            })();
        },
        stop: function () {
            clearTimeout(this.id);
            this.id = 0;
        }
    };


    plane.utility = {
        math: math,
        array: array,
        thread: thread,
        string: string,
        object: object,
        conversion: conversion
    };


})(c37.library.plane);