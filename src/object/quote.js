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

        this.segments = [];
        this.bounds = null;

        this.status = null;
        this.style = null;

        this.from = null;
        this.to = null;
        this.height = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Quote.prototype._calculeSegments = function () {

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

    Quote.prototype.fromSnap = function (point, distance) {

        if (point.distanceTo(this.from) <= distance) {
            return {
                status: true,
                point: this.from
            };
        }

        if (point.distanceTo(this.to) <= distance) {
            return {
                status: true,
                point: this.to
            };
        }

        return {
            status: false,
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
    
    Quote.prototype.toPoints = function () {

        var points = [];

        points.push(this.from.clone());
        points.push(this.to.clone());

        return points;

    };
    

    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
    Quote.prototype._render = function (context, zoom, motion) {

        var length = Math.sqrt((this.from.x - this.to.x) * (this.from.x - this.to.x) + (this.from.y - this.to.y) * (this.from.y - this.to.y));

        var p1 = this.from,
            p2 = {
                x: this.from.x + this.height * (this.from.y - this.to.y) / length,
                y: this.from.y + this.height * (this.to.x - this.from.x) / length
            };

        // o angulo para a inclinação dos pontos alpha
        var angleInRadian0 = this.from.angleTo(this.to);

        //p2 = plane.point.create(p2.x + ((2 / plane.view.zoom) * Math.cos(angleInRadian0)), p2.y + ((2 / plane.view.zoom) * Math.sin(angleInRadian0)));
        p2 = plane.point.create(p2.x + (1 * Math.cos(angleInRadian0)), p2.y + (1 * Math.sin(angleInRadian0)));


        var p3 = {
            x: this.to.x + this.height * (this.from.y - this.to.y) / length,
            y: this.to.y + this.height * (this.to.x - this.from.x) / length
        },
        p4 = this.to;

        //p3 = plane.point.create(p3.x + ((-2 / plane.view.zoom) * Math.cos(angleInRadian0)), p3.y + ((-2 / plane.view.zoom) * Math.sin(angleInRadian0)));
        p3 = plane.point.create(p3.x + (-1 * Math.cos(angleInRadian0)), p3.y + (-1 * Math.sin(angleInRadian0)));

        // salvo as configurações de estilo atuais do contexto
        context.save();


        if (this.style) {


            context.fillStyle = this.style.fillColor || this.style.lineColor;
            context.strokeStyle = this.style.fillColor || this.style.lineColor;

            // personalização para linha pontilhada
            if (this.style.lineDash)
                context.setLineDash([5, 2]);

            context.beginPath();

        }

//        if (this.style) {
//            context.fillStyle = this.style.lineColor || this.style.fillColor;
//            context.strokeStyle = this.style.lineColor || this.style.fillColor;
//        } else {
//            context.fillStyle = '#0f8fff';
//            context.strokeStyle = '#0f8fff';
//        }

        context.moveTo(this.from.x * zoom + motion.x, this.from.y * zoom + motion.y);

        context.lineTo(p1.x * zoom + motion.x, p1.y * zoom + motion.y);
        context.lineTo(p2.x * zoom + motion.x, p2.y * zoom + motion.y);

        context.lineTo(p3.x * zoom + motion.x, p3.y * zoom + motion.y);
        context.lineTo(p4.x * zoom + motion.x, p4.y * zoom + motion.y);

        if (this.style) {
            context.stroke();
        }






        var hAlpha = this.height + 1;

        var pAlpha1 = {
            x: this.from.x + hAlpha * (this.from.y - this.to.y) / length,
            y: this.from.y + hAlpha * (this.to.x - this.from.x) / length
        };
        var pAlpha2 = {
            x: this.to.x + hAlpha * (this.from.y - this.to.y) / length,
            y: this.to.y + hAlpha * (this.to.x - this.from.x) / length
        };


        // o primeiro tamanho do texto
//        if (!this.measure) {
//
//            this.measure = {
//                height: 0,
//                width: context.measureText(this.value).width
//            };
//
//        }

        // a medida arredondada entre o ponto inicial e o pointo final
        var textValue = plane.point.create(pAlpha1).distanceTo(plane.point.create(pAlpha2));


        // para a fonte + seu tamanho
        context.font = plane.utility.string.format('{0}px arial', [parseInt(5 * zoom)]);
        var textWidth = plane.view.context.measureText(Math.round(textValue)).width / plane.view.zoom;

        //console.log(textWidth);

        // o angulo para a inclinação dos pontos alpha
        var angleInRadian = this.from.angleTo(this.to);

        // o ponto final + medida total do texto para um novo pointo final
        

        // o meio entre o inicio estático e o novo pointo final
        var midAlpha = plane.point.create(pAlpha1).midTo(plane.point.create(pAlpha2));
        //var midAlpha = plane.point.create(pAlpha1).midTo(plane.point.create(pAlpha3));
        

        midAlpha = plane.point.create(midAlpha.x + ((-textWidth / 2) * Math.cos(angleInRadian)), midAlpha.y + ((-textWidth / 2) * Math.sin(angleInRadian)));
        //midAlpha = plane.point.create(midAlpha.x + ((-widthTextAlpha) * Math.cos(angleInRadian)), midAlpha.y + ((-widthTextAlpha) * Math.sin(angleInRadian)));




        // para o movimento até o ponto inicial
        context.translate(midAlpha.x * zoom + motion.x, midAlpha.y * zoom + motion.y);


        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations#Rotating
        // o angulo em radianos do ponto inicial ao ponto final
        context.rotate(this.from.angleTo(this.to));

        // o flip para o texto estar correto
        context.scale(1, -1);

        // escrevo o texto no context
        //context.fillText(Math.round(textAlpha) + 'mm', 0, 0);
        context.fillText(Math.round(textValue), 0, 0);

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

})(c37.library.plane);