/*!
 * C37 in 20-08-2014 at 13:17:02 
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
define("data/exporter", ['require', 'exports'], function (require, exports) {
    
//    function toJson (){
//        return true;
//    }
//    
//    function toSvg (){
//        return true;
//    }
    
    function toDxf (){
        return true;
    }
    
    function toPng (){
        return true;
    }
    
    function toPdf (){
        return true;
    }

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
    
    
    
    
    exports.toJson = toJson;
    exports.toSvg = toSvg;
    exports.toDxf = toDxf;
    exports.toPng = toPng;
    exports.toPdf = toPdf;

});
define("data/importer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

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
    
    
//
//    // importer
//    function fromJson(stringJson) {
//
//        var planeObject = JSON.parse(stringJson);
//
//        clear();
//
//        //        _center = planeObject.position;
//
//        planeObject.layers.forEach(function (layerObject) {
//
//            layerManager.create({
//                uuid: layerObject.uuid,
//                name: layerObject.name,
//                locked: layerObject.locked,
//                Visible: layerObject.Visible,
//                style: layerObject.style,
//                viewPort: viewPort
//            });
//
//            layerObject.shapes.forEach(function (shapeObject) {
//                shape.create(shapeObject)
//            });
//
//            layerManager.update();
//        });
//
//        return true;
//    };
//
//    function fromSvg(stringSvg) {
//        return true;
//    };
//
//
//    function fromDwg(stringDwg) {
//        return true;
//    }
//    // importer
    

    exports.parseDxf = parseDxf;
    exports.fromDwg = fromDwg;
    exports.fromJson = fromJson;
    exports.fromSvg = fromSvg;

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
define("geometric/intersection", ['require', 'exports'], function (require, exports) {

    var polynomial = require('geometric/polynomial'),
        point = require('structure/point');


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
define("geometric/matrix", ['require', 'exports'], function (require, exports) {

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
define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var types = require('utility/types');

    var matrix = require('geometric/matrix');

    var layer = require('structure/layer'),
        point = require('structure/point'),
        shape = require('structure/shape'),
        group = require('structure/group'),
        tool = require('structure/tool');

    var importer = require('data/importer'),
        exporter = require('data/exporter');

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
        var render = document.createElement('canvas');

        render.id = types.math.uuid(9, 16);
        render.width = viewPort.clientWidth;
        render.height = viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = 'transparent';

        // add em viewPort HTMLElement
        viewPort.appendChild(render);

        
        // initialize view

        // add to private view
        _view.context = render.getContext('2d');
        
        // sistema cartesiano de coordenadas
        _view.context.translate(0, viewPort.clientHeight);
        _view.context.scale(1, -1);
        
        // created the matrix transform
        _view.transform = matrix.create();

        // o centro inicial
        _view.center = _view.center.sum(point.create(viewPort.clientWidth / 2, viewPort.clientHeight / 2));

        // os tamanhos que são fixos
        _view.size.height = viewPort.clientHeight;
        _view.size.width = viewPort.clientWidth;

        
        // initialize structure
        layer.initialize({
            select: select
        });
        shape.initialize({
            select: select
        });
        tool.initialize({
            viewPort: viewPort,
            select: select,
            view: _view
        });

        return true;
    }

    function clear() {

        // reset all parameters in view
        _view.reset();

        // remove em todas as layers
        layer.remove();

        return true;
    }

    function update() {

        var context = _view.context,
            transform = _view.transform;

        // clear context, +1 is needed on some browsers to really clear the borders
        context.clearRect(0, 0, viewPort.clientWidth + 1, viewPort.clientHeight + 1);

        var layers = layer.list(),
            l = layers.length;
        while (l--) {
            var shapes = layers[l].children.list(),
                s = shapes.length;

            // style of layer
            context.lineCap = layers[l].style.lineCap;
            context.lineJoin = layers[l].style.lineJoin;

            while (s--) {
                context.beginPath();
                shapes[s].render(context, transform);
                context.stroke();
            }
        }
        return this;
    }

    // private view
    var _view = {
        context: null,
        transform: null,
        zoom: 1,
        center: point.create(0, 0),
        size: {
            height: 0,
            width: 0
        },
        bounds: {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        },
        reset: function () {

        }
    };

    // public view
    var view = {
        get zoom() {
            return _view.zoom;
        },
        set zoom(zoom) {

            var factor, motion;

            factor = zoom / _view.zoom;

            _view.transform.scale({
                x: factor,
                y: factor
            }, _view.center);

            _view.zoom = zoom;


            update();

            return true;
        },
        zoomTo: function(zoom, center){
            
            var factor, motion;

            factor = zoom / _view.zoom;

            _view.transform.scale({
                x: factor,
                y: factor
            }, _view.center);

            _view.zoom = zoom;
            
            

            var centerSubtract = center.subtract(_view.center);
            centerSubtract = centerSubtract.negate();

            var xxx = matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _view.transform.concate(xxx);

            _view.center = center;
            
            
            
            
            
            update();
            
            return true;
        },
        get center() {
            return _view.center;
        },
        set center(center) {

//            debugger;

            var centerSubtract = center.subtract(_view.center);
            centerSubtract = centerSubtract.negate();

            var xxx = matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _view.transform.concate(xxx);

            _view.center = center;

            update();

            return true;
        }
    };



    var select = (function () {

        var _layer = null,
            _shapes = types.data.dictionary.create(),
            _groups = types.data.dictionary.create();

        return {
            get layer() {
                return _layer;
            },
            set layer(uuid) {
                this.events.notify('onDeactivated', {
                    type: 'onDeactivated',
                    layer: _layer
                });

                _layer = layer.find(uuid);
                _shapes.clear();
                _groups.clear();

                this.events.notify('onActivated', {
                    type: 'onActivated',
                    layer: _layer
                });
            },
            get shapes() {
                return _shapes.list();
            },
            set shapes(shape) {
                return _shapes.add(shape.uuid, shape);
            },
            get groups() {
                return _groups.list();
            },
            set groups(group) {
                return _groups.add(group.uuid, group);
            },
            events: types.object.event.create()
        }
    })();



    exports.initialize = initialize;
    exports.update = update;
    exports.clear = clear;

    exports.view = view
    exports.select = select;

    exports.point = point;
    exports.shape = shape;
    exports.group = group;
    exports.layer = {
        create: layer.create,
        list: layer.list,
        find: layer.find,
        remove: layer.remove
    };
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
                update();
            }
        }
    };


    exports.exporter = exporter;
});
define("structure/group", ['require', 'exports'], function (require, exports) {

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
define("structure/layer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var store = types.data.dictionary.create();

    var select = null;


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
            children: this.children.list()
        };
    }


    function initialize(config) {

        select = config.select;



        return true;
    };



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
        select.layer = layer.uuid;

        return this;
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
define("structure/point", ['require', 'exports'], function (require, exports) {

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
define("structure/shape", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var intersection = require('geometric/intersection'),
        matrix = require('geometric/matrix');

    var point = require('structure/point'),
        layer = require('structure/layer');

    var select = null;


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

            if (this.type == 'arc') {

            } else if (this.type == 'bezier') {

            } else if (this.type == 'circle') {

            } else if (this.type == 'ellipse') {

            } else if (this.type == 'line') {

            } else if (this.type == 'polygon') {

            } else if (this.type == 'polyline') {

            } else if (this.type == 'rectangle') {

            }

            return true;
        },
        scaleTo: function (factor) {


            if (this.type == 'arc') {

                this.point.x *= factor;
                this.point.y *= factor;
                this.radius *= factor;

            } else if (this.type == 'bezier') {

                this.points.forEach(function (point) {
                    point.a = point.a.multiply(factor);
                    point.b = point.b.multiply(factor);
                    point.c = point.c.multiply(factor);
                });

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
        contains: function (position, transform) {
            
            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);
            
            if (this.type == 'arc') {

                return intersection.circleArc(position, 2, this.point.multiply(scale).sum(move), this.radius * scale, this.startAngle, this.endAngle, this.clockWise);

            } else if (this.type == 'bezier') {

                for (var i = 0; i < this.points.length; i++) {
                    if (intersection.circleBezier(this.points[i].a, this.points[i].b, this.points[i].c, point, 2, 2))
                        return true;
                }

            } else if (this.type == 'circle') {

//                var x = (this.point.x * scale) + move.x,
//                    y = (this.point.y * scale) + move.y;
//                
//                var xxx = point.create(x, y);
//                
                var xxx = this.point.multiply(scale).sum(move);
                
                return intersection.circleCircle(position, 2, xxx, this.radius * scale);

            } else if (this.type == 'ellipse') {

                return intersection.circleEllipse(position, 2, 2, this.point.multiply(scale).sum(move), this.radiusY * scale, this.radiusX * scale);

            } else if (this.type == 'line') {

                return intersection.circleLine(position, 2,  this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

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

                    if (intersection.circleLine(position, 2, pointA, pointB))
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

                    if (intersection.circleLine(position, 2, pointA, pointB))
                        return true;
                }

            } else if (this.type == 'rectangle') {

                var xxx = this.point.multiply(scale).sum(move);
                console.log(xxx);
                
//                var rrr = transform.inverseTransform(this.point);
//                console.log(rrr);
                
                console.log(position);
                
                return intersection.circleRectangle(position, 2, this.point.multiply(scale).sum(move), this.height * scale, this.width * scale);

            }

            return false;

        },
        render: function (context, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };

            if (this.type == 'arc') {

                context.arc((this.point.x * scale) + move.x, (this.point.y * scale) + move.y, this.radius * scale, (Math.PI / 180) * this.startAngle, (Math.PI / 180) * this.endAngle, this.clockWise);

            } else if (this.type == 'bezier') {

                // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
                this.points.forEach(function (point) {
                    var x = (point.c.x * scale) + move.x,
                        y = (point.c.y * scale) + move.y;
                    context.bezierCurveTo((point.a.x * scale) + move.x, (point.a.y * scale) + move.y, (point.b.x * scale) + move.x, (point.b.y * scale) + move.y, x, y);
                });

            } else if (this.type == 'circle') {

                context.arc((this.point.x * scale) + move.x, (this.point.y * scale) + move.y, this.radius * scale, 0, Math.PI * 2, true);

            } else if (this.type == 'ellipse') {

                // http://scienceprimer.com/draw-oval-html5-canvas
                // angle in radian
                var sss = 0;
                for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 0.01) {
                    var xPos = this.point.x - (this.radiusY * Math.sin(i)) * Math.sin(sss * Math.PI) + (this.radiusX * Math.cos(i)) * Math.cos(sss * Math.PI);
                    var yPos = this.point.y + (this.radiusX * Math.cos(i)) * Math.sin(sss * Math.PI) + (this.radiusY * Math.sin(i)) * Math.cos(sss * Math.PI);

                    if (i == 0) {
                        context.moveTo((xPos * scale) + move.x, (yPos * scale) + move.y);
                    } else {
                        context.lineTo((xPos * scale) + move.x, (yPos * scale) + move.y);
                    }
                }

            } else if (this.type == 'line') {

                context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);
                context.lineTo((this.points[1].x * scale) + move.x, (this.points[1].y * scale) + move.y);

            } else if (this.type == 'polygon') {

                context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);

                this.points.forEach(function (point) {
                    context.lineTo((point.x * scale) + move.x, (point.y * scale) + move.y);
                });
                context.closePath();

            } else if (this.type == 'polyline') {

                context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);

                this.points.forEach(function (point) {
                    context.lineTo((point.x * scale) + move.x, (point.y * scale) + move.y);
                });

            } else if (this.type == 'rectangle') {

                context.strokeRect((this.point.x * scale) + move.x, (this.point.y * scale) + move.y, this.width * scale, this.height * scale);

            }

            return true;
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

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Structure
     * @extends Shape
     * @class Arc
     * @constructor
     */
    var Arc = types.object.inherits(function Arc(attrs) {
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

        this.type = 'arc';
        this.point = attrs.point;
        this.radius = attrs.radius;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.clockWise = attrs.clockWise;
    }, Shape);

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Structure
     * @extends Shape
     * @class Bezier
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    var Bezier = types.object.inherits(function Bezier(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'bezier';
        this.points = attrs.points;
    }, Shape);

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Structure
     * @extends Shape
     * @class Circle
     * @constructor
     */
    var Circle = types.object.inherits(function Circle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'circle';
        this.point = attrs.point;
        this.radius = attrs.radius;
    }, Shape);

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Structure
     * @extends Shape
     * @class Ellipse
     * @constructor
     */
    var Ellipse = types.object.inherits(function Ellipse(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'ellipse';
        this.point = attrs.point;
        this.radiusY = attrs.radiusY;
        this.radiusX = attrs.radiusX;
    }, Shape);

    var Line = types.object.inherits(function Line(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'line';
        this.points = attrs.points;
        this.style = attrs.style;
    }, Shape);

    var Polygon = types.object.inherits(function Polygon(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'polygon';
        this.point = attrs.point;
        this.points = attrs.points;
        this.sides = attrs.sides;
    }, Shape);

    var Polyline = types.object.inherits(function Polyline(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'polyline';
        this.points = attrs.points;
    }, Shape);

    var Rectangle = types.object.inherits(function Rectangle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'rectangle';
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;
    }, Shape);



    function initialize(config) {

        select = config.select;



        return true;
    };


    function create(attrs) {
        if ((typeof attrs == "function") || (attrs == null)) {
            throw new Error('shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier'].indexOf(attrs.type) == -1) {
            throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (((attrs.type != 'polyline') && (attrs.type != 'bezier') && (attrs.type != 'line')) && ((attrs.x == undefined) || (attrs.y == undefined))) {
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

                shape = new Line(attrs);

                break;
            }
        case 'bezier':
            {
                attrs.points = attrs.points.map(function (pointAttrs) {
                    return {
                        a: point.create(pointAttrs.a[0], pointAttrs.a[1]),
                        b: point.create(pointAttrs.b[0], pointAttrs.b[1]),
                        c: point.create(pointAttrs.c[0], pointAttrs.c[1])
                    };
                });

                shape = new Bezier(attrs);

                break;
            }
        case 'rectangle':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.height = attrs.height;
                attrs.width = attrs.width;

                shape = new Rectangle(attrs);

                break;
            }
        case 'arc':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radius = attrs.radius;
                attrs.startAngle = attrs.startAngle;
                attrs.endAngle = attrs.endAngle;
                attrs.clockWise = attrs.clockWise;

                shape = new Arc(attrs);

                break;
            }
        case 'circle':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radius = attrs.radius;

                shape = new Circle(attrs);

                break;
            }
        case 'ellipse':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radiusY = attrs.radiusY;
                attrs.radiusX = attrs.radiusX;

                shape = new Ellipse(attrs);

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

                shape = new Polygon(attrs);

                break;
            }
        case 'polyline':
            {
                for (var i = 0; i < attrs.points.length; i++) {
                    attrs.points[i] = point.create(attrs.points[i].x, attrs.points[i].y);
                }

                shape = new Polyline(attrs);

                break;
            }
        default:
            break;
        }

        // adicionando o novo shape na layer ativa
        return select.layer.children.add(shape.uuid, shape);
    }

    function remove(value) {}

    function list() {}

    function find() {}



    exports.initialize = initialize;

    exports.create = create;
    exports.remove = remove;
    exports.list = list;
    exports.find = find;
});
define("structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var store = types.data.dictionary.create();

    var point = require('structure/point');

    var viewPort = null,
        select = null,
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
        select = config.select;
        view = config.view;

        var pointDown,
            shapesOver = types.data.dictionary.create();


        function onMouseDown(event) {

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);


            var children = select.layer.children.list(),
                c = children.length,
                shapes = [];

            while (c--) {
                if (children[c].contains(point.create(0, 0), view.transform))
                    shapes.push(children[c]);
            }

            pointDown = point.create(pointInView);


            // customized event
            event = {
                type: 'onMouseDown',
                point: pointDown,
                shapes: shapes,
                now: new Date().toISOString()
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

        function onMouseDrag(event) {

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

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                mouseInCanvas = types.graphic.canvasPosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas),
                pointMove = point.create(pointInCanvas);
//                pointMove = point.create(pointInView);


            //            console.log(pointInCanvas);
            //            console.log(pointInView);

            //            console.log(view.context.getImageData(mouseInCanvas.x, mouseInCanvas.y, 3, 3).data);


            // apenas procuro na layer selecionada
            var children = select.layer.children.list(),
                c = children.length;

            while (c--) {
                if (children[c].contains(pointMove, view.transform)) {
                    shapesOver.add(children[c].uuid, children[c]);
                } else {
                    shapesOver.remove(children[c].uuid);
                }
            }


            // customized event
            event = {
                type: 'onMouseMove',
                point: pointMove,
                shapes: shapesOver.list(),
                Now: new Date().toISOString()
            };

            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseMove', event);
                }
            }
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
define("structure/view", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var matrix = require('geometric/matrix');

    var viewPort = null,
        canvas = {
            context: null,
            transform: null
        };


    var view = (function () {

        var transform = matrix.create(),
            viewPort = null,
            _zoom = 1,
            center = {
                x: 0,
                y: 0
            },
            bounds = {
                bottom: 0,
                height: 0,
                left: 0,
                right: 0,
                top: 0,
                width: 0
            },
            size = {
                height: 0,
                width: 0
            };

        return {
            initialize: function (config) {

                viewPort = config.viewPort;

                bounds.height = viewPort.clientHeight;
                bounds.width = viewPort.clientWidth;

                center.x = viewPort.clientWidth / 2;
                center.y = viewPort.clientHeight / 2;

                size.height = viewPort.clientHeight;
                size.width = viewPort.clientWidth;

                return true;
            },
            // zoom level
            get zoom() {
                return _zoom;
                //                return Math.sqrt(transform.a * transform.d);
            },
            set zoom(value) {

                this.zoomTo(value, {
                    x: 0,
                    y: 0
                });

                return true;
            },

            /**
             * Descrição para o metodo zoomTo
             *
             * @method zoomTo
             * @param factor {Number} fator de zoom aplicado
             * @param point {Object} local onde o zoom será aplicado
             * @return {Boolean} Copy of ...
             */
            //            zoomTo: function (factor, point) {
            zoomTo: function (zoom, point) {

                //                                debugger;

                var factor, motion;

                factor = zoom / _zoom;

                transform.scale({
                    x: factor,
                    y: factor
                }, point);

                motion = {
                    x: transform.tx,
                    y: transform.ty
                }

                _zoom = zoom;


                //                var zoom, motion;
                //
                //                zoom = factor > 0 ? (1.041666666666667 / Math.sqrt(transform.a * transform.d)) : (.96 / Math.sqrt(transform.a * transform.d));
                //
                //                transform.scale({
                //                    x: zoom,
                //                    y: zoom
                //                }, point);
                //
                //                motion = {
                //                    x: transform.tx,
                //                    y: transform.ty
                //                }




                // High Performance - JavaScript - Loops - Page 65
                //                var layers = layer.list(),
                //                    l = layer.list().length;
                //                while (l--) {
                //                    var shapes = layers[l].shapes.list(),
                //                        s = shapes.length;
                //                    while (s--) {
                //                        shapes[s].scaleTo(this.zoom);
                //                        shapes[s].moveTo({
                //                            x: transform.tx,
                //                            y: transform.ty
                //                        });
                //                    }
                //                }

                // movimentando todos os shapes de todas as layers
                var layers = layer.list(),
                    l = layer.list().length - 1;
                do {
                    var shapes = layers[l].shapes.list(),
                        s = shapes.length - 1;
                    do {
                        shapes[s].scaleTo(zoom);
                        shapes[s].moveTo(motion);
                    } while (s--);
                } while (l--);
                layer.update();

                //                                layer.update(transform);

                return true;
            },
            moveTo: function (value) { // absolute



                return true;
            },
            center: {
                get position() {
                    return center;
                },
                add: function (value) { // relative

                    return true;
                },
                reset: function () {

                    // goto center initial

                    return true;
                }
            },
            get bounds() {

                //                debugger;                

                //                var bound = this.size;
                //                var iii = transform.inverted()._transformBounds(bound);
                //                var fff = this.size;


                return bounds;
            },
            get size() {
                return size;
            },
            reset: function () {

                transform.reset();

                zoom = 1;

                bounds.height = viewPort.clientHeight;
                bounds.width = viewPort.clientWidth;

                center.x = viewPort.clientWidth / 2;
                center.y = viewPort.clientHeight / 2;

                size.height = viewPort.clientHeight;
                size.width = viewPort.clientWidth;

                return true;
            }
        }
    })();


    function initialize(config) {

        viewPort = config.viewPort;

        // montando o render da Layer
        var render = document.createElement('canvas');

        render.id = types.math.uuid(9, 16);
        render.width = viewPort.clientWidth;
        render.height = viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = 'transparent';

        // add em viewPort
        viewPort.appendChild(render);

        // add to public
        canvas.context = render.getContext('2d');
        canvas.transform = matrix.create()

        return true;
    }

    exports.initialize = initialize;
    exports.canvas = canvas;

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
    exports.object = object;
});
window.plane = require("plane");
})(window);