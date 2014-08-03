/*!
 * C37 in 02-08-2014 at 21:50:30 
 *
 * plane version: 3.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */

(function (window) {
"use strict";
var define, require;

// http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
(function () {
    var registry = {},
        seen = {};

    define = function (name, deps, callback) {
        registry[name] = {
            deps: deps,
            callback: callback
        };
    };

    require = function (name) {

        if (seen[name]) {
            return seen[name];
        }
        seen[name] = {};

        var mod = registry[name];
        if (!mod) {
            throw new Error("Module '" + name + "' not found.");
        }

        var deps = mod.deps,
            callback = mod.callback,
            reified = [],
            exports;

        for (var i = 0, l = deps.length; i < l; i++) {
            if (deps[i] === 'require') {
                reified.push(require);
            } else if (deps[i] === 'exports') {
                reified.push(exports = {});
            } else {
                reified.push(require(deps[i]));
            }
        }

        var value = callback.apply(this, reified);
        return seen[name] = exports || value;
    };
})();
define("geometric/group", ['require', 'exports'], function (require, exports) {




});
define("geometric/intersection", ['require', 'exports'], function (require, exports) {

    var polynomial = require('geometric/polynomial'),
        point = require('geometric/point');


    function Bezout(e1, e2) {
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

        return polynomial.create(
            AB * BC - AC * AC,
            AB * BEmCD + AD * BC - 2 * AC * AE,
            AB * BFpDE + AD * BEmCD - AE * AE - 2 * AC * AF,
            AB * DF + AD * BFpDE - 2 * AE * AF,
            AD * DF - AF * AF
        );
    };


    function circleLine(c, r, a1, a2) {
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
    };

    function circleRectangle(c, r, p, h, w) {

        var rightBottom = point.create(p.x + w, p.y),
            rightTop = point.create(p.x + w, p.y + h),
            leftTop = point.create(p.x, p.y + h),
            leftBottom = point.create(p.x, p.y);

        var inter1 = circleLine(c, r, rightBottom, rightTop);
        var inter2 = circleLine(c, r, rightTop, leftTop);
        var inter3 = circleLine(c, r, leftTop, leftBottom);
        var inter4 = circleLine(c, r, leftBottom, rightBottom);

        return inter1 || inter2 || inter3 || inter4;
    };

    function circleCircle(c1, r1, c2, r2) {
        var result;

        // Determine minimum and maximum radii where circles can intersect
        var r_max = r1 + r2;
        var r_min = Math.abs(r1 - r2);

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
            var h = Math.sqrt(r1 * r1 - a * a);
            var p = c1.interpolationLinear(c2, a / c_dist);
            var b = h / c_dist;

            result.points.push(point.create(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x)));
            result.points.push(point.create(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x)));

        }

        return result;
    };

    function circleArc(c, r1, ca, r2, as, ae, ck) {

        var intersection = circleCircle(c, r1, ca, r2);

        if (intersection.points) {

            var radianStart = as / 360 * 2 * Math.PI,
                radianEnd = ae / 360 * 2 * Math.PI,
                radianMid = radianStart > radianEnd ? (radianStart - radianEnd) / 2 : (radianEnd - radianStart) / 2;

            var pointStart = point.create(ca.x + Math.cos(radianStart) * r2, ca.y + Math.sin(radianStart) * r2),
                pointEnd = point.create(ca.x + Math.cos(radianEnd) * r2, ca.y + Math.sin(radianEnd) * r2),
                pointMid = point.create(ca.x + Math.cos(radianMid) * r2, ck ? ca.y - Math.sin(radianMid) * r2 : ca.y + Math.sin(radianMid) * r2);

            var twoPi = (Math.PI + Math.PI);

            for (var i = 0; i <= intersection.points.length - 1; i++) {

                var pointDistance = intersection.points[i].distanceTo(ca),
                    radius = r2;

                if (radius - 4 <= pointDistance && pointDistance <= radius + 4) {

                    var pointstartAngle = ca.angleTo(pointStart),
                        pointMidAngle = ca.angleTo(pointMid),
                        pointendAngle = ca.angleTo(pointEnd),
                        pointMouseAngle = ca.angleTo(intersection.points[i]);

                    if (pointstartAngle <= pointMidAngle && pointMidAngle <= pointendAngle) {
                        // 2014.06.24 - 14:33 - lilo - em observação
                        //                        if (ck) {
                        //                            return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? true : false;
                        //                        } else {
                        //                            return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? false : true;
                        //                        }
                        return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? true : false;

                    } else if (pointendAngle <= pointMidAngle && pointMidAngle <= pointstartAngle) {
                        if (ck) {
                            return (pointendAngle <= pointMouseAngle && pointMouseAngle <= pointstartAngle) ? true : false;
                        } else {
                            return (pointendAngle <= pointMouseAngle && pointMouseAngle <= pointstartAngle) ? false : true;
                        }
                    } else if (pointstartAngle <= pointMidAngle && pointendAngle <= pointMidAngle) {
                        if (pointstartAngle < pointendAngle) {
                            if (ck) {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? false : true;
                            } else {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? true : false;
                            }
                        } else if (pointendAngle < pointstartAngle) {
                            return (pointendAngle < pointMouseAngle && pointMouseAngle < pointstartAngle) ? false : true;
                        }
                    } else if (pointMidAngle <= pointstartAngle && pointMidAngle <= pointendAngle) {
                        if (pointstartAngle < pointendAngle) {
                            if (ck) {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? false : true;
                            } else {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? true : false;
                            }
                        } else if (pointendAngle < pointstartAngle) {
                            return (pointendAngle < pointMouseAngle && pointMouseAngle < pointstartAngle) ? false : true;
                        }
                    }

                }
                return false;
            };
        }
        return false;
    };


    function circleEllipse(c1, ry1, rx1, c2, ry2, rx2) {

        var a = [ry1 * ry1, 0, rx1 * rx1, -2 * ry1 * ry1 * c1.x, -2 * rx1 * rx1 * c1.y, ry1 * ry1 * c1.x * c1.x + rx1 * rx1 * c1.y * c1.y - rx1 * rx1 * ry1 * ry1];
        var b = [ry2 * ry2, 0, rx2 * rx2, -2 * ry2 * ry2 * c2.x, -2 * rx2 * rx2 * c2.y, ry2 * ry2 * c2.x * c2.x + rx2 * rx2 * c2.y * c2.y - rx2 * rx2 * ry2 * ry2];

        var yPoly = Bezout(a, b);
        var yRoots = yPoly.getRoots();
        var epsilon = 1e-3;
        var norm0 = (a[0] * a[0] + 2 * a[1] * a[1] + a[2] * a[2]) * epsilon;
        var norm1 = (b[0] * b[0] + 2 * b[1] * b[1] + b[2] * b[2]) * epsilon;

        for (var y = 0; y < yRoots.length; y++) {
            var xPoly = polynomial.create(
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
    };


    function circleBezier(p1, p2, p3, ec, rx, ry) {

        var a, b; // temporary variables
        var c2, c1, c0; // coefficients of quadratic
        //        var result = new Intersection("No Intersection");
        var result = {};

        a = p2.multiply(-2);
        c2 = p1.sum(a.sum(p3));

        a = p1.multiply(-2);
        b = p2.multiply(2);
        c1 = a.sum(b);

        c0 = point.create(p1.x, p1.y);

        var rxrx = rx;
        var ryry = ry;

        var roots = polynomial.create(
            ryry * c2.x * c2.x + rxrx * c2.y * c2.y,
            2 * (ryry * c2.x * c1.x + rxrx * c2.y * c1.y),
            ryry * (2 * c2.x * c0.x + c1.x * c1.x) + rxrx * (2 * c2.y * c0.y + c1.y * c1.y) - 2 * (ryry * ec.x * c2.x + rxrx * ec.y * c2.y),
            2 * (ryry * c1.x * (c0.x - ec.x) + rxrx * c1.y * (c0.y - ec.y)),
            ryry * (c0.x * c0.x + ec.x * ec.x) + rxrx * (c0.y * c0.y + ec.y * ec.y) - 2 * (ryry * ec.x * c0.x + rxrx * ec.y * c0.y) - rxrx * ryry
        ).getRoots();

        if (roots.length > 1) {

            //            debugger;

            result.points = [];
            for (var i = 0; i < roots.length; i++) {
                var t = roots[i];

                //                if (t <= 0) {
                //                    result.points.push(c2.multiply(t * t).sum(c1.multiply(t).sum(c0)));
                //                }

                if (0 <= t && t <= 1)
                    result.points.push(c2.multiply(t * t).sum(c1.multiply(t).sum(c0)));
            }
            return (result.points.length > 0);
        }

        return false;
    };


    exports.circleLine = circleLine;
    exports.circleRectangle = circleRectangle;
    exports.circleCircle = circleCircle;
    exports.circleArc = circleArc;
    exports.circleEllipse = circleEllipse;
    exports.circleBezier = circleBezier;
});
define("geometric/point", ['require', 'exports'], function (require, exports) {

    function Point(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype = {
        sum: function (point) {
            return new Point(this.x + point.x, this.y + point.y);
        },
        subtract: function (point) {
            return new Point(this.x - point.x, this.y - point.y);
        },
        multiply: function (value) {
            return new Point(this.x * value, this.y * value);
        },
        distanceTo: function (point) {
            var dx = this.x - point.x;
            var dy = this.y - point.y;

            return Math.sqrt(dx * dx + dy * dy);
        },
        midTo: function (point) {
            return new Point(this.x + (point.x - this.x) / 2, this.y + (point.y - this.y) / 2);
        },
        angleTo: function (point) {
            return Math.atan2(point.y - this.y, point.x - this.x);
        },
        interpolationLinear: function (point, value) {
            return new Point(
                this.x + (point.x - this.x) * value,
                this.y + (point.y - this.y) * value
            );
        }
    };

    function create(x, y) {
        return new Point(x, y);
    };

    exports.create = create;

});
define("geometric/polynomial", ['require', 'exports'], function (require, exports) {

    function Polynomial(coefs) {
        this.coefs = new Array();

        for (var i = coefs.length - 1; i >= 0; i--)
            this.coefs.push(coefs[i]);

        this._variable = "t";
        this._s = 0;
    }

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

            var resolveRoots = create(
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
    
    
    function create() {
        return new Polynomial(arguments);
    }


    exports.create = create;

});
define("geometric/shape", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types'),
        point = require('geometric/point'),
        intersection = require('geometric/intersection');


    function Shape() {};

    Shape.prototype = {
        rotateTo: function (value) {
            return true;
        },
        scaleTo: function (value) {

            switch (this.type) {
            case 'arc':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.radius *= value;

                    break;
                }
            case 'bezier':
                {
                    this.points.forEach(function (point) {
                        point.a = point.a.multiply(value);
                        point.b = point.b.multiply(value);
                        point.c = point.c.multiply(value);
                    });
                    break;
                }
            case 'circle':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.radius *= value;

                    break;
                }
            case 'ellipse':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.radiusX *= value;
                    this.radiusY *= value;

                    break;
                }
            case 'line':
                {
                    this.points.forEach(function (point) {
                        point.x *= value;
                        point.y *= value;
                    });

                    break;
                }
            case 'polygon':
                {
                    this.point.x *= value;
                    this.point.y *= value;

                    this.points.forEach(function (point) {
                        point.x *= value;
                        point.y *= value;
                    });

                    break;
                }
            case 'polyline':
                {
                    this.points.forEach(function (point) {
                        point.x *= value;
                        point.y *= value;
                    });

                    break;
                }
            case 'rectangle':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.height *= value;
                    this.width *= value;

                    break;
                }
            }

            this.Scale = value;

        },
        moveTo: function (value) {

            if (this.point) {
                this.point = this.point.sum(value);
            }
            if (this.points && this.type != 'bezier') {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i] = this.points[i].sum(value);
                }
            }
            if (this.points && this.type == 'bezier') {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i].a = this.points[i].a.sum(value);
                    this.points[i].b = this.points[i].b.sum(value);
                    this.points[i].c = this.points[i].c.sum(value);
                }
            }

            return true;
        },
        contains: function (pointMouse) {

            switch (this.type) {
            case 'line':
                {
                    if (intersection.circleLine(pointMouse, 2, this.points[0], this.points[1]))
                        return true;

                    break;
                }
            case 'bezier':
                {
                    for (var i = 0; i < this.points.length; i++) {
                        if (intersection.circleBezier(this.points[i].a, this.points[i].b, this.points[i].c, point.create(pointMouse.x, pointMouse.y), 2, 2))
                            return true;
                    }
                    break;
                }
            case 'rectangle':
                {
                    if (intersection.circleRectangle(pointMouse, 2, this.point, this.height, this.width))
                        return true;

                    break;
                }
            case 'arc':
                {
                    if (intersection.circleArc(point.create(pointMouse.x, pointMouse.y), 2, this.point, this.radius, this.startAngle, this.endAngle, this.clockWise))
                        return true;

                    break;
                }
            case 'circle':
                {
                    if (intersection.circleCircle(pointMouse = point.create(pointMouse.x, pointMouse.y), 2, this.point, this.radius))
                        return true;

                    break;
                }
            case 'ellipse':
                return (intersection.circleEllipse(pointMouse, 2, 2, this.point, this.radiusY, this.radiusX))
            case 'polygon':
                {
                    var pointA = null,
                        pointB = null;

                    for (var i = 0; i < this.points.length; i++) {

                        if (i + 1 == this.points.length) {
                            pointA = this.points[i];
                            pointB = this.points[0];
                        } else {
                            pointA = this.points[i];
                            pointB = this.points[i + 1];
                        }

                        if (intersection.circleLine(pointMouse, 2, pointA, pointB))
                            return true;
                    }
                    break;
                }
            case 'polyline':
                {
                    var pointA = null,
                        pointB = null;

                    for (var i = 0; i < this.points.length; i++) {

                        if (i + 1 == this.points.length) {
                            pointA = this.points[i];
                            pointB = this.points[0];
                        } else {
                            pointA = this.points[i];
                            pointB = this.points[i + 1];
                        }

                        if (intersection.circleLine(pointMouse, 2, pointA, pointB))
                            return true;
                    }
                    break;
                }
            default:
                break;
            }

            return false;
        },
        render: function (context2D) {

            if (this.status == 'over') {
                context2D.strokeStyle = 'rgb(61, 142, 193)';
            }

            if (this.status == 'selected') {

                context2D.strokeStyle = 'rgb(68, 121, 154)';
                if (this.point) {
                    context2D.strokeRect(this.point.x - (Math.round(2) / 2), this.point.y - (Math.round(2) / 2), Math.round(2), Math.round(2));
                }
                if (this.points) {
                    this.points.forEach(function (point) {
                        context2D.strokeRect(point.x - (Math.round(2) / 2), point.y - (Math.round(2) / 2), Math.round(2), Math.round(2));
                    });
                }
            }

            switch (this.type) {
            case 'arc':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.arc(0, 0, this.radius, (Math.PI / 180) * this.startAngle, (Math.PI / 180) * this.endAngle, this.clockWise);

                    return true;
                }
            case 'bezier':
                {
                    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
                    this.points.forEach(function (point) {
                        context2D.bezierCurveTo(point.a.x, point.a.y, point.b.x, point.b.y, point.c.x, point.c.y);
                    });

                    return true;
                }
            case 'circle':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.arc(0, 0, this.radius, 0, Math.PI * 2, true);

                    return true;
                }
            case 'ellipse':
                {
                    // http://scienceprimer.com/draw-oval-html5-canvas
                    context2D.translate(this.point.x, this.point.y);

                    // angle in radian
                    var sss = 0;
                    for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 0.01) {
                        var xPos = 0 - (this.radiusY * Math.sin(i)) * Math.sin(sss * Math.PI) + (this.radiusX * Math.cos(i)) * Math.cos(sss * Math.PI);
                        var yPos = 0 + (this.radiusX * Math.cos(i)) * Math.sin(sss * Math.PI) + (this.radiusY * Math.sin(i)) * Math.cos(sss * Math.PI);

                        if (i == 0) {
                            context2D.moveTo(xPos, yPos);
                        } else {
                            context2D.lineTo(xPos, yPos);
                        }
                    }

                    return true;
                }
            case 'line':
                {
                    // possivel personalização
                    if (this.status != 'Over') {
                        context2D.lineWidth = (this.style && this.style.lineWidth) ? this.style.lineWidth : context2D.lineWidth;
                        context2D.strokeStyle = (this.style && this.style.lineColor) ? this.style.lineColor : context2D.strokeStyle;
                    }

                    context2D.moveTo(this.points[0].x, this.points[0].y);
                    context2D.lineTo(this.points[1].x, this.points[1].y);

                    return true;
                }
            case 'polygon':
                {
                    context2D.moveTo(this.points[0].x, this.points[0].y);

                    this.points.forEach(function (point) {
                        context2D.lineTo(point.x, point.y);
                    });
                    context2D.closePath();

                    return true;
                }
            case 'polyline':
                {
                    context2D.moveTo(this.points[0].x, this.points[0].y);

                    this.points.forEach(function (point) {
                        context2D.lineTo(point.x, point.y);
                    });

                    return true;
                }
            case 'rectangle':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.strokeRect(0, 0, this.width, this.height);

                    return true;
                }
            }

        },
        toObject: function () {

            switch (this.type) {
            case 'arc':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    radius: types.math.parseFloat(this.radius, 5),
                    startAngle: types.math.parseFloat(this.startAngle, 5),
                    endAngle: types.math.parseFloat(this.endAngle, 5),
                    clockWise: this.clockWise
                };
            case 'bezier':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    points: this.points.map(function (point) {
                        return {
                            a: [types.math.parseFloat(point.a.x, 5), types.math.parseFloat(point.a.y, 5)],
                            b: [types.math.parseFloat(point.b.x, 5), types.math.parseFloat(point.b.y, 5)],
                            c: [types.math.parseFloat(point.c.x, 5), types.math.parseFloat(point.c.y, 5)]
                        }
                    })
                };
            case 'circle':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    radius: types.math.parseFloat(this.radius, 5)
                };
            case 'ellipse':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    radiusX: types.math.parseFloat(this.radiusX, 5),
                    radiusY: types.math.parseFloat(this.radiusY, 5)
                };
            case 'line':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    a: [types.math.parseFloat(this.points[0].x, 5), types.math.parseFloat(this.points[0].y, 5)],
                    b: [types.math.parseFloat(this.points[1].x, 5), types.math.parseFloat(this.points[1].y, 5)]
                };
            case 'polygon':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    sides: this.sides
                };
            case 'polyline':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    points: this.points.map(function (point) {
                        return {
                            x: types.math.parseFloat(point.x, 5),
                            y: types.math.parseFloat(point.y, 5)
                        }
                    })
                };
            case 'rectangle':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    height: types.math.parseFloat(this.height, 5),
                    width: types.math.parseFloat(this.width, 5)
                };
            }

        }
    };


    var Arc = types.object.inherits(function Arc(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'arc';
        this.point = attrs.point;
        this.radius = attrs.radius;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.clockWise = attrs.clockWise;
    }, Shape);

    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    var Bezier = types.object.inherits(function Bezier(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'bezier';
        this.points = attrs.points;
    }, Shape);

    var Circle = types.object.inherits(function Circle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'circle';
        this.point = attrs.point;
        this.radius = attrs.radius;
    }, Shape);

    var Ellipse = types.object.inherits(function Ellipse(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'ellipse';
        this.point = attrs.point;
        this.radiusY = attrs.radiusY;
        this.radiusX = attrs.radiusX;
    }, Shape);

    var Line = types.object.inherits(function Line(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'line';
        this.points = attrs.points;
        this.style = attrs.style;
    }, Shape);

    var Polygon = types.object.inherits(function Polygon(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'polygon';
        this.point = attrs.point;
        this.points = attrs.points;
        this.sides = attrs.sides;
    }, Shape);

    var Polyline = types.object.inherits(function Polyline(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'polyline';
        this.points = attrs.points;
    }, Shape);

    var Rectangle = types.object.inherits(function Rectangle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'rectangle';
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;
    }, Shape);


    function create(attrs) {

        var uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            uuid: uuid,
            name: 'shape '.concat(uuid),
            style: null,
            status: null
        }, attrs);

        switch (attrs.type) {
        case 'line':
            {
                attrs.points = [point.create(attrs.a[0], attrs.a[1]), point.create(attrs.b[0], attrs.b[1])];
                return new Line(attrs);
            }
        case 'bezier':
            {
                attrs.points = attrs.points.map(function (singlePoint) {
                    return {
                        a: point.create(singlePoint.a[0], singlePoint.a[1]),
                        b: point.create(singlePoint.b[0], singlePoint.b[1]),
                        c: point.create(singlePoint.c[0], singlePoint.c[1])
                    };
                });
                return new Bezier(attrs);
            }
        case 'rectangle':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.height = attrs.height;
                attrs.width = attrs.width;
                return new Rectangle(attrs);
            }
        case 'arc':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radius = attrs.radius;
                attrs.startAngle = attrs.startAngle;
                attrs.endAngle = attrs.endAngle;
                attrs.clockWise = attrs.clockWise;
                return new Arc(attrs);
            }
        case 'circle':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radius = attrs.radius;
                return new Circle(attrs);
            }
        case 'ellipse':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radiusY = attrs.radiusY;
                attrs.radiusX = attrs.radiusX;
                return new Ellipse(attrs);
            }
        case 'polygon':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.points = [];

                for (var i = 0; i < attrs.sides; i++) {

                    var pointX = (attrs.radius * Math.cos(((Math.PI * 2) / attrs.sides) * i) + attrs.point.x),
                        pointY = (attrs.radius * Math.sin(((Math.PI * 2) / attrs.sides) * i) + attrs.point.y);

                    attrs['points'].push(point.create(pointX, pointY));
                }

                return new Polygon(attrs);
            }
        case 'polyline':
            {
                for (var i = 0; i < attrs.points.length; i++) {
                    attrs.points[i] = point.create(attrs.points[i].x, attrs.points[i].y);
                }
                return new Polyline(attrs);
            }
        default:
            break;
        }

    }

    function remove(value) {}

    function list() {}

    function find() {}


    exports.create = create;
    exports.remove = remove;
    exports.list = list;
    exports.find = find;
});
define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var types = require('utility/types'),
        importer = require('utility/importer'),
        exporter = require('utility/exporter');

    var layerManager = require('structure/layer'),
        shapeManager = require('geometric/shape'),
        toolManager = require('structure/tool');

    var centerHistory = types.data.list.create();

    var viewPort = null,
        _view = {
            zoom: 1,
            center: {
                x: 0,
                y: 0
            },
            bounds: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            }
        }


    function initialize(config) {
        if (config == null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (typeof config == "function") {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (config.viewPort == null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }


        viewPort = config.viewPort;

        _view.center.x = viewPort.clientWidth / 2;
        _view.center.y = viewPort.clientHeight / 2;

        _view.bounds.width = viewPort.clientWidth;
        _view.bounds.height = viewPort.clientHeight;


        toolManager.event.start({
            viewPort: viewPort
        });

        return true;
    }

    function clear() {
        // reset em center
        center({
            factor: 1,
            center: {
                x: _center.position.x * -1,
                y: _center.position.y * -1
            }
        });

        // remove em todas as layers
        layerManager.remove();

        return true;
    }

    // plane.view.zoom =/ .9;  - more
    // plane.view.zoom =* .9; - less
    var view = {
        get zoom() {
            return _view.zoom;
        },
        set zoom(value) {

            var layerActive = layerManager.active(),
                zoomFactor = value / _view.zoom;

            // com o valor do middle anterior para retroceder os valores sem perder a medida do centro
            var middlePrevious = {
                x: ((viewPort.clientWidth - (viewPort.clientWidth * _view.zoom)) / 2) * -1,
                y: ((viewPort.clientHeight - (viewPort.clientHeight * _view.zoom)) / 2) * -1,
            };
            // ATENÇÃO - os sinais!
            _view.bounds = {
                x: _view.bounds.x + middlePrevious.x,
                y: _view.bounds.y + middlePrevious.y
            }

            // com o meio atualizando pelo zoom
            var middleCurrent = {
                x: ((viewPort.clientWidth - (viewPort.clientWidth * value)) / 2),
                y: (viewPort.clientHeight - (viewPort.clientHeight * value)) / 2,
            };
            // atualizando os limites
            _view.bounds = {
                x: _view.bounds.x + middleCurrent.x,
                y: _view.bounds.y + middleCurrent.y
            }

            layerManager.list().forEach(function (layer) {

                layerManager.active(layer.uuid);

                layerManager.active().shapes.list().forEach(function (shape) {
                    shape.moveTo(middlePrevious);
                    shape.scaleTo(zoomFactor);
                    shape.moveTo(middleCurrent);
                });

                layerManager.update();
            });
            layerManager.active(layerActive.uuid);

            _view.zoom = value;
        },
        get center() {
            return _view.center;
        },
        set center(value) {
            // verificamos se o novo status de centro é realmente diferente do atual
            if (value && (value.x != 0 || value.y != 0) && (value.x != _view.center.x || value.y != _view.center.y)) {

                var layerActive = layerManager.active(),
                    // fator de movimento - calculando e atualizando com o zoom atual
                    moveFactor = {
                        x: (value.x - _view.center.x) * _view.zoom,
                        y: (value.y - _view.center.y) * _view.zoom
                    }

                // adicionado ao histórico dos movimentos de centro
                centerHistory.add({
                    x: value.x - _view.center.x,
                    y: value.y - _view.center.y
                });

                // movimentando todos os shapes de todas as layers
                layerManager.list().forEach(function (layer) {

                    layerManager.active(layer.uuid);

                    layerManager.active().shapes.list().forEach(function (shape) {
                        shape.moveTo(moveFactor);
                    });

                    layerManager.update();
                });
                layerManager.active(layerActive.uuid);

                _view.center = value;
            }
        },
        get bounds() {
            var boundsHistory = {
                x: 0,
                y: 0
            };

            centerHistory.list().forEach(function (itemHistory) {
                boundsHistory.x = boundsHistory.x + itemHistory.x;
                boundsHistory.y = boundsHistory.y + itemHistory.y;
            });

            boundsHistory = {
                x: boundsHistory.x * _view.zoom,
                y: boundsHistory.y * _view.zoom
            }

            return {
                x: _view.bounds.x + boundsHistory.x,
                y: _view.bounds.y + boundsHistory.y
            };
        },
    }




    var layer = types.object.extend(types.object.event.create(), {
        create: function (attrs) {
            if ((typeof attrs == "function")) {
                throw new Error('layer - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            attrs = types.object.union(attrs, {
                viewPort: viewPort
            });

            return layerManager.create(attrs);
        },
        list: function (selector) {
            return layerManager.list();
        },
        remove: function (uuid) {
            layerManager.remove(uuid);
        },
        get active() {
            return layerManager.active();
        },
        set active(value) {
            this.notify('onDeactive', {
                type: 'onDeactive',
                layer: layerManager.active()
            });

            layerManager.active(value);

            this.notify('onActive', {
                type: 'onActive',
                layer: layerManager.active()
            });
        },
        update: function () {
            return layerManager.update();
        }
    });

    var shape = {
        create: function (attrs) {
            if ((typeof attrs == "function") || (attrs == null)) {
                throw new Error('shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier'].indexOf(attrs.type) == -1) {
                throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (((attrs.type != 'polyline') && (attrs.type != 'bezier') && (attrs.type != 'line')) && ((attrs.x == undefined) || (attrs.y == undefined))) {
                throw new Error('shape - create - x and y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            var shape = shapeManager.create(attrs);

            layerManager.active().shapes.add(shape.uuid, shape);

            return true;
        }
    };

    var tool = {
        create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            return toolManager.create(attrs);
        }
    };

    // importer
    function fromJson(stringJson) {

        var planeObject = JSON.parse(stringJson);

        clear();

        //        _center = planeObject.position;

        planeObject.layers.forEach(function (layerObject) {

            layerManager.create({
                uuid: layerObject.uuid,
                name: layerObject.name,
                locked: layerObject.locked,
                Visible: layerObject.Visible,
                style: layerObject.style,
                viewPort: viewPort
            });

            layerObject.shapes.forEach(function (shapeObject) {
                shape.create(shapeObject)
            });

            layerManager.update();
        });

        return true;
    };

    function fromSvg(stringSvg) {
        return true;
    };

    function fromDxf(stringDxf) {
        clear();

        var stringJson = importer.fromDxf(stringDxf);
        var objectDxf = JSON.parse(stringJson);

        if (stringJson) {
            layer.create();
            for (var prop in objectDxf) {
                shape.create(objectDxf[prop]);
            }
            layer.update();
        }
    };

    function fromDwg(stringDwg) {
        return true;
    }
    // importer

    // exporter
    function toJson() {

        var planeExport = {
            //            center: _center,
            layers: layerManager.list().map(function (layer) {
                var layerObject = layer.toObject();

                layerObject.shapes = layerObject.shapes.map(function (shape) {
                    return shape.toObject();
                });

                return layerObject;
            })
        }

        return JSON.stringify(planeExport);
    }

    function toSvg() {
        return true;
    }
    // exporter


    exports.initialize = initialize;
    exports.clear = clear;
    exports.view = view;

    exports.layer = layer;
    exports.shape = shape;
    exports.tool = tool;

    exports.importer = {
        fromJson: fromJson,
        fromSvg: fromSvg,
        fromDxf: fromDxf,
        fromDwg: fromDwg
    };
    exports.exporter = {
        toJson: toJson,
        toSvg: toSvg
    };
});
define("structure/layer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var layerStore = types.data.dictionary.create(),
        layerActive = null;


    var Layer = types.object.inherits(function Layer(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.render = attrs.render;
        this.shapes = attrs.shapes;
    }, types.object.event);

    Layer.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            locked: this.locked,
            status: this.status,
            style: this.style,
            shapes: this.shapes.list()
        };
    }


    function create(attrs) {

        var uuid = types.math.uuid(9, 16);

        // montando o render da Layer
        var render = document.createElement('canvas');

        render.id = types.math.uuid(9, 16);
        render.width = attrs.viewPort.clientWidth;
        render.height = attrs.viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = (attrs.status == 'system') ? attrs.style.backgroundColor : 'transparent';

        var context2D = render.getContext('2d');

        // sistema cartesiano de coordenadas
        context2D.translate(0, render.height);
        context2D.scale(1, -1);

        // parametros para a nova Layer
        attrs = types.object.merge({
            uuid: uuid,
            name: 'New Layer '.concat(uuid),
            style: {
                lineCap: 'butt',
                lineJoin: 'miter',
                lineWidth: .7,
                lineColor: 'rgb(0, 0, 0)',
            },
            status: 'visible',
            shapes: types.data.dictionary.create(),
            render: render
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // add em viewPort
        attrs.viewPort.appendChild(layer.render);

        //        if (layer.status != 'system') {
        //            layerStore.add(layer.uuid, layer);
        //            this.active(layer.uuid);
        //            return true;
        //        } else {
        //            return layer;
        //        }

        layerStore.add(layer.uuid, layer);
        return this.active(layer.uuid);

    }

    function active(value) {
        return value ? layerActive = layerStore.find(value) : layerActive;
    }

    function remove(value) {
        layerStore.list().forEach(function (layer) {
            var element = document.getElementById(layer.render.id);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
            layerStore.remove(layer.uuid);
        });
    }

    function list() {
        return layerStore.list();
    }

    function update() {

        var layerStyle = layerActive.style,
            layerShapes = layerActive.shapes.list(),
            layerRender = layerActive.render,
            context2D = layerRender.getContext('2d');

        // limpando o render
        context2D.clearRect(0, 0, viewPort.clientWidth, viewPort.clientHeight);
        
        // style of layer
        context2D.lineCap = layerStyle.lineCap;
        context2D.lineJoin = layerStyle.lineJoin;

        // render para cada shape
        layerShapes.forEach(function (shape) {
            // save state of all configuration
            context2D.save();
            context2D.beginPath();

            shape.render(context2D);

            context2D.stroke();
            // restore state of all configuration
            context2D.restore();
        });
        
        return true;
    }


    exports.create = create;
    exports.active = active;
    exports.update = update;
    exports.list = list;
    exports.remove = remove;
});
define("structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var toolStore = types.data.dictionary.create(),
        shapeSelected = types.data.dictionary.create();

    var layerManager = require('structure/layer');

    var viewPort = null;

    
    var Tool = types.object.inherits(function Tool(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;

        Object.defineProperty(this, 'active', {
            get: function () {
                return this._active || false;
            }, 
            set: function (value) {
                this.notify(value ? 'onActive' : 'onDeactive', {
                    type: value ? 'onActive' : 'onDeactive',
                    Now: new Date().toISOString()

                });
                this._active = value;
            }
        });
    }, types.object.event);


    function create(attrs) {

        var uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            uuid: uuid,
            name: 'Tool '.concat(uuid)
        }, attrs); 

        // nova tool
        var tool = new Tool(attrs)

        toolStore.add(tool.uuid, tool);

        return tool;
    }


    var event = types.object.extend(types.object.event.create(), {

        start: function (config) {

            viewPort = config.viewPort;

            viewPort.onmousemove = function (event) {
                
                if (layerManager.active()) {
                    layerManager.active().shapes.list().forEach(function (shape) {
                        if (shape.status != 'selected') {
                            shape.status = shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY)) ? 'over' : 'out';
                        }
                    });
                    layerManager.update();
                }
            }

            viewPort.onclick = function (event) {
                if (layerManager.active()) {
                    
                    layerManager.active().shapes.list().forEach(function (shape) {
                        if (shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY))) {

                            shape.status = shape.status != 'selected' ? 'selected' : 'over';

                            if (shape.status == 'selected') {
                                shapeSelected.add(shape.uuid, shape);
                            } else {
                                shapeSelected.remove(shape.uuid);
                            }

                        }
                    });
                    layerManager.update();

                    toolStore.list().forEach(function (Tool) {
                        if (Tool.active) {
                            Tool.notify('onMouseClick', {
                                type: 'onMouseClick',
                                shapes: shapeSelected.list()
                            });
                        }
                    });
                }
            }
        }

    })

    exports.event = event;
    exports.create = create;
});
define("utility/exporter", ['require', 'exports'], function (require, exports) {
    
    function toJson (){
        return true;
    }
    
    function toSvg (){
        return true;
    }
    
    function toDxf (){
        return true;
    }
    
    function toPng (){
        return true;
    }
    
    function toPdf (){
        return true;
    }

    
    exports.toJson = toJson;
    exports.toSvg = toSvg;
    exports.toDxf = toDxf;
    exports.toPng = toPng;
    exports.toPdf = toPdf;

});
define("utility/importer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    function fromDxf(stringDxf) {

        function toJson(objectDxf) {

            switch (objectDxf.type) {
            case 'line':
                {
                    var line = '{ "type": "line", "a": [{0}, {1}], "b": [{2}, {3}] },';
                    return types.string.format(line, [objectDxf.x, objectDxf.y, objectDxf.x1, objectDxf.y1]);
                }
            case 'spline':
                {
                    var line = '{ "type": "line", "a": [{0}, {1}], "b": [{2}, {3}] },';
                    return types.string.format(line, [objectDxf.x, objectDxf.y, objectDxf.x1, objectDxf.y1]);
                }
            case 'circle':
                {
                    var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} },';
                    return types.string.format(circle, [objectDxf.x, objectDxf.y, objectDxf.r]);
                }
            case 'arc':
                {
                    var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2},"startAngle": {3}, "endAngle": {4}, "clockWise": {5} },';
                    return types.string.format(arc, [objectDxf.x, objectDxf.y, objectDxf.r, objectDxf.a0, objectDxf.a1, false]);
                }
            case 'ellipse':
                {
                    var ellipse = '{"type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2},"radiusX": {3} },',
                        radiusX = Math.abs(objectDxf.x1),
                        radiusY = radiusX * objectDxf.r;

                    return types.string.format(ellipse, [objectDxf.x, objectDxf.y, radiusY, radiusX])
                }
            case 'lwpolyline':
                {
                    if (objectDxf.vertices) {
                        var polyline = '{"type": "polyline", "points": [{0}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.vertices.length; i++) {

                            var point = i == objectDxf.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [objectDxf.vertices[i].x, objectDxf.vertices[i].y]);

                        }
                        return types.string.format(polyline, [points]);
                    }
                    return '';
                }
            case 'polyline':
                {
                    if (objectDxf.vertices) {
                        var polyline = '{"type": "polyline", "points": [{0}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.vertices.length; i++) {

                            var point = i == objectDxf.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [objectDxf.vertices[i].x, objectDxf.vertices[i].y]);

                        }
                        return types.string.format(polyline, [points]);
                    }
                    return '';
                }
            }

        }


        // certificando que a linha irá terá o caractere de nova linha
        stringDxf = stringDxf.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // entidades suportadas na conversão
        //                var entitiesSupport = ['polyline'],
        var entitiesSupport = ['line', 'circle', 'arc', 'ellipse', 'lwpolyline', 'polyline', 'spline'],
            entitiesSection = false,
            objectParse = null,
            stringAux = '',
            stringJson = '',
            stringLine = '',
            arrayDxf = stringDxf.split('\n');

        for (var i = 0; i <= arrayDxf.length - 1; i++) {

            stringLine = arrayDxf[i].toLowerCase();

            entitiesSection = entitiesSection ? entitiesSection : (stringLine == 'entities');
            if (!entitiesSection) continue;

            if (entitiesSupport.indexOf(stringLine) > -1) {
                objectParse = {
                    type: stringLine
                };
                continue;
            }

            if (!objectParse) continue;


            if (stringAux == ' 10') {
                // verificação especifica para spline
                if (objectParse.type == 'spline' && objectParse.x) {
                    objectParse.x1 = types.math.parseFloat(stringLine, 5);
                } else {
                    objectParse.x = types.math.parseFloat(stringLine, 5);
                }
                stringAux = '';
                continue;
            }
            if (stringLine == ' 10') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 11') {
                objectParse.x1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }

            if (stringLine == ' 11') {
                stringAux = stringLine;
                continue;
            }

            if (stringAux == ' 20') {
                // verificação especifica para spline
                if (objectParse.type == 'spline' && objectParse.y) {
                    objectParse.y1 = types.math.parseFloat(stringLine, 5);
                } else {
                    objectParse.y = types.math.parseFloat(stringLine, 5);
                }
                // verificação especifica para lwpolyline e polyline
                if (objectParse.type == 'lwpolyline' || objectParse.type == 'polyline') {
                    if (objectParse.x && objectParse.y) {
                        objectParse.vertices = objectParse.vertices || [];
                        objectParse.vertices.push({
                            x: objectParse.x,
                            y: objectParse.y
                        });
                    }
                }
                stringAux = '';
                continue;
            }
            if (stringLine == ' 20') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 21') {
                objectParse.y1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 21') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 40') {
                objectParse.r = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 40') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 50') {
                objectParse.a0 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 50') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 51') {
                objectParse.a1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 51') {
                stringAux = stringLine;
                continue;
            }


            // conversão para Json
            if (objectParse && objectParse.type && objectParse.type != 'polyline' && arrayDxf[i] == '  0') {
                stringJson += toJson(objectParse);
                objectParse = null;
            }
            // conversão para Json - verificação especifica para Polyline
            if (objectParse && objectParse.type && objectParse.type == 'polyline' && arrayDxf[i] == 'SEQEND') {
                stringJson += toJson(objectParse);
                objectParse = null;
            }
        }

        return stringJson ? '[' + stringJson.substring(0, stringJson.length - 1) + ']' : '[]';
    }

    function fromDwg(stringDwg) {
        return true;
    }

    function fromJson(stringJson) {
        return true;
    }

    function fromSvg(stringSvg) {
        return true;
    }

    exports.fromDxf = fromDxf;
    exports.fromDwg = fromDwg;
    exports.fromJson = fromJson;
    exports.fromSvg = fromSvg;

});
define("utility/types", ['require', 'exports'], function (require, exports) {

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
        }
    }

    var string = {

        format: function (str, args) {
            return str.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        },
        contains: function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        }

    }

    var graphic = {

        mousePosition: function (Element, x, y) {
            var bb = Element.getBoundingClientRect();

            x = (x - bb.left) * (Element.clientWidth / bb.width);
            y = (y - bb.top) * (Element.clientHeight / bb.height);

            // tradução para o sistema de coordenadas cartesiano
            y = (y - Element.clientHeight) * -1;

            return {
                x: x,
                y: y
            };
        }

    }

    var data = {

        dictionary: (function () {

            function Dictionary() {
                this.store = [];
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

    var object = {
        inherits: function (f, p) {
            f.prototype = new p();
            return f;
        },
        /*
         * Copy the enumerable properties of p to o, and return o
         * If o and p have a property by the same name, o's property is overwritten
         * This function does not handle getters and setters or copy attributes
         */
        extend: function (o, p) {
            for (var prop in p) { // For all props in p.
                Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(p, prop)); // add the property to o.
            }
            return o;
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

    exports.math = math;
    exports.string = string;
    exports.graphic = graphic;
    exports.data = data;
    exports.object = object;
});
window.plane = require("plane");
})(window);