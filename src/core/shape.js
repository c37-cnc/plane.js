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