/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @class Shape
 * @static
 */
plane.shape = (function (layers) {
    "use strict";

    return {
        create: function (params) {
            layers.active.shapes.add(params);
            return this;
        },

        search: function (selector) {
            return layers.active.shapes.search();
        },

        remove: function (shape) {
            layers.active.shapes.remove(shape);
            return this;
        }
    };

})(plane.layers);