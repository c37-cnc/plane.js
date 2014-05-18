/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @class Shape
 * @static
 */
Plane.Shape = (function (Plane) {
    "use strict";

    var shapes = [];



    return {
        Create: function (params) {

//            Plane.dispatchEvent('onChange', {
//                type: 'onChange',
//                now: new Date().toISOString()
//            });

            var uuid = Plane.Layers.Active.uuid;

            if (!shapes[uuid]) {
                shapes[uuid] = [];
            }

            shapes[uuid].push(params);

            return this;
        },

        Search: function (selector) {

            return shapes[selector];

        },

        Remove: function (shape) {

            return this;
        }
    };

})(Plane);