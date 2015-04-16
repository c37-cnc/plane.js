(function (plane) {
    "use strict";

    var Rectangle = plane.utility.object.inherits(function Rectangle(attrs) {

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

    Rectangle.prototype._calculeSegments = function () {

        //  left + bottom 
        this._segments.push({
            x: this.from.x,
            y: this.from.y
        });
        // left + top
        this._segments.push({
            x: this.from.x,
            y: this.to.y
        });
        // right + top
        this._segments.push({
            x: this.to.x,
            y: this.to.y
        });
        // right + bottom 
        this._segments.push({
            x: this.to.x,
            y: this.from.y
        });
        // base
        this._segments.push({
            x: this.from.x,
            y: this.from.y
        });

        return true;
    };

    Rectangle.prototype._calculeBounds = function () {

        var from = plane.point.create(this._segments[0]),
            to = plane.point.create(this._segments[0]);

        this._segments.forEach(function (segment) {

            var point = plane.point.create(segment);

            from = point.minimum(from);
            to = point.maximum(to);

        });



        // um remendo para o calculo
        var angleInRadian = 0.7853981634,
            lineSizeValue = 10 / plane.view.zoom;

        // com uma tolerancia para os limites não ficar sem cima dos shapes
        var minPoint = plane.point.create(from.x + (-lineSizeValue * Math.cos(angleInRadian)), from.y + (-lineSizeValue * Math.sin(angleInRadian))),
            maxPoint = plane.point.create(to.x + (+lineSizeValue * Math.cos(angleInRadian)), to.y + (+lineSizeValue * Math.sin(angleInRadian)));
        
        this._bounds.from = minPoint;
        this._bounds.to = maxPoint;


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

    Rectangle.prototype.fromSnap = function (point, distance) {


    };

    Rectangle.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            from: this.from.toObject(),
            to: this.to.toObject()
        };
    };


    plane.object.rectangle = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('rectangle - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.from = plane.point.create(attrs.from);
            attrs.to = plane.point.create(attrs.to);

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Rectangle(attrs);
        }
    };

})(c37.library.plane);