define("plane/object/rectangle", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Rectangle = utility.object.inherits(function Rectangle(attrs) {

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
        this.status = null;
        this.style = null;

        this.from = null;
        this.to = null;

        this.initialize(attrs);

    }, shape.Base);

    Rectangle.prototype.calculeSegments = function () {

        //  left + bottom 
        this.segments.push({
            x: this.from.x,
            y: this.from.y
        });
        // left + top
        this.segments.push({
            x: this.from.x,
            y: this.to.y
        });
        // right + top
        this.segments.push({
            x: this.to.x,
            y: this.to.y
        });
        // right + bottom 
        this.segments.push({
            x: this.to.x,
            y: this.from.y
        });
        // base
        this.segments.push({
            x: this.from.x,
            y: this.from.y
        });

        return true;

    }

    Rectangle.prototype.fromSnap = function (pointCheck, distance) {

        var status = false;

        // pelas pontas
        for (var i = 0; i < this.segments.length; i++) {

            var calculatePoint = point.create(this.segments[i]);

            if (calculatePoint.distanceTo(pointCheck) <= distance) {
                return {
                    status: true,
                    point: calculatePoint
                };
            }
        }

        // pelos meios 
        var p1 = point.create(this.segments[0]),
            p2 = point.create(this.segments[1]);

        if (pointCheck.distanceTo(p1.midTo(p2)) <= distance) {
            return {
                status: true,
                point: p1.midTo(p2)
            };
        }

        var p3 = point.create(this.segments[1]),
            p4 = point.create(this.segments[2]);

        if (pointCheck.distanceTo(p3.midTo(p4)) <= distance) {
            return {
                status: true,
                point: p3.midTo(p4)
            };
        }

        var p5 = point.create(this.segments[2]),
            p6 = point.create(this.segments[3]);

        if (pointCheck.distanceTo(p5.midTo(p6)) <= distance) {
            return {
                status: true,
                point: p5.midTo(p6)
            };
        }

        var p7 = point.create(this.segments[3]),
            p8 = point.create(this.segments[4]);

        if (pointCheck.distanceTo(p7.midTo(p8)) <= distance) {
            return {
                status: true,
                point: p7.midTo(p8)
            };
        }


        return {
            status: status,
            point: null
        };

    }


    Rectangle.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            from: this.from.toObject(),
            to: this.to.toObject()
        };
    }




    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Arc - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.from = point.create(attrs.from);
        attrs.to = point.create(attrs.to);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Rectangle(attrs);
    }
    ;

    exports.create = create;

});