(function (plane) {
    "use strict";

    var Circle = plane.utility.object.inherits(function Circle(attrs) {

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

        this._segments = [];
        this._bounds = {
            from: null,
            to: null,
            center: null,
            radius: null
        };

        this.status = null;
        this.style = null;

        this.center = null;
        this.radius = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Circle.prototype._calculeSegments = function () {

        // em numero de partes - 58 
        //var num1 = Math.PI / 58;
        var num1 = Math.PI / 33;
        var size = Math.abs(2.0 * Math.PI / num1) + 2;
        var index = 0;
        var num2 = 0.0;

        while (index < size - 1) {
            this._segments.push({
                x: this.center.x + this.radius * Math.cos(num2),
                y: this.center.y + this.radius * Math.sin(num2)
            });
            ++index;
            num2 += num1;
        }
        ;

        return true;
    };

    Circle.prototype.fromSnap = function (point, distance) {

        // center
        if (point.distanceTo(this.center) <= distance) {
            return {
                status: true,
                point: this.center
            };
        }

//        // radius
//        var x = this.center.x + (this.radius * Math.cos(this.center.angleTo(point))),
//            y = this.center.y + (this.radius * Math.sin(this.center.angleTo(point)));
//
//        var pointRadius = plane.point.create(x, y);
//
//        if (point.distanceTo(pointRadius) <= distance) {
//            return {
//                status: true,
//                point: pointRadius
//            };
//        }

        return {
            status: false,
            point: null
        };

    };

    Circle.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            center: this.center.toObject(),
            radius: this.radius
        };
    };


    plane.object.circle = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('circle - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.center = plane.point.create(attrs.center);

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Circle(attrs);
        }
    };

})(c37.library.plane);