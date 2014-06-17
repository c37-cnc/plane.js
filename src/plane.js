window.Plane = (function (window, document, math) {
    "use strict";

    var version = '2.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var layerStore = null,
        renderStore = null,
        toolStore = null;

    var shapeStore = null,
        groupStore = null;

    var viewPort = null,
        settings = null;


    // ####Douglas Crockford's "method"
    //
    Function.prototype.method = function (name, func) {
        this.prototype[name] = func;
        return this;
    };

    // ####Douglas Crockford's "inherits"
    //
    Function.method('inherits', function (parent) {
        this.prototype = new parent();
        var d = {},
            p = this.prototype;
        this.prototype.constructor = parent;
        return this;
    });


    function gridDraw(enabled, width, height, color) {

        if (!enabled) return;

        Plane.Layer.Create({
            system: true
        });

        for (var xActual = 0; xActual < width; xActual += 50) {
            Plane.Shape.Create({
                type: 'line',
                x: [xActual, 0],
                y: [xActual, height],
                style: {
                    lineColor: color,
                    lineWidth: .6
                }
            });

            for (var xInternalSub = 1; xInternalSub <= 4; xInternalSub++) {
                // small part = 50/5 = 10px espaço entre as linhas
                var xActualSub = Math.round(xActual + 10 * xInternalSub);

                // como é somado + 10 (afrente) para fazer as sub-linhas
                // verifico se não ultrapassou o width
                //            if (xActualSub > width) {
                //                break;
                //            }

                Plane.Shape.Create({
                    type: 'line',
                    x: [xActualSub, 0],
                    y: [xActualSub, height],
                    style: {
                        lineColor: color,
                        lineWidth: .3
                    }
                });
            }
        }

        // + 40 = fim linha acima
        for (var yActual = 0; yActual < height + 40; yActual += 50) {
            Plane.Shape.Create({
                type: 'line',
                x: [0, yActual],
                y: [width, yActual],
                style: {
                    lineColor: color,
                    lineWidth: .6
                }
            });

            // 10/20/30/40 = 4 linhas internas
            for (var yInternalSub = 1; yInternalSub <= 4; yInternalSub++) {
                // small part = 50/5 = 10px espaço entre as linhas
                var yActualSub = Math.round(yActual - 10 * yInternalSub);

                // como é subtraido - 10 (atrás/acima) para fazer as sub-linhas
                // verifico se não ultrapassou o height
                //            if (yActualSub < 0) {
                //                break;
                //            }

                Plane.Shape.Create({
                    type: 'line',
                    x: [0, yActualSub],
                    y: [width, yActualSub],
                    style: {
                        lineColor: color,
                        lineWidth: .3
                    }
                });
            }
        }
        Plane.Render.Update();
    };


    var utility = (function () {

        var utility = {
            math: {
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
                }
            },
            object: {
                merge: function (first, second) {
                    if (first == null || second == null)
                        return first;

                    for (var key in second)
                        if (second.hasOwnProperty(key))
                            first[key] = second[key];

                    return first;
                },
                extend: function (base, object) {
                    var obj = new base();
                    for (var prop in object)
                        obj[prop] = object[prop];
                    return obj;
                },
                inherit: (function () {

                })(),
                event: (function () {

                    function Event() {
                        this.listeners = {};
                    }

                    Event.prototype.listen = function (event, handler) {
                        if (this.listeners[event] === undefined) {
                            this.listeners[event] = [];
                        }
                        this.listeners[event].push(handler);
                    };

                    Event.prototype.notify = function (event, data) {
                        if (this.listeners[event] !== undefined) {
                            for (var callback in this.listeners[event]) {
                                this.listeners[event][callback].call(this, data);
                            }
                        }
                    };

                    Event.prototype.unlisten = function (event, handler) {
                        if (this.listeners[event] !== undefined) {
                            var index = this.listeners[event].indexOf(handler);
                            if (index !== -1) {
                                this.listeners[event].splice(index, 1);
                            }
                        }
                    };

                    return Event;
                })(),
                dictionary: (function () {

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
                })()
            },
            graphic: {
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
                }
            },
            geometry: {
                polynomial: (function () {

                    function Polynomial() {
                        this.init(arguments);
                    }


                    Polynomial.prototype.init = function (coefs) {
                        this.coefs = new Array();

                        for (var i = coefs.length - 1; i >= 0; i--)
                            this.coefs.push(coefs[i]);

                        this._variable = "t";
                        this._s = 0;
                    };

                    Polynomial.prototype.simplify = function () {
                        for (var i = this.getDegree(); i >= 0; i--) {
                            if (Math.abs(this.coefs[i]) <= Polynomial.TOLERANCE)
                                this.coefs.pop();
                            else
                                break;
                        }
                    };

                    Polynomial.prototype.getDegree = function () {
                        return this.coefs.length - 1;
                    };

                    Polynomial.prototype.getLinearRoot = function () {
                        var result = new Array();
                        var a = this.coefs[1];

                        if (a != 0)
                            result.push(-this.coefs[0] / a);

                        return result;
                    };

                    Polynomial.prototype.getQuadraticRoots = function () {
                        var results = new Array();

                        if (this.getDegree() == 2) {
                            var a = this.coefs[2];
                            var b = this.coefs[1] / a;
                            var c = this.coefs[0] / a;
                            var d = b * b - 4 * c;

                            if (d > 0) {
                                var e = Math.sqrt(d);

                                results.push(0.5 * (-b + e));
                                results.push(0.5 * (-b - e));
                            } else if (d == 0) {
                                // really two roots with same value, but we only return one
                                results.push(0.5 * -b);
                            }
                        }

                        return results;
                    };

                    Polynomial.prototype.getCubicRoots = function () {
                        var results = new Array();

                        if (this.getDegree() == 3) {
                            var c3 = this.coefs[3];
                            var c2 = this.coefs[2] / c3;
                            var c1 = this.coefs[1] / c3;
                            var c0 = this.coefs[0] / c3;

                            var a = (3 * c1 - c2 * c2) / 3;
                            var b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
                            var offset = c2 / 3;
                            var discrim = b * b / 4 + a * a * a / 27;
                            var halfB = b / 2;

                            if (Math.abs(discrim) <= Polynomial.TOLERANCE) discrim = 0;

                            if (discrim > 0) {
                                var e = Math.sqrt(discrim);
                                var tmp;
                                var root;

                                tmp = -halfB + e;
                                if (tmp >= 0)
                                    root = Math.pow(tmp, 1 / 3);
                                else
                                    root = -Math.pow(-tmp, 1 / 3);

                                tmp = -halfB - e;
                                if (tmp >= 0)
                                    root += Math.pow(tmp, 1 / 3);
                                else
                                    root -= Math.pow(-tmp, 1 / 3);

                                results.push(root - offset);
                            } else if (discrim < 0) {
                                var distance = Math.sqrt(-a / 3);
                                var angle = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
                                var cos = Math.cos(angle);
                                var sin = Math.sin(angle);
                                var sqrt3 = Math.sqrt(3);

                                results.push(2 * distance * cos - offset);
                                results.push(-distance * (cos + sqrt3 * sin) - offset);
                                results.push(-distance * (cos - sqrt3 * sin) - offset);
                            } else {
                                var tmp;

                                if (halfB >= 0)
                                    tmp = -Math.pow(halfB, 1 / 3);
                                else
                                    tmp = Math.pow(-halfB, 1 / 3);

                                results.push(2 * tmp - offset);
                                // really should return next root twice, but we return only one
                                results.push(-tmp - offset);
                            }
                        }

                        return results;
                    };

                    Polynomial.prototype.getQuarticRoots = function () {
                        var results = new Array();

                        if (this.getDegree() == 4) {
                            var c4 = this.coefs[4];
                            var c3 = this.coefs[3] / c4;
                            var c2 = this.coefs[2] / c4;
                            var c1 = this.coefs[1] / c4;
                            var c0 = this.coefs[0] / c4;

                            var resolveRoots = new Polynomial(
                                1, -c2, c3 * c1 - 4 * c0, -c3 * c3 * c0 + 4 * c2 * c0 - c1 * c1
                            ).getCubicRoots();
                            var y = resolveRoots[0];
                            var discrim = c3 * c3 / 4 - c2 + y;

                            if (Math.abs(discrim) <= Polynomial.TOLERANCE) discrim = 0;

                            if (discrim > 0) {
                                var e = Math.sqrt(discrim);
                                var t1 = 3 * c3 * c3 / 4 - e * e - 2 * c2;
                                var t2 = (4 * c3 * c2 - 8 * c1 - c3 * c3 * c3) / (4 * e);
                                var plus = t1 + t2;
                                var minus = t1 - t2;

                                if (Math.abs(plus) <= Polynomial.TOLERANCE) plus = 0;
                                if (Math.abs(minus) <= Polynomial.TOLERANCE) minus = 0;

                                if (plus >= 0) {
                                    var f = Math.sqrt(plus);

                                    results.push(-c3 / 4 + (e + f) / 2);
                                    results.push(-c3 / 4 + (e - f) / 2);
                                }
                                if (minus >= 0) {
                                    var f = Math.sqrt(minus);

                                    results.push(-c3 / 4 + (f - e) / 2);
                                    results.push(-c3 / 4 - (f + e) / 2);
                                }
                            } else if (discrim < 0) {
                                // no roots
                            } else {
                                var t2 = y * y - 4 * c0;

                                if (t2 >= -Polynomial.TOLERANCE) {
                                    if (t2 < 0) t2 = 0;

                                    t2 = 2 * Math.sqrt(t2);
                                    t1 = 3 * c3 * c3 / 4 - 2 * c2;
                                    if (t1 + t2 >= Polynomial.TOLERANCE) {
                                        var d = Math.sqrt(t1 + t2);

                                        results.push(-c3 / 4 + d / 2);
                                        results.push(-c3 / 4 - d / 2);
                                    }
                                    if (t1 - t2 >= Polynomial.TOLERANCE) {
                                        var d = Math.sqrt(t1 - t2);

                                        results.push(-c3 / 4 + d / 2);
                                        results.push(-c3 / 4 - d / 2);
                                    }
                                }
                            }
                        }

                        return results;
                    };

                    Polynomial.prototype.getRoots = function () {
                        var result;

                        this.simplify();
                        switch (this.getDegree()) {
                        case 0:
                            result = new Array();
                            break;
                        case 1:
                            result = this.getLinearRoot();
                            break;
                        case 2:
                            result = this.getQuadraticRoots();
                            break;
                        case 3:
                            result = this.getCubicRoots();
                            break;
                        case 4:
                            result = this.getQuarticRoots();
                            break;
                        default:
                            result = new Array();
                            // should try Newton's method and/or bisection
                        }

                        return result;
                    };

                    return Polynomial;

                })(),
                intersection: {
                    bezout: function (e1, e2) {
                        var AB = e1[0] * e2[1] - e2[0] * e1[1];
                        var AC = e1[0] * e2[2] - e2[0] * e1[2];
                        var AD = e1[0] * e2[3] - e2[0] * e1[3];
                        var AE = e1[0] * e2[4] - e2[0] * e1[4];
                        var AF = e1[0] * e2[5] - e2[0] * e1[5];
                        var BC = e1[1] * e2[2] - e2[1] * e1[2];
                        var BE = e1[1] * e2[4] - e2[1] * e1[4];
                        var BF = e1[1] * e2[5] - e2[1] * e1[5];
                        var CD = e1[2] * e2[3] - e2[2] * e1[3];
                        var DE = e1[3] * e2[4] - e2[3] * e1[4];
                        var DF = e1[3] * e2[5] - e2[3] * e1[5];
                        var BFpDE = BF + DE;
                        var BEmCD = BE - CD;

                        return new utility.geometry.polynomial(
                            AB * BC - AC * AC,
                            AB * BEmCD + AD * BC - 2 * AC * AE,
                            AB * BFpDE + AD * BEmCD - AE * AE - 2 * AC * AF,
                            AB * DF + AD * BFpDE - 2 * AE * AF,
                            AD * DF - AF * AF
                        );
                    },
                    circleLine: function (c, r, a1, a2) {
                        var result,
                            a = (a2.x - a1.x) * (a2.x - a1.x) + (a2.y - a1.y) * (a2.y - a1.y),
                            b = 2 * ((a2.x - a1.x) * (a1.x - c.x) + (a2.y - a1.y) * (a1.y - c.y)),
                            cc = c.x * c.x + c.y * c.y + a1.x * a1.x + a1.y * a1.y - 2 * (c.x * a1.x + c.y * a1.y) - r * r,
                            deter = b * b - 4 * a * cc;

                        if (deter < 0) {
                            result = false;
                        } else if (deter == 0) {
                            result = false;
                        } else {
                            var e = Math.sqrt(deter),
                                u1 = (-b + e) / (2 * a),
                                u2 = (-b - e) / (2 * a);

                            if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
                                if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
                                    result = false;
                                } else {
                                    result = false;
                                }
                            } else {
                                result = true;
                            }
                        }
                        return result;
                    },
                    circleRectangle: function (c, r, p, h, w) {

                        var rightBottom = Point.Create(p.x + w, p.y),
                            rightTop = Point.Create(p.x + w, p.y + h),
                            leftTop = Point.Create(p.x, p.y + h),
                            leftBottom = Point.Create(p.x, p.y);

                        var inter1 = this.circleLine(c, r, rightBottom, rightTop);
                        var inter2 = this.circleLine(c, r, rightTop, leftTop);
                        var inter3 = this.circleLine(c, r, leftTop, leftBottom);
                        var inter4 = this.circleLine(c, r, leftBottom, rightBottom);

                        return inter1 || inter2 || inter3 || inter4;
                    },
                    circleCircle: function (c1, r1, c2, r2) {
                        var result;

                        // Determine minimum and maximum radii where circles can intersect
                        var r_max = r1 + r2;
                        var r_min = math.abs(r1 - r2);

                        // Determine actual distance between circle circles
                        var c_dist = c1.distanceTo(c2);

                        if (c_dist > r_max) {
                            result = false;
                        } else if (c_dist < r_min) {
                            result = false;
                        } else {
                            result = {
                                points: []
                            };

                            var a = (r1 * r1 - r2 * r2 + c_dist * c_dist) / (2 * c_dist);
                            var h = math.sqrt(r1 * r1 - a * a);
                            var p = c1.interpolationLinear(c2, a / c_dist);
                            var b = h / c_dist;

                            result.points.push(Point.Create(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x)));
                            result.points.push(Point.Create(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x)));

                        }

                        return result;
                    },
                    circleArc: function (c, r1, ca, r2, as, ae, ck) {

                        var intersection = this.circleCircle(c, r1, ca, r2);

                        if (intersection.points) {

                            var radianStart = as / 360 * 2 * math.PI,
                                radianEnd = ae / 360 * 2 * math.PI,
                                radianMid = radianStart > radianEnd ? (radianStart - radianEnd) / 2 : (radianEnd - radianStart) / 2;

                            var pointStart = Point.Create(ca.x + math.cos(radianStart) * r2, ca.y + math.sin(radianStart) * r2),
                                pointEnd = Point.Create(ca.x + math.cos(radianEnd) * r2, ca.y + math.sin(radianEnd) * r2),
                                pointMid = Point.Create(ca.x + math.cos(radianMid) * r2, ck ? ca.y - math.sin(radianMid) * r2 : ca.y + math.sin(radianMid) * r2);

                            var twoPi = (math.PI + math.PI);

                            for (var i = 0; i <= intersection.points.length - 1; i++) {

                                var pointDistance = intersection.points[i].distanceTo(ca),
                                    radius = r2;

                                if (radius - 4 <= pointDistance && pointDistance <= radius + 4) {

                                    var pointStartAngle = ca.angleTo(pointStart),
                                        pointMidAngle = ca.angleTo(pointMid),
                                        pointEndAngle = ca.angleTo(pointEnd),
                                        pointMouseAngle = ca.angleTo(intersection.points[i]);

                                    if (pointStartAngle <= pointMidAngle && pointMidAngle <= pointEndAngle) {
                                        if (ck) {
                                            return (pointStartAngle <= pointMouseAngle && pointMouseAngle <= pointEndAngle) ? true : false;
                                        } else {
                                            return (pointStartAngle <= pointMouseAngle && pointMouseAngle <= pointEndAngle) ? false : true;
                                        }
                                    } else if (pointEndAngle <= pointMidAngle && pointMidAngle <= pointStartAngle) {
                                        if (ck) {
                                            return (pointEndAngle <= pointMouseAngle && pointMouseAngle <= pointStartAngle) ? true : false;
                                        } else {
                                            return (pointEndAngle <= pointMouseAngle && pointMouseAngle <= pointStartAngle) ? false : true;
                                        }
                                    } else if (pointStartAngle <= pointMidAngle && pointEndAngle <= pointMidAngle) {
                                        if (pointStartAngle < pointEndAngle) {
                                            if (ck) {
                                                return (pointStartAngle < pointMouseAngle && pointMouseAngle < pointEndAngle) ? false : true;
                                            } else {
                                                return (pointStartAngle < pointMouseAngle && pointMouseAngle < pointEndAngle) ? true : false;
                                            }
                                        } else if (pointEndAngle < pointStartAngle) {
                                            return (pointEndAngle < pointMouseAngle && pointMouseAngle < pointStartAngle) ? false : true;
                                        }
                                    } else if (pointMidAngle <= pointStartAngle && pointMidAngle <= pointEndAngle) {
                                        if (pointStartAngle < pointEndAngle) {
                                            if (ck) {
                                                return (pointStartAngle < pointMouseAngle && pointMouseAngle < pointEndAngle) ? false : true;
                                            } else {
                                                return (pointStartAngle < pointMouseAngle && pointMouseAngle < pointEndAngle) ? true : false;
                                            }
                                        } else if (pointEndAngle < pointStartAngle) {
                                            return (pointEndAngle < pointMouseAngle && pointMouseAngle < pointStartAngle) ? false : true;
                                        }
                                    }

                                }
                                return false;
                            };
                        }
                        return false;
                    },
                    circleEllipse: function (c1, ry1, rx1, c2, ry2, rx2) {

                        var a = [ry1 * ry1, 0, rx1 * rx1, -2 * ry1 * ry1 * c1.x, -2 * rx1 * rx1 * c1.y, ry1 * ry1 * c1.x * c1.x + rx1 * rx1 * c1.y * c1.y - rx1 * rx1 * ry1 * ry1];
                        var b = [ry2 * ry2, 0, rx2 * rx2, -2 * ry2 * ry2 * c2.x, -2 * rx2 * rx2 * c2.y, ry2 * ry2 * c2.x * c2.x + rx2 * rx2 * c2.y * c2.y - rx2 * rx2 * ry2 * ry2];

                        var yPoly = this.bezout(a, b);
                        var yRoots = yPoly.getRoots();
                        var epsilon = 1e-3;
                        var norm0 = (a[0] * a[0] + 2 * a[1] * a[1] + a[2] * a[2]) * epsilon;
                        var norm1 = (b[0] * b[0] + 2 * b[1] * b[1] + b[2] * b[2]) * epsilon;

                        for (var y = 0; y < yRoots.length; y++) {
                            var xPoly = new utility.geometry.polynomial(
                                a[0],
                                a[3] + yRoots[y] * a[1],
                                a[5] + yRoots[y] * (a[4] + yRoots[y] * a[2])
                            );
                            var xRoots = xPoly.getRoots();

                            for (var x = 0; x < xRoots.length; x++) {
                                var test =
                                    (a[0] * xRoots[x] + a[1] * yRoots[y] + a[3]) * xRoots[x] +
                                    (a[2] * yRoots[y] + a[4]) * yRoots[y] + a[5];
                                if (Math.abs(test) < norm0) {
                                    test =
                                        (b[0] * xRoots[x] + b[1] * yRoots[y] + b[3]) * xRoots[x] +
                                        (b[2] * yRoots[y] + b[4]) * yRoots[y] + b[5];
                                    if (Math.abs(test) < norm1) {
                                        return true;
                                    }
                                }
                            }
                        }
                        return false;
                    }
                }
            },
            string: (function () {

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
            import: {
                fromJson: null,
                fromSvg: null,
                fromDxf: function (stringDxf) {

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
                        case 'ELLIPSE':
                            {
                                var ellipse = '{"type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2},"radiusX": {3} }',
                                    radiusX = math.abs(dxfObject.x1),
                                    radiusY = radiusX * dxfObject.r;

                                return ellipse.format(dxfObject.x, dxfObject.y, radiusY, radiusX);
                            }
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
                        51: 'a1',
                    };

                    var supportedEntities = ['LINE', 'CIRCLE', 'ARC', 'ELLIPSE'];

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
                                }
                            }
                        }
                    });

                    return json += ']';
                },
                fromDwg: null
            },
            export: {
                toJson: null,
                toSvg: null,
                toDxf: null,
                toPng: null,
                toPdf: null
            }
        };

        return utility;

    })();


    var Layer = (function () {

        function Layer(attrs) {

            this.uuid = attrs.uuid;
            this.name = attrs.name;
            this.locked = attrs.locked;
            this.visible = attrs.visible;
            this.system = attrs.system;
            this.style = attrs.style;

        }
        Layer.prototype = new utility.object.event();

        Layer.prototype.toJson = function () {
            return JSON.stringify(this).replace(/_/g, '');
        }

        return {
            Create: function (uuid, name, style, system) {

                var attrs = {
                    uuid: uuid,
                    name: name,
                    style: style,
                    locked: false,
                    visible: true,
                    system: system
                };

                return new Layer(attrs);
            }
        };
    })();

    var Point = (function () {

        function Point(x, y) {
            this.x = x;
            this.y = y;
        };

        //        Point.prototype = {
        //            operations: {
        //
        //            },
        //            measures: {
        //
        //            },
        //            functions: {
        //
        //            }
        //        }

        Point.prototype.sum = function (point) {
            return new Point(this.x + point.x, this.y + point.y);
        };
        Point.prototype.subtract = function (point) {
            return new Point(this.x - point.x, this.y - point.y);
        };

        Point.prototype.distanceTo = function (point) {
            var dx = this.x - point.x;
            var dy = this.y - point.y;

            return math.sqrt(dx * dx + dy * dy);
        };
        Point.prototype.midTo = function (point) {
            return new Point(this.x + (point.x - this.x) / 2, this.y + (point.y - this.y) / 2);
        }
        Point.prototype.angleTo = function (point) {
            return math.atan2(point.y - this.y, point.x - this.x);
        };

        // Returns new point which is the result of linear interpolation with this one and another one
        Point.prototype.interpolationLinear = function (point, value) {
            return new Point(
                this.x + (point.x - this.x) * value,
                this.y + (point.y - this.y) * value
            );
        };

        return {
            Create: function (x, y) {
                return new Point(x, y);
            }
        }
    })();

    var Shape = (function () {

        function Shape(uuid, name, locked, visible, selected) {

            this.uuid = uuid;
            this.name = name;
            this.locked = locked;
            this.visible = visible;
            this.selected = selected;

        };
        Shape.prototype = {
            rotate: function (value) {
                return true;
            },
            scale: function (value) {
                return this;
            },
            move: function (point) {
                return true;
            },
            contains: function (pointActual) {

                var pointOrigin,
                    pointDestination,
                    pointIntersection = 0;


                switch (this.type) {
                case 'line':
                    {

                        //debugger;
                        pointOrigin = this.points[0];
                        pointDestination = this.points[1];

                        if (utility.geometry.intersection.circleLine(pointActual, 2, pointOrigin, pointDestination))
                            return true;

                        break;
                    }
                case 'rectangle':
                    {
                        if (utility.geometry.intersection.circleRectangle(pointActual, 2, this.point, this.height, this.width))
                            return true;

                        break;
                    }
                case 'arc':
                    {
                        if (utility.geometry.intersection.circleArc(pointActual, 2, this.point, this.radius, this.startAngle, this.endAngle, this.clockWise))
                            return true;

                        break;
                    }
                case 'circle':
                    {
                        if (utility.geometry.intersection.circleCircle(pointActual, 2, this.point, this.radius))
                            return true;

                        break;
                    }
                case 'ellipse':
                    return (utility.geometry.intersection.circleEllipse(pointActual, 2, 2, this.point, this.radiusY, this.radiusX))
                case 'polygon':
                    {
                        for (var i = 0; i < this.points.length; i++) {

                            if (i + 1 == this.points.length) {
                                pointOrigin = this.points[i];
                                pointDestination = this.points[0];
                            } else {
                                pointOrigin = this.points[i];
                                pointDestination = this.points[i + 1];
                            }

                            if (utility.geometry.intersection.circleLine(pointActual, 2, pointOrigin, pointDestination))
                                return true;
                        }
                        break;
                    }
                default:
                    break;
                }

                return false;
            },
            toJson: function () {
                return JSON.stringify(this);
            }
        };

        function Arc(attrs) {
            this.type = 'arc';
            this.point = attrs.point;
            this.radius = attrs.radius;
            this.startAngle = attrs.startAngle;
            this.endAngle = attrs.endAngle;
            this.clockWise = attrs.clockWise;
            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        };
        Arc.prototype = Shape.prototype;

        function Circle(attrs) {
            this.type = 'circle';
            this.point = attrs.point;
            this.radius = attrs.radius;
            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Circle.prototype = Shape.prototype;

        function Ellipse(attrs) {
            this.type = 'ellipse';
            this.point = attrs.point;
            this.radiusY = attrs.radiusY;
            this.radiusX = attrs.radiusX;
            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Ellipse.prototype = Shape.prototype;

        function Line(attrs) {
            this.type = 'line';
            this.points = attrs.points;
            this.style = attrs.style;
            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Line.prototype = Shape.prototype;

        function Polygon(attrs) {
            this.type = 'polygon';
            this.points = attrs.points;
            this.sides = attrs.sides;
            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Polygon.prototype = Shape.prototype;

        var Rectangle = function (attrs) {

            this.type = 'rectangle';
            this.point = attrs.point;
            this.height = attrs.height;
            this.width = attrs.width;

            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        }.inherits(Shape);

        //        function Rectangle(attrs) {
        //            this.type = 'rectangle';
        //            this.point = attrs.point;
        //            this.height = attrs.height;
        //            this.width = attrs.width;
        //            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        //        }
        //        Rectangle.prototype = new Shape();

        return {
            Create: function (uuid, type, x, y, style, radius, startAngle, endAngle, clockWise, sides, height, width, radiusY, radiusX) {

                var attrs = {
                    uuid: uuid,
                    name: 'Shape '.concat(uuid),
                    style: style,
                    locked: false,
                    visible: true,
                    selected: false
                };

                switch (type) {
                case 'line':
                    {
                        attrs.points = [Point.Create(x[0], x[1]), Point.Create(y[0], y[1])];
                        return new Line(attrs);
                    }
                case 'rectangle':
                    {
                        attrs.point = Point.Create(x, y);
                        attrs.height = height;
                        attrs.width = width;
                        return new Rectangle(attrs);
                    }
                case 'arc':
                    {
                        attrs.point = Point.Create(x, y);
                        attrs.radius = radius;
                        attrs.startAngle = startAngle;
                        attrs.endAngle = endAngle;
                        attrs.clockWise = clockWise;
                        return new Arc(attrs);
                    }
                case 'circle':
                    {
                        attrs.point = Point.Create(x, y);
                        attrs.radius = radius;
                        return new Circle(attrs);
                    }
                case 'ellipse':
                    {
                        attrs.point = Point.Create(x, y);
                        attrs.radiusY = radiusY;
                        attrs.radiusX = radiusX;
                        return new Ellipse(attrs);
                    }
                case 'polygon':
                    {
                        attrs.points = [];
                        attrs.sides = sides;

                        for (var i = 0; i < sides; i++) {

                            var pointX = (radius * math.cos(((math.PI * 2) / sides) * i) + x),
                                pointY = (radius * math.sin(((math.PI * 2) / sides) * i) + y);

                            attrs['points'].push(Point.Create(pointX, pointY));
                        }

                        return new Polygon(attrs);
                    }
                default:
                    break;
                }

            }
        }


    })();

    var Group = (function () {

    })();

    var Tool = (function () {

        function Tool(attrs) {
            this.uuid = attrs.uuid;
            this.name = attrs.name;

            this.__defineGetter__('active', function () {
                return this._active || false;
            });
            this.__defineSetter__('active', function (value) {
                this.notify(value ? 'onActive' : 'onDeactive', {
                    type: value ? 'onActive' : 'onDeactive',
                    now: new Date().toISOString()

                });
                this._active = value;
            });

            utility.object.event.call(this);
        }
        Tool.prototype = utility.object.event.prototype;

        return {
            Create: function (uuid, name) {

                var attrs = {
                        uuid: uuid,
                        name: name
                    },
                    tool = new Tool(attrs);

                return tool;
            }
        }


    })();

    var Render = (function () {

        return {
            Create: function (uuid, width, height, backgroundColor) {

                var render = document.createElement('canvas');

                render.width = width;
                render.height = height;

                render.style.position = "absolute";
                render.style.backgroundColor = backgroundColor || 'transparent';

                // sistema cartesiano de coordenadas
                var context2D = render.getContext('2d');
                context2D.translate(0, render.height);
                context2D.scale(1, -1);

                return render;
            },
            Update: function () {

                var layerUuid = layerFacade.Active.uuid,
                    layerStyle = layerFacade.Active.style,
                    layerShapes = shapeStore[layerUuid].list(),
                    layerRender = renderStore[layerUuid],
                    context2D = layerRender.getContext('2d');

                //https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial

                // limpando o render
                context2D.clearRect(0, 0, layerRender.width, layerRender.height);
                // alinhando com o centro
                context2D.translate(planeFacade.center.x, planeFacade.center.y);

                // style of layer
                context2D.lineCap = layerStyle.lineCap;
                context2D.lineJoin = layerStyle.lineJoin;

                // render para cada shape
                layerShapes.forEach(function (shape) {

                    // save state of all configuration
                    context2D.save();

                    context2D.beginPath();

                    // possivel personalização
                    context2D.lineWidth = (shape.style && shape.style.lineWidth) ? shape.style.lineWidth : layerStyle.lineWidth;
                    context2D.strokeStyle = (shape.style && shape.style.lineColor) ? shape.style.lineColor : layerStyle.lineColor;

                    switch (shape.type) {
                    case 'line':
                        {
                            context2D.moveTo(shape.points[0].x, shape.points[0].y);
                            context2D.lineTo(shape.points[1].x, shape.points[1].y);
                            break;
                        }
                    case 'rectangle':
                        {
                            context2D.translate(shape.point.x, shape.point.y);
                            context2D.strokeRect(0, 0, shape.width, shape.height);
                            break;
                        }
                    case 'arc':
                        {
                            context2D.translate(shape.point.x, shape.point.y);
                            context2D.arc(0, 0, shape.radius, (math.PI / 180) * shape.startAngle, (math.PI / 180) * shape.endAngle, shape.clockWise);
                            break;
                        }
                    case 'circle':
                        {
                            context2D.translate(shape.point.x, shape.point.y);
                            context2D.arc(0, 0, shape.radius, 0, math.PI * 2, true);
                            break;
                        }
                    case 'ellipse':
                        {
                            context2D.translate(shape.point.x, shape.point.y);
                            context2D.ellipse(0, 0, shape.radiusX, shape.radiusY, 0, 0, math.PI * 2)
                            break;
                        }
                    case 'polygon':
                        {
                            context2D.moveTo(shape.points[0].x, shape.points[0].y);

                            shape.points.forEach(function (point) {
                                context2D.lineTo(point.x, point.y);
                            });

                            context2D.closePath();
                            break;
                        }
                    default:
                        break;
                    }

                    context2D.stroke();

                    // restore state of all configuration
                    context2D.restore();

                });
            }
        }

    })();

    var layerFacade = utility.object.extend(utility.object.event, {
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Layer - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            var uuid = utility.math.uuid(9, 16),
                attrs = utility.object.merge({
                    uuid: uuid,
                    name: 'New Layer ' + layerStore.count(),
                    style: {
                        fillColor: 'rgb(0,0,0)',
                        lineCap: 'butt',
                        lineJoin: 'miter',
                        lineWidth: .7,
                        lineColor: 'rgb(0, 0, 0)',
                    },
                    locked: false,
                    visible: true,
                    system: false
                }, attrs),
                layer = Layer.Create(attrs.uuid, attrs.name, attrs.style, attrs.system),
                render = Render.Create(uuid, viewPort.clientWidth, viewPort.clientHeight, layerStore.count() == 0 ? settings.backgroundColor : null);

            // add render ao html 76yv
            viewPort.appendChild(render);

            // add layer ao dictionary
            layerStore.add(uuid, layer);

            // add render & shape & group ao object
            renderStore[uuid] = render;
            shapeStore[uuid] = new utility.object.dictionary();
            groupStore[uuid] = new utility.object.dictionary();

            // colocando a nova layer como ativa
            this.Active = layer.uuid;
        },
        Delete: null
    });
    Object.defineProperty(layerFacade, 'Active', {
        get: function () {
            return this._active || {};
        },
        set: function (value) {
            this.notify('onDeactive', {
                type: 'onDeactive',
                layer: this._active
            });

            this._active = layerStore.find(value);

            this.notify('onActive', {
                type: 'onActive',
                layer: this._active
            });
        }
    });

    var shapeFacade = utility.object.extend(utility.object.event, {
        Create: function (attrs) {
            if ((typeof attrs == "function") || (attrs == null)) {
                throw new Error('Shape - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (['polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse'].indexOf(attrs.type.toLowerCase()) == -1) {
                throw new Error('Shape - Create - Type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if ((attrs.x == undefined) || (attrs.y == undefined)) {
                throw new Error('Shape - Create - X and Y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            attrs = utility.object.merge({
                uuid: utility.math.uuid(9, 16)
            }, attrs);

            var shape = Shape.Create(attrs.uuid, attrs.type, attrs.x, attrs.y, attrs.style, attrs.radius, attrs.startAngle,
                attrs.endAngle, attrs.clockWise, attrs.sides, attrs.height, attrs.width, attrs.radiusY, attrs.radiusX);

            shapeStore[layerFacade.Active.uuid].add(shape.uuid, shape);

            return true;
        },
        Delete: null
    });

    var groupFacade = utility.object.extend(utility.object.event, {
        Create: null,
        Update: null,
        Delete: null
    });

    var toolFacade = utility.object.extend(utility.object.event, {
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            attrs = utility.object.merge({
                uuid: utility.math.uuid(9, 16),
                name: 'Tool '.concat(toolStore.count())
            }, attrs);

            var tool = Tool.Create(attrs.uuid, attrs.name);

            toolStore.add(attrs.uuid, tool);

            return true;
        },
        Delete: null
    });
    // register events
    toolFacade.listen('onMouseMove', function (event) {
        //    toolFacade.listen('onClick', function (event) {
        var position = {
            x: event.clientX,
            y: event.clientY
        };

        position = utility.graphic.mousePosition(viewPort, position);

        console.log(position);

        var layerUuid = layerFacade.Active.uuid,
            layerShapes = shapeStore[layerUuid].list();


        layerShapes.forEach(function (shape) {

            if (shape.contains(Point.Create(position.x, position.y))) {

                console.log(shape);

            }


        });


        //        toolFacade.notify('onMouseMove', {
        //            type: 'onMouseMove',
        //            x: position.x,
        //            y: position.y
        //        });

        //        console.log(event);
        //console.log(position);
    });
    // register events

    var renderFacade = utility.object.extend(utility.object.event, {
        Update: function () {

            this.notify('onChange', {
                type: 'onChange',
                now: new Date().toISOString()
            });

            Render.Update();
        }
    });


    var planeFacade = utility.object.extend(utility.object.event, {
        Initialize: function (config) {
            // verificações para as configurações
            if (config == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (typeof config == "function") {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (config.viewPort == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            // verificações para as configurações

            viewPort = config.viewPort;
            settings = utility.object.merge({
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            }, config.settings || {});

            // dicionarios para dados
            layerStore = new utility.object.dictionary();
            toolStore = new utility.object.dictionary();
            // dicionarios para dados

            // objetos para dados
            renderStore = {};
            shapeStore = {};
            groupStore = {};
            // objetos para dados

            // start em eventos
            viewPort.onmousemove = function (event) {
                toolFacade.notify('onMouseMove', event);
            };
            viewPort.onclick = function (event) {
                toolFacade.notify('onClick', event);
            }
            // start em eventos

            gridDraw(settings.gridEnable, viewPort.clientWidth, viewPort.clientHeight, settings.gridColor);

            return true;
        },
        Layer: layerFacade,
        Shape: shapeFacade,
        Group: groupFacade,
        Tool: toolFacade,
        Render: renderFacade,
        Import: {
            fromJson: null,
            fromSvg: null,
            fromDxf: function (stringDxf) {
                try {
                    var stringJson = utility.import.fromDxf(stringDxf);
                    var objectDxf = JSON.parse(stringJson.replace(/u,/g, '').replace(/undefined,/g, ''));

                    //                    debugger;

                    if (stringJson) {
                        layerFacade.Create();
                        for (var prop in objectDxf) {
                            shapeFacade.Create(objectDxf[prop]);
                        }
                        renderFacade.Update();
                    }
                } catch (error) {
                    alert(error);
                }
            },
            fromDwg: null
        },
        Export: {
            toJson: null,
            toSvg: null,
            toDxf: null,
            toPng: null,
            toPdf: null
        }
    });
    Object.defineProperty(planeFacade, 'center', {
        get: function () {
            return this._center || {
                x: 0,
                y: 0
            };
        },
        set: function (value) {
            this._center = value;
        }
    })
    Object.defineProperty(planeFacade, 'zoom', {
        get: function () {
            return this._zoom || {
                x: 0,
                y: 0
            };
        },
        set: function (value) {
            this._zoom = value;
        }
    })

    return planeFacade;

})(window, window.document, Math);