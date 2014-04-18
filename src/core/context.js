draw.context = (function (draw) {
    "use strict";

    // Private attribute
    var shapes = [];

    // Private method
    function oo() {
        return ''
    };

    return {
        add: function (shape) {
            
            shapes.push(shape);

            draw.render.update();

        },

        locate: function (selector) {

            return shapes;

        },

        remove: function (shape) {

            shapes.slice(shapes.indexOf(shape));

        }
    }
}(draw));





//(function (draw) {
//    draw.context = {
//
//        shape: {
//            shapes: [],
//
//            add: function (shape) {
//
//                draw.context.shape.shapes.push(shape);
//                
//                
//                
//                draw.render.update(shape);
//
//            },
//
//            locate: function (selector) {
//
//                return draw.context.shape.shapes;
//
//            },
//
//            remove: function (shape) {
//
//                draw.context.shape.shapes.slice(draw.context.shape.shapes.indexOf(shape));
//
//            }
//        }
//    };
//}(draw));