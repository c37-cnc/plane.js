(function (Draw) {
    "use strict";

    Draw.Context = {

        shapes: [],
        shape: {

            add: function (shape) {

                Draw.Context.shapes.push(shape);

            },

            locate: function (selector) {

                return Draw.Context.shapes;

            },

            remove: function (shape) {

                Draw.Context.shapes.slice(Draw.Context.shapes.indexOf(shape));

            }
        }
    };

}(Draw));