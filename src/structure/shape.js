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

                return intersection.circleArc(position, 4, this.point.multiply(scale).sum(move), this.radius * scale, this.startAngle, this.endAngle, this.clockWise);

            } else if (this.type == 'bezier') {

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

                var LEUWF3cpo = function(_param1, degree, knots, points) {
                    
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
        if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier', 'spline'].indexOf(attrs.type) == -1) {
            throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (((attrs.type != 'polyline') && (attrs.type != 'bezier') && (attrs.type != 'spline') && (attrs.type != 'line')) && ((attrs.x == undefined) || (attrs.y == undefined))) {
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