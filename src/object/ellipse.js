(function (plane) {
    "use strict";

    var Ellipse = plane.utility.object.inherits(function Ellipse(attrs) {

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
        this.bounds = null;

        this.status = null;
        this.style = null;

        this.center = null;
        this.radiusY = null;
        this.radiusX = null;

        this.angle = null;
        this.startAngle = null;
        this.endAngle = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Ellipse.prototype._calculeSegments = function () {

        var angle = (this.startAngle !== undefined && this.endAngle !== undefined) ? this.angle : plane.utility.math.radians(this.angle) || 0;
        var startAngle = this.startAngle || 0;
        var endAngle = this.endAngle || (2.0 * Math.PI);

        while (endAngle < startAngle) {
            endAngle += 2.0 * Math.PI;
        }

        var radiusX = this.radiusX;
        var radiusY = this.radiusY;

        var num18 = Math.PI / 40.0;


        var num = Math.cos(angle);
        var num12 = Math.sin(angle);


        while (true) {
            if (startAngle > endAngle) {
                num18 -= startAngle - endAngle;
                startAngle = endAngle;
            }
            var p3 = {
                x: radiusX * Math.cos(startAngle),
                y: radiusY * Math.sin(startAngle)
            };
            // p3 *= matrix4x4F;
            // aplicando a matrix para a rotação
            p3 = {
                x: p3.x * num + p3.y * -num12,
                y: p3.x * num12 + p3.y * num
            }
            // o ponto de centro + o item da ellipse
            p3 = {
                x: this.center.x + p3.x,
                y: this.center.y + p3.y
            };

            // armazenando no array
            this.segments.push(p3);

            // continuando até a volta completa
            if (startAngle !== endAngle)
                startAngle += num18;
            else
                break;
        }

        return true;
    };

    Ellipse.prototype.fromSnap = function (point, distance) {


    };

    Ellipse.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            center: this.center.toObject(),
            radiusY: this.radiusY,
            radiusX: this.radiusX,
            angle: this.angle,
            startAngle: this.startAngle,
            endAngle: this.endAngle
        };
    };

    Ellipse.prototype.toPoints = function () {

        // https://www.mathsisfun.com/algebra/trig-four-quadrants.html
        // http://www.rapidtables.com/convert/number/degrees-to-radians.htm
        var points = [];

        // para 0º
        var x = this.center.x + (this.radiusX * -Math.sin(0)),
            y = this.center.y + (this.radiusX * Math.cos(0));
        points.push(plane.point.create(x, y));

        // para 270º
        var x = this.center.x + (this.radiusY * -Math.sin(4.7123889804)),
            y = this.center.y + (this.radiusY * Math.cos(4.7123889804));
        points.push(plane.point.create(x, y));

        // para 180º
        var x = this.center.x + (this.radiusX * -Math.sin(3.1415926536)),
            y = this.center.y + (this.radiusX * Math.cos(3.1415926536));
        points.push(plane.point.create(x, y));

        // para 90º
        var x = this.center.x + (this.radiusY * -Math.sin(1.5707963268)),
            y = this.center.y + (this.radiusY * Math.cos(1.5707963268));
        points.push(plane.point.create(x, y));

        return points;

    };


    plane.object.ellipse = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('ellipse - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.center = plane.point.create(attrs.center);

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Ellipse(attrs);
        }
    };

})(c37.library.plane);