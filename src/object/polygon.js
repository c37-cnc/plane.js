(function (plane) {
    "use strict";

    var Polygon = plane.utility.object.inherits(function Polygon(attrs) {

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
        this.sides = null;
        this.radius = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Polygon.prototype._calculeSegments = function () {

        for (var i = 0; i <= this.sides; i++) {

            var pointX = (this.radius * Math.cos(((Math.PI * 2) / this.sides) * i) + this.center.x),
                pointY = (this.radius * Math.sin(((Math.PI * 2) / this.sides) * i) + this.center.y);

            this._segments.push({
                x: pointX,
                y: pointY
            });
        }

        return true;
    };

    Polygon.prototype.fromSnap = function (point, distance) {


    };

    Polygon.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            center: this.center.toObject(),
            sides: this.sides,
            radius: this.radius
        };
    };


    plane.object.polygon = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('polygon - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.center = plane.point.create(attrs.center);

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Polygon(attrs);
        }
    };

})(plane);