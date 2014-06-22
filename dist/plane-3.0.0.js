/*!
 * C37 in 22-06-2014 at 07:53:53 
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
define("geometric/group", ['require', 'exports'], function (require, exports) {




});
define("geometric/intersection", ['require', 'exports'], function (require, exports) {

    var Polynomial = require('geometric/polynomial').Polynomial,
        math = Math;


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
            var e = math.sqrt(deter),
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

        var inter1 = this.circleLine(c, r, rightBottom, rightTop);
        var inter2 = this.circleLine(c, r, rightTop, leftTop);
        var inter3 = this.circleLine(c, r, leftTop, leftBottom);
        var inter4 = this.circleLine(c, r, leftBottom, rightBottom);

        return inter1 || inter2 || inter3 || inter4;
    };

    function CircleCircle(c1, r1, c2, r2) {
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
    };

    function CircleArc(c, r1, ca, r2, as, ae, ck) {

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
                if (math.abs(test) < norm0) {
                    test =
                        (b[0] * xRoots[x] + b[1] * yRoots[y] + b[3]) * xRoots[x] +
                        (b[2] * yRoots[y] + b[4]) * yRoots[y] + b[5];
                    if (math.abs(test) < norm1) {
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

    var math = Math;


    function Point(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype = {
        Operations: {
            Sum: function (point) {
                return new Point(this.x + point.x, this.y + point.y);
            },
            Subtract: function (point) {
                return new Point(this.x - point.x, this.y - point.y);
            }
        },
        Measures: {
            DistanceTo: function (point) {
                var dx = this.x - point.x;
                var dy = this.y - point.y;

                return math.sqrt(dx * dx + dy * dy);
            },
            MidTo: function (point) {
                return new Point(this.x + (point.x - this.x) / 2, this.y + (point.y - this.y) / 2);
            },
            AngleTo: function (point) {
                return math.atan2(point.y - this.y, point.x - this.x);
            }
        },
        Functions: {
            InterpolationLinear: function (point, value) {
                return new Point(
                    this.x + (point.x - this.x) * value,
                    this.y + (point.y - this.y) * value
                );
            }
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
        contains: function (point) {
            return false;
        },
        toJson: function () {
            return JSON.stringify(this);
        }
    };


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


    exports.Create = Create;

});
define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var Object = require('utility/object'),
        Types = require('utility/types');

    var Tools = require('structure/tools').ToolsProxy;


    var LayerStore = new Types.Data.Dictionary();

    var RenderStore = {},
        ShapeStore = {},
        GroupStore = {};

    var ViewPort = null,
        Settings = null;


    var PlaneProxy = ObjectUtil.Extend(new ObjectUtil.Event(), {

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

            ViewPort = config.viewPort;


            Settings = Object.Merge({
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            }, config.settings || {});


            // start em eventos
            ViewPort.onmousemove = function (event) {
                Tools.notify('onMouseMove', event);
            };
            ViewPort.onclick = function (event) {
                Tools.notify('onClick', event);
            }
            // start em eventos

            //gridDraw(settings.gridEnable, viewPort.clientWidth, viewPort.clientHeight, settings.gridColor);

            return true;
        }

    });









    exports.PlaneProxy = PlaneProxy;
});
define("shapes/arc", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Arc = (function (base) {

        function Arc(attrs) {

            this.type = 'arc';
            this.point = attrs.point;
            this.radius = attrs.radius;
            this.startAngle = attrs.startAngle;
            this.endAngle = attrs.endAngle;
            this.clockWise = attrs.clockWise;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        };
        Arc.prototype = Shape.prototype;

        return Arc;
        
    })(Shape);

    exports.Arc = Arc;
});
define("geometric/bézier", ['require', 'exports'], function (require, exports) {

    var f001 = function () {
        alert('f001 - b');
    }



    exports.f001 = f001;
});
define("shapes/circle", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Circle = (function (base) {

        function Circle(attrs) {

            this.type = 'circle';
            this.point = attrs.point;
            this.radius = attrs.radius;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        }
        Circle.prototype = Shape.prototype;

        return Circle;

    })(Shape);

    exports.Circle = Circle;
});
define("shapes/ellipse", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Ellipse = (function (base) {

        function Ellipse(attrs) {

            this.type = 'ellipse';
            this.point = attrs.point;
            this.radiusY = attrs.radiusY;
            this.radiusX = attrs.radiusX;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        }
        Ellipse.prototype = Shape.prototype;

        return Ellipse;
        
    })(Shape);

    exports.Ellipse = Ellipse;
});
define("shapes/line", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Line = (function (base) {

        function Line(attrs) {

            this.type = 'line';
            this.points = attrs.points;
            this.style = attrs.style;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Line.prototype = Shape.prototype;

        return Line;
        
    })(Shape);

    exports.Line = Line;
});
define("shapes/polygon", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Polygon = (function (base) {

        function Polygon(attrs) {

            this.type = 'polygon';
            this.points = attrs.points;
            this.sides = attrs.sides;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Polygon.prototype = Shape.prototype;

        return Polygon;
        
    })(Shape);

    exports.Polygon = Polygon;
});
define("shapes/rectangle", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Rectangle = (function (base) {

        function Rectangle(attrs) {

            this.type = 'rectangle';
            this.point = attrs.point;
            this.height = attrs.height;
            this.width = attrs.width;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Rectangle.prototype = Shape.prototype;
        
        return Rectangle;
        
    })(Shape);

    exports.Rectangle = Rectangle;
});
define("structure/layer", ['require', 'exports'], function (require, exports) {

    var object = require('utility/object');

    function Layer(attrs) {

        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.system = attrs.system;
        this.style = attrs.style;

    }
    Layer.prototype = new object.Event();

    Layer.prototype.toJson = function () {
        return JSON.stringify(this).replace(/_/g, '');
    }


    function Create(uuid, name, style, system) {

        var attrs = {
            uuid: uuid,
            name: name,
            style: style,
            locked: false,
            visible: true,
            system: system
        };

        return new Layer(attrs);
    };
    
    
    exports.Create = Create;




});
define("structure/render", ['require', 'exports'], function (require, exports) {


    function Create(uuid, width, height, backgroundColor) {

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
    };

    function Update() {

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


    exports.Create = Create;
    exports.Update = Update;




});
define("structure/shape", ['require', 'exports'], function (require, exports) {

});

define("structure/tools", ['require', 'exports'], function (require, exports) {

    var ObjectUtil = require('utility/object'),
        TypesUtil = require('utility/types'),
        MathUtil = require('utility/math');

    var ToolStore = new TypesUtil.Data.Dictionary();

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
    Tool.prototype = ObjectUtil.Event.prototype;


    var ToolsProxy = ObjectUtil.Extend(new ObjectUtil.Event(), {
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            attrs = Object.Merge({
                uuid: MathUtil.Uuid(9, 16),
                name: 'Tool '.concat(ToolStore.count())
            }, attrs);

            var tool = Tool.Create(attrs.uuid, attrs.name);

            toolStore.add(attrs.uuid, tool);

            return true;
        }
    });

    exports.ToolsProxy = ToolsProxy;

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
define("utility/graphic", ['require', 'exports'], function (require, exports) {

    function MousePosition(element, position) {
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

    exports.MousePosition = MousePosition;

});
define("utility/import", ['require', 'exports'], function (require, exports) {

    function FromDxf(stringDxf) {

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
define("utility/math", ['require', 'exports'], function (require, exports) {

    function Uuid(length, radix) {
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

    exports.Uuid = Uuid;
});
define("utility/object", ['require', 'exports'], function (require, exports) {

    /*
     * Copy the enumerable properties of p to o, and return o
     * If o and p have a property by the same name, o's property is overwritten
     * This function does not handle getters and setters or copy attributes
     */
    function Extend(o, p) {
        for (var prop in p) { // For all props in p.
            o[prop] = p[prop]; // Add the property to o.
        }
        return o;
    }

    /*
     * Copy the enumerable properties of p to o, and return o
     * If o and p have a property by the same name, o's property is left alone
     * This function does not handle getters and setters or copy attributes
     */
    function Merge(o, p) {
        for (var prop in p) { // For all props in p
            if (o.hasOwnProperty[prop]) continue; // Except those already in o
            o[prop] = p[prop]; // Add the property to o
        }
        return o;
    }

    /*
     * Remove properties from o if there is not a property with the same name in p
     * Return o
     */
    function Restrict(o, p) {
        for (var prop in o) { // For all props in o
            if (!(prop in p)) delete o[prop]; // Delete if not in p
        }
        return o;
    }

    /*
     * For each property of p, delete the property with the same name from o
     * Return o
     */
    function Subtract(o, p) {
        for (var prop in p) { // For all props in p
            delete o[prop]; // Delete from o (deleting a nonexistent prop is harmless)
        }
        return o;
    }

    /* 
     * Return a new object that holds the properties of both o and p.
     * If o and p have properties by the same name, the values from o are used
     */
    function Union(o, p) {
        return extend(extend({}, o), p);
    }

    /*
     * Return a new object that holds only the properties of o that also appear
     * in p. This is something like the intersection of o and p, but the values of
     * the properties in p are discarded
     */
    function Intersection(o, p) {
        return restrict(extend({}, o), p);
    }

    /*
     * Return an array that holds the names of the enumerable own properties of o
     */
    function Keys(o) {
        if (typeof o !== "object") throw TypeError(); // Object argument required
        var result = []; // The array we will return
        for (var prop in o) { // For all enumerable properties
            if (o.hasOwnProperty(prop)) // If it is an own property
                result.push(prop); // add it to the array.
        }
        return result; // Return the array.
    }



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


    exports.Extend = Extend;
    exports.Merge = Merge;
    exports.Restrict = Restrict;
    exports.Subtract = Subtract;
    exports.Union = Union;
    exports.Intersection = Intersection;
    exports.Keys = Keys;
    exports.Event = Event;
});
define("utility/types", ['require', 'exports'], function (require, exports) {

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

    var Data = {

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
        })()

    }

    exports.String = String;
    exports.Data = Data;
});
window.Plane = require("plane");
})(window);