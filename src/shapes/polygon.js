define("plane/shapes/polygon", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');


    function Polygon(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.segments = [];

        this.type = 'polygon';
        this.point = attrs.point;
        this.points = attrs.points;
        this.sides = attrs.sides;
        this.radius = attrs.radius;

        this.initialize();
    };

    Polygon.prototype = {
        initialize: function () {

            for (var i = 0; i < this.sides; i++) {
                
                var pointX = (this.radius * Math.cos(((Math.PI * 2) / this.sides) * i) + this.point.x),
                    pointY = (this.radius * Math.sin(((Math.PI * 2) / this.sides) * i) + this.point.y);

                this.segments.push({
                    x: pointX,
                    y: pointY
                });
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
                sides: this.sides
            };

        },
        render: function (context, transform) {

            //            context.beginPath();
            //
            //            var scale = Math.sqrt(transform.a * transform.d);
            //            var move = {
            //                x: transform.tx,
            //                y: transform.ty
            //            };
            //
            //
            //            context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);
            //
            //            this.points.forEach(function (point) {
            //                context.lineTo((point.x * scale) + move.x, (point.y * scale) + move.y);
            //            });
            //            context.closePath();
            //
            //            context.stroke();


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


            // ATENÇÃO PARA CALCULO DOS SEGMENTOS
            context.moveTo((this.segments[0].x * scale) + move.x, (this.segments[0].y * scale) + move.y);

            this.segments.forEach(function (point) {
                context.lineTo((point.x * scale) + move.x, (point.y * scale) + move.y);
            });
            context.closePath();
            // ATENÇÃO PARA CALCULO DOS SEGMENTOS


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