draw.render = (function (draw) {
    "use strict";

    var render = null;

    return {
        initialize: function (config) {

            var renderTypes = {
                canvas: draw.render.canvas,
                svg: draw.render.svg
            };

            render = renderTypes[config.renderType];

            return render.initialize(config);
        },
        update: function () {
            
            var shapes = draw.shape.search();
            
            if (shapes.length > 0) {
                render.update(shapes);
            }
        }
    };

}(draw));