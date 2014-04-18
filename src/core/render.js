draw.render = (function (draw) {
    "use strict";

    var renderType = null,
        htmlElement = null;


    return {
        init: function (params) {

            var types = {
                canvas: draw.render.canvas,
                svg: draw.render.svg
            };

            renderType = types[params.renderType];
            htmlElement = renderType.init(params);

            return htmlElement;
        },
        update: function () {
            
            renderType.render(htmlElement, draw.shape.locate());

        }
    };

}(draw));


//(function (draw) {
//    "use strict";
//
//    function render(params) {
//
//        if (arguments.length == 0) {
//            throw new SyntaxError('render - no arguments');
//        } else if (!(this instanceof render)) {
//            return new render(params);
//        }
//        
//        var types = {
//            canvas: draw.render.canvas,
//            svg: draw.render.svg
//        };
//
//
//        return types[params.renderType].call(this, params);
//
//    }
//
//    draw.render = render;







//    draw.render = {
//        renderer: null,
//        update: function (shape) {
//            var context = draw.render.renderer.getContext('2d');
//
//            if (shape instanceof draw.shape.line) {
//                var from = shape.x,
//                    to = shape.y;
//
//                context.beginPath();
//                context.moveTo(from[0], from[1]);
//                context.lineTo(to[0], to[1]);
//                context.stroke();
//            }
//
//            if (shape instanceof draw.shape.circle) {
//
//                context.beginPath();
//                context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);
//                context.stroke();
//            }
//
//            if (shape instanceof draw.shape.polygon) {
//
//                if (shape.sides < 3) {
//                    return;
//                }
//
//                context.beginPath();
//
//
//                var a = ((Math.PI * 2) / shape.sides);
//
//                context.translate(shape.x, shape.y);
//                context.moveTo(shape.radius, 0);
//
//
//                for (var i = 1; i < shape.sides; i++) {
//                    context.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
//                }
//                
//                context.closePath();
//                context.stroke();
//
//
//            }
//
//
//
//
//
//
//        }
//    }



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

//}(draw));