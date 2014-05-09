plane.render = (function (plane) {
    "use strict";

    return {
        initialize: function (config) {

            //            return callback.call(this, true);
            return true;
        },
        update: function () {
            var shapes = plane.layers.active.shapes.search(),
                render = plane.layers.active.getRender();

            console.log(shapes);

            if (shapes.length > 0) {
                render.update(shapes);
            }
        }
    };

})(plane);