(function (Draw) {
    "use strict";

    function Context() {

        var shapes = [];

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
        initialize: function () {

            return this;
        }
    }
 
    Draw.Context = Context;

}(Draw));