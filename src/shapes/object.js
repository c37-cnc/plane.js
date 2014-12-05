define("plane/shapes/object", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');

    var types = require('plane/utility/types');

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    function Base() {};

    Base.prototype = {
        initialize: function (attrs) {

            // o nome do shape
            attrs.name = types.string.format('{0} - {1}', [attrs.type, attrs.uuid]);

            // completando os campos do shape
            types.object.extend(this, attrs);

            // calculando os segmentos
            this.calculeSegments();

            return true;
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

        },
        intersect: function (rectangle) {

            var tl = point.create(rectangle.from.x, rectangle.to.y), // top left
                tr = point.create(rectangle.to.x, rectangle.to.y), // top right
                bl = point.create(rectangle.from.x, rectangle.from.y), // bottom left
                br = point.create(rectangle.to.x, rectangle.from.y); // bottom right

            return intersection.segmentsRectangle(this.segments, tl, tr, bl, br);

        },
        render: function (context, transform) {

            // possivel personalização
            if (this.style) {
                context.save();

                if (this.style.lineDash) {
                    context.setLineDash([5, 2]);
                }
                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
            }

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


            // possivel personalização
            if (this.style) {
                context.restore();
            }


        },
        toObject: function () {

            // converto para object os campos utilizando parseFloat

            //            return {
            //                uuid: this.uuid,
            //                type: this.type,
            //                name: this.name,
            //                status: this.status,
            //                x: types.math.parseFloat(this.point.x, 5),
            //                y: types.math.parseFloat(this.point.y, 5),
            //                radius: types.math.parseFloat(this.radius, 5),
            //                startAngle: types.math.parseFloat(this.startAngle, 5),
            //                endAngle: types.math.parseFloat(this.endAngle, 5),
            //                clockWise: this.clockWise
            //            };

            return true;
        }
    };



    exports.Base = Base;

});