(function (draw) {
    "use strict";

    draw.context = {

        shape: {
            shapes: [],

            add: function (shape) {

                draw.context.shape.shapes.push(shape);
                
                
                
                draw.render.update(shape);

            },

            locate: function (selector) {

                return draw.context.shape.shapes;

            },

            remove: function (shape) {

                draw.context.shape.shapes.slice(draw.context.shape.shapes.indexOf(shape));

            }
        }
    };

}(draw));