define("plane/shapes/ellipse", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point'),
        object = require('plane/structure/object');

    var types = require('plane/utility/types');


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
    var Ellipse = types.object.inherits(function Ellipse(attrs) {

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
        this.radiusY = null;
        this.radiusX = null;

        this.angle = null;
        this.startAngle = null;
        this.endAngle = null;

        this.initialize(attrs);

    }, object.Shape);

    Ellipse.prototype.calculeSegments = function () {

        var angle = (this.startAngle != undefined && this.endAngle != undefined) ? this.angle : types.math.radians(this.angle) || 0;
        var startAngle = this.startAngle || 0;
        var endAngle = this.endAngle || (2.0 * Math.PI);

        while (endAngle < startAngle) {
            endAngle += 2.0 * Math.PI;
        }

        var radiusX = this.radiusX;
        var radiusY = this.radiusY;

        var num18 = Math.PI / 60.0;


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
            if (startAngle != endAngle)
                startAngle += num18;
            else
                break;
        }

        return true;

    }

    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Ellipse - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.center = point.create(attrs.center);

        // 4 - criando um novo shape do tipo arco
        return new Ellipse(attrs);
    };

    exports.create = create;

});