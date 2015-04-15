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

            // completando os campos do shape
            plane.utility.object.extend(this, attrs);

            // limpando os segments
            this._segments = [];

            // calculando os segmentos
            this._calculeSegments();

            // calculando os limites
            this._calculeBounds();

            return true;
        },
        _calculeBounds: function () {

            var from = plane.point.create(this._segments[0]),
                to = plane.point.create(this._segments[0]);

            this._segments.forEach(function (segment) {

                var point = plane.point.create(segment);

                from = point.minimum(from);
                to = point.maximum(to);

            });

            this._bounds = plane.math.bounds.create(from, to);

            return true;

        },
        _cache: function () {
            // http://www.createjs.com/Demos/EaselJS/Cache
            // https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/display/DisplayObject.js#L811


            return true;
        },
        contains: function (position, transform) {

            return false;

        },
        intersect: function (rectangle) {

            return true;

        },
        _render: function (context, zoom, motion) {

            //console.log('render - ' + this.type + ' - uuid: ' + this.uuid)

            // movendo para o inicio do shape para não criar uma linha
            context.moveTo(~~(0.5 + (this._segments[0].x * zoom + motion.x)), ~~(0.5 + (this._segments[0].y * zoom + motion.y)));
            // para cada segmento, vou traçando uma linha
            for (var i = 0; i < this._segments.length; i++) {

                // http://seb.ly/2011/02/html5-canvas-sprite-optimisation/
                // http://jsperf.com/math-round-vs-hack/3
                // http://www.ibm.com/developerworks/library/wa-canvashtml5layering/

                // var x = this._segments[i].x * zoom + motion.x;
                // var y = this._segments[i].y * zoom + motion.y;

                // var x = Math.round(this._segments[i].x * zoom + motion.x);
                // var y = Math.round(this._segments[i].y * zoom + motion.y);

                // var x = (0.5 + (this._segments[i].x * zoom + motion.x)) << 0;
                // var y = (0.5 + (this._segments[i].y * zoom + motion.y) << 0);

                //debugger;

                var x = ~~(0.5 + (this._segments[i].x * zoom + motion.x));
                var y = ~~(0.5 + (this._segments[i].y * zoom + motion.y));


                context.lineTo(x, y);
            }

        }
    };

    plane.math.shape = Shape;

})(plane);