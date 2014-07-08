/*!
 * C37 in 08-07-2014 at 14:40:57 
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
        point = require('geometric/point'),
        vector = require('geometric/vector');


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


    function circleBezier(p1, p2, p3, p4, ec, rx, ry) {
        
        debugger;
        
        var a, b, c, d; // temporary variables
        var c3, c2, c1, c0; // coefficients of cubic
//        var result = new Intersection("No Intersection");

        // Calculate the coefficients of cubic polynomial
        a = p1.multiply(-1);
        b = p2.multiply(3);
        c = p3.multiply(-3);
        d = a.sum(b.sum(c.sum(p4)));
        c3 = vector.create(d.x, d.y);

        a = p1.multiply(3);
        b = p2.multiply(-6);
        c = p3.multiply(3);
        d = a.sum(b.sum(c));
        c2 = vector.create(d.x, d.y);

        a = p1.multiply(-3);
        b = p2.multiply(3);
        c = a.sum(b);
        c1 = vector.create(c.x, c.y);

        c0 = vector.create(p1.x, p1.y);

        var rxrx = rx * rx;
        var ryry = ry * ry;
        var poly = polynomial.create(
            c3.x * c3.x * ryry + c3.y * c3.y * rxrx,
            2 * (c3.x * c2.x * ryry + c3.y * c2.y * rxrx),
            2 * (c3.x * c1.x * ryry + c3.y * c1.y * rxrx) + c2.x * c2.x * ryry + c2.y * c2.y * rxrx,
            2 * c3.x * ryry * (c0.x - ec.x) + 2 * c3.y * rxrx * (c0.y - ec.y) +
            2 * (c2.x * c1.x * ryry + c2.y * c1.y * rxrx),
            2 * c2.x * ryry * (c0.x - ec.x) + 2 * c2.y * rxrx * (c0.y - ec.y) +
            c1.x * c1.x * ryry + c1.y * c1.y * rxrx,
            2 * c1.x * ryry * (c0.x - ec.x) + 2 * c1.y * rxrx * (c0.y - ec.y),
            c0.x * c0.x * ryry - 2 * c0.y * ec.y * rxrx - 2 * c0.x * ec.x * ryry +
            c0.y * c0.y * rxrx + ec.x * ec.x * ryry + ec.y * ec.y * rxrx - rxrx * ryry
        );
        var roots = poly.getRootsInInterval(0, 1);
        
        return roots.length > 1;
        

//        for (var i = 0; i < roots.length; i++) {
//            var t = roots[i];
//
//            result.points.push(
//                c3.multiply(t * t * t).sum(c2.multiply(t * t).add(c1.multiply(t).add(c0)))
//            );
//        }
//
//        if (result.points.length > 0) result.status = "Intersection";
//
//        return result;
    };



//    function circleQuadratic(p1, p2, p3, c, r) {
    function circleQuadratic(p1, p2, p3, ec, rx, ry) {
        
        var a, b; // temporary variables
        var c2, c1, c0; // coefficients of quadratic
//        var result = new Intersection("No Intersection");

        a = p2.multiply(-2);
        c2 = p1.sum(a.sum(p3));

        a = p1.multiply(-2);
        b = p2.multiply(2);
        c1 = a.sum(b);

        c0 = point.create(p1.x, p1.y);

        var rxrx = rx * rx;
        var ryry = ry * ry;
        var roots = polynomial.create(
            ryry * c2.x * c2.x + rxrx * c2.y * c2.y,
            2 * (ryry * c2.x * c1.x + rxrx * c2.y * c1.y),
            ryry * (2 * c2.x * c0.x + c1.x * c1.x) + rxrx * (2 * c2.y * c0.y + c1.y * c1.y) -
            2 * (ryry * ec.x * c2.x + rxrx * ec.y * c2.y),
            2 * (ryry * c1.x * (c0.x - ec.x) + rxrx * c1.y * (c0.y - ec.y)),
            ryry * (c0.x * c0.x + ec.x * ec.x) + rxrx * (c0.y * c0.y + ec.y * ec.y) -
            2 * (ryry * ec.x * c0.x + rxrx * ec.y * c0.y) - rxrx * ryry
        ).getRoots();
        
        
        return roots.length > 1;
        

//        for (var i = 0; i < roots.length; i++) {
//            var t = roots[i];
//
//            if (0 <= t && t <= 1)
//                result.points.push(c2.multiply(t * t).add(c1.multiply(t).add(c0)));
//        }
//
//        if (result.points.length > 0) result.status = "Intersection";
//
//        return result;
    };


    exports.circleLine = circleLine;
    exports.circleRectangle = circleRectangle;
    exports.circleCircle = circleCircle;
    exports.circleArc = circleArc;
    exports.circleEllipse = circleEllipse;
    exports.circleBezier = circleBezier;
    exports.circleQuadratic = circleQuadratic;
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
            if (this.points) {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i] = this.points[i].sum(value);
                }
            }

            return true;
        },
        contains: function (pointMouse) {

            switch (this.type) {
            case 'line':
                {
                    var pointA = this.points[0],
                        pointB = this.points[1]

                    if (intersection.circleLine(pointMouse, 2, pointA, pointB))
                        return true;

                    break;
                }
            case 'bezier':
                {
                    for (var i = 0; i < this.points.length; i++) {
                        if (intersection.circleQuadratic(this.points[i].cp1, this.points[i].cp2, this.points[i].point, point.create(pointMouse.x, pointMouse.y), 2, 2))
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
        render: function (context2D, zoom) {

            if (this.status == 'over') {
                context2D.strokeStyle = 'rgb(61, 142, 193)';
            }

            if (this.status == 'selected') {

                context2D.strokeStyle = 'rgb(68, 121, 154)';
                if (this.point) {
                    context2D.strokeRect(this.point.x - (Math.round(2 * zoom) / 2), this.point.y - (Math.round(2 * zoom) / 2), Math.round(2 * zoom), Math.round(2 * zoom));
                }
                if (this.points) {
                    this.points.forEach(function (point) {
                        context2D.strokeRect(point.x - (Math.round(2 * zoom) / 2), point.y - (Math.round(2 * zoom) / 2), Math.round(2 * zoom), Math.round(2 * zoom));
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
                        context2D.bezierCurveTo(point.cp1.x, point.cp1.y, point.cp2.x, point.cp2.y, point.point.x, point.point.y);
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
                    // http://gis.stackexchange.com/questions/49223/drawing-ellipse-with-openlayers
                    // http://scienceprimer.com/draw-oval-html5-canvas
                    context2D.translate(this.point.x, this.point.y);
                    context2D.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2)

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
                    x: [types.math.parseFloat(this.points[0].x, 5), types.math.parseFloat(this.points[0].y, 5)],
                    y: [types.math.parseFloat(this.points[1].x, 5), types.math.parseFloat(this.points[1].y, 5)]
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
    var Quadratic = types.object.inherits(function Quadratic(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'quadratic';
        this.points = attrs.points;

        //        this.points = [{
        //            cp: point,
        //            point: point
        //        }]
    }, Shape);

    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    var Bezier = types.object.inherits(function Bezier(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'bezier';
        this.points = attrs.points;

        //        this.points = [{
        //            cp1: point,
        //            cp2: point,
        //            point: point
        //        }]

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
                attrs.points = [point.create(attrs.x[0], attrs.x[1]), point.create(attrs.y[0], attrs.y[1])];
                return new Line(attrs);
            }
        case 'bezier':
            {
                attrs.points = attrs.points.map(function (singlePoint) {
                    return {
                        cp1: point.create(singlePoint.cp1[0], singlePoint.cp1[1]),
                        cp2: point.create(singlePoint.cp2[0], singlePoint.cp2[1]),
                        point: point.create(singlePoint.x, singlePoint.y)
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
define("geometric/vector", ['require', 'exports'], function (require, exports) {

    
    // https://github.com/lilo003/algorithm-003/blob/master/src/vector2d/Vector2D.js
    
    function Vector(x, y) {
        if (arguments.length > 0) {
            this.x = x;
            this.y = y;
        }
    }


    /*****
     *
     *   length
     *
     *****/
    Vector.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };


    /*****
     *
     *   dot
     *
     *****/
    Vector.prototype.dot = function (that) {
        return this.x * that.x + this.y * that.y;
    };


    /*****
     *
     *   cross
     *
     *****/
    Vector.prototype.cross = function (that) {
        return this.x * that.y - this.y * that.x;
    }


    /*****
     *
     *   unit
     *
     *****/
    Vector.prototype.unit = function () {
        return this.divide(this.length());
    };


    /*****
     *
     *   unitEquals
     *
     *****/
    Vector.prototype.unitEquals = function () {
        this.divideEquals(this.length());

        return this;
    };


    /*****
     *
     *   add
     *
     *****/
    Vector.prototype.add = function (that) {
        return new Vector(this.x + that.x, this.y + that.y);
    };


    /*****
     *
     *   addEquals
     *
     *****/
    Vector.prototype.addEquals = function (that) {
        this.x += that.x;
        this.y += that.y;

        return this;
    };


    /*****
     *
     *   subtract
     *
     *****/
    Vector.prototype.subtract = function (that) {
        return new Vector(this.x - that.x, this.y - that.y);
    };


    /*****
     *
     *   subtractEquals
     *
     *****/
    Vector.prototype.subtractEquals = function (that) {
        this.x -= that.x;
        this.y -= that.y;

        return this;
    };


    /*****
     *
     *   multiply
     *
     *****/
    Vector.prototype.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };


    /*****
     *
     *   multiplyEquals
     *
     *****/
    Vector.prototype.multiplyEquals = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    };


    /*****
     *
     *   divide
     *
     *****/
    Vector.prototype.divide = function (scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    };


    /*****
     *
     *   divideEquals
     *
     *****/
    Vector.prototype.divideEquals = function (scalar) {
        this.x /= scalar;
        this.y /= scalar;

        return this;
    };


    /*****
     *
     *   perp
     *
     *****/
    Vector.prototype.perp = function () {
        return new Vector(-this.y, this.x);
    };


    /*****
     *
     *   perpendicular
     *
     *****/
    Vector.prototype.perpendicular = function (that) {
        return this.subtract(this.project(that));
    };


    /*****
     *
     *   project
     *
     *****/
    Vector.prototype.project = function (that) {
        var percent = this.dot(that) / that.dot(that);

        return that.multiply(percent);
    };


    /*****
     *
     *   toString
     *
     *****/
    Vector.prototype.toString = function () {
        return this.x + "," + this.y;
    };


    /*****
     *
     *   fromPoints
     *
     *****/
    Vector.fromPoints = function (p1, p2) {
        return new Vector(
            p2.x - p1.x,
            p2.y - p1.y
        );
    };


    function create(x, y) {
        return new Vector(x, y);
    };
    

    exports.create = create;
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

    var layerSystem = null,
        viewPort = null;


    var plane = types.object.extend(types.object.event.create(), {

        initialize: function (config) {
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

            plane.settings = config.settings ? config.settings : plane.settings;

            gridDraw(viewPort.clientHeight, viewPort.clientWidth, plane.zoom, plane.scroll);

            toolManager.event.start({
                viewPort: viewPort,
                update: plane.update
            });

            return true;
        },
        update: function (layerSystem) {

            var layerStyle = layerSystem ? layerSystem.style : layerManager.active().style,
                layerShapes = layerSystem ? layerSystem.shapes.list() : layerManager.active().shapes.list(),
                layerRender = layerSystem ? layerSystem.render : layerManager.active().render,
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

                shape.render(context2D, plane.zoom);

                context2D.stroke();
                // restore state of all configuration
                context2D.restore();
            });

            return true;
        },
        clear: function () {

            // reset em scroll
            if ((plane.scroll.x != 0) || (plane.scroll.y != 0)) {
                plane.scroll = {
                    x: 0,
                    y: 0
                }
            };

            // reset em zoom
            if (plane.zoom != 1) {
                plane.zoom = 1;
            }

            // remove em todas as layers
            layerManager.remove();

            return true;
        },
        layer: types.object.extend(types.object.event.create(), {
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
                    Layer: layerManager.active()
                });

                layerManager.active(value);

                this.notify('onActive', {
                    type: 'onActive',
                    Layer: layerManager.active()
                });
            }

        }),
        shape: {
            create: function (attrs) {
                if ((typeof attrs == "function") || (attrs == null)) {
                    throw new Error('shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }
                if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier'].indexOf(attrs.type) == -1) {
                    throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }
                if (((attrs.type != 'polyline') && (attrs.type != 'bezier')) && ((attrs.x == undefined) || (attrs.y == undefined))) {
                    throw new Error('shape - create - x and y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                var shape = shapeManager.create(attrs);

                layerManager.active().shapes.add(shape.uuid, shape);

                return true;
            }
        },
        tool: {
            create: function (attrs) {
                if (typeof attrs == "function") {
                    throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                return toolManager.create(attrs);
            }
        },
        get zoom() {
            return this._zoom || 1;
        },
        set zoom(value) {

            // plane.zoom /= .9;  - more
            // plane.zoom *= .9; - less

            var LayerActive = layerManager.active(),
                zoomFactor = value / plane.zoom;

            gridDraw(viewPort.clientHeight, viewPort.clientWidth, value, this.scroll);

            // Se não alguma Layer Ativa = clear || importer
            if (LayerActive) {
                layerManager.list().forEach(function (Layer) {

                    layerManager.active(Layer.uuid);

                    layerManager.active().shapes.list().forEach(function (Shape) {
                        Shape.scaleTo(zoomFactor);
                    });

                    plane.update();
                });
                layerManager.active(LayerActive.uuid);
            }

            this._zoom = value;
        },
        get scroll() {
            return this._scroll || {
                x: 0,
                y: 0
            };
        },
        set scroll(value) {

            var LayerActive = layerManager.active(),
                MoveFactor = {
                    x: value.x + this.scroll.x,
                    y: value.y + this.scroll.y
                };

            gridDraw(viewPort.clientHeight, viewPort.clientWidth, this.zoom, MoveFactor);

            // Se não alguma Layer Ativa = clear || importer
            if (LayerActive) {
                value.x = value.x * this.zoom;
                value.y = value.y * this.zoom;

                layerManager.list().forEach(function (Layer) {

                    layerManager.active(Layer.uuid);

                    layerManager.active().shapes.list().forEach(function (Shape) {
                        Shape.moveTo(value);
                    });

                    plane.update();

                });
                layerManager.active(LayerActive.uuid);
            }

            this._scroll = MoveFactor;
        },
        get settings() {
            return this._settings || {
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            };
        },
        set settings(value) {
            this._settings = value;
        },
        importer: {
            fromJson: function (stringJson) {

                var planeObject = JSON.parse(stringJson);

                plane.clear();

                plane.settings = planeObject.settings;
                plane.zoom = planeObject.zoom;
                plane.scroll = planeObject.scroll;

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
                        plane.shape.create(shapeObject)
                    });

                    plane.update();
                });

                return true;
            },
            fromSvg: null,
            fromDxf: function (stringDxf) {
                plane.clear();

                var stringJson = importer.fromDxf(stringDxf);
                var objectDxf = JSON.parse(stringJson.replace(/u,/g, '').replace(/undefined,/g, ''));

                if (stringJson) {
                    plane.layer.create();
                    for (var prop in objectDxf) {
                        plane.shape.create(objectDxf[prop]);
                    }
                    plane.update();
                }
            },
            fromDwg: null
        },
        exporter: {
            toJson: function () {

                var planeExport = {
                    settings: plane.settings,
                    zoom: types.math.parseFloat(plane.zoom, 5),
                    scroll: plane.scroll,
                    layers: layerManager.list().map(function (layerExport) {
                        var layerObject = layerExport.toObject();

                        layerObject.shapes = layerObject.shapes.map(function (shapeExport) {
                            return shapeExport.toObject();
                        });

                        return layerObject;
                    })
                }

                return JSON.stringify(planeExport);

            }
        }
    });


    function gridDraw(height, width, zoom, scroll) {

        if (!plane.settings.gridEnable) return;

        if (!layerSystem) {
            var attrs = { // atributos para a layer do grid (sistema) 
                viewPort: viewPort,
                name: 'Plane - System',
                status: 'system',
                style: {
                    backgroundColor: plane.settings.backgroundColor
                }
            };
            layerSystem = layerManager.create(attrs);
        } else {
            layerSystem.shapes.clear();
        }

        // calculos para o zoom
        width = zoom > 1 ? Math.round(width * zoom) : Math.round(width / zoom);
        height = zoom > 1 ? Math.round(height * zoom) : Math.round(height / zoom);

        var lineBold = 0;
        if (scroll.x > 0) {
            for (var x = (scroll.x * zoom); x >= 0; x -= (10 * zoom)) {

                var shape = shapeManager.create({
                    uuid: types.math.uuid(9, 16),
                    type: 'line',
                    x: [x, 0],
                    y: [x, height],
                    style: {
                        lineColor: plane.settings.gridColor,
                        lineWidth: lineBold % 5 == 0 ? .8 : .3
                    }
                });

                layerSystem.shapes.add(shape.uuid, shape);
                lineBold++;
            }
        }

        lineBold = 0;
        for (var x = (scroll.x * zoom); x <= width; x += (10 * zoom)) {

            var shape = shapeManager.create({
                uuid: types.math.uuid(9, 16),
                type: 'line',
                x: [x, 0],
                y: [x, height],
                style: {
                    lineColor: plane.settings.gridColor,
                    lineWidth: lineBold % 5 == 0 ? .8 : .3
                }
            });

            layerSystem.shapes.add(shape.uuid, shape);
            lineBold++;
        }

        lineBold = 0;
        if (scroll.y > 0) {
            for (var y = (scroll.y * zoom); y >= 0; y -= (10 * zoom)) {

                var shape = shapeManager.create({
                    uuid: types.math.uuid(9, 16),
                    type: 'line',
                    x: [0, y],
                    y: [width, y],
                    style: {
                        lineColor: plane.settings.gridColor,
                        lineWidth: lineBold % 5 == 0 ? .8 : .3
                    }
                });

                layerSystem.shapes.add(shape.uuid, shape);
                lineBold++;
            }
        }

        lineBold = 0;
        for (var y = (scroll.y * zoom); y <= height; y += (10 * zoom)) {

            var shape = shapeManager.create({
                uuid: types.math.uuid(9, 16),
                type: 'line',
                x: [0, y],
                y: [width, y],
                style: {
                    lineColor: plane.settings.gridColor,
                    lineWidth: lineBold % 5 == 0 ? .8 : .3
                }
            });

            layerSystem.shapes.add(shape.uuid, shape);
            lineBold++;
        }

        plane.update(layerSystem);
    };


    exports.public = plane;
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

        if (layer.status != 'system') {
            layerStore.add(layer.uuid, layer);
            this.active(layer.uuid);
            return true;
        } else {
            return layer;
        }
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



    exports.create = create;
    exports.active = active;
    exports.list = list;
    exports.remove = remove;
});
define("structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var toolStore = types.data.dictionary.create(),
        shapeSelected = types.data.dictionary.create();

    var layerManager = require('structure/layer');

    var viewPort = null,
        update = null;


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


    var eventProxy = types.object.extend(types.object.event.create(), {

        start: function (config) {

            viewPort = config.viewPort;
            update = config.update;

            viewPort.onmousemove = function (event) {
                
                if (layerManager.active()) {
                    layerManager.active().shapes.list().forEach(function (shape) {
                        if (shape.status != 'selected') {
                            shape.status = shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY)) ? 'over' : 'out';
                        }
                    });
                    update();
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
                    update();

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

    exports.event = eventProxy;
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


        function toJson(dxfObject) {

            switch (dxfObject.type) {
            case 'LINE':
                {
                    var line = '{ "type": "line", "x": [{0}, {1}], "y": [{2}, {3}] }';
                    return types.string.format(line, [dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1]);
                }
            case 'CIRCLE':
                {
                    var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} }';
                    return types.string.format(circle, [dxfObject.x, dxfObject.y, dxfObject.r]);
                }
            case 'ARC':
                {
                    var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2},"startAngle": {3}, "endAngle": {4}, "clockWise": {5} }';
                    return types.string.format(arc, [dxfObject.x, dxfObject.y, dxfObject.r, dxfObject.a0, dxfObject.a1, false]);
                }
            case 'ELLIPSE':
                {
                    var ellipse = '{"type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2},"radiusX": {3} }',
                        radiusX = Math.abs(dxfObject.x1),
                        radiusY = radiusX * dxfObject.r;

                    return types.string.format(ellipse, [dxfObject.x, dxfObject.y, radiusY, radiusX])
                }
            case 'LWPOLYLINE':
                {
                    if (dxfObject.vertices) {

                        var polyline = '{"type": "polyline", "points": [{0}]}',
                            points = '';

                        for (var i = 0; i < dxfObject.vertices.length; i++) {

                            var point = i == dxfObject.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [dxfObject.vertices[i].x, dxfObject.vertices[i].y]);

                        }
                        return types.string.format(polyline, [points]);
                    }
                }
            }

        }

        var groupCodes = {
            0: 'entitytype',
            2: 'blockname',
            10: 'x',
            11: 'x1',
            20: 'y',
            21: 'y1',
            40: 'r',
            50: 'a0',
            51: 'a1',
        };

        var supportedEntities = ['LINE', 'CIRCLE', 'ARC', 'ELLIPSE', 'LWPOLYLINE'];

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
                if (groupCode === 'blockname' && value === 'ENTITIES') {
                    isEntitiesSectionActive = true;
                } else if (isEntitiesSectionActive) {

                    if (groupCode === 'entitytype') { // New entity starts.
                        if (object.type) {
                            json += json.substring(json.length - 1, json.length) == '[' ? '' : ',';
                            json += toJson(object);
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
window.plane = require("plane").public;
})(window);