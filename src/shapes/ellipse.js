define("plane/shapes/ellipse", ['require', 'exports'], function (require, exports) {

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

        this.type = 'ellipse';
        this.point = attrs.point;
        this.radiusY = attrs.radiusY;
        this.radiusX = attrs.radiusX;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.angle = attrs.angle;
    };

    Ellipse.prototype = {
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




            var p2 = {
                x: this.point.x,
                y: this.point.y
            };

            var double2 = this.radiusX;
            var double3 = this.startAngle;
            var double4 = this.endAngle || (2.0 * Math.PI);

            while (double4 < double3) {
                double4 += 2.0 * Math.PI;
            }

            var num16 = {
                x: 0 - p2.x,
                y: 0 - p2.y
            };

            num16 = Math.sqrt(num16.x * num16.x + num16.y * num16.y);

            var num17 = num16 * double2;
            var th = Math.atan2(p2.y, p2.x);
            var num18 = Math.PI / 60.0;
            var num19 = double3;


            var polyline2 = [];


            var num = Math.cos(th);
            var num12 = Math.sin(th);


            while (true) {
                if (num19 > double4) {
                    num18 -= num19 - double4;
                    num19 = double4;
                }
                var p3 = {
                    x: num16 * Math.cos(num19),
                    y: num17 * Math.sin(num19)
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
                if (num19 != double4)
                    num19 += num18;
                else
                    break;
            }

            var points = polyline2.map(function (item) {
                return [item.x, item.y];
            });

            for (var i = 0; i < points.length; i += 2) {

                var x = points[i] * scale + move.x;
                var y = points[i + 1] * scale + move.y;

                context.lineTo(points[i] * scale + move.x, points[i + 1] * scale + move.y);
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

        return new Ellipse(attrs);
    };

    exports.create = create;

});