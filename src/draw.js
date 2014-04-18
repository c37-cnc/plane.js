(function (window) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @module draw
     */
    var draw = {};

    /**
     * @for draw
     * @property version
     * @type String
     * @static
     **/
    draw.version = '1.0.0';

    /**
     * @for draw
     * @property author
     * @type String
     * @static
     */
    draw.author = 'lilo@c37.co';

    /**
     * Returns this model's attributes as...
     *
     * @method initialize
     * @param htmlElement {HTMLElement} <canvas></canvas> or <svg></svg>
     * @param renderType {String} 'automatic', 'manual' or 'event'
     * @return {Object} instance of Projector
     */
//    draw.initialize = function (htmlElement, renderType) {
//
//        var renderer = htmlElement !== undefined ? htmlElement : document.createElement('canvas'),
//            renderType = renderType !== undefined ? renderType : 'automatic';
//        //render = new draw.Render(renderer, renderType);
//
//
//
//
//        draw.render.renderer = renderer;
//
//
//
//
//
//
//        return renderer;
//    }


    draw.init = function (params) {

        return draw.render.init(params);
        
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
    draw.geometry = {};

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Shape
     * @static
     */
    draw.shape = (function (draw) {

        var shapes = [];
        

        return {
            create: function (params) {
                
                shapes.push(params);
                
                draw.render.update();
            },

            locate: function (selector) {
                return shapes;
            },

            destroy: function (shape) {
                
                
                
                
                shapes.slice(shapes.indexOf(shape));
            }
        };

    }(draw));
    //    draw.shape = function (params) {
    //
    //        var context = draw.render.renderer.getContext('2d');
    //
    //        context.beginPath();
    //        context.moveTo(params.x[0], params.x[1]);
    //        context.lineTo(params.y[0], params.y[1]);
    //        context.stroke();
    //
    //
    //
    //
    //    };

    /**
     * Descrição para o objeto Utility no arquivo draw.js
     *
     * @class Utility
     * @static
     */
    draw.utility = {};

    window.draw = draw;
}(window));