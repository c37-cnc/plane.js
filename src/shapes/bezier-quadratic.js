define("plane/shapes/bezier-quadratic", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point'),
        object = require('plane/structure/object');

    var types = require('plane/utility/types');


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

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.points = attrs.points;

        this.initialize(attrs);

    }, object.Shape);


    // https://github.com/MartinDoms/Splines/blob/master/quadraticBezier.js
    BezierQuadratic.prototype.calculeSegments = function () {

        var lineSegments = 100;

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
            this.segments.push(quadraticBezier(this.points, j / lineSegments));
        }

        return true;
    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Bezier Quadratic - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.points[0] = point.create(attrs.points[0]);
        attrs.points[1] = point.create(attrs.points[1]);
        attrs.points[2] = point.create(attrs.points[2]);


        // 4 - criando um novo shape do tipo arco
        return new BezierQuadratic(attrs);
    };

    exports.create = create;

});