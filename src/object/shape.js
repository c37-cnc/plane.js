define('plane/object/shape', ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection');

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

                // correção de lógica, como estou calculando pelos segmentos, 
                // não posso pegar o ultimo + o primeiro, pois será como um shape 'fechado'
                // 2015.02.16 - outra correção IMPORTANTE - se == ao fim CONTINUE
                if (i + 1 === this.segments.length) {
                    continue;
                }
                
                segmentA = this.segments[i];
                segmentB = this.segments[i + 1];

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

            return false;

        },
        intersect: function (rectangle) {

            var tl = point.create(rectangle.from.x, rectangle.to.y), // top left
                tr = point.create(rectangle.to.x, rectangle.to.y), // top right
                bl = point.create(rectangle.from.x, rectangle.from.y), // bottom left
                br = point.create(rectangle.to.x, rectangle.from.y), // bottom right
                result = false;


            if ((this.type === 'line') || (this.type === 'text')) {

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
            
            var moveX = ~~(0.5 + (this.segments[0].x * scale + move.x)),
                moveY = ~~(0.5 + (this.segments[0].y * scale + move.y));
            

            // movendo para o inicio do shape para não criar uma linha
            //context.moveTo(this.segments[0].x * scale + move.x, this.segments[0].y * scale + move.y);
            context.moveTo(moveX, moveY);
            // para cada segmento, vou traçando uma linha
            for (var i = 0; i < this.segments.length; i++) {
//                var x = this.segments[i].x * scale + move.x;
//                var y = this.segments[i].y * scale + move.y;

                    var x = ~~(0.5 + (this.segments[i].x * scale + move.x));
                    var y = ~~(0.5 + (this.segments[i].y * scale + move.y));


                context.lineTo(x, y);
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



    exports.Base = Base;

});