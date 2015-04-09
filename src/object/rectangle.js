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

})(plane);