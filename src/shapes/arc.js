define("plane/shapes/arc", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');

    var object = require('plane/structure/object');

    var types = require('plane/utility/types');



    var Arc = types.object.inherits(function Arc(attrs) {

        // atributos primitivos

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

        this.center = null;
        this.radius = null;
        this.startAngle = null;
        this.endAngle = null;

        this.initialize(attrs);

    }, object.Shape);

    Arc.prototype.calculeSegments = function () {

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

            var xval = this.center.x + this.radius * Math.cos(num4);
            var yval = this.center.y + this.radius * Math.sin(num4);

            this.segments.push({
                x: xval,
                y: yval
            });
            ++index;
            num4 += num1;
        }

        var xval1 = this.center.x + this.radius * Math.cos(num2 + num3);
        var yval1 = this.center.y + this.radius * Math.sin(num2 + num3);

        this.segments[this.segments.length - 1].x = xval1;
        this.segments[this.segments.length - 1].y = yval1;


    }


    //   var Arc = types.object.inherits(function Arc(attrs) {
    //        /**
    //         * A Universally unique identifier for
    //         * a single instance of Object
    //         *
    //         * @property uuid
    //         * @type String
    //         * @default 'uuid'
    //         */
    //        this.uuid = attrs.uuid;
    //        this.name = attrs.name;
    //        this.transform = attrs.transform;
    //        this.status = attrs.status;
    //
    //        this.type = 'arc';
    //        this.point = attrs.point;
    //        this.radius = attrs.radius;
    //        this.startAngle = attrs.startAngle;
    //        this.endAngle = attrs.endAngle;
    //        this.clockWise = attrs.clockWise;
    //    }, Shape);


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
    //    function Arc(attrs) {
    //        /**
    //         * A Universally unique identifier for
    //         * a single instance of Object
    //         *
    //         * @property uuid
    //         * @type String
    //         * @default 'uuid'
    //         */
    //        this.uuid = attrs.uuid;
    //        this.name = attrs.name;
    //        this.transform = attrs.transform;
    //        this.status = attrs.status;
    //
    //        this.segments = [];
    //
    //        this.type = 'arc';
    //        this.point = attrs.point;
    //        this.radius = attrs.radius;
    //        this.startAngle = attrs.startAngle;
    //        this.endAngle = attrs.endAngle;
    //        this.clockWise = attrs.clockWise;
    //
    //        this.initialize();
    //    };


    //    Arc.prototype = {
    //        initialize: function () {
    //
    //            var end = this.endAngle - this.startAngle;
    //            if (end < 0.0) {
    //                end += 360.0;
    //            }
    //
    //            // .7 resolution
    //            var num1 = .7 / 180.0 * Math.PI;
    //            var num2 = this.startAngle / 180.0 * Math.PI;
    //            var num3 = end / 180.0 * Math.PI;
    //
    //            if (num3 < 0.0)
    //                num1 = -num1;
    //            var size = Math.abs(num3 / num1) + 2;
    //
    //            var index = 0;
    //            var num4 = num2;
    //            while (index < size - 1) {
    //
    //                var xval = this.point.x + this.radius * Math.cos(num4);
    //                var yval = this.point.y + this.radius * Math.sin(num4);
    //
    //                this.segments.push({
    //                    x: xval,
    //                    y: yval
    //                });
    //                ++index;
    //                num4 += num1;
    //            }
    //
    //            var xval1 = this.point.x + this.radius * Math.cos(num2 + num3);
    //            var yval1 = this.point.y + this.radius * Math.sin(num2 + num3);
    //
    //            this.segments[this.segments.length - 1].x = xval1;
    //            this.segments[this.segments.length - 1].y = yval1;
    //
    //        },
    //        toObject: function () {
    //
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
    //
    //        },
    //        render: function (context, transform) {
    //
    //            // possivel personalização
    //            if (this.style) {
    //                context.save();
    //
    //                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
    //                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
    //            }
    //
    //            context.beginPath();
    //
    //            var scale = Math.sqrt(transform.a * transform.d);
    //            var move = {
    //                x: transform.tx,
    //                y: transform.ty
    //            };
    //
    //
    //            for (var i = 0; i < this.segments.length; i += 2) {
    //                var x = this.segments[i].x * scale + move.x;
    //                var y = this.segments[i].y * scale + move.y;
    //
    //                context.lineTo(x, y);
    //            }
    //
    //
    //            context.stroke();
    //
    //
    //            // possivel personalização
    //            if (this.style) {
    //                context.restore();
    //            }
    //
    //
    //        },
    //        contains: function (position, transform) {
    //
    //            var scale = Math.sqrt(transform.a * transform.d);
    //            var move = point.create(transform.tx, transform.ty);
    //
    //
    //            var segmentA = null,
    //                segmentB = null;
    //
    //            for (var i = 0; i < this.segments.length; i++) {
    //
    //                if (i + 1 == this.segments.length) {
    //                    segmentA = this.segments[i];
    //                    segmentB = this.segments[0];
    //                } else {
    //                    segmentA = this.segments[i];
    //                    segmentB = this.segments[i + 1];
    //                }
    //
    //                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
    //                    return true;
    //            }
    //
    //            return false;
    //
    //        },
    //        intersectsWithRect: function (rect) {
    //
    //            //            debugger;
    //
    //            var tl = point.create(rect.x, rect.y + rect.height),
    //                tr = point.create(rect.x + rect.width, rect.y + rect.height),
    //                bl = point.create(rect.x, rect.y),
    //                br = point.create(rect.x + rect.width, rect.y);
    //
    //            //            debugger;
    //
    //            if (intersectPolygonRectangle(this.segments, tl, tr, bl, br)) {
    //                return true;
    //            }
    //
    //
    //
    //            return false;
    //
    //        }
    //
    //    };


    function isInside(x, y, z1, z2, z3, z4) {
        var x1 = z1.minimum(z3);
        var x2 = z1.maximum(z3);
        var y1 = z2.minimum(z4);
        var y2 = z2.maximum(z4);

        return ((x1.x <= x) && (x <= x2.x) && (y1.y <= y) && (y <= y2.y));
    };

    function intersectPolygonRectangle(points, tl, tr, bl, br) {

        var inter1 = intersectLinePolygon(tl, tr, points),
            inter2 = intersectLinePolygon(tr, br, points),
            inter3 = intersectLinePolygon(br, bl, points),
            inter4 = intersectLinePolygon(bl, tl, points);

        if (inter1 || inter2 || inter3 || inter4) {
            return true;
        }

        for (var i = 0; i < points.length; i++) {
            if (isInside(points[i].x, points[i].y, bl, tl, tr, br)) {
                return true;
            }
        }

        return false;
    };

    function intersectLinePolygon(a1, a2, points) {
        var result = [],
            length = points.length;

        for (var i = 0; i < length; i++) {
            var b1 = points[i],
                b2 = points[(i + 1) % length];

            if (intersection.lineLine(a1, a2, b1, b2)) {
                return true;
            }
        }
        return false;
    };




    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        

        // 2 - validações dos atributos


        // 3 - conversões dos atributos
        attrs.center = point.create(attrs.center);

        // 4 - crio um novo arco
        return new Arc(attrs);
    };

    exports.create = create;

});