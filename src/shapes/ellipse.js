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