/*!
 * C37 in 23-04-2014 at 22:34:47 
 *
 * draw version: 1.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */
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
    draw.initialize = function (config) {
        
//        draw.layer.initialize(config);
        
        
        

        // configuration
        // layers
        // events
        // render
        // renderer
        
        
        return draw.render.initialize(config);
        
    }

    /**
     * Descrição para o objeto Utility no arquivo draw.js
     *
     * @class Utility
     * @static
     */
    draw.utility = {};

    window.draw = draw;
    
}(window));


// style 

// fillColor: 'rgb(255,0,0)',
// lineCap: 'round',
// lineWidth: 10,
// lineColor: 'rgb(255,0,0)',
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
    "use strict";

    var shapes = [];


    return {
        create: function (params) {

            shapes.push(params);

            return this;
        },

        search: function (selector) {
            return shapes;
        },

        destroy: function (shape) {

            shapes.slice(shapes.indexOf(shape));

            return this;
        }
    };

}(draw));


//(function (draw) {
//    "use strict";
//
//    /**
//     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
//     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
//     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
//     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
//     *
//     * @namespace Geometry
//     * @class Shape
//     * @constructor
//     */
//    function shape(attrs) {
//
//
//        if (arguments.length == 0) {
//            return 'no arguments';
//        }
//
//
//        if (!(this instanceof shape)) {
//            return new shape(attrs);
//        }
//
//        for (var name in attrs) {
//            this[name] = attrs[name];
//        }
//        
//        /**
//         * A Universally unique identifier for
//         * a single instance of Shape
//         *
//         * @property uuid
//         * @type String
//         * @default 'uuid'
//         */
//        this.uuid = 'uuid';
//
//        /**
//         * Template for this view's container...
//         *
//         * @property name
//         * @type String
//         * @default ''
//         */
//        this.name = '';

//        this.uuid = 'uuid';
//        this.name = '';
//
//        this.visible = true;
//        this.data = {};
//
//        this.children = [];


//
//
////        this.from = this.from ? this.from : null;
////
////        this.to = this.to ? this.to : null;
//
//
//
//        this.visible = true;
//        this.data = {};
//
//        this.x = this.x || 0;
//        this.y = this.y || 0;
//        
//        this.radius = this.radius || 0;
//        
//        this.scale = 'Math.Vector';
//        this.angle = 'Math.Euler';
//
//
//        //this.initialize();
//
//    }
//
//    shape.prototype = {
//        initialize: function () {
//
//            return draw.context.shape.add(this);
//
//            //            return this;
//        },
//        moveTo: function () {
//            return true;
//        },
//        delete: function () {
//            return true;
//        },
//        toString: function () {
//            return "[" + this.constructor.name + " x : " + this.x + ", y : " + this.y + ", position : " + getPosition() + "]";
//        }
//    }
//
//    draw.geometry.shape = shape;
//
//}(draw));
draw.render.canvas = (function () {

    var htmlElement = null,
        elementContext = null;

    return {
        initialize: function (config) {

            htmlElement = document.createElement('canvas');

            htmlElement = config.renderer;

            htmlElement.width = config.renderer.clientWidth;
            htmlElement.height = config.renderer.clientHeight;

            if (!htmlElement.getContext) {
                throw new Error('no canvas suport');
            }

            elementContext = htmlElement.getContext('2d');

            // Cartesian coordinate system
            elementContext.translate(0, htmlElement.height);
            elementContext.scale(1, -1);








            function getMousePos(canvas, evt) {
                var rect = canvas.getBoundingClientRect();
                return {
                    x: evt.clientX - rect.left,
                    y: canvas.height - (evt.clientY - rect.top)
                    //                    y: canvas.height - (evt.clientY - rect.top)
                };
            }

            htmlElement.onmousewheel = function (event) {
                console.log(event);
            };
            //            htmlElement.onmousemove = function (event) {
            //                console.log(event);
            //            };
            htmlElement.onclick = function (event) {

                var zzz = getMousePos(htmlElement, event);

                var element = elementContext.isPointInPath(zzz.x, (parseInt(htmlElement.height) - zzz.y));
                var debug = document.getElementById('debug');

                debug.innerHTML = 'x: ' + zzz.x + ', y:' + zzz.y + ', k:' + (parseInt(htmlElement.height) - zzz.y) + ', selected: ' + element;;

                console.log(zzz);

            };

            return htmlElement;

        },
        update: function (shapes) {

            elementContext.clearRect(0, 0, htmlElement.width, htmlElement.height);

            shapes.forEach(function (shape) {

                // save state of all configuration
                elementContext.save();

                elementContext.beginPath();

                switch (shape.type) {
                case 'line':
                    {

                        elementContext.lineWidth = shape.strokeWidth || 1;
                        elementContext.strokeStyle = shape.strokeColor || 'black';

                        elementContext.moveTo(shape.x[0], shape.x[1]);
                        elementContext.lineTo(shape.y[0], shape.y[1]);

                        break;
                    }
                case 'rectangle':
                    {

                        elementContext.lineWidth = shape.strokeWidth || 1;
                        elementContext.strokeStyle = shape.strokeColor || 'black';
                        
                        elementContext.strokeRect(shape.x, shape.y, shape.width, shape.height);

                        break;
                    }
                case 'arc':
                    {

                        break;
                    }
                case 'circle':
                    {
                        elementContext.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);

                        break;
                    }
                case 'ellipse':
                    {

                        break;
                    }
                case 'polygon':
                    {
                        if (shape.sides < 3) {
                            throw new Error('shape.sides < 3');
                        }

                        var a = ((Math.PI * 2) / shape.sides);

                        elementContext.translate(shape.x, shape.y);
                        elementContext.moveTo(shape.radius, 0);

                        for (var i = 1; i < shape.sides; i++) {
                            elementContext.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
                        }

                        elementContext.closePath();

                        break;
                    }
                default:
                    break;
                }

                elementContext.stroke();

                // restore state of all configuration
                elementContext.restore();

            });
        }
    }



}(draw));
(function (draw) {
    "use strict";

    function svg(params) {

        if (arguments.length == 0) {
            throw new SyntaxError('svg - no arguments');
        } else if (!(this instanceof svg)) {
            return new svg(params);
        }
        
        this.type = 'svg';
        
    }

    draw.render.svg = svg;


}(draw));


(function (draw) {
    "use strict";

    /**
     * Descrição para Utility.Math no arquivo math.js
     *
     * @namespace Utility
     * @class Math
     * @static
     */
    draw.utility.math = {

        /**
         * Descrição para o metodo calculeX
         *
         * @method calculeX
         * @return {Number} Copy of ...
         */
        calculeX: function (a, b) {
            return a + b;
        },

        /**
         * Descrição para o metodo uuid
         *
         * @method calculeX
         * @return {String} Copy of ...
         */
        uuid: function () {
            return '';
        }

    }

}(draw));