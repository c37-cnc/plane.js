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

            this._bounds.from = from;
            this._bounds.to = to;

            //            // um remendo para o calculo
            //            var angleInRadian = maxPoint.angleTo(minPoint),
            //                lineSizeValue = 5 / view.zoom;
            //
            //            // com uma tolerancia para os limites não ficar sem cima dos shapes
            //            var maxPoint2 = point.create(maxPoint.x + (-lineSizeValue * Math.cos(angleInRadian)), maxPoint.y + (-lineSizeValue * Math.sin(angleInRadian))),
            //                minPoint2 = point.create(minPoint.x + (+lineSizeValue * Math.cos(angleInRadian)), minPoint.y + (+lineSizeValue * Math.sin(angleInRadian)));

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
        contains: function (position, transform) {

            return false;

        },
        intersect: function (rectangle) {

            return true;

        },
        render: function (context) {

            //console.log('render - ' + this.type + ' - uuid: ' + this.uuid)

            // de acordo com a matrix - a escala que devo aplicar nos segmentos
            var scale = 1;
            // de acordo com a matrix - o movimento que devo aplicar nos segmentos
            var move = {
                x: 0,
                y: 0
            };

            // movendo para o inicio do shape para não criar uma linha
            context.moveTo(this._segments[0].x * scale + move.x, this._segments[0].y * scale + move.y);
            // para cada segmento, vou traçando uma linha
            for (var i = 0; i < this._segments.length; i++) {
                var x = this._segments[i].x * scale + move.x;
                var y = this._segments[i].y * scale + move.y;

                context.lineTo(x, y);
            }

        }
    };

    plane.math.shape = Shape;

})(plane);