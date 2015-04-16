(function (plane) {
    "use strict";

    var Line = plane.utility.object.inherits(function Line(attrs) {

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

        this.from = null;
        this.to = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Line.prototype._calculeSegments = function () {

        this._segments.push({
            x: this.from.x,
            y: this.from.y
        });
        this._segments.push({
            x: this.to.x,
            y: this.to.y
        });

        return true;

    };

    Line.prototype._calculeBounds = function () {

        var from = plane.point.create(this._segments[0]),
            to = plane.point.create(this._segments[0]);

        this._segments.forEach(function (segment) {

            var point = plane.point.create(segment);

            from = point.minimum(from);
            to = point.maximum(to);

        });

        this._bounds.from = from;
        this._bounds.to = to;

        // correção para rectangle com eixos iguais
        // APARENTEMENTE ERRADO!
//        if ((this._bounds.from.x === this._bounds.to.x) || (this._bounds.from.y === this._bounds.to.y)) {
//            this._bounds.from.x = this._bounds.from.x - (7 / plane.view.zoom);
//            this._bounds.from.y = this._bounds.from.y - (7 / plane.view.zoom);
//            
//            this._bounds.to.x = this._bounds.to.x + (7 / plane.view.zoom);
//            this._bounds.to.y = this._bounds.to.y + (7 / plane.view.zoom);
//        }
//
//


        // https://github.com/craftyjs/Crafty/blob/bcd581948c61966ed589c457feb32358a0afd9c8/src/spatial/collision.js#L154
        var center = {
            x: (from.x + to.x) / 2,
            y: (from.y + to.y) / 2
        },
        radius = Math.sqrt((to.x - from.x) * (to.x - from.x) + (to.y - from.y) * (to.y - from.y)) / 2;

        this._bounds.center = plane.point.create(center);
        this._bounds.radius = radius;


        /**
         * Calculates the MBR when rotated some number of radians about an origin point o.
         * Necessary on a rotation, or a resize
         */
        // https://github.com/craftyjs/Crafty/blob/2f131c55c60e1aecc68923c9576c6dad00539d82/src/spatial/2d.js#L358

        return true;

    };

    Line.prototype.fromSnap = function (point, distance) {


    };

    Line.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            from: this.from.toObject(),
            to: this.to.toObject()
        };
    };


    plane.object.line = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('line - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.from = plane.point.create(attrs.from);
            attrs.to = plane.point.create(attrs.to);


            // 5 - criando um novo shape do tipo arco
            return new Line(attrs);
        }
    };

})(c37.library.plane);