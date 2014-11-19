define("plane/shapes/polyline", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');


    function Polyline(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.segments = [];


        this.type = 'polyline';
        this.points = attrs.points;

        this.initialize();
    };

    Polyline.prototype = {
        initialize: function () {
        
            this.segments = this.   points;
        
        
        },
        toObject: function () {

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



//            context.moveTo(this.segments[0].x * scale + move.x, this.segments[0].y * scale + move.y);
//            
//            for (var i = 0; i < this.segments.length; i += 2) {
//                var x = this.segments[i].x * scale + move.x;
//                var y = this.segments[i].y * scale + move.y;
//
//                context.lineTo(x, y);
//            }


            context.moveTo((this.segments[0].x * scale) + move.x, (this.segments[0].y * scale) + move.y);

            this.segments.forEach(function (point) {
                context.lineTo((point.x * scale) + move.x, (point.y * scale) + move.y);
            });
            
            
            
            
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

        return new Polyline(attrs);
    };

    exports.create = create;

});