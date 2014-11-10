define("plane/shapes/polygon", ['require', 'exports'], function (require, exports) {

    var point = require('plane/structure/point');
    
    
    function Polygon(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'polygon';
        this.point = attrs.point;
        this.points = attrs.points;
        this.sides = attrs.sides;
    };

    Polygon.prototype = {
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

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);

            this.points.forEach(function (point) {
                context.lineTo((point.x * scale) + move.x, (point.y * scale) + move.y);
            });
            context.closePath();

            context.stroke();

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            //            return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

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