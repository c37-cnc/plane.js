(function (draw) {
    "use strict";

    draw.render = {
        renderer: null,
        update: function (shape) {
            var context = draw.render.renderer.getContext('2d');

            if (shape instanceof draw.shape.line) {
                var from = shape.position.from,
                    to = shape.position.to;

                context.beginPath();
                context.moveTo(from.x, from.y);
                context.lineTo(to.x, to.y);
                context.stroke();
            }

            if (shape instanceof draw.shape.circle) {

                context.beginPath();
                context.arc(shape.position.x, shape.position.y, shape.radius, 0, Math.PI * 2, true);
                context.stroke();
            }

            if (shape instanceof draw.shape.polygon) {

                if (shape.sides < 3) {
                    return;
                }

                context.beginPath();


                var a = ((Math.PI * 2) / shape.sides);

                context.translate(shape.position.x, shape.position.y);
                context.moveTo(shape.radius, 0);


                for (var i = 1; i < shape.sides; i++) {
                    context.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
                }
                
                context.closePath();
                context.stroke();


            }






        }
    }



    //    function Render(renderer, renderType) {
    //
    //        var renderType = renderType;
    //
    //    }
    //
    //    Render.prototype = {
    //        update: function () {
    //
    //        }
    //    }
    //
    //    draw.Render = Render;

}(draw));