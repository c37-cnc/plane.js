(function (plane) {
    "use strict";

    function Shape() {

        // NÃO COLOCAR OS FIELDS AQUI!!!
        // ele ira herder como prototype

    }

    Shape.prototype = {
        _initialize: function (attrs) {

            // o nome do shape
            this.name = plane.utility.string.format('{0} - {1}', [attrs.type, attrs.uuid]);

            // cache
            this._cache = {
                //canvas: document.createElement("canvas"),
                canvas: null,
                context: null
            };


            // completando os campos do shape
            plane.utility.object.extend(this, attrs);

            // limpando os segments
            this._segments = [];

            // calculando os segmentos
            this._calculeSegments();

            // calculando os limites
            this._calculeBounds();

            //this._calculeCache();

            return true;
        },
        _calculeBounds: function () {

            var from = plane.point.create(this._segments[0]),
                to = plane.point.create(this._segments[0]);

            this._segments.forEach(function (segment) {
                from = operation.minimum(segment, from);
                to = operation.maximum(segment, to);
            });

            this._bounds = plane.math.bounds.create(from, to);

            return true;

        },
        _calculeCache: function () {
            // http://www.createjs.com/Demos/EaselJS/Cache
            // https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/display/DisplayObject.js#L811
            
            // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
            // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

            this._cache.context = this._cache.canvas.getContext('2d');

            var moveX = ~~(0.5 + (this._segments[0].x)),
                moveY = ~~(0.5 + (this._segments[0].y));

            // movendo para o inicio do shape para não criar uma linha
            this._cache.context.moveTo(moveX, moveY);

            // para cada segmento, vou traçando uma linha
            for (var i = 0; i < this._segments.length; i++) {
                // http://seb.ly/2011/02/html5-canvas-sprite-optimisation/
                // http://jsperf.com/math-round-vs-hack/3
                // http://www.ibm.com/developerworks/library/wa-canvashtml5layering/
                var x = ~~(0.5 + (this._segments[i].x));
                var y = ~~(0.5 + (this._segments[i].y));

                this._cache.context.lineTo(x, y);
            }

            return true;
        },
        contains: function (position, transform) {

            return false;

        },
        intersect: function (rectangle) {

            return true;

        },
        _render: function (context, zoom, motion) {

            // possivel personalização
            if (this.style) {
                // salvo as configurações de estilo atuais do contexto
                context.save();

                // personalização para linha pontilhada
                if (this.style.lineDash)
                    context.setLineDash([5, 2]);

                // personalização para a espessura da linha
                if (this.style.lineWidth)
                    context.lineWidth = this.style.lineWidth;

                // personalização para a cor da linha
                if (this.style.lineColor)
                    context.strokeStyle = this.style.lineColor;

                // e deixo iniciado um novo shape
                context.beginPath();
            }

            var moveX = ~~(0.5 + (this._segments[0].x * zoom + motion.x)),
                moveY = ~~(0.5 + (this._segments[0].y * zoom + motion.y));

            if (!this._cache.context) {
                // movendo para o inicio do shape para não criar uma linha
                context.moveTo(moveX, moveY);

                // para cada segmento, vou traçando uma linha
                for (var i = 0; i < this._segments.length; i++) {
                    // http://seb.ly/2011/02/html5-canvas-sprite-optimisation/
                    // http://jsperf.com/math-round-vs-hack/3
                    // http://www.ibm.com/developerworks/library/wa-canvashtml5layering/
                    var x = ~~(0.5 + (this._segments[i].x * zoom + motion.x));
                    var y = ~~(0.5 + (this._segments[i].y * zoom + motion.y));

                    context.lineTo(x, y);
                }
            } else {
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
                var dt = this._cache.context.getImageData(1, 1, 100, 100);

                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
                context.putImageData(dt, 1, 1);
                //context.putImageData(dt, moveX, moveY);
            }
            
            // quando possivel personalização
            if (this.style) {
                // desenho o shape no contexto
                context.stroke();
                // restauro as configurações de estilo anteriores do contexto
                context.restore();
            }
        },
        render: function (context, transform) {

            // possivel personalização
            if (this.style) {
                // salvo as configurações de estilo atuais do contexto
                context.save();

                // personalização para linha pontilhada
                if (this.style.lineDash)
                    context.setLineDash([5, 2]);

                // personalização para a espessura da linha
                if (this.style.lineWidth)
                    context.lineWidth = this.style.lineWidth;

                // personalização para a cor da linha
                if (this.style.lineColor)
                    context.strokeStyle = this.style.lineColor;

                // e deixo iniciado um novo shape
                context.beginPath();
            }

            // de acordo com a matrix - a escala que devo aplicar nos segmentos
            var scale = Math.sqrt(transform.a * transform.d);
            // de acordo com a matrix - o movimento que devo aplicar nos segmentos
            var move = {
                x: transform.tx,
                y: transform.ty
            };

            // movendo para o inicio do shape para não criar uma linha
            context.moveTo(this._segments[0].x * scale + move.x, this._segments[0].y * scale + move.y);
            // para cada segmento, vou traçando uma linha
            for (var i = 0; i < this._segments.length; i++) {
                var x = this._segments[i].x * scale + move.x;
                var y = this._segments[i].y * scale + move.y;

                context.lineTo(x, y);
                
//                if (i === this._segments.length - 2)
//                    break;
                
            }
            
            // quando possivel personalização
            if (this.style) {
                // desenho o shape no contexto
                context.stroke();
                // restauro as configurações de estilo anteriores do contexto
                context.restore();
            }

        }

    };

    var operation = {
        minimum: function (a, b) {
            return {
                x: (a.x < b.x) ? a.x : b.x,
                y: (a.y < b.y) ? a.y : b.y
            };
        },
        maximum: function (a, b) {
            return {
                x: (a.x > b.x) ? a.x : b.x,
                y: (a.y > b.y) ? a.y : b.y
            };
        }
    };

    plane.math.shape = Shape;

})(c37.library.plane);