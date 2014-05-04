plane.render = (function (plane) {
    "use strict";


    var renderType = null,
        renders = [];

    function performanceCalculating() {

        return 'canvas';
    }


    return {
        initialize: function (config) {
            // validações em config aqui
            if (typeof config == "function") {
                throw new Error('Render - Initialize - Config is not valid');
            }

            var config = {
                renderType: config ? config.renderType || performanceCalculating() : performanceCalculating(),
                renderer: config ? config.renderer || null : null
            }
            // validações em config aqui

            
            // tipos de render implementados
            var renderTypes = {
                canvas: plane.render.canvas,
                svg: plane.render.svg
            };
            // tipos de render implementados
            
            
            // render Type choice
            renderType = renderTypes[config.renderType];
            
            // add ao index
            renders.push(renderType.create(config))

            return this;
        },
        update: function () {

            var shapes = plane.layers.active.shapes.search();

            if (shapes.length > 0) {
                renderType.update(shapes);
            }
        }
    };

}(plane));