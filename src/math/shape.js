(function (plane) {
    "use strict";

    function Shape() {

        // NÃO COLOCAR OS FIELDS AQUI!!!
        // ele ira herder como prototype

        // https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js#L395

    }

    Shape.prototype = {
        _initialize: function (attrs) {

            // o nome do shape
            this.name = plane.utility.string.format('{0} - {1}', [attrs.type, attrs.uuid]);

            // cache
//            this._cache = {
//                canvas: document.createElement("canvas"),
//                //canvas: null,
//                context: null,
//                image: null
//            };


            // completando os campos do shape
            plane.utility.object.extend(this, attrs);

            // limpando os segments
            this.segments = [];

            // calculando os segmentos
            this._calculeSegments();

            // calculando os limites
            this._calculeBounds();

            // montando o cache
            //this._calculeCache();

            return true;
        },
        _calculeBounds: function () {

            // https://github.com/mrdoob/three.js/blob/master/src/core/Geometry.js#L562
            // https://github.com/mrdoob/three.js/blob/master/src/math/Box3.js#L185
            if (!(this.bounds instanceof plane.math.bounds)) {

                var from = plane.point.create(this.segments[0]),
                    to = plane.point.create(this.segments[0]);

                this.segments.forEach(function (segment) {
                    from = operation.minimum(segment, from);
                    to = operation.maximum(segment, to);
                });

                this.bounds = plane.math.bounds.create(from, to);
            }

            return true;

        },
        _calculeCache: function () {
            // http://www.createjs.com/Demos/EaselJS/Cache
            // https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/display/DisplayObject.js#L811

            // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
            // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

            if (this._cache.context === null) {

                this._cache.canvas.width = plane.view.size.width;
                this._cache.canvas.height = plane.view.size.height;

                this._cache.context = this._cache.canvas.getContext('2d');

            }

            // clear context, +1 is needed on some browsers to really clear the borders
            this._cache.context.clearRect(0, 0, this._cache.canvas.width + 1, this._cache.canvas.height + 1);


            var moveX = ~~(0.5 + (this.segments[0].x)),
                moveY = ~~(0.5 + (this.segments[0].y));

            // movendo para o inicio do shape para não criar uma linha
            this._cache.context.moveTo(moveX, moveY);

            this._cache.context.beginPath();
            // para cada segmento, vou traçando uma linha
            for (var i = 0; i < this.segments.length; i++) {

                var x = ~~(0.5 + (this.segments[i].x));
                var y = ~~(0.5 + (this.segments[i].y));

                this._cache.context.lineTo(x, y);
            }
            this._cache.context.stroke();

            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
            var x = plane.utility.math.parseFloat(this.bounds.from.x, 5),
                y = plane.utility.math.parseFloat(this.bounds.from.y, 5),
                width = this.bounds.width === 0 ? 1 : this.bounds.width,
                height = this.bounds.height === 0 ? 1 : this.bounds.height;

            this._cache.image = this._cache.context.getImageData(x, y, width, height);

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
            // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
            if (this.style) {
                // salvo as configurações de estilo atuais do contexto
                context.save();

                if (this.style.fillColor) {
                    context.fillStyle = this.style.fillColor;
                    //context.strokeStyle = this.style.fillColor;
                } else {
                    // personalização para a cor da linha
                    if (this.style.lineColor)
                        context.strokeStyle = this.style.lineColor;

                    // personalização para linha pontilhada
                    if (this.style.lineDash)
                        context.setLineDash([5, 2]);

                    // personalização para a espessura da linha
                    if (this.style.lineWidth)
                        context.lineWidth = this.style.lineWidth;

                    // e deixo iniciado um novo shape
                    context.beginPath();
                }
            }

            // context.globalCompositeOperation = 'source-in';
            // if (!this._cache.context) {
            // } else {
            //     // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
            //     context.putImageData(this._cache.image, moveX, moveY);
            // }

            var moveX = ~~(0.5 + (this.segments[0].x * zoom + motion.x)),
                moveY = ~~(0.5 + (this.segments[0].y * zoom + motion.y));

            // movendo para o inicio do shape para não criar uma linha
            context.moveTo(moveX, moveY);

            // para cada segmento, vou traçando uma linha
            for (var i = 0; i < this.segments.length; i++) {
                // http://seb.ly/2011/02/html5-canvas-sprite-optimisation/
                // http://jsperf.com/math-round-vs-hack/3
                // http://www.ibm.com/developerworks/library/wa-canvashtml5layering/
                var x = ~~(0.5 + (this.segments[i].x * zoom + motion.x));
                var y = ~~(0.5 + (this.segments[i].y * zoom + motion.y));

                context.lineTo(x, y);
            }

            // quando possivel personalização
            if (this.style) {
                // para fazer o preenchimento quando necessário
                if (this.style.fillColor) {
                    // preencho o shape no contexto
                    context.fill();
                } else {
                    // desenho o shape no contexto
                    context.stroke();
                }
                // restauro as configurações de estilo anteriores do contexto
                context.restore();
            }
        }
    };

    var renderToCanvas = function (width, height, renderFunction) {
        var buffer = document.createElement('canvas');
        buffer.width = width;
        buffer.height = height;
        renderFunction(buffer.getContext('2d'));
        return buffer;
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