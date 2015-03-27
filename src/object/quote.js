define("plane/object/quote", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        view = require('plane/core/view'),
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
    var Quote = utility.object.inherits(function Quote(attrs) {

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
        this.style = 'quote';

        this.from = null;
        this.to = null;
        this.height = null;

        this.initialize(attrs);

    }, shape.Base);

    Quote.prototype.calculeSegments = function () {

        return true;

    };

    Quote.prototype.fromSnap = function (pointCheck, distance) {

        var status = false;


        if (pointCheck.distanceTo(this.from) <= distance) {
            return {
                status: true,
                point: this.from
            };
        }

        // um remendo para o calculo
        var angleInRadian = this.from.angleTo(this.to),
            lineSizeValue = this.measure.width - (.5 / view.zoom);

        var pointTo = point.create(this.from.x + (lineSizeValue * Math.cos(angleInRadian)), this.from.y + (lineSizeValue * Math.sin(angleInRadian)));

        if (pointCheck.distanceTo(pointTo) <= distance) {
            return {
                status: true,
                point: pointTo
            };
        }

        return {
            status: status,
            point: null
        };

    };

    Quote.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            from: this.from.toObject(),
            to: this.to.toObject(),
            height: this.height
        };
    };


    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
    Quote.prototype.render = function (context, transform) {

        var length = Math.sqrt((this.from.x - this.to.x) * (this.from.x - this.to.x) + (this.from.y - this.to.y) * (this.from.y - this.to.y));

        var p1 = this.from,
            p2 = {
                x: this.from.x + this.height * (this.from.y - this.to.y) / length,
                y: this.from.y + this.height * (this.to.x - this.from.x) / length
            };

        var p3 = {
            x: this.to.x + this.height * (this.from.y - this.to.y) / length,
            y: this.to.y + this.height * (this.to.x - this.from.x) / length
        },
        p4 = this.to;


        // de acordo com a matrix - a escala que devo aplicar nos segmentos
        var scale = Math.sqrt(transform.a * transform.d);
        // de acordo com a matrix - o movimento que devo aplicar nos segmentos
        var move = {
            x: transform.tx,
            y: transform.ty
        };
        
        
        // salvo as configurações de estilo atuais do contexto
        context.save();
        
        context.setLineDash([5, 2]);
        //context.strokeStyle = '#007efc';
        context.strokeStyle = '#0f8fff';
        
        context.beginPath();
        
        
        context.moveTo(this.from.x * scale + move.x, this.from.y * scale + move.y);

        context.lineTo(p1.x * scale + move.x, p1.y * scale + move.y);
        context.lineTo(p2.x * scale + move.x, p2.y * scale + move.y);

        context.lineTo(p3.x * scale + move.x, p3.y * scale + move.y);
        context.lineTo(p4.x * scale + move.x, p4.y * scale + move.y);
        
        context.stroke();
        

        var hAlpha = this.height + 3;

        var pAlpha1 = {
            x: this.from.x + hAlpha * (this.from.y - this.to.y) / length,
            y: this.from.y + hAlpha * (this.to.x - this.from.x) / length
        };
        var pAlpha2 = {
            x: this.to.x + hAlpha * (this.from.y - this.to.y) / length,
            y: this.to.y + hAlpha * (this.to.x - this.from.x) / length
        };
        
        // o tamanho do texto 
        var widthTextAlpha = context.measureText(this.value).width;
        
        // o angulo para a inclinação dos pontos alpha
        var angleInRadian = this.from.angleTo(this.to);
        
        // o ponto final + medida total do texto para um novo pointo final
        var pAlpha3 = point.create(pAlpha2.x + (-widthTextAlpha * Math.cos(angleInRadian)), pAlpha2.y + (-widthTextAlpha * Math.sin(angleInRadian)));
        
        // o meio entre o inicio estático e o novo pointo final
        var midAlpha = point.create(pAlpha1).midTo(point.create(pAlpha3));
        
        // a medida arredondada entre o ponto inicial e o pointo final
        var textAlpha = point.create(pAlpha1).distanceTo(point.create(pAlpha2));
        
        
        

        
        // para a fonte + seu tamanho
        context.font = utility.string.format('{0}px arial', [parseInt(11 * scale)]);
        //context.fillStyle = '#007efc';
        context.fillStyle = '#0f8fff';

        // para o movimento até o ponto inicial
        context.translate(midAlpha.x * scale + move.x, midAlpha.y * scale + move.y);


        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations#Rotating
        // o angulo em radianos do ponto inicial ao ponto final
        context.rotate(this.from.angleTo(this.to));

        // o flip para o texto estar correto
        context.scale(1, -1);


        if (!this.measure) {

            this.measure = {
                height: 0,
                width: context.measureText(this.value).width
            };

        }

        // escrevo o texto no context
        context.fillText(Math.round(textAlpha) + 'mm', 0, 0);

        // restauro as configurações de estilo anteriores do contexto
        context.restore();

    };

    Quote.prototype.intersect = function (rectangle) {

        //console.log('sasasas');

        return true;
    };


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs === 'function') {
            throw new Error('Quote - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.from = point.create(attrs.from);
        attrs.to = point.create(attrs.to);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Quote(attrs);
    }
    ;

    exports.create = create;

});