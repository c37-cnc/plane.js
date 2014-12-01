define("plane/shapes/circle", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point'),
        object = require('plane/shapes/object');

    var types = require('plane/utility/types');

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
    var Circle = types.object.inherits(function Circle(attrs) {

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

        this.center = null;
        this.radius = null;

        this.initialize(attrs);

    }, object.Base);

    Circle.prototype.calculeSegments = function () {

        // em numero de partes - 58 
        var num1 = Math.PI / 58;
        var size = Math.abs(2.0 * Math.PI / num1) + 2;
        var index = 0;
        var num2 = 0.0;

        while (index < size - 1) {
            this.segments.push({
                x: this.center.x + this.radius * Math.cos(num2),
                y: this.center.y + this.radius * Math.sin(num2)
            });
            ++index;
            num2 += num1;
        }

        return true;

    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Circle - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.center = point.create(attrs.center);

        // 4 - criando um novo shape do tipo arco
        return new Circle(attrs);
    };

    exports.create = create;

});