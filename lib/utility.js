// lilo003 - 2014.12.12 1009 - Primeira união de utility somando outras versão dos códigos
// lilo003 - 2014.12.12 1039 - Novo método em array = find
// lilo003 - 2015.01.12 0310 - Novo objeto thread - para testes de performance
// lilo003 - 2015.01.12 1035 - Novo método em array = split
// lilo003 - 2015.02.09 1040 - Novo objeto application com método history
// lilo003 - 2015.02.09 1044 - Alterando o método mediator para o objeto application
// lilo003 - 2015.02.12 1034 - Novo método em conversion = toArray
define('utility', ['require', 'exports'], function (require, exports) {

    // do livro - Segredos do Ninja JavaScript - John Resig - pag. 264
    var thread = {
        id: 0,
        threads: [],
        add: function (handler) {
            this.threads.push(handler);
        },
        start: function () {
            if (this.id) return;

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
    }

    // https://github.com/ArthurClemens/Javascript-Undo-Manager
    var application = {
        history: (function () {

            // EVENTOS = podem ser de dois tipos: 
            // - ações = não possuem undo, ex: zoom + center, novo arquivo
            // - comandos = possuem undo e redo, ex: criar, deletar ou alterar um objeto
            var events = [],
                index = 0;

            function add(event) {

                // salvo o horario do evento para mostrar 
                event.createAt = new Date().toISOString();

                // verifico se não estou add para um evento após um execute
                if (index != 0) {

                    // ordeno os eventos em ordem decrescente
                    events = list();

                    // excluo do inicio até o index
                    events.splice(0, index);

                    // quando ao add um novo evento 'limpo' o index
                    index = 0;
                }

                // add na pilha 'array' o novo evento
                return events.push(event);
            }

            function execute(to, callback) {

                // declaro está variavel auxiliar
                // ordeno os eventos em ordem decrescente
                var sortEvents = list();

                // marco no indice o evento escolhido
                index = parseInt(to);

                for (var i = 0; i <= index; i++) {
                    // ações são prioritárias
                    if (sortEvents[i].action) {
                        sortEvents[i].action();
                    } else {
                        // caso contrario, o tipo de comando de acordo como o index
                        sortEvents[i][index > i ? 'undo' : 'redo']();
                    }
                }
                return callback(true);

            }

            function list() {
                return events.sort(function (a, b) {
                    return a.createAt < b.createAt;
                });
            }

            function clear() {
                return events = []
            }

            return {
                add: add,
                list: list,
                clear: clear,
                execute: execute
            }

        })(),
        mediator: (function () {
            // Storage for our topics/events
            var channels = {};
            // Subscribe to an event, supply a callback to be executed
            // when that event is broadcast
            var subscribe = function (channel, fn) {
                if (!channels[channel]) channels[channel] = [];
                channels[channel].push({
                    context: this,
                    callback: fn
                });
                return this;

            };
            // Publish/broadcast an event to the rest of the application
            var publish = function (channel) {
                if (!channels[channel]) return false;
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, l = channels[channel].length; i < l; i++) {
                    var subscription = channels[channel][i];
                    subscription.callback.apply(subscription.context, args);
                }
                return this;
            };
            return {
                publish: publish,
                subscribe: subscribe,
                installTo: function (obj) {
                    obj.subscribe = subscribe;
                    obj.publish = publish;
                }
            };
        })()
    }

    var math = {
        uuid: function (length, radix) {
            // http://www.ietf.org/rfc/rfc4122.txt
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
                uuid = [],
                i;
            radix = radix || chars.length;

            if (length) {
                for (i = 0; i < length; i++) uuid[i] = chars[0 | Math.random() * radix];
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
    }


    var date = {

        format: function () {}

    }

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
        }
    }

    /**
     * Descrição para o objeto String no arquivo types.js
     *
     * @class String
     * @static
     */
    var string = {

        format: function (str, args) {
            return str.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        },
        contains: function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        },
        fromKeyPress: function (keyCode) {

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

                '191': '/?',
                '192': '`~',


            };

            return keys[keyCode];
        }

    }

    var graphic = {

        mousePosition: function (element, x, y) {

            var bb = element.getBoundingClientRect();

            x = (x - bb.left) * (element.clientWidth / bb.width);
            y = (y - bb.top) * (element.clientHeight / bb.height);

            // tradução para o sistema de coordenadas cartesiano
            y = (y - element.clientHeight) * -1;
            // Y - INVERTIDO

            return {
                x: x,
                y: y
            };
        },

        //        ATENÇÃO - quando context.transform() a inversão não é feita
        //        canvasPosition: function (element, x, y) {
        //            var bb = element.getBoundingClientRect();
        //
        //            x = (x - bb.left) * (element.clientWidth / bb.width);
        //            y = (y - bb.top) * (element.clientHeight / bb.height);
        //
        //            return {
        //                x: x,
        //                y: y
        //            };
        //        }

    }

    var data = {

        dictionary: (function () {

            function Dictionary() {
                this.store = [];
            }

            Dictionary.prototype = {
                add: function (key, value) {
                    return this.store[key] = value;
                },
                update: function (key, value) {
                    return this.store[key] = value;
                },
                find: function (key) {
                    return this.store[key];
                },
                remove: function (key) {
                    delete this.store[key];
                },
                count: function () {
                    return Object.keys(this.store).length;
                },
                clear: function () {
                    return this.store = new Array();
                },
                list: function () {
                    var self = this;
                    return Object.keys(this.store).map(function (key) {
                        return self.store[key];
                    });
                }
            }

            Dictionary.create = function () {
                return new Dictionary();
            }

            return Dictionary;
        })(),

        list: (function () {

            function List() {
                this.store = [];
                this.size = 0;
                this.position = 0;
            }

            List.prototype = {
                add: function (element) {
                    this.store[this.size++] = element;
                },
                find: function (element) {
                    for (var i = 0; i < this.store.length; ++i) {
                        if (this.store[i] == element) {
                            return i;
                        }
                    }
                    return -1;
                },
                remove: function (element) {
                    var foundAt = this.find(element);
                    if (foundAt > -1) {
                        this.store.splice(foundAt, 1);
                        --this.size;
                        return true;
                    }
                    return false;
                },
                contains: function (element) {
                    for (var i = 0; i < this.store.length; ++i) {
                        if (this.store[i] == element) {
                            return true;
                        }
                    }
                    return false;
                },
                length: function () {
                    return this.size;
                },
                clear: function () {
                    delete this.store;
                    this.store = [];
                    this.size = this.position = 0;
                },
                list: function () {
                    return this.store;
                },
                first: function () {
                    this.position = 0;
                },
                last: function () {
                    this.position = this.size - 1;
                },
                previous: function () {
                    if (this.position > 0) {
                        --this.position;
                    }
                },
                next: function () {
                    if (this.position < this.size - 1) {
                        ++this.position;
                    }
                },
                currentPosition: function () {
                    return this.position;
                },
                moveTo: function (position) {
                    this.position = position;
                },
                getElement: function () {
                    return this.store[this.position];
                }
            }

            List.create = function () {
                return new List();
            }

            return List;

        })()

    }

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
            for (var i = obj.length >>> 0; i--;) {
                array[i] = obj[i];
            }
            return array;
        }
    }

    var object = {
        inherits: function (f, p) {
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
                if (o.hasOwnProperty[prop]) continue; // Except those already in o
                o[prop] = p[prop]; // add the property to o
            }
            return o;
        },
        /*
         * Remove properties from o if there is not a property with the same name in p
         * Return o
         */
        restrict: function (o, p) {
            for (var prop in o) { // For all props in o
                if (!(prop in p)) delete o[prop]; // remove if not in p
            }
            return o;
        },
        /*
         * For each property of p, remove the property with the same name from o
         * Return o
         */
        subtract: function (o, p) {
            for (var prop in p) { // For all props in p
                delete o[prop]; // remove from o (deleting a nonexistent prop is harmless)
            }
            return o;
        },
        /* 
         * Return a new object that holds the properties of both o and p.
         * If o and p have properties by the same name, the values from o are used
         */
        union: function (o, p) {
            return object.extend(object.extend({}, o), p);
        },
        /*
         * Return a new object that holds only the properties of o that also appear
         * in p. This is something like the intersection of o and p, but the values of
         * the properties in p are discarded
         */
        intersection: function (o, p) {
            return object.restrict(object.extend({}, o), p);
        },
        /*
         * Return an array that holds the names of the enumerable own properties of o
         */
        keys: function (o) {
            if (typeof o !== "object") throw typeError(); // Object argument required
            var result = []; // The array we will return
            for (var prop in o) { // For all enumerable properties
                if (o.hasOwnProperty(prop)) // If it is an own property
                    result.push(prop); // add it to the array.
            }
            return result; // Return the array.
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
            }

            return Event;

        })()
    }



    exports.thread = thread;
    exports.application = application;
    exports.math = math;
    exports.string = string;
    exports.array = array;
    exports.graphic = graphic;
    exports.data = data;
    exports.date = date;
    exports.object = object;
    exports.conversion = conversion;
});