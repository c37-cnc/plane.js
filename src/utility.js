Plane.Utility = (function (Plane) {
    "use strict";

    return {
        Uuid: function (length, radix) {

            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
                uuid = [],
                i;
            radix = radix || chars.length;

            if (length) {
                // Compact form
                for (i = 0; i < length; i++) uuid[i] = chars[0 | Math.random() * radix];
            } else {
                // rfc4122, version 4 form
                var r;

                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                // Fill in random data.  At i==19 set the high bits of clock sequence as
                // per rfc4122, sec. 4.1.5
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }

            return uuid.join('').toLowerCase();
        },
        Event: (function () {

            function Event() {
                this.listeners = {};
            }

            Event.prototype.addEventListener = function (event, handler) {
                if (this.listeners[event] === undefined) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(handler);
            };

            Event.prototype.dispatchEvent = function (event, data) {
                if (this.listeners[event] !== undefined) {
                    for (var callback in this.listeners[event]) {
                        this.listeners[event][callback].call(this, data);
                    }
                }
            };

            Event.prototype.removeEventListener = function (event, handler) {
                if (this.listeners[event] !== undefined) {
                    var index = this.listeners[event].indexOf(handler);
                    if (index !== -1) {
                        this.listeners[event].splice(index, 1);
                    }
                }
            };

            return Event;

        })(),
        Dictionary: (function () {

            function Dictionary() {
                this.store = new Array();
            }

            Dictionary.prototype = {
                add: function (key, value) {
                    this.store[key] = value;
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
                list: function () {
                    var self = this;
                    return Object.keys(this.store).map(function (key) {
                        return self.store[key];
                    });
                }
            }

            return Dictionary;

        })(),
        Graphic: {
            mousePosition: function (element, position) {
                var bb = element.getBoundingClientRect();

                var x = (position.x - bb.left) * (element.clientWidth / bb.width);
                var y = (position.y - bb.top) * (element.clientHeight / bb.height);

                // tradução para o sistema de coordenadas cartesiano
                y = (y - element.clientHeight) * -1;

                return {
                    x: x,
                    y: y
                };
            },
            intersectionLine: function (a1, a2, b1, b2) {
                var uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
                    ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
                    uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
                if (uB !== 0) {
                    var ua = uaT / uB,
                        ub = ubT / uB;
                    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                        var xxx = (a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y));
                        
                        console.log('Intersection');
                        
//                        result = new Intersection('Intersection');
//                        result.points.push(new fabric.Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
                    } else {
                        var zzz = 'aa';
//                        result = new Intersection();
                    }
                } else {
                    if (uaT === 0 || ubT === 0) {
                        var sss = 'Coincident';
//                        result = new Intersection('Coincident');
                    } else {
                        var ttt = 'Parallel';
//                        result = new Intersection('Parallel');
                    }
                }
                return true;

            }
        },
        Object: {
            merge: function (first, second) {
                if (first == null || second == null)
                    return first;

                for (var key in second)
                    if (second.hasOwnProperty(key))
                        first[key] = second[key];

                return first;
            },
        }
    }

})(Plane);