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

            // possivel personalização
            if (this.style) {
                context.save();

                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
            }

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
            
            
            // possivel personalização
            if (this.style) {
                context.restore();
            }
            

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