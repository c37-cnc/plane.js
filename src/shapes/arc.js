define("plane/shapes/arc", ['require', 'exports'], function (require, exports) {

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

        this.type = 'arc';
        this.point = attrs.point;
        this.radius = attrs.radius;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.clockWise = attrs.clockWise;
    };


    Arc.prototype = {
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

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            var points = [];

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

                points.push({
                    x: xval,
                    y: yval
                });
                ++index;
                num4 += num1;
            }

            var xval1 = this.point.x + this.radius * Math.cos(num2 + num3);
            var yval1 = this.point.y + this.radius * Math.sin(num2 + num3);

            points[points.length - 1].x = xval1;
            points[points.length - 1].y = yval1;


            for (var i = 0; i < points.length; i += 2) {
                context.lineTo(points[i].x * scale + move.x, points[i].y * scale + move.y);
            }

            context.stroke();

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