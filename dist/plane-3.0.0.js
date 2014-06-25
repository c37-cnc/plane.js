/*!
 * C37 in 24-06-2014 at 22:05:49 
 *
 * plane version: 3.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */

(function (window) {
"use strict";
var define, require;

(function () { //http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
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
define("geometric/bézier", ['require', 'exports'], function (require, exports) {


});
define("geometric/group", ['require', 'exports'], function (require, exports) {




});
define("geometric/intersection", ['require', 'exports'], function (require, exports) {

    var Polynomial = require('geometric/polynomial').Polynomial,
        Point = require('geometric/point');


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

        return new Polynomial(
            AB * BC - AC * AC,
            AB * BEmCD + AD * BC - 2 * AC * AE,
            AB * BFpDE + AD * BEmCD - AE * AE - 2 * AC * AF,
            AB * DF + AD * BFpDE - 2 * AE * AF,
            AD * DF - AF * AF
        );
    };


    function CircleLine(c, r, a1, a2) {
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

    function CircleRectangle(c, r, p, h, w) {

        var rightBottom = Point.Create(p.x + w, p.y),
            rightTop = Point.Create(p.x + w, p.y + h),
            leftTop = Point.Create(p.x, p.y + h),
            leftBottom = Point.Create(p.x, p.y);

        var inter1 = CircleLine(c, r, rightBottom, rightTop);
        var inter2 = CircleLine(c, r, rightTop, leftTop);
        var inter3 = CircleLine(c, r, leftTop, leftBottom);
        var inter4 = CircleLine(c, r, leftBottom, rightBottom);

        return inter1 || inter2 || inter3 || inter4;
    };

    function CircleCircle(c1, r1, c2, r2) {
        var result;

        // Determine minimum and maximum radii where circles can intersect
        var r_max = r1 + r2;
        var r_min = Math.abs(r1 - r2);

        // Determine actual distance between circle circles
        var c_dist = c1.DistanceTo(c2);

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
            var p = c1.InterpolationLinear(c2, a / c_dist);
            var b = h / c_dist;

            result.points.push(Point.Create(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x)));
            result.points.push(Point.Create(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x)));

        }

        return result;
    };

    function CircleArc(c, r1, ca, r2, as, ae, ck) {

        var intersection = CircleCircle(c, r1, ca, r2);

        if (intersection.points) {

            var radianStart = as / 360 * 2 * Math.PI,
                radianEnd = ae / 360 * 2 * Math.PI,
                radianMid = radianStart > radianEnd ? (radianStart - radianEnd) / 2 : (radianEnd - radianStart) / 2;

            var pointStart = Point.Create(ca.x + Math.cos(radianStart) * r2, ca.y + Math.sin(radianStart) * r2),
                pointEnd = Point.Create(ca.x + Math.cos(radianEnd) * r2, ca.y + Math.sin(radianEnd) * r2),
                pointMid = Point.Create(ca.x + Math.cos(radianMid) * r2, ck ? ca.y - Math.sin(radianMid) * r2 : ca.y + Math.sin(radianMid) * r2);

            var twoPi = (Math.PI + Math.PI);

            for (var i = 0; i <= intersection.points.length - 1; i++) {

                var pointDistance = intersection.points[i].DistanceTo(ca),
                    radius = r2;

                if (radius - 4 <= pointDistance && pointDistance <= radius + 4) {

                    var pointStartAngle = ca.AngleTo(pointStart),
                        pointMidAngle = ca.AngleTo(pointMid),
                        pointEndAngle = ca.AngleTo(pointEnd),
                        pointMouseAngle = ca.AngleTo(intersection.points[i]);

                    if (pointStartAngle <= pointMidAngle && pointMidAngle <= pointEndAngle) {
                        // 2014.06.24 - 14:33 - lilo - em observação
                        //                        if (ck) {
                        //                            return (pointStartAngle <= pointMouseAngle && pointMouseAngle <= pointEndAngle) ? true : false;
                        //                        } else {
                        //                            return (pointStartAngle <= pointMouseAngle && pointMouseAngle <= pointEndAngle) ? false : true;
                        //                        }
                        return (pointStartAngle <= pointMouseAngle && pointMouseAngle <= pointEndAngle) ? true : false;

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
    };


    function CircleEllipse(c1, ry1, rx1, c2, ry2, rx2) {

        var a = [ry1 * ry1, 0, rx1 * rx1, -2 * ry1 * ry1 * c1.x, -2 * rx1 * rx1 * c1.y, ry1 * ry1 * c1.x * c1.x + rx1 * rx1 * c1.y * c1.y - rx1 * rx1 * ry1 * ry1];
        var b = [ry2 * ry2, 0, rx2 * rx2, -2 * ry2 * ry2 * c2.x, -2 * rx2 * rx2 * c2.y, ry2 * ry2 * c2.x * c2.x + rx2 * rx2 * c2.y * c2.y - rx2 * rx2 * ry2 * ry2];

        var yPoly = Bezout(a, b);
        var yRoots = yPoly.getRoots();
        var epsilon = 1e-3;
        var norm0 = (a[0] * a[0] + 2 * a[1] * a[1] + a[2] * a[2]) * epsilon;
        var norm1 = (b[0] * b[0] + 2 * b[1] * b[1] + b[2] * b[2]) * epsilon;

        for (var y = 0; y < yRoots.length; y++) {
            var xPoly = new Polynomial(
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

    exports.CircleLine = CircleLine;
    exports.CircleRectangle = CircleRectangle;
    exports.CircleCircle = CircleCircle;
    exports.CircleArc = CircleArc;
    exports.CircleEllipse = CircleEllipse;
});
define("geometric/point", ['require', 'exports'], function (require, exports) {

    function Point(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype = {
        Sum: function (point) {
            return new Point(this.x + point.x, this.y + point.y);
        },
        Subtract: function (point) {
            return new Point(this.x - point.x, this.y - point.y);
        },
        DistanceTo: function (point) {
            var dx = this.x - point.x;
            var dy = this.y - point.y;

            return Math.sqrt(dx * dx + dy * dy);
        },
        MidTo: function (point) {
            return new Point(this.x + (point.x - this.x) / 2, this.y + (point.y - this.y) / 2);
        },
        AngleTo: function (point) {
            return Math.atan2(point.y - this.y, point.x - this.x);
        },
        InterpolationLinear: function (point, value) {
            return new Point(
                this.x + (point.x - this.x) * value,
                this.y + (point.y - this.y) * value
            );
        }
    };

    function Create(x, y) {
        return new Point(x, y);
    };

    exports.Create = Create;

});
define("geometric/polynomial", ['require', 'exports'], function (require, exports) {

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

    exports.Polynomial = Polynomial;

});
define("geometric/shape", ['require', 'exports'], function (require, exports) {

    var Point = require('geometric/point'),
        Intersection = require('geometric/intersection');

    function Shape(uuid, name, locked, visible, selected) {

        this.uuid = uuid;
        this.name = name;
        this.locked = locked;
        this.visible = visible;
        this.status = selected;

    };
    Shape.prototype = {
        rotate: function (value) {
            return true;
        },
        get Scale() {
            return this._scale || 1;
        },
        set Scale(value) {

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

            this._scale = value;
        },
        MoveTo: function (value) {

            value = {
                x: value.X,
                y: value.Y
            };

            if (this.point) {
                this.point = this.point.Sum(value);
            } else {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i] = this.points[i].Sum(value);
                }
            }
            return true;
        },
        Contains: function (pointActual) {

            var pointOrigin,
                pointDestination,
                pointIntersection = 0;

            switch (this.type) {
            case 'line':
                {

                    //debugger;
                    pointOrigin = this.points[0];
                    pointDestination = this.points[1];

                    if (Intersection.CircleLine(pointActual, 2, pointOrigin, pointDestination))
                        return true;

                    break;
                }
            case 'rectangle':
                {
                    if (Intersection.CircleRectangle(pointActual, 2, this.point, this.height, this.width))
                        return true;

                    break;
                }
            case 'arc':
                {
                    pointActual = Point.Create(pointActual.x, pointActual.y);

                    if (Intersection.CircleArc(pointActual, 2, this.point, this.radius, this.startAngle, this.endAngle, this.clockWise))
                        return true;

                    break;
                }
            case 'circle':
                {
                    pointActual = Point.Create(pointActual.x, pointActual.y);

                    if (Intersection.CircleCircle(pointActual, 2, this.point, this.radius))
                        return true;

                    break;
                }
            case 'ellipse':
                return (Intersection.CircleEllipse(pointActual, 2, 2, this.point, this.radiusY, this.radiusX))
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

                        if (Intersection.CircleLine(pointActual, 2, pointOrigin, pointDestination))
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

            if (this.status == 'Over') {
                context2D.strokeStyle = 'rgb(61, 142, 193)';
            }


            switch (this.type) {
            case 'arc':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.arc(0, 0, this.radius, (Math.PI / 180) * this.startAngle, (Math.PI / 180) * this.endAngle, this.clockWise);

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
            case 'rectangle':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.strokeRect(0, 0, this.width, this.height);

                    return true;
                }
            }

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

    function Rectangle(attrs) {
        this.type = 'rectangle';
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;

        Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
    }
    Rectangle.prototype = Shape.prototype;


    function Create(uuid, type, x, y, style, radius, startAngle, endAngle, clockWise, sides, height, width, radiusY, radiusX) {

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

                    var pointX = (radius * Math.cos(((Math.PI * 2) / sides) * i) + x),
                        pointY = (radius * Math.sin(((Math.PI * 2) / sides) * i) + y);

                    attrs['points'].push(Point.Create(pointX, pointY));
                }

                return new Polygon(attrs);
            }
        default:
            break;
        }

    }

    exports.Create = Create;
});
define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var Types = require('utility/types'),
        Import = require('utility/import');

    var LayerStore = new Types.Data.Dictionary(),
        ToolsStore = new Types.Data.Dictionary();

    var Layer = require('structure/layer'),
        Shape = require('geometric/shape'),
        Tools = require('structure/tools');

    var LayerActive = null,
        ViewPort = null,
        Settings = null;


    var Plane = Types.Object.Extend(new Types.Object.Event(), {

        Initialize: function (Config) {
            // verificações para as configurações
            if (Config == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (typeof Config == "function") {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (Config.ViewPort == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            // verificações para as Configurações

            ViewPort = Config.ViewPort;


            Settings = Types.Object.Merge({
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            }, Config.Settings || {});


            // start em eventos
            ViewPort.onmousemove = function (Event) {
                Tools.Event.notify('onMouseMove', {
                    Event: event,
                    ViewPort: ViewPort,
                    Shapes: LayerActive.Shapes.List(),
                    Plane: Plane
                });
            };
            ViewPort.onclick = function (event) {
                Tools.Event.notify('onClick', event);
            }
            // start em eventos

            GridDraw(Settings.gridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.gridColor, this.Zoom, this.Scroll);

            return true;
        },
        Update: function () {

            var LayerStyle = LayerActive.Style,
                LayerShapes = LayerActive.Shapes.List(),
                LayerRender = LayerActive.Render,
                Context2D = LayerRender.getContext('2d');

            // limpando o render
            Context2D.clearRect(0, 0, ViewPort.clientWidth, ViewPort.clientHeight);

            // style of layer
            Context2D.lineCap = LayerStyle.lineCap;
            Context2D.lineJoin = LayerStyle.lineJoin;

            // render para cada shape
            LayerShapes.forEach(function (shape) {
                // save state of all Configuration
                Context2D.save();
                Context2D.beginPath();

                shape.render(Context2D);

                Context2D.stroke();
                // restore state of all Configuration
                Context2D.restore();
            });

            return true;
        },
        Layer: Types.Object.Extend(new Types.Object.Event(), {
            Create: function (attrs) {

                attrs = Types.Object.Union(attrs, {
                    ViewPort: ViewPort,
                    count: LayerStore.Count(),
                    backgroundColor: Settings.backgroundColor
                });

                var layer = Layer.Create(attrs);
                LayerStore.Add(layer.Uuid, layer);
                LayerActive = layer;

            },
            List: function (Selector) {

                var LayerList = LayerStore.List().filter(function (Layer) {
                    return Selector ? Layer : !Layer.System;
                });

                return LayerList;
            },
            Delete: function () {},
            get Active() {
                return LayerActive || {};
            },
            set Active(value) {
                this.notify('onDeactive', {
                    type: 'onDeactive',
                    layer: LayerActive
                });

                LayerActive = LayerStore.Find(value);

                this.notify('onActive', {
                    type: 'onActive',
                    layer: LayerActive
                });
            }

        }),
        Shape: {
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

                attrs = Types.Object.Merge({
                    uuid: Types.Math.Uuid(9, 16)
                }, attrs);

                var shape = Shape.Create(attrs.uuid, attrs.type, attrs.x, attrs.y, attrs.style, attrs.radius, attrs.startAngle,
                    attrs.endAngle, attrs.clockWise, attrs.sides, attrs.height, attrs.width, attrs.radiusY, attrs.radiusX);

                LayerActive.Shapes.Add(shape.uuid, shape);

                return true;
            }
        },
        Import: {
            FromJson: null,
            FromSvg: null,
            FromDxf: function (StringDxf) {
                try {
                    var StringJson = Import.FromDxf(StringDxf);
                    var ObjectDxf = JSON.parse(StringJson.replace(/u,/g, '').replace(/undefined,/g, ''));

                    if (StringJson) {
                        Plane.Layer.Create();
                        for (var prop in ObjectDxf) {
                            Plane.Shape.Create(ObjectDxf[prop]);
                        }
                        Plane.Update();
                    }

                } catch (error) {
                    alert(error);
                }
            },
            FromDwg: null
        },
        get Zoom() {
            return this._zoom || 1;
        },
        set Zoom(value) {

            // Plane.Zoom /= .9;  - more
            // Plane.Zoom *= .9; - less

            GridDraw(Settings.gridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.gridColor, value, this.Scroll);

            var LayerActive = Plane.Layer.Active,
                ZoomFactor = value / Plane.Zoom;

            Plane.Layer.List().forEach(function (Layer) {

                Plane.Layer.Active = Layer.Uuid;

                Plane.Layer.Active.Shapes.List().forEach(function (Shape) {
                    Shape.Scale = ZoomFactor;
                });

                Plane.Update();
            });

            Plane.Layer.Active = LayerActive.Uuid;

            this._zoom = value;
        },
        get Scroll() {
            return this._scroll || {
                X: 0,
                Y: 0
            };
        },
        set Scroll(value) {

            var LayerActive = Plane.Layer.Active;
            var MoveFactor = {
                X: value.X + this.Scroll.X,
                Y: value.Y + this.Scroll.Y
            };
            
//            debugger;
            
            value.X *= this.Zoom;
            value.Y *= this.Zoom;
            
            GridDraw(Settings.gridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.gridColor, this.Zoom, MoveFactor);

            Plane.Layer.List().forEach(function (Layer) {

                Plane.Layer.Active = Layer.Uuid;

                Plane.Layer.Active.Shapes.List().forEach(function (Shape) {
                    Shape.MoveTo(value);
                });

                Plane.Update();
            });

            Plane.Layer.Active = LayerActive.Uuid;

            this._scroll = MoveFactor;
        }
    });


    function GridDraw(Enabled, Height, Width, Color, Zoom, Scroll) {

        if (!Enabled) return;

        var LayerSystem = LayerStore.List().filter(function (Layer) {
            return Layer.System;
        });

        var LayerActive = Plane.Layer.Active,
            LineBold = 0;

        if (LayerSystem.length == 1) {
            LayerSystem[0].Shapes = new Types.Data.Dictionary();
            Plane.Layer.Active = LayerSystem[0].Uuid;
        } else {
            Plane.Layer.Create({
                System: true,
                Name: 'Plane - Grid'
            });
        }

        Width = Zoom > 1 ? Width * Zoom : Width / Zoom;
        Height = Zoom > 1 ? Height * Zoom : Height / Zoom;

        if (Scroll.X > 0) {

            for (var x = (Scroll.X * Zoom); x >= 0; x -= (10 * Zoom)) {

                var LineFactor = Math.round(x * Zoom);

                Plane.Shape.Create({
                    type: 'line',
                    x: [LineFactor, 0],
                    y: [LineFactor, Height],
                    style: {
                        lineColor: 'red',
                        lineWidth: LineBold % 5 == 0 ? .8 : .3
                    }
                });

                LineBold++;
            }
        }

        LineBold = 0;

        for (var x = (Scroll.X * Zoom); x <= Width; x += (10 * Zoom)) {

            var LineFactor = Math.round(x * Zoom);

            Plane.Shape.Create({
                type: 'line',
                x: [LineFactor, 0],
                y: [LineFactor, Height],
                style: {
                    lineColor: Color,
                    lineWidth: LineBold % 5 == 0 ? .8 : .3
                }
            });

            LineBold++;
        }

        LineBold = 0;

        if (Scroll.Y > 0) {
            for (var y = (Scroll.Y * Zoom); y >= 0; y -= (10 * Zoom)) {

                var LineFactor = Math.round(y * Zoom);

                Plane.Shape.Create({
                    type: 'line',
                    x: [0, LineFactor],
                    y: [Width, LineFactor],
                    style: {
                        lineColor: 'red',
                        lineWidth: LineBold % 5 == 0 ? .8 : .3
                    }
                });

                LineBold++;
            }
        }

        LineBold = 0;

        for (var y = (Scroll.Y * Zoom); y <= Height; y += (10 * Zoom)) {

            var LineFactor = Math.round(y * Zoom);

            Plane.Shape.Create({
                type: 'line',
                x: [0, LineFactor],
                y: [Width, LineFactor],
                style: {
                    lineColor: Color,
                    lineWidth: LineBold % 5 == 0 ? .8 : .3
                }
            });
            LineBold++;
        }

        Plane.Update();

        if (LayerSystem.length == 1) {
            Plane.Layer.Active = LayerActive.Uuid;
        }
    };


    exports.PlaneApi = Plane;
});
define("structure/layer", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');

    function Layer(Attrs) {

        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Locked = Attrs.Locked;
        this.Visible = Attrs.Visible;
        this.System = Attrs.System;
        this.Style = Attrs.Style;
        this.Render = Attrs.Render;
        this.Shapes = Attrs.Shapes;

        Types.Object.Event.call(this);

    }
    Layer.prototype = Types.Object.Event.prototype;

    Layer.prototype.ToJson = function () {
        return JSON.stringify(this).replace(/_/g, '');
    }


    function Create(Attrs) {
        if (typeof Attrs == "function") {
            throw new Error('Layer - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var Uuid = Types.Math.Uuid(9, 16);

        // montando o Render da Layer
        var Render = document.createElement('canvas');

        Render.width = Attrs.ViewPort.clientWidth;
        Render.height = Attrs.ViewPort.clientHeight;

        Render.style.position = "absolute";
        Render.style.backgroundColor = Attrs.count == 0 ? Attrs.backgroundColor : 'transparent';

        // sistema cartesiano de coordenadas
        var Context2D = Render.getContext('2d');
        Context2D.translate(0, Render.height);
        Context2D.scale(1, -1);

        // parametros para a nova Layer
        Attrs = Types.Object.Merge({
            Uuid: Uuid,
            Name: 'New Layer ' + Attrs.count,
            Style: {
                fillColor: 'rgb(0,0,0)',
                lineCap: 'butt',
                lineJoin: 'miter',
                lineWidth: .7,
                lineColor: 'rgb(0, 0, 0)',
            },
            Locked: false,
            Visible: true,
            System: false,
            Shapes: new Types.Data.Dictionary(),
            Render: Render
        }, Attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(Attrs);

        // add em ViewPort
        Attrs.ViewPort.appendChild(layer.Render);

        return layer;
    }

    exports.Create = Create;

});
define("structure/tools", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');

    var ToolStore = new Types.Data.Dictionary();

    //    var Tools = Object.Extend(new Object.Event(), {
    //
    //        this.uuid: null,
    //        this.name: '',
    //        get active() {
    //            return this._active;
    //        },
    //        set active(value) {
    //            this._active = value;
    //        }
    //
    //    });

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
    Tool.prototype = Types.Object.Event.prototype;


    function Create(attrs) {
        if (typeof attrs == "function") {
            throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        attrs = Types.Object.Merge({
            uuid: Types.Math.Uuid(9, 16),
            name: 'Tool '.concat(ToolStore.count())
        }, attrs);

        var tool = Tool.Create(attrs.uuid, attrs.name);

        toolStore.add(attrs.uuid, tool);

        return true;
    }

    var EventProxy = new Types.Object.Event();

    EventProxy.listen('onMouseMove', function (Message) {

        var Position = {
            x: Message.Event.clientX,
            y: Message.Event.clientY
        };

        Position = Types.Graphic.MousePosition(Message.ViewPort, Position);

        Message.Shapes.forEach(function (Shape, Index) {

            Shape.status = 'Out';

            if (Shape.Contains(Position)) {

                Shape.status = 'Over';

                console.log(Position);
                console.log(Shape);
            }

        });

        Message.Plane.Update();



    });


    exports.Event = EventProxy;
    exports.Create = Create;

});
define("utility/export", ['require', 'exports'], function (require, exports) {
    
    function ToJson (){
        return true;
    }
    
    function ToSvg (){
        return true;
    }
    
    function ToDxf (){
        return true;
    }
    
    function ToPng (){
        return true;
    }
    
    function ToPdf (){
        return true;
    }

    
    exports.ToJson = ToJson;
    exports.ToSvg = ToSvg;
    exports.ToDxf = ToDxf;
    exports.ToPng = ToPng;
    exports.ToPdf = ToPdf;

});
define("utility/import", ['require', 'exports'], function (require, exports) {

//    var Types = require('utility/types');
    
    function FromDxf(stringDxf) {
        
        
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
                        radiusX = Math.abs(dxfObject.x1),
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
    }

    function FromDwg(stringDwg) {
        return true;
    }

    function FromJson(stringJson) {
        return true;
    }

    function FromSvg(stringSvg) {
        return true;
    }

    exports.FromDxf = FromDxf;
    exports.FromDwg = FromDwg;
    exports.FromJson = FromJson;
    exports.FromSvg = FromSvg;

});
define("utility/types", ['require', 'exports'], function (require, exports) {

    var Maths = {
        Uuid: function (length, radix) {
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
    }

    var String = {

        Format: function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        },
        Contains: function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        }

    }

    var Graphic = {

        MousePosition: function (element, position) {
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

    }

    var Data = {

        Dictionary: (function () {

            function Dictionary() {
                this.store = new Array();
            }

            Dictionary.prototype = {
                Add: function (key, value) {
                    this.store[key] = value;
                },
                Find: function (key) {
                    return this.store[key];
                },
                Remove: function (key) {
                    delete this.store[key];
                },
                Count: function () {
                    return Object.keys(this.store).length;
                },
                List: function () {
                    var self = this;
                    return Object.keys(this.store).map(function (key) {
                        return self.store[key];
                    });
                }
            }

            return Dictionary;
        })()

    }

    var Objects = {
        /*
         * Copy the enumerable properties of p to o, and return o
         * If o and p have a property by the same name, o's property is overwritten
         * This function does not handle getters and setters or copy attributes
         */
        Extend: function (o, p) {
            for (var prop in p) { // For all props in p.
                Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(p, prop)); // Add the property to o.
            }
            return o;
        },
        /*
         * Copy the enumerable properties of p to o, and return o
         * If o and p have a property by the same name, o's property is left alone
         * This function does not handle getters and setters or copy attributes
         */
        Merge: function (o, p) {
            for (var prop in p) { // For all props in p
                if (o.hasOwnProperty[prop]) continue; // Except those already in o
                o[prop] = p[prop]; // Add the property to o
            }
            return o;
        },
        /*
         * Remove properties from o if there is not a property with the same name in p
         * Return o
         */
        Restrict: function (o, p) {
            for (var prop in o) { // For all props in o
                if (!(prop in p)) delete o[prop]; // Delete if not in p
            }
            return o;
        },
        /*
         * For each property of p, delete the property with the same name from o
         * Return o
         */
        Subtract: function (o, p) {
            for (var prop in p) { // For all props in p
                delete o[prop]; // Delete from o (deleting a nonexistent prop is harmless)
            }
            return o;
        },
        /* 
         * Return a new object that holds the properties of both o and p.
         * If o and p have properties by the same name, the values from o are used
         */
        Union: function (o, p) {
            return Objects.Extend(Objects.Extend({}, o), p);
        },
        /*
         * Return a new object that holds only the properties of o that also appear
         * in p. This is something like the intersection of o and p, but the values of
         * the properties in p are discarded
         */
        Intersection: function (o, p) {
            return Restrict(extend({}, o), p);
        },
        /*
         * Return an array that holds the names of the enumerable own properties of o
         */
        Keys: function (o) {
            if (typeof o !== "object") throw TypeError(); // Object argument required
            var result = []; // The array we will return
            for (var prop in o) { // For all enumerable properties
                if (o.hasOwnProperty(prop)) // If it is an own property
                    result.push(prop); // add it to the array.
            }
            return result; // Return the array.
        },
        Event: (function () {

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

        })()
    }

    exports.Math = Maths;
    exports.String = String;
    exports.Graphic = Graphic;
    exports.Data = Data;
    exports.Object = Objects;
});
window.Plane = require("plane").PlaneApi;
})(window);