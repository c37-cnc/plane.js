/*!
 * C37 in 10-11-2014 at 01:42:58 
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
        modules = {};

    define = function (name, dependencies, callback) {
        registry[name] = {
            dependencies: dependencies,
            callback: callback
        };
    };

    require = function (name) {

        if (modules[name]) {
            return modules[name];
        }
        modules[name] = {};

        var module = registry[name];
        if (!module) {
            throw new Error("Module '" + name + "' not found.");
        }

        var dependencies = module.dependencies,
            callback = module.callback,
            parameters = [],
            exports = {};

        for (var i = 0, l = dependencies.length; i < l; i++) {
            if (dependencies[i] == 'require') {
                parameters.push(require);
            } else if (dependencies[i] == 'exports') {
                parameters.push(exports);
            } else {
                parameters.push(require(dependencies[i]));
            }
        }

        var concrete = callback.apply(this, parameters);
        return modules[name] = exports || concrete;
    };
})();
define("plane/data/exporter", ['require', 'exports'], function (require, exports) {
    
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

    
    
    
    
    exports.toSvg = toSvg;
    exports.toDxf = toDxf;
    exports.toPng = toPng;
    exports.toPdf = toPdf;

});
define("plane/data/importer", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    function parseDxf(stringDxf) {

        function toJson(objectDxf) {

            switch (objectDxf.type) {
            case 'line':
                {
                    var line = '{ "type": "line", "a": [{0}, {1}], "b": [{2}, {3}] },';
                    return types.string.format(line, [objectDxf.x, objectDxf.y, objectDxf.x1, objectDxf.y1]);
                }
            case 'spline':
                {
                    if (objectDxf.points) {
                        var spline = '{"type": "spline", "degree": {0}, "knots": [{1}], "points": [{2}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.points.length; i++) {

                            var point = i == objectDxf.points.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [objectDxf.points[i][0], objectDxf.points[i][1]]);

                        }
                        return types.string.format(spline, [objectDxf.degree, objectDxf.knots.join(), points]);
                    }
                    return '';
                }
            case 'circle':
                {
                    var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} },';
                    return types.string.format(circle, [objectDxf.x, objectDxf.y, objectDxf.r]);
                }
            case 'arc':
                {
                    var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2}, "startAngle": {3}, "endAngle": {4}, "clockWise": {5} },';
                    return types.string.format(arc, [objectDxf.x, objectDxf.y, objectDxf.r, objectDxf.a0, objectDxf.a1, false]);
                }
            case 'ellipse':
                {
                    var ellipse = '{ "type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2}, "radiusX": {3}, "startAngle": {4}, "endAngle": {5}, "angle": {6} },';
                    
                    var p2 = {
                        x: objectDxf.x1,
                        y: objectDxf.y1
                    };

                    var ratio = objectDxf.r;
                    var startAngle = objectParse.startAngle;
                    var endAngle = objectParse.endAngle || (2.0 * Math.PI);

                    while (endAngle < startAngle) {
                        endAngle += 2.0 * Math.PI;
                    }

                    var radiusX = {
                        x: 0 - p2.x,
                        y: 0 - p2.y
                    };

                    radiusX = Math.sqrt(radiusX.x * radiusX.x + radiusX.y * radiusX.y);

                    var radiusY = radiusX * ratio;
                    var angle = Math.atan2(p2.y, p2.x);
                    
                    
                    
                    return types.string.format(ellipse, [objectDxf.x, objectDxf.y, radiusY, radiusX, startAngle, endAngle, angle]);
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
            //            if (!entitiesSection) continue;

            if (entitiesSupport.indexOf(stringLine) > -1) {
                objectParse = {
                    type: stringLine
                };
                continue;
            }

            if (!objectParse) continue;


            if (stringAux == ' 10') {
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // caso necessário crio um array de points
                    objectParse.points = objectParse.points || [];
                    objectParse.points.push([types.math.parseFloat(stringLine, 5), 0]);
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

            // TODO: verificar qual logica é melhor para reinterpretação de uma array de pontos
            if (stringAux == ' 20') {
                // de acordo com o tipo localizar o ultimo point em array e add y ?
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // localizando o ultimo point de points para completar add ao valor de y
                    objectParse.points[objectParse.points.length - 1][1] = types.math.parseFloat(stringLine, 5);
                } else {
                    objectParse.y = types.math.parseFloat(stringLine, 5);
                }
                // de acordo com o tipo pegar o preenchido de x e y ?
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
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // caso necessário crio um array de points
                    objectParse.knots = objectParse.knots || [];
                    objectParse.knots.push(types.math.parseFloat(stringLine, 5));
                } else {
                    objectParse.r = types.math.parseFloat(stringLine, 5);
                }
                stringAux = '';
                continue;
            }
            if (stringLine == ' 40') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 41') {
                objectParse.startAngle = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 41') {
                stringAux = stringLine;
                continue;
            }

            if (stringAux == ' 42') {
                objectParse.endAngle = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 42') {
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


            if (stringAux == ' 71') {
                objectParse.degree = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 71') {
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

    function parseDwg(stringDwg) {
        return true;
    }

    function parseJson(stringJson) {
        return true;
    }

    function parseSvg(stringSvg) {
        return true;
    }


    exports.parseDxf = parseDxf;
    exports.parseDwg = parseDwg;
    exports.parseJson = parseJson;
    exports.parseSvg = parseSvg;

});



// https://github.com/paperjs/paper.js/blob/a9618b50f89c480600bf12868d414e5bed095430/test/tests/PathItem_Contains.js#L49

//	testPoint(path, path.bounds.topCenter, true);
//	testPoint(path, path.bounds.leftCenter, true);
//	testPoint(path, path.bounds.rightCenter, true);
//	testPoint(path, path.bounds.bottomCenter, true);
//	testPoint(path, path.bounds.topLeft, false);
//	testPoint(path, path.bounds.topRight, false);
//	testPoint(path, path.bounds.bottomLeft, false);
//	testPoint(path, path.bounds.bottomRight, false);
define("plane/geometric/intersection", ['require', 'exports'], function (require, exports) {

    var polynomial = require('plane/geometric/polynomial'),
        point = require('plane/structure/point');


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
define("plane/geometric/matrix", ['require', 'exports'], function (require, exports) {

    // http://www.senocular.com/flash/tutorials/transformmatrix/
    // https://github.com/heygrady/transform/wiki/Calculating-2d-Matrices

    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js
    // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js
    // https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/geom/Matrix2D.js
    // http://eip.epitech.eu/2014/tumbleweed/api/classes/Math.Matrix2D.html
    // https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat2.js

    // https://github.com/kangax/fabric.js/blob/818ab118b30a9205a0e57620452b08bb8f5f18cc/src/static_canvas.class.js#L611
    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js

    function Matrix(a, b, c, d, tx, ty) {
        this.a = a || 1; // x scale
        this.c = c || 0; // x inclinação 

        this.b = b || 0; // y inclinação 
        this.d = d || 1; // y scale

        this.tx = tx || 0; // x translate
        this.ty = ty || 0; // y translate
    };


    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L558
    // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L427
    function getDeterminant(transform) {
        return transform.a * transform.d - transform.b * transform.c;
    };

    function isIdentity() {};

    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L93
    function toPoint(point, transform, offSet) {
        if (offSet) {
            return {
                x: (transform[0] * point.x) + (transform[1] * point.y),
                y: (transform[2] * point.x) + (transform[3] * point.y)
            }
        };
        return {
            x: (transform[0] * point.x) + (transform[1] * point.y) + transform[4],
            y: (transform[2] * point.x) + (transform[3] * point.y) + transform[5]
        };
    };




    //    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L513
    //    var _transformCorners: function (rect) {
    //        var x1 = rect.x,
    //            y1 = rect.y,
    //            x2 = x1 + rect.width,
    //            y2 = y1 + rect.height,
    //            coords = [x1, y1, x2, y1, x2, y2, x1, y2];
    //        return this._transformCoordinates(coords, coords, 4);
    //    };
    //
    //    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L527
    //    var _transformBounds: function (bounds, dest, _dontNotify) {
    //        var coords = this._transformCorners(bounds),
    //            min = coords.slice(0, 2),
    //            max = coords.slice();
    //        for (var i = 2; i < 8; i++) {
    //            var val = coords[i],
    //                j = i & 1;
    //            if (val < min[j])
    //                min[j] = val;
    //            else if (val > max[j])
    //                max[j] = val;
    //        }
    //        if (!dest)
    //            dest = new Rectangle();
    //        return dest.set(min[0], min[1], max[0] - min[0], max[1] - min[1],
    //            _dontNotify);
    //    };


    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L113
    function toInverse(transform) {


        return transform;
    }

    Matrix.prototype = {
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L256
        // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L560
        rotate: function (angle, x, y) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            return this.transform(cos, sin, -sin, cos, x - x * cos + y * sin, y - x * sin - y * cos);
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L218
        scale: function (scale, center) {

            if (center)
                this.translate(center.x, center.y);

            this.a *= scale.x;
            this.c *= scale.x;
            this.b *= scale.y;
            this.d *= scale.y;

            if (center)
                this.translate(-center.x, -center.y);

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L189
        translate: function (x, y) {

            this.tx += x * this.a + y * this.b;
            this.ty += x * this.c + y * this.d;

            return this;

        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L150
        reset: function () {

            this.a = this.d = 1;
            this.c = this.b = this.tx = this.ty = 0;

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L117
        clone: function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L352
        concate: function (matrix) {

            var a1 = this.a,
                b1 = this.b,
                c1 = this.c,
                d1 = this.d,
                a2 = matrix.a,
                b2 = matrix.b,
                c2 = matrix.c,
                d2 = matrix.d,
                tx2 = matrix.tx,
                ty2 = matrix.ty;

            this.a = a2 * a1 + c2 * b1;
            this.b = b2 * a1 + d2 * b1;
            this.c = a2 * c1 + c2 * d1;
            this.d = b2 * c1 + d2 * d1;
            this.tx += tx2 * a1 + ty2 * b1;
            this.ty += tx2 * c1 + ty2 * d1;

            return this;

        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L299
        shear: function (shear, center) {

            if (center)
                this.translate(center.x, center.y);

            var a = this.a,
                c = this.c;

            this.a += shear.y * this.b;
            this.c += shear.y * this.d;
            this.b += shear.x * a;
            this.d += shear.x * c;

            if (center)
                this.translate(-center.x, -center.y);

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L337
        skew: function (skew, center) {

            var toRadians = Math.PI / 180,
                shear = {
                    x: Math.tan(skew.x * toRadians),
                    y: Math.tan(skew.y * toRadians)
                };

            return this.shear(shear, center);

        },
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L113
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/shapes/group.class.js#L459

        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L565
        // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L451
        inverse: function () {

            //            var r, t = this.toArray(),
            //                a = 1 / (t[0] * t[3] - t[1] * t[2]);
            //
            //            r = [a * t[3], -a * t[1], -a * t[2], a * t[0], 0, 0];
            //
            //            var o = toPoint({
            //                x: t[4],
            //                y: t[5]
            //            }, r);
            //            r[4] = -o.x;
            //            r[5] = -o.y;
            //            return r;


            var r = this.toArray(),
                a = 1 / (this.a * this.d - this.b * this.c);

            r = [a * this.d, -a * this.b, -a * this.c, a * this.a, 0, 0];

            var o = toPoint({
                x: this.tx,
                y: this.ty
            }, r);

            r[4] = -o.x;
            r[5] = -o.y;

            return r;

        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L727
        inverted: function () {
            var det = getDeterminant(this);

            return det && new Matrix(
                this.d / det, -this.c / det, -this.b / det,
                this.a / det, (this.b * this.ty - this.d * this.tx) / det, (this.c * this.tx - this.a * this.ty) / det);
        },
        inverseTransform: function (point) {
            var det = getDeterminant(this);

            var x = point.x - this.tx,
                y = point.y - this.ty;

            return {
                x: (x * this.d - y * this.b) / det,
                y: (y * this.a - x * this.c) / det
            };
        },
        transform: function (a, b, c, d, tx, ty) {

            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;

            return this;
        },
        toCenter: function (point) {},
        toArray: function () {
            return [this.a, this.b, this.c, this.d, this.tx, this.ty];
        },
        _transformCoordinates: function (src, dst, count) {
            var i = 0,
                j = 0,
                max = 2 * count;
            while (i < max) {
                var x = src[i++],
                    y = src[i++];
                dst[j++] = x * this._a + y * this._b + this._tx;
                dst[j++] = x * this._c + y * this._d + this._ty;
            }
            return dst;
        },
        _transformCorners: function (rect) {
            var x1 = rect.x,
                y1 = rect.y,
                x2 = x1 + rect.width,
                y2 = y1 + rect.height,
                coords = [x1, y1, x2, y1, x2, y2, x1, y2];
            return this._transformCoordinates(coords, coords, 4);
        },
        _transformBounds: function (bounds, dest, _dontNotify) {

            debugger;

            var coords = this._transformCorners(bounds),
                min = coords.slice(0, 2),
                max = coords.slice();
            for (var i = 2; i < 8; i++) {
                var val = coords[i],
                    j = i & 1;
                if (val < min[j])
                    min[j] = val;
                else if (val > max[j])
                    max[j] = val;
            }
            if (!dest)
                dest = new Rectangle();
            return dest.set(min[0], min[1], max[0] - min[0], max[1] - min[1],
                _dontNotify);
        },


    };

    function create() {
        return new Matrix();
    };

    exports.create = create;
    exports.toPoint = toPoint;
});
define("plane/geometric/polynomial", ['require', 'exports'], function (require, exports) {

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
define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var types = require('plane/utility/types');

    var matrix = require('plane/geometric/matrix');

    var layer = require('plane/structure/layer'),
        point = require('plane/structure/point'),
        shape = require('plane/structure/shape'),
        group = require('plane/structure/group'),
        tool = require('plane/structure/tool'),
        view = require('plane/structure/view');

    var importer = require('plane/data/importer'),
        exporter = require('plane/data/exporter');

    var viewPort = null;


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

        // save in variable viewPort
        viewPort = config.viewPort;


        // montando o render de Plane
        var canvas = document.createElement('canvas');

        canvas.id = types.math.uuid(9, 16);
        canvas.width = viewPort.clientWidth;
        canvas.height = viewPort.clientHeight;

        canvas.style.position = "absolute";
        canvas.style.backgroundColor = 'transparent';

        // add em viewPort HTMLElement
        viewPort.appendChild(canvas);


        // initialize view
        view.initialize({
            viewPort: viewPort,
            context : canvas.getContext('2d')
        });
        // initialize tool
        tool.initialize({
            viewPort: viewPort,
            view: view
        });

        return true;
    }
    

    function clear() {

        // reset all parameters in view
        view.reset();

        // remove em todas as layers
        layer.remove();

        return true;
    }

 
    
    



    exports.initialize = initialize;
    exports.clear = clear;

    exports.view = view;

    exports.point = point;
    exports.shape = shape;
    exports.group = group;

    exports.layer = layer;
    exports.tool = {
        create: tool.create,
        list: tool.list,
        find: tool.find,
        remove: tool.remove
    };

    exports.importer = {
        fromDxf: function (stringDxf) {
            // clear Plane
            clear();

            var stringJson = importer.parseDxf(stringDxf);
            var objectDxf = JSON.parse(stringJson);

            if (stringJson) {
                layer.create();
                for (var prop in objectDxf) {
                    shape.create(objectDxf[prop]);
                }
                view.update();
            }
        },
        fromJson: function (stringJson) {

            var objectPlane = JSON.parse(stringJson);

            clear();

            objectPlane.layers.forEach(function (objectLayer) {

                layer.create({
                    uuid: objectLayer.uuid,
                    name: objectLayer.name,
                    status: objectLayer.status,
                    style: objectLayer.style,
                });

                objectLayer.children.forEach(function (objectShape) {
                    shape.create(objectShape);
                });
            });

            view.zoomTo(objectPlane.zoom, point.create(objectPlane.center));

            return true;
        }
    };


    exports.exporter = {
        toJson: function () {

            var plane = {
                center: _view.center,
                zoom: _view.zoom,
                layers: layer.list().map(function (layer) {
                    return layer.status != 'system' ? layer.toObject() : null;
                }).filter(function (layer) {
                    return layer != undefined
                })
            }

            return JSON.stringify(plane);
        }
    };
    
});
define("plane/shapes/arc", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Arc
     * @constructor
     */
    function Arc(attrs) {
        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.segments = [];

        this.type = 'arc';
        this.point = attrs.point;
        this.radius = attrs.radius;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.clockWise = attrs.clockWise;

        this.initialize();
    };


    Arc.prototype = {
        initialize: function () {

            var end = this.endAngle - this.startAngle;
            if (end < 0.0) {
                end += 360.0;
            }

            // .7 resolution
            var num1 = .7 / 180.0 * Math.PI;
            var num2 = this.startAngle / 180.0 * Math.PI;
            var num3 = end / 180.0 * Math.PI;

            if (num3 < 0.0)
                num1 = -num1;
            var size = Math.abs(num3 / num1) + 2;

            var index = 0;
            var num4 = num2;
            while (index < size - 1) {

                var xval = this.point.x + this.radius * Math.cos(num4);
                var yval = this.point.y + this.radius * Math.sin(num4);

                this.segments.push({
                    x: xval,
                    y: yval
                });
                ++index;
                num4 += num1;
            }

            var xval1 = this.point.x + this.radius * Math.cos(num2 + num3);
            var yval1 = this.point.y + this.radius * Math.sin(num2 + num3);

            this.segments[this.segments.length - 1].x = xval1;
            this.segments[this.segments.length - 1].y = yval1;

        },
        toObject: function () {

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

        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };




            //            for (var i = 0; i < points.length; i += 2) {
            //                context.lineTo(points[i].x * scale + move.x, points[i].y * scale + move.y);
            //            }

            for (var i = 0; i < this.segments.length; i += 2) {
                var x = this.segments[i].x * scale + move.x;
                var y = this.segments[i].y * scale + move.y;

                context.lineTo(x, y);
            }


            context.stroke();

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            var segmentA = null,
                segmentB = null;

            for (var i = 0; i < this.segments.length; i++) {

                if (i + 1 == this.segments.length) {
                    segmentA = this.segments[i];
                    segmentB = this.segments[0];
                } else {
                    segmentA = this.segments[i];
                    segmentB = this.segments[i + 1];
                }

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

            return false;

        }

    };






    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Arc(attrs);
    };

    exports.create = create;

});
define("plane/shapes/bezier-cubic", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');



    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Bezier Cubic
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    function BezierCubic(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.segments = [];


        this.type = 'bezier-cubic';
        this.points = attrs.points;
        
        this.initialize();
    };


    BezierCubic.prototype = {
        initialize: function () {

            // https://github.com/MartinDoms/Splines/blob/master/cubicBezier.js

            var lineSegments = 100;


            var dot = function (v1, v2) {
                var sum = 0;
                for (var i = 0; i < v1.length; i++) {
                    sum += v1[i] * v2[i];
                }
                return sum;
            };

            var cubicBezier = function (points, t) {
                var p0 = points[0];
                var p1 = points[1];
                var p2 = points[2];
                var p3 = points[3];
                var t3 = t * t * t;
                var t2 = t * t;

                var dx = dot([p0.x, p1.x, p2.x, p3.x], [(1 - t) * (1 - t) * (1 - t), 3 * (1 - t) * (1 - t) * t, 3 * (1 - t) * t2, t3]);
                var dy = dot([p0.y, p1.y, p2.y, p3.y], [(1 - t) * (1 - t) * (1 - t), 3 * (1 - t) * (1 - t) * t, 3 * (1 - t) * t2, t3]);

                return {
                    x: dx,
                    y: dy
                };
            }
            
            for (var j = 0; j < lineSegments + 1; j++) {
                this.segments.push(cubicBezier(this.points, j / lineSegments));
            }


        },
        toObject: function () {
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
        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };



            for (var i = 0; i < this.segments.length; i++) {

                var x = this.segments[i].x * scale + move.x;
                var y = this.segments[i].y * scale + move.y;

                context.lineTo(x, y);
            }
            
            context.stroke();

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);

            var segmentA = null,
                segmentB = null;

            for (var i = 0; i < this.segments.length; i++) {

                if (i + 1 == this.segments.length) {
                    segmentA = this.segments[i];
                    segmentB = this.segments[0];
                } else {
                    segmentA = this.segments[i];
                    segmentB = this.segments[i + 1];
                }

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

            return false;

        }

    }




    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new BezierCubic(attrs);
    };

    exports.create = create;

});
define("plane/shapes/bezier-quadratic", ['require', 'exports'], function (require, exports) {

    var point = require('plane/structure/point');

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Structure
     * @extends Shape
     * @class Bezier Quadratic
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    function BezierQuadratic(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'bezier-quadratic';
        this.points = attrs.points;
    };

    BezierQuadratic.prototype = {
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            var pts = [],
                lineSegments = 100;


            var dot = function (v1, v2) {
                var sum = 0;
                for (var i = 0; i < v1.length; i++) {
                    sum += v1[i] * v2[i];
                }
                return sum;
            }

            var quadraticBezier = function (points, t) {
                var p0 = points[0];
                var p1 = points[1];
                var p2 = points[2];
                var t3 = t * t * t;
                var t2 = t * t;

                var dx = dot([p0.x, p1.x, p2.x], [(1 - t) * (1 - t), 2 * t * (1 - t), t2]);
                var dy = dot([p0.y, p1.y, p2.y], [(1 - t) * (1 - t), 2 * t * (1 - t), t2]);

                return {
                    x: dx,
                    y: dy
                };
            }

            for (var j = 0; j < lineSegments + 1; j++) {
                pts.push(quadraticBezier(this.points, j / lineSegments));
            }



            for (var i = 0; i < pts.length; i += 2) {
                context.lineTo(pts[i].x * scale + move.x, pts[i].y * scale + move.y);
            }
            context.stroke();

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            //            return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

            return false;

        }


    }



    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new BezierQuadratic(attrs);
    };

    exports.create = create;

});
define("plane/shapes/circle", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Circle
     * @constructor
     */
    function Circle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.segments = [];

        this.type = 'circle';
        this.point = attrs.point;
        this.radius = attrs.radius;

        this.initialize();
    };

    Circle.prototype = {
        initialize: function () {

            // em numero de partes - 58 
            var num1 = Math.PI / 58;
            var size = Math.abs(2.0 * Math.PI / num1) + 2;
            var index = 0;
            var num2 = 0.0;

            while (index < size - 1) {
                this.segments.push({
                    x: this.point.x + this.radius * Math.cos(num2),
                    y: this.point.y + this.radius * Math.sin(num2)
                });
                ++index;
                num2 += num1;
            }

        },
        toObject: function () {
            return {
                uuid: this.uuid,
                type: this.type,
                name: this.name,
                status: this.status,
                x: types.math.parseFloat(this.point.x, 5),
                y: types.math.parseFloat(this.point.y, 5),
                radius: types.math.parseFloat(this.radius, 5)
            };
        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };



            for (var i = 0; i < this.segments.length; i += 2) {
                var x = this.segments[i].x * scale + move.x;
                var y = this.segments[i].y * scale + move.y;

                context.lineTo(x, y);
            }
            context.stroke();


        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);

            var segmentA = null,
                segmentB = null;

            for (var i = 0; i < this.segments.length; i++) {

                if (i + 1 == this.segments.length) {
                    segmentA = this.segments[i];
                    segmentB = this.segments[0];
                } else {
                    segmentA = this.segments[i];
                    segmentB = this.segments[i + 1];
                }

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

            return false;

        }


    }


    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Circle(attrs);
    };

    exports.create = create;

});
define("plane/shapes/ellipse", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Ellipse
     * @constructor
     */
    function Ellipse(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;


        this.segments = [];

        this.type = 'ellipse';
        this.point = attrs.point;
        this.radiusY = attrs.radiusY;
        this.radiusX = attrs.radiusX;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.angle = attrs.angle;


        this.initialize();
    };

    Ellipse.prototype = {
        initialize: function () {

            var startAngle = this.startAngle || 0;
            var endAngle = this.endAngle || (2.0 * Math.PI);

            while (endAngle < startAngle) {
                endAngle += 2.0 * Math.PI;
            }

            var radiusX = this.radiusX;
            var radiusY = this.radiusY;

            var angle = types.math.radians(this.angle) || 0;
            var num18 = Math.PI / 60.0;


            var polyline2 = [];


            var num = Math.cos(angle);
            var num12 = Math.sin(angle);


            while (true) {
                if (startAngle > endAngle) {
                    num18 -= startAngle - endAngle;
                    startAngle = endAngle;
                }
                var p3 = {
                    x: radiusX * Math.cos(startAngle),
                    y: radiusY * Math.sin(startAngle)
                };
                // p3 *= matrix4x4F;
                // aplicando a matrix para a rotação
                p3 = {
                    x: p3.x * num + p3.y * -num12,
                    y: p3.x * num12 + p3.y * num
                }
                // o ponto de centro + o item da ellipse
                p3 = {
                    x: this.point.x + p3.x,
                    y: this.point.y + p3.y
                };

                // armazenando no array
                polyline2.push(p3);

                // continuando até a volta completa
                if (startAngle != endAngle)
                    startAngle += num18;
                else
                    break;
            }

            this.segments = polyline2.map(function (item) {
                return {
                    x: item.x,
                    y: item.y
                };
            });

        },
        toObject: function () {

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

        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            //            debugger;







            for (var i = 0; i < this.segments.length; i++) {

                var x = this.segments[i].x * scale + move.x;
                var y = this.segments[i].y * scale + move.y;

                context.lineTo(x, y);
            }


            context.stroke();

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);

            var segmentA = null,
                segmentB = null;

            for (var i = 0; i < this.segments.length; i++) {

                if (i + 1 == this.segments.length) {
                    segmentA = this.segments[i];
                    segmentB = this.segments[0];
                } else {
                    segmentA = this.segments[i];
                    segmentB = this.segments[i + 1];
                }

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

            return false;
        }

    }


    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Ellipse(attrs);
    };

    exports.create = create;

});
define("plane/shapes/line", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');

    function Line(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'line';
        this.points = attrs.points;
        this.style = attrs.style;
    };


    Line.prototype = {
        toObject: function () {

            return {
                uuid: this.uuid,
                type: this.type,
                name: this.name,
                status: this.status,
                a: [types.math.parseFloat(this.points[0].x, 5), types.math.parseFloat(this.points[0].y, 5)],
                b: [types.math.parseFloat(this.points[1].x, 5), types.math.parseFloat(this.points[1].y, 5)]
            };

        },
        render: function (context, transform) {

            // possivel personalização
            //            if (this.style) {
            //                context.save();
            //
            //                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
            //                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
            //            }


            //            debugger;

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            //            // possivel personalização
            //            context.lineWidth = (this.style && this.style.lineWidth) ? this.style.lineWidth : context.lineWidth;
            //            context.strokeStyle = (this.style && this.style.lineColor) ? this.style.lineColor : context.strokeStyle;

            context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);
            context.lineTo((this.points[1].x * scale) + move.x, (this.points[1].y * scale) + move.y);

            context.stroke();



            // possivel personalização
            if (this.style) {
                context.restore();
            }

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);
            
            if (intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move))){
                return true;
            }

            return false;

        }
    }


    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Line(attrs);
    };

    exports.create = create;

});
define("plane/shapes/polygon", ['require', 'exports'], function (require, exports) {

    var point = require('plane/structure/point');
    
    
    function Polygon(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'polygon';
        this.point = attrs.point;
        this.points = attrs.points;
        this.sides = attrs.sides;
    };

    Polygon.prototype = {
        toObject: function () {

            return {
                uuid: this.uuid,
                type: this.type,
                name: this.name,
                status: this.status,
                x: types.math.parseFloat(this.point.x, 5),
                y: types.math.parseFloat(this.point.y, 5),
                sides: this.sides
            };

        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);

            this.points.forEach(function (point) {
                context.lineTo((point.x * scale) + move.x, (point.y * scale) + move.y);
            });
            context.closePath();

            context.stroke();

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            //            return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

            return false;

        }

    }


    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Polygon(attrs);
    };

    exports.create = create;

});
define("plane/shapes/polyline", ['require', 'exports'], function (require, exports) {

    var point = require('plane/structure/point');
    
    function Polyline(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'polyline';
        this.points = attrs.points;
    };

    Polyline.prototype = {
        toObject: function () {

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

        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);

            this.points.forEach(function (point) {
                context.lineTo((point.x * scale) + move.x, (point.y * scale) + move.y);
            });


            context.stroke();


        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            //            return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

            return false;

        }

    }



    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Polyline(attrs);
    };

    exports.create = create;

});
define("plane/shapes/rectangle", ['require', 'exports'], function (require, exports) {

    var point = require('plane/structure/point');
    
    
    function Rectangle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'rectangle';
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;
    };

    Rectangle.prototype = {
        toObject: function () {

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

        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            context.strokeRect((this.point.x * scale) + move.x, (this.point.y * scale) + move.y, this.width * scale, this.height * scale);

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            //            return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

            return false;

        }

    }




    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Rectangle(attrs);
    };

    exports.create = create;

});
define("plane/shapes/spline-catmull–rom", ['require', 'exports'], function (require, exports) {


    // http://jsbin.com/piyal/15/edit?js,output



    function SplineCatmullRom(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'spline-catmull–rom';
        this.points = attrs.points;
    };


    SplineCatmullRom.prototype = {

        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };
        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            //            return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

            return false;

        }


    }





    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new SplineCatmullRom(attrs);
    };

    exports.create = create;

});
define("plane/shapes/spline-nurbs", ['require', 'exports'], function (require, exports) {

    function SplineNurbs(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'spline-nurbs';
        this.degree = attrs.degree;
        this.knots = attrs.knots;
        this.points = attrs.points;
    };


    SplineNurbs.prototype = {
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };



            /*
                    Finds knot vector span.

                    p : degree
                    u : parametric value
                    U : knot vector

                    returns the span
                */
            var findSpan = function (p, u, U) {
                var n = U.length - p - 1;

                if (u >= U[n]) {
                    return n - 1;
                }

                if (u <= U[p]) {
                    return p;
                }

                var low = p;
                var high = n;
                var mid = Math.floor((low + high) / 2);

                while (u < U[mid] || u >= U[mid + 1]) {

                    if (u < U[mid]) {
                        high = mid;
                    } else {
                        low = mid;
                    }

                    mid = Math.floor((low + high) / 2);
                }

                return mid;
            }

            /*
                    Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2

                    span : span in which u lies
                    u    : parametric point
                    p    : degree
                    U    : knot vector

                    returns array[p+1] with basis functions values.
                */
            var calcBasisFunctions = function (span, u, p, U) {
                var N = [];
                var left = [];
                var right = [];
                N[0] = 1.0;

                for (var j = 1; j <= p; ++j) {

                    left[j] = u - U[span + 1 - j];
                    right[j] = U[span + j] - u;

                    var saved = 0.0;

                    for (var r = 0; r < j; ++r) {

                        var rv = right[r + 1];
                        var lv = left[j - r];
                        var temp = N[r] / (rv + lv);
                        N[r] = saved + rv * temp;
                        saved = lv * temp;
                    }

                    N[j] = saved;
                }

                return N;
            }

            /*
                    Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.

                    p : degree of B-Spline
                    U : knot vector
                    P : control points (x, y, z, w)
                    u : parametric point

                    returns point for given u
                */
            var calcBSplinePoint = function (p, U, P, u) {
                var span = findSpan(p, u, U);
                var N = calcBasisFunctions(span, u, p, U);
                //                    var C = new THREE.Vector4(0, 0, 0, 0);
                var C = {
                    x: 0,
                    y: 0
                };

                for (var j = 0; j <= p; ++j) {
                    var point = P[span - p + j];
                    var Nj = N[j];
                    //                        var wNj = point.w * Nj;
                    C.x += point.x * Nj;
                    C.y += point.y * Nj;
                    //                        C.z += point.z * wNj;
                    //                        C.w += point.w * Nj;
                }

                return C;
            }


            var getPoint = function (t, degree, knots, points) {

                var u = knots[0] + t * (knots[knots.length - 1] - knots[0]); // linear mapping t->u

                // following results in (wx, wy, wz, w) homogeneous point
                var hpoint = calcBSplinePoint(degree, knots, points, u);

                //                    if (hpoint.w != 1.0) { // project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
                //                        hpoint.divideScalar(hpoint.w);
                //                    }

                //                    return new THREE.Vector3(hpoint.x, hpoint.y, hpoint.z);
                return {
                    x: hpoint.x,
                    y: hpoint.y
                };
            }

            var getPoints = function (divisions, degree, knots, points) {

                var d, pts = [];

                for (d = 0; d <= divisions; d++) {

                    pts.push(getPoint(d / divisions, degree, knots, points));

                }
                return pts;
            }

            var LEUWF3cpo = function (_param1, degree, knots, points) {

                var point3Farray = [];

                for (var index1 = 0; index1 < knots.length - 1; ++index1) {
                    var num1 = knots[index1];
                    var num2 = knots[index1 + 1];

                    if (num2 > num1) {
                        for (var index2 = 0; index2 <= (_param1 == 0 ? 12 : _param1); ++index2) {
                            var p = calcBSplinePoint(degree, knots, points, num1 + (num2 - num1) * index2 / (_param1 == 0 ? 12.0 : _param1));
                            point3Farray.push(p);
                        }
                    }
                }
                return point3Farray;
            }

            //                debugger;

            //                                var xxx = getPoints(800, this.degree, this.knots, this.points);
            var xxx = LEUWF3cpo(17, this.degree, this.knots, this.points);



            context.moveTo(xxx[0].x * scale + move.x, xxx.y * scale + move.y);

            for (var i = 0; i < xxx.length; i++) {
                context.lineTo(xxx[i].x * scale + move.x, xxx[i].y * scale + move.y);
            }


            context.stroke();

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            //            return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

            return false;

        }



    }





    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new SplineNurbs(attrs);
    };

    exports.create = create;

});
define("plane/structure/group", ['require', 'exports'], function (require, exports) {

    function Group() {};

    Group.prototype = {};

    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Group();
    };

    exports.create = create;

});
define("plane/structure/layer", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var store = types.data.dictionary.create();

    var _active = null;


    function Layer(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.children = attrs.children;
        this.events = attrs.events;
    };

    Layer.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            status: this.status,
            style: this.style,
            children: this.children.list().map(function (shape) {
                return shape.toObject();
            })
        };
    }



    function create(attrs) {
        if ((typeof attrs == "function")) {
            throw new Error('layer - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = types.math.uuid(9, 16);

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
            children: types.data.dictionary.create(),
            events: types.object.event.create()
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // armazenando 
        store.add(layer.uuid, layer);

        // colocando nova layer como selecionada
        this.active = layer.uuid;

        return this;
    }

    function list() {
        return store.list();
    }

    function find(uuid) {
        return store.find(uuid);
    }

    function remove(uuid) {
        if (uuid) {
            return store.remove(uuid);
        } else {
            store.list().forEach(function (layer) {
                if (layer.status != 'system') {
                    store.remove(layer.uuid);
                }
            });
            return true;
        }
        //        return uuid ? store.remove(uuid) : store.clear();
    }




    function active(uuid) {
        return uuid ? active = store.find(uuid) : active;
    }


    Object.defineProperty(exports, 'active', {
        get: function () {
            return _active;

        },
        set: function (uuid) {

            this.events.notify('onDeactivated', {
                type: 'onDeactivated',
                layer: _active
            });

            _active = store.find(uuid);

            this.events.notify('onActivated', {
                type: 'onActivated',
                layer: _active
            });

        }
    });


    exports.events = types.object.event.create();



    exports.create = create;
    exports.list = list;
    exports.find = find;
    exports.remove = remove;
});
define("plane/structure/point", ['require', 'exports'], function (require, exports) {

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
        negate: function () {
            return new Point(-this.x, -this.y);
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

    function create() {

        if (arguments.length == 2 && (arguments[0] != null && arguments[1] != null)) {
            return new Point(arguments[0], arguments[1]);
        } else if (arguments.length == 1 && typeof arguments == 'object' && (arguments[0].x != null && arguments[0].y != null)) {
            return new Point(arguments[0].x, arguments[0].y);
        }

        throw new Error('Point - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');

    };

    exports.create = create;

});
define("plane/structure/shape", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point'),
        layer = require('plane/structure/layer');

    var arc = require('plane/shapes/arc'),
        bezierCubic = require('plane/shapes/bezier-cubic'),
        bezierQuadratic = require('plane/shapes/bezier-quadratic'),
        circle = require('plane/shapes/circle'),
        ellipse = require('plane/shapes/ellipse'),
        line = require('plane/shapes/line'),
        polygon = require('plane/shapes/polygon'),
        polyline = require('plane/shapes/polyline'),
        rectangle = require('plane/shapes/rectangle'),
        splineCatmullRom = require('plane/shapes/spline-catmull–rom'),
        splineNurbs = require('plane/shapes/spline-nurbs');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Structure
     * @class Shape
     * @constructor
     */
    function Shape() {};

    Shape.prototype = {
        rotateTo: function (angle) {

            return true;
        },
        scaleTo: function (factor) {


            if (this.type == 'arc') {

                this.point.x *= factor;
                this.point.y *= factor;
                this.radius *= factor;

            } else if (this.type == 'circle') {

                this.point.x *= factor;
                this.point.y *= factor;
                this.radius *= factor;

            } else if (this.type == 'ellipse') {

                this.point.x *= factor;
                this.point.y *= factor;
                this.radiusX *= factor;
                this.radiusY *= factor;

            } else if (this.type == 'line') {

                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i] = this.points[i].multiply(factor);
                };

            } else if (this.type == 'polygon') {

                this.point.x *= factor;
                this.point.y *= factor;

                this.points.forEach(function (point) {
                    point.x *= factor;
                    point.y *= factor;
                });

            } else if (this.type == 'polyline') {

                this.points.forEach(function (point) {
                    point.x *= factor;
                    point.y *= factor;
                });

            } else if (this.type == 'spline') {

                this.points.forEach(function (point) {
                    point.x *= factor;
                    point.y *= factor;
                });

            } else if (this.type == 'rectangle') {

                this.point.x *= factor;
                this.point.y *= factor;
                this.height *= factor;
                this.width *= factor;

            }


        },
        moveTo: function (value) {

            if (this.point) {
                this.point = this.point.sum(value);
            }
            if (this.points && this.type != 'bezier-quadratic') {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i] = this.points[i].sum(value);
                }
            }
            if (this.points && this.type == 'bezier-quadratic') {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i].a = this.points[i].a.sum(value);
                    this.points[i].b = this.points[i].b.sum(value);
                    this.points[i].c = this.points[i].c.sum(value);
                }
            }

            return true;
        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);

            if (this.type == 'arc') {

                return intersection.circleArc(position, 4, this.point.multiply(scale).sum(move), this.radius * scale, this.startAngle, this.endAngle, this.clockWise);

            } else if (this.type == 'bezier-quadratic') {

                for (var i = 0; i < this.points.length; i++) {
                    if (intersection.circleBezier(this.points[i].a, this.points[i].b, this.points[i].c, point, 4, 4))
                        return true;
                }

            } else if (this.type == 'circle') {

                var xxx = this.point.multiply(scale).sum(move);

                return intersection.circleCircle(position, 4, xxx, this.radius * scale);

            } else if (this.type == 'ellipse') {

                return intersection.circleEllipse(position, 4, 4, this.point.multiply(scale).sum(move), this.radiusY * scale, this.radiusX * scale);

            } else if (this.type == 'line') {

                return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

            } else if (this.type == 'polygon') {

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

                    if (intersection.circleLine(position, 4, point.create(pointA.x * scale + move.x, pointA.y * scale + move.y), point.create(pointB.x * scale + move.x, pointB.y * scale + move.y)))
                        return true;
                }

            } else if (this.type == 'polyline') {

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

                    if (intersection.circleLine(position, 4, point.create(pointA.x * scale + move.x, pointA.y * scale + move.y), point.create(pointB.x * scale + move.x, pointB.y * scale + move.y)))
                        return true;
                }

            } else if (this.type == 'rectangle') {

                var xxx = this.point.multiply(scale).sum(move);

                return intersection.circleRectangle(position, 4, this.point.multiply(scale).sum(move), this.height * scale, this.width * scale);

            }

            return false;

        },
    };









    function create(attrs) {
        if ((typeof attrs == "function") || (attrs == null)) {
            throw new Error('shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline'].indexOf(attrs.type) == -1) {
            throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (((attrs.type != 'polyline') && (attrs.type != 'bezier-quadratic') && (attrs.type != 'bezier-cubic') &&
            (attrs.type != 'spline') && (attrs.type != 'line')) && ((attrs.x == undefined) || (attrs.y == undefined))) {
            throw new Error('shape - create - x and y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = types.math.uuid(9, 16),
            shape = null;

        // atributos 
        attrs = types.object.merge({
            uuid: uuid,
            name: 'shape '.concat(uuid),
            style: null,
            transform: matrix.create(),
            status: null
        }, attrs);

        switch (attrs.type) {
        case 'line':
            {
                attrs.points = [point.create(attrs.a[0], attrs.a[1]), point.create(attrs.b[0], attrs.b[1])];

                shape = line.create(attrs);

                break;
            }
        case 'bezier-cubic':
            {
                attrs.points[0] = point.create(attrs.points[0][0], attrs.points[0][1]);
                attrs.points[1] = point.create(attrs.points[1][0], attrs.points[1][1]);
                attrs.points[2] = point.create(attrs.points[2][0], attrs.points[2][1]);
                attrs.points[3] = point.create(attrs.points[3][0], attrs.points[3][1]);

                shape = bezierCubic.create(attrs);

                break;
            }
        case 'bezier-quadratic':
            {
                attrs.points[0] = point.create(attrs.points[0][0], attrs.points[0][1]);
                attrs.points[1] = point.create(attrs.points[1][0], attrs.points[1][1]);
                attrs.points[2] = point.create(attrs.points[2][0], attrs.points[2][1]);

                shape = bezierQuadratic.create(attrs);

                break;
            }
        case 'rectangle':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.height = attrs.height;
                attrs.width = attrs.width;

                shape = rectangle.create(attrs);

                break;
            }
        case 'arc':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radius = attrs.radius;
                attrs.startAngle = attrs.startAngle;
                attrs.endAngle = attrs.endAngle;
                attrs.clockWise = attrs.clockWise;

                shape = arc.create(attrs);

                break;
            }
        case 'circle':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radius = attrs.radius;

                shape = circle.create(attrs);

                break;
            }
        case 'ellipse':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radiusY = attrs.radiusY;
                attrs.radiusX = attrs.radiusX;

                shape = ellipse.create(attrs);

                break;
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

                shape = polygon.create(attrs);

                break;
            }
        case 'polyline':
            {
                for (var i = 0; i < attrs.points.length; i++) {
                    attrs.points[i] = point.create(attrs.points[i].x, attrs.points[i].y);
                }

                shape = polyline.create(attrs);

                break;
            }
        case 'spline':
            {
                for (var i = 0; i < attrs.points.length; i++) {
                    attrs.points[i] = point.create(attrs.points[i].x, attrs.points[i].y);
                }

                shape = splineNurbs.create(attrs);

                break;
            }
        default:
            break;
        }

        // adicionando o novo shape na layer ativa
        return layer.active.children.add(shape.uuid, shape);
    }

    function remove(value) {}

    function list() {}

    function find() {}



    exports.create = create;
    exports.remove = remove;
    exports.list = list;
    exports.find = find;
});
define("plane/structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var store = types.data.dictionary.create();

    var layer = require('plane/structure/layer'),
        point = require('plane/structure/point');

    var viewPort = null,
        view = null;


    function Tool(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.events = attrs.events;

        Object.defineProperty(this, 'active', {
            get: function () {
                return this._active || false;
            },
            set: function (value) {
                this.events.notify(value ? 'onActive' : 'onDeactive', {
                    type: value ? 'onActive' : 'onDeactive',
                    Now: new Date().toISOString()

                });
                this._active = value;
            }
        });

        this.active = attrs.active;
    };


    function initialize(config) {

        viewPort = config.viewPort;
        //        select = config.select;
        view = config.view;

        var pointDown,
            //            shapesSelect = select.shapes,
            shapesOver = types.data.dictionary.create();


        function onMouseDown(event) {

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                mouseInCanvas = types.graphic.canvasPosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas),
                pointMove = point.create(pointInView),
                shapesSelect = [];

            // to point
            pointInCanvas = point.create(pointInCanvas);

            // dizendo que o mouse preenche o evento down
            pointDown = point.create(pointInView);

            // verifico se o local onde o ponto está possui alguma shape como imagem
            var imageData = [].some.call(view.context.getImageData(mouseInCanvas.x, mouseInCanvas.y, 3, 3).data, function (element) {
                return element > 0;
            });

            //            debugger;

            // caso positivo realizamos a procura 
            if (imageData && layer.active && layer.active.status != 'system') {
                // apenas procuro na layer selecionada
                var children = layer.active.children.list(),
                    c = children.length;

                while (c--) {
                    if (children[c].contains(pointInCanvas, view.transform)) {
                        shapesSelect.push(children[c]);
                        //                        break; - lilo - teste de performance
                    }
                }
            }


            // customized event
            event = {
                type: 'onMouseDown',
                point: pointMove,
                shapes: shapesSelect,
                Now: new Date().toISOString()
            };

            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseDown', event);
                }
            }


        }

        function onMouseUp(event) {
            pointDown = null;
        }

        // Mouse Drag com o evento Mouse Move
        function onMouseDrag(event) {
            // se Mouse Down preenchido 
            if (pointDown) {
                var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                    pointInView = view.transform.inverseTransform(pointInCanvas);

                // http://paperjs.org/reference/toolevent/#point
                event = {
                    type: 'onMouseDrag',
                    pointFirst: pointDown,
                    pointLast: point.create(pointInView),
                    now: new Date().toISOString()
                }

                var tools = store.list(),
                    t = tools.length;
                while (t--) {
                    if (tools[t].active) {
                        tools[t].events.notify('onMouseDrag', event);
                    }
                }
            }
        }

        function onMouseMove(event) {

            //            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
            //                mouseInCanvas = types.graphic.canvasPosition(viewPort, event.x, event.y),
            //                pointInView = view.transform.inverseTransform(pointInCanvas);
            //
            //            // to point para procura em contains
            //            pointInCanvas = point.create(pointInCanvas);
            //
            //            // verifico se o local onde o ponto está possui alguma shape como imagem
            //            var imageData = [].some.call(view.context.getImageData(mouseInCanvas.x, mouseInCanvas.y, 3, 3).data, function (element) {
            //                return element > 0;
            //            });
            //
            //            // caso positivo realizamos a procura 
            //            if (imageData && select.layer && select.layer.status != 'system') {
            //                // apenas procuro na layer selecionada
            //                var children = select.layer.children.list(),
            //                    c = children.length;
            //
            //                while (c--) {
            //                    if (children[c].contains(pointInCanvas, view.transform)) {
            //                        shapesOver.add(children[c].uuid, children[c]);
            //                        //                        break; - lilo - teste de performance
            //                    } else {
            //                        shapesOver.remove(children[c].uuid);
            //                    }
            //                }
            //            } else { // caso negativo - limpamos os shapesOver
            //                shapesOver.clear();
            //            }
            //
            //            // customized event
            //            event = {
            //                type: 'onMouseMove',
            //                point: {
            //                    inDocument: point.create(event.x, event.y),
            //                    inCanvas: point.create(mouseInCanvas.x, mouseInCanvas.y),
            //                    inView: point.create(pointInView)
            //                },
            //                shapes: shapesOver.list(),
            //                Now: new Date().toISOString()
            //            };
            //
            //            var tools = store.list(),
            //                t = tools.length;
            //            while (t--) {
            //                if (tools[t].active) {
            //                    tools[t].events.notify('onMouseMove', event);
            //                }
            //            }
        }

        function onMouseLeave(event) {
            //            pointDown = null;
        }

        function onMouseWheel(event) {

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);

            // customized event
            event = {
                type: 'onMouseWheel',
                delta: event.deltaY,
                point: point.create(pointInView),
                now: new Date().toISOString()
            };

            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseWheel', event);
                }
            }
        }


        viewPort.onmousedown = onMouseDown;
        viewPort.onmouseup = onMouseUp;
        viewPort.addEventListener('mousemove', onMouseMove, false);
        viewPort.addEventListener('mousemove', onMouseDrag, false);
        viewPort.onmouseleave = onMouseLeave;
        viewPort.onmousewheel = onMouseWheel;

        return true;
    }

    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            uuid: uuid,
            name: 'Tool '.concat(uuid),
            events: types.object.event.create(),
            active: false
        }, attrs);

        // nova tool
        var tool = new Tool(attrs)

        store.add(tool.uuid, tool);

        return tool;
    }

    function list() {
        return store.list();
    }

    function find(uuid) {
        return store.find(uuid);
    }

    function remove(uuid) {
        return store.remove(uuid);
    }


    exports.initialize = initialize;

    exports.create = create;
    exports.list = list;
    exports.find = find;
    exports.remove = remove;
});
define("plane/structure/view", ['require', 'exports'], function (require, exports) {

    var matrix = require('plane/geometric/matrix');

    var layer = require('plane/structure/layer'),
        point = require('plane/structure/point');



    var viewPort = null,
        _context = null,
        _transform = null,
        _zoom = 1,
        _center = point.create(0, 0),
        size = {
            height: 0,
            width: 0
        },
        bounds = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };




    function initialize(config) {

        viewPort = config.viewPort;
        _context = config.context;
        
        // sistema cartesiano de coordenadas
        _context.translate(0, viewPort.clientHeight);
        _context.scale(1, -1);

        // created the matrix transform
        _transform = matrix.create();

        // o centro inicial
        _center = _center.sum(point.create(viewPort.clientWidth / 2, viewPort.clientHeight / 2));

        // os tamanhos que são fixos
        size.height = viewPort.clientHeight;
        size.width = viewPort.clientWidth;
    }






    function update() {


        // clear context, +1 is needed on some browsers to really clear the borders
        _context.clearRect(0, 0, viewPort.clientWidth + 1, viewPort.clientHeight + 1);

        var layers = layer.list(),
            l = layers.length;
        while (l--) {
            var shapes = layers[l].children.list(),
                s = shapes.length;

            // style of layer
            _context.lineCap = layers[l].style.lineCap;
            _context.lineJoin = layers[l].style.lineJoin;

            while (s--) {
                shapes[s].render(_context, _transform);
            }
        }
        return this;
    }





    function zoomTo(zoom, center) {

        var factor, motion;

        factor = zoom / _zoom;

        _transform.scale({
            x: factor,
            y: factor
        }, _center);

        _zoom = zoom;


        var centerSubtract = center.subtract(_center);
        centerSubtract = centerSubtract.negate();

        var xxx = matrix.create();
        xxx.translate(centerSubtract.x, centerSubtract.y);

        _transform.concate(xxx);

        _center = center;

        update();

        return true;
    }

    
    
    
    function reset() {
        zoomTo(1, point.create(size.width / 2, size.height / 2));
    }


    Object.defineProperty(exports, 'context', {
        get: function () {
            return _context;
        }
    });

    Object.defineProperty(exports, 'transform', {
        get: function () {
            return _transform;
        }
    });

    Object.defineProperty(exports, 'size', {
        get: function () {
            return size;
        }
    });

    Object.defineProperty(exports, 'bounds', {
        get: function () {
            var scale = Math.sqrt(_transform.a * _transform.d);

            return {
                x: _transform.tx,
                y: _transform.ty,
                height: size.height * scale,
                width: size.width * scale
            }
        }
    });

    Object.defineProperty(exports, 'center', {
        get: function () {
            return _center;
        },
        set: function (value) {

            var centerSubtract = value.subtract(_center);
            centerSubtract = centerSubtract.negate();

            var xxx = matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _transform.concate(xxx);

            _center = value;

            update();

            return true;
        }
    });

    Object.defineProperty(exports, 'zoom', {
        get: function () {
            return _zoom;
        },
        set: function (value) {

            var factor, motion;

            factor = value / _zoom;

            _transform.scale({
                x: factor,
                y: factor
            }, _center);

            _zoom = value;

            update();

            return true;
        }
    });




    exports.initialize = initialize;
    exports.update = update;
    exports.zoomTo = zoomTo;
    exports.reset = reset;
    
    
});
define("plane/utility/types", ['require', 'exports'], function (require, exports) {

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
        }

    }

    var graphic = {

        mousePosition: function (element, x, y) {
            var bb = element.getBoundingClientRect();

            x = (x - bb.left) * (element.clientWidth / bb.width);
            y = (y - bb.top) * (element.clientHeight / bb.height);

            // tradução para o sistema de coordenadas cartesiano
            y = (y - element.clientHeight) * -1;
            // ATENÇÃO - quando context.transform() a inversão não é feita

            return {
                x: x,
                y: y
            };
        },

        canvasPosition: function (element, x, y) {
            var bb = element.getBoundingClientRect();

            x = (x - bb.left) * (element.clientWidth / bb.width);
            y = (y - bb.top) * (element.clientHeight / bb.height);

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
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor
                // 2014.08.08 11:00 - lilo - alteração para funcionar com propriedas e função "not own (prototype chain)" do objeto
                var desc = Object.getOwnPropertyDescriptor(p, prop);
                if (desc) {
                    Object.defineProperty(o, prop, desc); // add the property to o.
                } else {
                    o[prop] = p[prop];
                }
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
    exports.date = date;
    exports.object = object;
});
window.plane = require("plane");
})(window);