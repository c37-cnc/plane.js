(function (plane) {
    "use strict";

    var Text = plane.utility.object.inherits(function Text(attrs) {

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
        this.size = null;
        this.value = null;
        this.measure = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Text.prototype._calculeSegments = function () {

        this.segments.push({
            x: this.from.x,
            y: this.from.y
        });
        
        plane.view.context.save();

        // para a fonte + seu tamanho
        plane.view.context.font = plane.utility.string.format('{0}px arial', [parseInt(this.size * plane.view.zoom)]);
        
        // um remendo para o calculo
        var angleInRadian = this.from.angleTo(this.to),
            //lineSizeValue = this.measure.width - (.5 / plane.view.zoom);
            lineSizeValue = plane.view.context.measureText(this.value).width / plane.view.zoom;
            
        plane.view.context.restore();
        
        var x = this.from.x + (lineSizeValue * Math.cos(angleInRadian)),
            y = this.from.y + (lineSizeValue * Math.sin(angleInRadian));
        
        this.segments.push({
            x: x,
            y: y
        });
        
        this.to = plane.point.create(x, y);
        
        return true;
    };

    Text.prototype.fromSnap = function (point, distance) {

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

    Text.prototype.toObject = function () {
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
    Text.prototype._render = function (context, zoom, motion) {

        // salvo as configurações de estilo atuais do contexto
        context.save();

        // possivel personalização
        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
        if (this.style) {

            context.fillStyle = this.style.fillColor || this.style.lineColor;

            // personalização para linha pontilhada
            if (this.style.lineDash)
                context.setLineDash([5, 2]);

        }

        // para a fonte + seu tamanho
        context.font = plane.utility.string.format('{0}px arial', [parseInt(this.size * zoom)]);

        // para o movimento até o ponto inicial
        context.translate(this.from.x * zoom + motion.x, this.from.y * zoom + motion.y);


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

        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
        // escrevo o texto no context
        context.fillText(this.value, 0, 0);


        // restauro as configurações de estilo anteriores do contexto
        context.restore();

    };


    plane.object.text = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('text - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.from = plane.point.create(attrs.from);
            attrs.to = plane.point.create(attrs.to);

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Text(attrs);
        }
    };

})(c37.library.plane);