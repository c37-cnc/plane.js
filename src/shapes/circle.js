define("plane/shapes/circle", ['require', 'exports'], function (require, exports) {

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Circle
     * @constructor
     */
    function Circle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'circle';
        this.point = attrs.point;
        this.radius = attrs.radius;
    };

    Circle.prototype = {
        toObject: function () {
            return {
                uuid: this.uuid,
                type: this.type,
                name: this.name,
                status: this.status,
                x: types.math.parseFloat(this.point.x, 5),
                y: types.math.parseFloat(this.point.y, 5),
                radius: types.math.parseFloat(this.radius, 5)
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

            // em numero de partes - 58 
            var num1 = Math.PI / 58;
            var size = Math.abs(2.0 * Math.PI / num1) + 2;
            var index = 0;
            var num2 = 0.0;

            while (index < size - 1) {
                points.push({
                    x: this.point.x + this.radius * Math.cos(num2),
                    y: this.point.y + this.radius * Math.sin(num2)
                });
                ++index;
                num2 += num1;
            }

            for (var i = 0; i < points.length; i += 2) {
                context.lineTo(points[i].x * scale + move.x, points[i].y * scale + move.y);
            }
            context.stroke();


        }
    }


    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Circle(attrs);
    };

    exports.create = create;

});