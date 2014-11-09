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