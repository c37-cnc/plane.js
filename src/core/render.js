draw.render = (function (draw) {
    "use strict";

    var render = null;


    return {
        initialize: function (params) {

            var types = {
                canvas: draw.render.canvas,
                svg: draw.render.svg
            };

            render = types[params.renderType];

            return render.initialize(params);
        },
        update: function () {

            render.update(draw.shape.locate());

        }
    };

}(draw));