(function (Draw) {
    "use strict";

    function Context(renderer) {

        var shapes = [],
            renderer = renderer;


        this.shape = {

            add: function (shape) {

                shapes.push(shape);

            },

            locate: function (selector) {

                return shapes;

            },

            remove: function (shape) {

                shapes.slice(shapes.indexOf(shape));

            }
        }

    }

    Context.prototype = {
        initialize: function (renderer) {

            return this;
        },
        render: function () {

        }
    }

    Draw.Context = Context;

}(Draw));