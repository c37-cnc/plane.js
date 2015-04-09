(function (plane) {
    "use strict";

    var Quote = plane.utility.object.inherits(function Quote(attrs) {
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
        this.height = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Quote.prototype._calculeSegments = function () {

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

    Quote.prototype.fromSnap = function (point, distance) {

        //return true;

    };

    Quote.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            from: this.from.toObject(),
            to: this.to.toObject(),
            size: this.size,
            value: this.value
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

        // o angulo para a inclinação dos pontos alpha
        var angleInRadian0 = this.from.angleTo(this.to);

        p2 = plane.point.create(p2.x + (5 * Math.cos(angleInRadian0)), p2.y + (5 * Math.sin(angleInRadian0)));


        var p3 = {
            x: this.to.x + this.height * (this.from.y - this.to.y) / length,
            y: this.to.y + this.height * (this.to.x - this.from.x) / length
        },
        p4 = this.to;

        p3 = plane.point.create(p3.x + (-5 * Math.cos(angleInRadian0)), p3.y + (-5 * Math.sin(angleInRadian0)));

        // de acordo com a matrix - a escala que devo aplicar nos segmentos
        //var scale = Math.sqrt(transform.a * transform.d);
        var scale = 1;
        // de acordo com a matrix - o movimento que devo aplicar nos segmentos
        var move = {
            x: 0,
            y: 0
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







        // para a fonte + seu tamanho
        context.font = plane.utility.string.format('{0}px arial', [parseInt(10 * scale)]);
        //context.fillStyle = '#007efc';
        context.fillStyle = '#0f8fff';



        var hAlpha = this.height + 3;

        var pAlpha1 = {
            x: this.from.x + hAlpha * (this.from.y - this.to.y) / length,
            y: this.from.y + hAlpha * (this.to.x - this.from.x) / length
        };
        var pAlpha2 = {
            x: this.to.x + hAlpha * (this.from.y - this.to.y) / length,
            y: this.to.y + hAlpha * (this.to.x - this.from.x) / length
        };


        // o primeiro tamanho do texto
        if (!this.measure) {

            this.measure = {
                height: 0,
                width: context.measureText(this.value).width
            };

        }

        // o tamanho do texto 
        var widthTextAlpha = this.measure.width;
        //var widthTextAlpha = context.measureText(this.value).width;

        // o angulo para a inclinação dos pontos alpha
        var angleInRadian = this.from.angleTo(this.to);

        // o ponto final + medida total do texto para um novo pointo final
        var pAlpha3 = plane.point.create(pAlpha2.x + (-widthTextAlpha * Math.cos(angleInRadian)), pAlpha2.y + (-widthTextAlpha * Math.sin(angleInRadian)));

        // o meio entre o inicio estático e o novo pointo final
        var midAlpha = plane.point.create(pAlpha1).midTo(plane.point.create(pAlpha2));

        // a medida arredondada entre o ponto inicial e o pointo final
        var textAlpha = plane.point.create(pAlpha1).distanceTo(plane.point.create(pAlpha2));





        // para o movimento até o ponto inicial
        context.translate(midAlpha.x * scale + move.x, midAlpha.y * scale + move.y);


        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations#Rotating
        // o angulo em radianos do ponto inicial ao ponto final
        context.rotate(this.from.angleTo(this.to));

        // o flip para o texto estar correto
        context.scale(1, -1);


        // escrevo o texto no context
        context.fillText(Math.round(textAlpha) + 'mm', 0, 0);

        // restauro as configurações de estilo anteriores do contexto
        context.restore();

    };


    plane.object.quote = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('quote - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.from = plane.point.create(attrs.from);
            attrs.to = plane.point.create(attrs.to);

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Quote(attrs);
        }
    };

})(plane);