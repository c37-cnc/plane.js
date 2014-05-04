(function (window) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @module plane
     */
    var plane = {};

    /**
     * @for plane
     * @property version
     * @type String
     * @static
     **/
    plane.version = '1.0.0';

    /**
     * @for plane
     * @property author
     * @type String
     * @static
     */
    plane.author = 'lilo@c37.co';

    /**
     * Returns this model's attributes as...
     *
     * @method initialize
     * @param htmlElement {HTMLElement} <canvas></canvas> or <svg></svg>
     * @param renderType {String} 'automatic', 'manual' or 'event'
     * @return {Object} instance of Projector
     */
    plane.initialize = function (config) {
 
        // validações para config 

        // validações para config 

        plane.layers.initialize(config);
        plane.render.initialize(config)
 

        //        console.log(plane.layers.getActive().toString());
        //        plane.layers.create();
        //        console.log(plane.layers.getActive().toString());
        //        plane.layers.create();
        //        console.log(plane.layers.getActive().toString());

        console.log(plane.layers.list());

        //        plane.event.initialize(config);
        //        plane.render.initialize(config);




        // configuration//
        // layer
        // event
        // render
        // renderer


        return plane.render.initialize(config);

    }

    /**
     * Descrição para o objeto Utility no arquivo plane.js
     *
     * @class Utility
     * @static
     */
    plane.utility = {};

    window.plane = plane;

}(window));




//plane.initialize(config);
//
//plane.zoom = 2;
//plane.center = [300, 600];
//
//plane.importJSON();
//plane.importSVG();
//plane.importDxf();
//
//plane.exportJSON();
//plane.exportSVG()
//plane.exportDxf()
//plane.exportPng()
//plane.exportPdf()
//
//plane.onChange(function () {});
//plane.onResize(function () {});
//
//
//plane.layers.initialize(config);
//
//plane.layers.create(params);
//plane.layers.remove(layerName);
//
//plane.layers.list();
//plane.layers.select(layerName);
//
//plane.layers.active = plane.layer;
//
//plane.layer.onActivate();
//plane.layer.onDeactivate();
//
//
//plane.render.initialize(config);
//plane.render.update();
//
//
//plane.shape.create();
//plane.shape.search();
//plane.shape.remove();
//
//
//plane.tools.initialize(config);
//
//plane.tools.create(params);
//plane.tools.remove(toolName);
//
//plane.tools.list();
//plane.tools.select(toolName);
//
//plane.tool.active = true || false;
//plane.tool.onActivate();
//plane.tool.onDeactivate();
//
//plane.tool.onMouseDown();
//plane.tool.onMouseUp();
//plane.tool.onMouseDrag();
//plane.tool.onMouseMove();
//
//plane.tool.onKeyDown();
//plane.tool.onKeyUp();
//
//plane.tool.onMouseWheel();
//
//
//plane.utility.math
//plane.utility.event