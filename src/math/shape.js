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

//            // um remendo para o calculo
//            var angleInRadian = from.angleTo(to),
//                lineSizeValue = 5 / plane.view.zoom;
//
//            // com uma tolerancia para os limites não ficar sem cima dos shapes
//            var minPoint = plane.point.create(from.x + (-lineSizeValue * Math.cos(angleInRadian)), from.y + (-lineSizeValue * Math.sin(angleInRadian))),
//                maxPoint = plane.point.create(to.x + (+lineSizeValue * Math.cos(angleInRadian)), to.y + (+lineSizeValue * Math.sin(angleInRadian)));
//
//            from = minPoint;
//            to = maxPoint;

            this._bounds.from = from;
            this._bounds.to = to;


            // https://github.com/craftyjs/Crafty/blob/bcd581948c61966ed589c457feb32358a0afd9c8/src/spatial/collision.js#L154
            var center = {
                x: (from.x + to.x) / 2,
                y: (from.y + to.y) / 2
            },
            radius = Math.sqrt((to.x - from.x) * (to.x - from.x) + (to.y - from.y) * (to.y - from.y)) / 2;

            this._bounds.center = plane.point.create(center);
            this._bounds.radius = radius;


            /**
             * Calculates the MBR when rotated some number of radians about an origin point o.
             * Necessary on a rotation, or a resize
             */
            // https://github.com/craftyjs/Crafty/blob/2f131c55c60e1aecc68923c9576c6dad00539d82/src/spatial/2d.js#L358

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