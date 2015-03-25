define("plane/object/text", ['require', 'exports'], function (require, exports) {

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
    var Text = utility.object.inherits(function Text(attrs) {

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

    Text.prototype.calculeSegments = function () {


        console.log('segments de text!');


        return true;

    };

    Text.prototype.fromSnap = function (pointCheck, distance) {

        var status = false;

        if (pointCheck.distanceTo(this.from) <= distance) {
            return {
                status: true,
                point: this.from
            };
        }

        if (pointCheck.distanceTo(this.to) <= distance) {
            return {
                status: true,
                point: this.to
            };
        }

        return {
            status: status,
            point: null
        };

    };

    Text.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            from: this.from.toObject(),
            to: this.from.toObject(),
            size: this.size,
            value: this.value
        };
    };


    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
    Text.prototype.render = function (context, transform) {

        // salvo as configurações de estilo atuais do contexto
        context.save();

        // de acordo com a matrix - a escala que devo aplicar nos segmentos
        var scale = Math.sqrt(transform.a * transform.d);
        // de acordo com a matrix - o movimento que devo aplicar nos segmentos
        var move = {
            x: transform.tx,
            y: transform.ty
        };


        // para a fonte + seu tamanho
        context.font = utility.string.format('{0}px arial', [parseInt(this.size * scale)]);

        // para o movimento até o ponto inicial
        context.translate(this.from.x * scale + move.x, this.from.y * scale + move.y);


        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations#Rotating
        // o angulo em radianos do ponto inicial ao ponto final
        context.rotate(this.from.angleTo(this.to));

        // o flip para o texto estar correto
        context.scale(1, -1);








        //context.rotate(Math.PI);
        context.fillText(this.value, 0, 0);
        //context.fillText(this.value, this.from.x, this.from.y);

        console.log(context.measureText(this.value));

        // restauro as configurações de estilo anteriores do contexto
        context.restore();

    }




    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs === 'function') {
            throw new Error('Text - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.from = point.create(attrs.from);
        attrs.to = point.create(attrs.to);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Text(attrs);
    }
    ;

    exports.create = create;

});