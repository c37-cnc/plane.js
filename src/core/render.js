plane.render = (function (layers) {
    "use strict";

    return {
        initialize: function (config) {

            //            return callback.call(this, true);
            return true;
        },
        update: function () {
            var shapes = layers.active.shapes.search(),
                render = layers.active.render();

            console.log(shapes);

            if (shapes.length > 0) {
                renderer.update(shapes);
            }
        }
    };

})(plane.layers);