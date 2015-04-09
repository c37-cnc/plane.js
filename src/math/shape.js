(function (plane) {
    "use strict";

    function Shape() {
    }

    Shape.prototype = {
        _initialize: function (attrs) {

            // o nome do shape
            this.name = plane.utility.string.format('{0} - {1}', [attrs.type, attrs.uuid]);

            // completando os campos do shape
            plane.utility.object.extend(this, attrs);


            // calculando os segmentos
            this._calculeSegments();

            return true;
        },
        contains: function (position, transform) {

            return false;

        },
        intersect: function (rectangle) {

            return true;

        },
        render: function (context) {
            
            console.log('render - ' + this.type + ' - uuid: ' + this.uuid)

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