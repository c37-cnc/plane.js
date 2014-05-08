plane.render = (function (layers) {
    "use strict";

    function performanceCalculating() {
        return 'canvas';
    }

    return {
        initialize: function (config) {

            return true;
        },
        update: function () {
            var shapes = layers.active.shapes.search(),
                renderer = layers.active.renderer();

            console.log(shapes);

            if (shapes.length > 0) {
                renderer.update(shapes);
            }
        },
        rendererType: function () {
            return rendererType;
        }
    };

}(plane.layers));