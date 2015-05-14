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

        this.segments = [];
        this.bounds = null;

        this.status = null;
        this.style = null;

        this.from = null;
        this.to = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Line.prototype._calculeSegments = function () {

        this.segments.push({
            x: this.from.x,
            y: this.from.y
        });
        this.segments.push({
            x: this.to.x,
            y: this.to.y
        });

        return true;

    };

    Line.prototype.fromSnap = function (point, distance) {

        // inicio 
        if (point.distanceTo(this.from) <= distance) {
            return {
                status: true,
                point: this.from
            };
        }

        // meio
        if (point.distanceTo(this.from.midTo(this.to)) <= distance) {
            return {
                status: true,
                point: this.from.midTo(this.to)
            };
        }

        // fim 
        if (point.distanceTo(this.to) <= distance) {
            return {
                status: true,
                point: this.to
            };
        }

        // caso nenhum snap seja encontrado
        return {
            status: false,
            point: null
        };

    };

    Line.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            from: this.from.toObject(),
            to: this.to.toObject()
        };
    };

    Line.prototype.toPoint = function () {

        var points = [];

        points.push(this.from);
        points.push(this.to);

        return points;

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