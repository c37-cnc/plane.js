define("plane/object/shape", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point');

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
    function Base() {};

    Base.prototype = {
        initialize: function (attrs) {

            // o nome do shape
            attrs.name = utility.string.format('{0} - {1}', [attrs.type, attrs.uuid]);

            // completando os campos do shape
            utility.object.extend(this, attrs);

            // calculando os segmentos
            this.calculeSegments();

            return true;
        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            var segmentA = null,
                segmentB = null;

            for (var i = 0; i < this.segments.length; i++) {

                if (i + 1 == this.segments.length) {
                    segmentA = this.segments[i];
                    segmentB = this.segments[0];
                } else {
                    segmentA = this.segments[i];
                    segmentB = this.segments[i + 1];
                }

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

            return false;

        },
        intersect: function (rectangle) {

            var tl = point.create(rectangle.from.x, rectangle.to.y), // top left
                tr = point.create(rectangle.to.x, rectangle.to.y), // top right
                bl = point.create(rectangle.from.x, rectangle.from.y), // bottom left
                br = point.create(rectangle.to.x, rectangle.from.y); // bottom right

            return intersection.segmentsRectangle(this.segments, tl, tr, bl, br);

        },
        inRectangle: function (rectangle) {

            var tl = point.create(rectangle.from.x, rectangle.to.y), // top left
                tr = point.create(rectangle.to.x, rectangle.to.y), // top right
                bl = point.create(rectangle.from.x, rectangle.from.y), // bottom left
                br = point.create(rectangle.to.x, rectangle.from.y), // bottom right
                result = false;


            if (this.type == 'line') {

                // faço a verificação 'pontos dentro do retângulo'
                result = ((this.to.x >= rectangle.from.x && this.to.x <= rectangle.to.x) && (this.to.y >= rectangle.from.y && this.to.y <= rectangle.to.y)) ||
                    ((this.from.x >= rectangle.from.x && this.from.x <= rectangle.to.x) && (this.from.y >= rectangle.from.y && this.from.y <= rectangle.to.y));

                if (!result) {
                    result = intersection.segmentsRectangle(this.segments, tl, tr, bl, br);
                }

            } else {
                result = intersection.segmentsRectangle(this.segments, tl, tr, bl, br);
            }

            return result;

        },
        render: function (context, transform) {

            // possivel personalização
            if (this.style) {
                // salvo as configurações de estilo atuais do contexto
                context.save();
                // personalização para linha pontilhada
                if (this.style.lineDash) {
                    context.setLineDash([5, 2]);
                }
                // personalização para preenchimento de cor
                if (this.style.fillColor) {
                    context.fillStyle = this.style.fillColor;
                    context.strokeStyle = this.style.fillColor;
                }
                // personalização para a espessura da linha
                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
                // personalização para a cor da linha
                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
            }

            // de acordo com a matrix - a escala que devo aplicar nos segmentos
            var scale = Math.sqrt(transform.a * transform.d);
            // de acordo com a matrix - o movimento que devo aplicar nos segmentos
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            // movendo para o inicio do shape para não criar uma linha
            context.moveTo(this.segments[0].x * scale + move.x, this.segments[0].y * scale + move.y);
            // para cada segmento, vou traçando uma linha
            for (var i = 0; i < this.segments.length; i++) {
                var x = this.segments[i].x * scale + move.x;
                var y = this.segments[i].y * scale + move.y;

                context.lineTo(x, y);
            }


            // possivel personalização
            if (this.style && this.style.fillColor) {
                context.fill();
            }
            // quando possivel personalização
            if (this.style) {
                // desenho o shape no contexto
                context.stroke();
                // restauro as configurações de estilo anteriores do contexto
                context.restore();
                // e deixo iniciado um novo shape
                context.beginPath();
            }

        },
        toObject: function () {

            // converto para object os campos utilizando parseFloat

            //            return {
            //                uuid: this.uuid,
            //                type: this.type,
            //                name: this.name,
            //                status: this.status,
            //                x: utility.math.parseFloat(this.point.x, 5),
            //                y: utility.math.parseFloat(this.point.y, 5),
            //                radius: utility.math.parseFloat(this.radius, 5),
            //                startAngle: utility.math.parseFloat(this.startAngle, 5),
            //                endAngle: utility.math.parseFloat(this.endAngle, 5),
            //                clockWise: this.clockWise
            //            };

            return true;
        }
    };



    exports.Base = Base;

});