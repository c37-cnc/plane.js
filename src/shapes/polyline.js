define("plane/shapes/polyline", ['require', 'exports'], function (require, exports) {

    function Polyline(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'polyline';
        this.points = attrs.points;
    };

    Polyline.prototype = {
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


            context.stroke();


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