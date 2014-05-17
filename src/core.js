/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @module plane
 */
window.plane = (function (window) {
    "use strict";

    var version = '1.0.0',
        author = 'lilo@c37.co';

    return {
        initialize: function (config) {
            if ((config == null) || (typeof config == "function")) {
                throw new Error('Plane - Initialize - Config is not valid - See the documentation');
            }

            plane.render.initialize(config);
            plane.layers.initialize(config);
            plane.events.initialize(config);

            return true;

        }
    }
}(window));