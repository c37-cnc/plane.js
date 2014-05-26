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
            intersectionLine: function (A, B, C, D) {

                function ccw(A, B, C) {
                    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
                }

                var xxx = ccw(A, C, D) != ccw(B, C, D) && ccw(A, B, C) != ccw(A, B, D);

                if (xxx) {
                    console.log('Intersection');
                }

                //                def ccw(A, B, C): return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x)
                //
                //                def intersect(A, B, C, D): return ccw(A, C, D) != ccw(B, C, D) and ccw(A, B, C) != ccw(A, B, D)

                return xxx;

                //            intersectionLine: function (a1, a2, b1, b2) {

                //                var uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
                //                    ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
                //                    uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
                //                if (uB !== 0) {
                //                    var ua = uaT / uB,
                //                        ub = ubT / uB;
                //                    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                //                        var xxx = (a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y));
                //                        
                //                        console.log('Intersection');
                //                        
                ////                        result = new Intersection('Intersection');
                ////                        result.points.push(new fabric.Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
                //                    } else {
                //                        var zzz = 'aa';
                ////                        result = new Intersection();
                //                    }
                //                } else {
                //                    if (uaT === 0 || ubT === 0) {
                //                        var sss = 'Coincident';
                ////                        result = new Intersection('Coincident');
                //                    } else {
                //                        var ttt = 'Parallel';
                ////                        result = new Intersection('Parallel');
                //                    }
                //                }
                //                return true;

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
        },
        String: (function () {

            if (!String.prototype.format) {
                String.prototype.format = function () {
                    var args = arguments;
                    return this.replace(/{(\d+)}/g, function (match, number) {
                        return typeof args[number] != 'undefined' ? args[number] : match;
                    });
                };
            }

            if (!String.prototype.contains) {
                String.prototype.contains = function () {
                    return String.prototype.indexOf.apply(this, arguments) !== -1;
                };
            }

        })(),
        Import: {
            fromDxf: function (stringDxf) {
                "use strict";

                function aaaa(dxfObject) {

                    switch (dxfObject.type) {
                    case 'LINE':
                        {
                            var line = '{ "type": "line", "x": [{0}, {1}], "y": [{2}, {3}] }';
                            return line.format(dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1);
                        }
                    case 'CIRCLE':
                        {
                            var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} }';
                            return circle.format(dxfObject.x, dxfObject.y, dxfObject.r);
                        }
                    case 'ARC':
                        {
                            var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2},"startAngle": {3}, "endAngle": {4}, "clockWise": {5} }';
                            return arc.format(dxfObject.x, dxfObject.y, dxfObject.r, dxfObject.a0, dxfObject.a1, false);
                        }
                    }

                }


                function dxfObjectToSvgSnippet(dxfObject) {
                    function getLineSvg(x1, y1, x2, y2) {
                        return '<path d="M{0},{1} {2},{3}"/>\n'.format(x1, y1, x2, y2);
                    }

                    function deg2rad(deg) {
                        return deg * (Math.PI / 180);
                    }

                    switch (dxfObject.type) {
                    case 'LINE':
                        return getLineSvg(dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1);
                    case 'CIRCLE':
                        return '<circle cx="{0}" cy="{1}" r="{2}"/>\n'.format(dxfObject.x, dxfObject.y, dxfObject.r);
                    case 'ARC':
                        var x1 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a0));
                        var y1 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a0));
                        var x2 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a1));
                        var y2 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a1));

                        if (dxfObject.a1 < dxfObject.a0) {
                            dxfObject.a1 += 360;
                        }
                        var largeArcFlag = dxfObject.a1 - dxfObject.a0 > 180 ? 1 : 0;

                        return '<path d="M{0},{1} A{2},{3} 0 {4},1 {5},{6}"/>\n'.format(x1, y1, dxfObject.r, dxfObject.r, largeArcFlag, x2, y2);
                    case 'LWPOLYLINE':
                        var svgSnippet = '';
                        var vertices = dxfObject.vertices;
                        for (var i = 0; i < vertices.length - 1; i++) {
                            var vertice1 = vertices[i];
                            var vertice2 = vertices[i + 1];
                            svgSnippet += getLineSvg(vertice1.x, vertice1.y, vertice2.x, vertice2.y);
                        }
                        return svgSnippet;
                    }
                }

                var groupCodes = {
                    0: 'entityType',
                    2: 'blockName',
                    10: 'x',
                    11: 'x1',
                    20: 'y',
                    21: 'y1',
                    40: 'r',
                    50: 'a0',
                    51: 'a1'
                };

                var supportedEntities = ['LINE', 'CIRCLE', 'ARC', 'LWPOLYLINE'];

                var counter = 0;
                var code = null;
                var isEntitiesSectionActive = false;
                var object = {};
                var svg = '',
                    json = '[';

                // Normalize platform-specific newlines.
                stringDxf = stringDxf.replace(/\r\n/g, '\n');
                stringDxf = stringDxf.replace(/\r/g, '\n');

                stringDxf.split('\n').forEach(function (line) {
                    line = line.trim();

                    if (counter++ % 2 === 0) {
                        code = parseInt(line);
                    } else {
                        var value = line;
                        var groupCode = groupCodes[code];
                        if (groupCode === 'blockName' && value === 'ENTITIES') {
                            isEntitiesSectionActive = true;
                        } else if (isEntitiesSectionActive) {
                            if (groupCode === 'entityType') { // New entity starts.
                                if (object.type) {
                                    json += json.substring(json.length - 1, json.length) == '[' ? '' : ',';
                                    json += aaaa(object);
                                }

                                object = supportedEntities.indexOf(value) > -1 ? {
                                    type: value
                                } : {};

                                if (value === 'ENDSEC') {
                                    isEntitiesSectionActive = false;
                                }
                            } else if (object.type && typeof groupCode !== 'undefined') { // Known entity property recognized.
                                object[groupCode] = parseFloat(value);

                                if (object.type == 'LWPOLYLINE' && groupCode === 'y') {
                                    if (!object.vertices) {
                                        object.vertices = [];
                                    }
                                    object.vertices.push({
                                        x: object.x,
                                        y: object.y
                                    });
                                }
                            }
                        }
                    }
                });

                return json += ']';

            }
        }
    }

})(Plane);