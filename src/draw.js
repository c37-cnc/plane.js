(function (window) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @module Draw
     */
    var Draw = {};

    /**
     * @for Draw
     * @property version
     * @type String
     * @static
     **/
    Draw.version = '1.0.0';

    /**
     * @for Draw
     * @property author
     * @type String
     * @static
     */
    Draw.author = 'lilo@c37.co';

    /**
     * Returns this model's attributes as...
     *
     * @method initialize
     * @param element {HTMLElement} <canvas></canvas> or <svg></svg>
     * @param renderType {String} 'automatic' or 'manual'
     * @return {Object} instance of Projector
     */
    Draw.initialize = function (element, renderType) {

        var renderer = element != undefined ? element : document.createElement('canvas'),
            renderType = renderType !== undefined ? renderType : 'automatic';

        var context = new Draw.Context(renderer);

        context.shape.add({
            type: 'Polygon'
        });
        
        context.shape.add({
            type: 'Line'
        });
        

        console.log(context.shape.locate());
        
        





        return element !== undefined ? true : render;
    }

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Geometry
     * @static
     */
    Draw.Geometry = {};

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Math
     * @static
     */
    Draw.Math = {};

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Shape
     * @static
     */
    Draw.Shape = {};

    /**
     * Descrição para o objeto Utility no arquivo draw.js
     *
     * @class Utility
     * @static
     */
    Draw.Utility = {};

    window.Draw = Draw;
}(window));