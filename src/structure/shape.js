define("plane/structure/shape", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point'),
        layer = require('plane/structure/layer');

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

            } else if (this.type == 'bezier-quadratic') {

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

            } else if (this.type == 'bezier-quadratic') {

                this.points.forEach(function (point) {
                    point[0] = point[0].multiply(factor);
                    point[1] = point[1].multiply(factor);
                    point[2] = point[2].multiply(factor);
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
        render: function (context, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            // possivel personalização
            if (this.style) {
                context.save();

                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
            }

            context.beginPath();

            if (this.type == 'arc') {

                //                context.arc((this.point.x * scale) + move.x, (this.point.y * scale) + move.y, this.radius * scale, (Math.PI / 180) * this.startAngle, (Math.PI / 180) * this.endAngle, this.clockWise);
                //                context.stroke();

                var points = [];

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

                    points.push({
                        x: xval,
                        y: yval
                    });
                    ++index;
                    num4 += num1;
                }

                var xval1 = this.point.x + this.radius * Math.cos(num2 + num3);
                var yval1 = this.point.y + this.radius * Math.sin(num2 + num3);

                points[points.length - 1].x = xval1;
                points[points.length - 1].y = yval1;


                for (var i = 0; i < points.length; i += 2) {
                    context.lineTo(points[i].x * scale + move.x, points[i].y * scale + move.y);
                }
                context.stroke();


            } else if (this.type == 'bezier-cubic') {


                // https://github.com/MartinDoms/Splines/blob/master/cubicBezier.js

                var pts = [],
                    lineSegments = 100;


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
                    pts.push(cubicBezier(this.points, j / lineSegments));
                }


                for (var i = 0; i < pts.length; i += 2) {
                    context.lineTo(pts[i].x * scale + move.x, pts[i].y * scale + move.y);
                }
                context.stroke();




            } else if (this.type == 'bezier-quadratic') {

                // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
                //                                this.points.forEach(function (point) {
                //                                    var x = (point.c.x * scale) + move.x,
                //                                        y = (point.c.y * scale) + move.y;
                //                                    context.bezierCurveTo((point.a.x * scale) + move.x, (point.a.y * scale) + move.y, (point.b.x * scale) + move.x, (point.b.y * scale) + move.y, x, y);
                //                                });


                // https://github.com/mrdoob/three.js/blob/1769fbfc6c994b51a54c15a5c096855fd3cb8a1a/src/extras/curves/QuadraticBezierCurve.js#L21
                // https://github.com/mrdoob/three.js/blob/1769fbfc6c994b51a54c15a5c096855fd3cb8a1a/src/extras/core/Shape.js#L534

                // Bezier Curves formulas obtained from
                // http://en.wikipedia.org/wiki/B%C3%A9zier_curve

                // Quad Bezier Functions

                //                var b2p0 = function (t, p) {
                //
                //                    var k = 1 - t;
                //                    return k * k * p;
                //
                //                };
                //
                //                var b2p1 = function (t, p) {
                //
                //                    return 2 * (1 - t) * t * p;
                //
                //                };
                //
                //                var b2p2 = function (t, p) {
                //
                //                    return t * t * p;
                //
                //                };
                //
                //                var b2 = function (t, p0, p1, p2) {
                //
                //                    return b2p0(t, p0) + b2p1(t, p1) + b2p2(t, p2);
                //
                //                };
                //
                //                var d, pts = [],
                //                    divisions = 200;
                //
                //                this.points.forEach(function (point) {
                //
                //                    for (d = 0; d <= divisions; d++) {
                //
                //                        var t = d / divisions;
                //
                //                        var tx = b2(t, point.a.x, point.b.x, point.c.x);
                //                        var ty = b2(t, point.a.y, point.b.y, point.c.y);
                //
                //                        pts.push({
                //                            x: tx,
                //                            y: ty
                //                        });
                //                    }
                //
                //                });


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




            } else if (this.type == 'circle') {

                //                context.arc((this.point.x * scale) + move.x, (this.point.y * scale) + move.y, this.radius * scale, 0, Math.PI * 2, true);

                var points = [];

                // em numero de partes - 58 
                var num1 = Math.PI / 58;
                var size = Math.abs(2.0 * Math.PI / num1) + 2;
                var index = 0;
                var num2 = 0.0;

                while (index < size - 1) {
                    points.push({
                        x: this.point.x + this.radius * Math.cos(num2),
                        y: this.point.y + this.radius * Math.sin(num2)
                    });
                    ++index;
                    num2 += num1;
                }

                for (var i = 0; i < points.length; i += 2) {
                    context.lineTo(points[i].x * scale + move.x, points[i].y * scale + move.y);
                }
                context.stroke();


            } else if (this.type == 'ellipse') {

                // http://scienceprimer.com/draw-oval-html5-canvas
                //                                 angle in radian
                //                                var sss = types.math.radians(this.angle || 0);

                //                var rotation = types.math.radians(this.angle || 0);

                if (this.endAngle) {

                    //                    debugger;

                    var points = this.endAngle;



                    for (var i = 0; i < points.length; i += 2) {

                        var x = points[i] * scale + move.x;
                        var y = points[i + 1] * scale + move.y;

                        context.lineTo(points[i] * scale + move.x, points[i + 1] * scale + move.y);
                    }
                    context.stroke();

                }



                // erro na conversão dxf - ver entidade na linha 7506 de entities.dxf

                //                var points = [];
                //                var beta = (90) *  (Math.PI / 180);
                //                var sinbeta = Math.sin(beta);
                //                var cosbeta = Math.cos(beta);
                //
                //                for (var i = 0; i <= 361; i += 360 / 200) {
                //                    var alpha = i * (Math.PI / 180);
                //                    var sinalpha = Math.sin(alpha);
                //                    var cosalpha = Math.cos(alpha);
                //
                //                    var pointX = 0.5 * (this.radiusX * cosalpha * cosbeta - this.radiusY * sinalpha * sinbeta);
                //                    var pointY = 0.5 * (this.radiusX * cosalpha * sinbeta + this.radiusY * sinalpha * cosbeta);
                //
                //                    points.push({
                //                        x: this.point.x + pointX,
                //                        y: this.point.y + pointY
                //                    });
                //                }

                //                context.moveTo(this.point.x, this.point.y);
                //                for (var i = 0; i < points.length; i++) {
                //                    context.lineTo(points[i].x * scale + move.x, points[i].y * scale + move.y);
                //                    context.stroke();
                //                }





                //                context.ellipse(this.point.x * scale + move.x, this.point.y * scale + move.y, this.radiusX * scale, this.radiusY * scale, rotation, 0, 360);


                //                for (var i = 2 * Math.PI; i > 0; i -=.1) {
                //                    
                //                    var xPos = this.point.x - (this.radiusY * Math.sin(i)) * Math.sin(sss * Math.PI) + (this.radiusX * Math.cos(i)) * Math.cos(sss * Math.PI);
                //                    var yPos = this.point.y + (this.radiusX * Math.cos(i)) * Math.sin(sss * Math.PI) + (this.radiusY * Math.sin(i)) * Math.cos(sss * Math.PI);
                //
                //                    if (i == 0) {
                //                        context.moveTo((xPos * scale) + move.x, (yPos * scale) + move.y);
                //                    } else {
                //                        context.lineTo((xPos * scale) + move.x, (yPos * scale) + move.y);
                //                    }
                //                }

                //                for (var i = 0; i < 2 * Math.PI; i +=.1) {
                //                    var xPos = this.point.x - (this.radiusY * Math.sin(i)) * Math.sin(sss * Math.PI) + (this.radiusX * Math.cos(i)) * Math.cos(sss);
                //                    var yPos = this.point.y + (this.radiusX * Math.cos(i)) * Math.sin(sss * Math.PI) + (this.radiusY * Math.sin(i)) * Math.cos(sss);
                //
                //                    if (i == 0) {
                //                        context.moveTo((xPos * scale) + move.x, (yPos * scale) + move.y);
                //                    } else {
                //                        context.lineTo((xPos * scale) + move.x, (yPos * scale) + move.y);
                //                    }
                //                }
                //                

                var getPoint = function (t, point, startAngle, endAngle, radiusX, radiusY) {

                    var aClockwise = true;
                    var angle;
                    var deltaAngle = endAngle - startAngle;

                    if (deltaAngle < 0) deltaAngle += Math.PI * 2;
                    if (deltaAngle > Math.PI * 2) deltaAngle -= Math.PI * 2;

                    if (aClockwise === true) {

                        angle = endAngle + (1 - t) * (Math.PI * 2 - deltaAngle);

                    } else {

                        angle = startAngle + t * deltaAngle;

                    }

                    var tx = point.x + radiusX * Math.cos(angle);
                    var ty = point.y + radiusY * Math.sin(angle);

                    return {
                        x: tx,
                        y: ty
                    };
                }

                var getPoints = function (divisions, point, startAngle, endAngle, radiusX, radiusY) {

                    var d, pts = [];

                    for (d = 0; d <= divisions; d++) {

                        pts.push(getPoint(d / divisions, point, startAngle, endAngle, radiusX, radiusY));

                    }
                    return pts;
                }

                //                if (this.startAngle && this.endAngle) {
                //                    
                ////                    debugger;
                //                    
                //                    var xxx = getPoints(300, this.point, this.startAngle, this.endAngle, this.radiusX, this.radiusY);
                //
                //                    context.moveTo(xxx[0].x * scale + move.x, xxx.y * scale + move.y);
                //
                //                    for (var i = 0; i < xxx.length; i++) {
                //                        context.lineTo(xxx[i].x * scale + move.x, xxx[i].y * scale + move.y);
                //                    }
                //                    
                //                    context.stroke();
                //                }


            } else if (this.type == 'line') {

                // possivel personalização
                context.lineWidth = (this.style && this.style.lineWidth) ? this.style.lineWidth : context.lineWidth;
                context.strokeStyle = (this.style && this.style.lineColor) ? this.style.lineColor : context.strokeStyle;

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

            } else if (this.type == 'spline') {

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



            }

            context.stroke();

            // possivel personalização
            if (this.style) {
                context.restore();
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
            case 'bezier-quadratic':
                //                return {
                //                    uuid: this.uuid,
                //                    type: this.type,
                //                    name: this.name,
                //                    status: this.status,
                //                    points: this.points.map(function (point) {
                //                        return {
                //                            a: [types.math.parseFloat(point.a.x, 5), types.math.parseFloat(point.a.y, 5)],
                //                            b: [types.math.parseFloat(point.b.x, 5), types.math.parseFloat(point.b.y, 5)],
                //                            c: [types.math.parseFloat(point.c.x, 5), types.math.parseFloat(point.c.y, 5)]
                //                        }
                //                    })
                //                };
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
     * @class Bezier Quadratic
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    var BezierQuadratic = types.object.inherits(function BezierQuadratic(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'bezier-quadratic';
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
     * @class Bezier Cubic
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    var BezierCubic = types.object.inherits(function BezierCubic(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'bezier-cubic';
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
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.angle = attrs.angle;
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

    var Spline = types.object.inherits(function Spline(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'spline';
        this.degree = attrs.degree;
        this.knots = attrs.knots;
        this.points = attrs.points;
    }, Shape);



    function initialize(config) {

        select = config.select;



        return true;
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

                shape = new Line(attrs);

                break;
            }
        case 'bezier-cubic':
            {
                attrs.points[0] = point.create(attrs.points[0][0], attrs.points[0][1]);
                attrs.points[1] = point.create(attrs.points[1][0], attrs.points[1][1]);
                attrs.points[2] = point.create(attrs.points[2][0], attrs.points[2][1]);
                attrs.points[3] = point.create(attrs.points[3][0], attrs.points[3][1]);

                shape = new BezierCubic(attrs);

                break;
            }
        case 'bezier-quadratic':
            {
                attrs.points[0] = point.create(attrs.points[0][0], attrs.points[0][1]);
                attrs.points[1] = point.create(attrs.points[1][0], attrs.points[1][1]);
                attrs.points[2] = point.create(attrs.points[2][0], attrs.points[2][1]);

                shape = new BezierQuadratic(attrs);

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
        case 'spline':
            {
                for (var i = 0; i < attrs.points.length; i++) {
                    attrs.points[i] = point.create(attrs.points[i].x, attrs.points[i].y);
                }

                shape = new Spline(attrs);

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