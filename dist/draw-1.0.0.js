/*!
 * C37 in 10-04-2014 at 21:43:54 
 *
 * draw version: 1.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */
(function (window) {
    "use strict";

    /**
     * @module Sparrow
     */
    var Sparrow = {};

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Draw
     * @static
     */
    Sparrow.Draw = function () {};

    /**
     * @property version
     * @type String
     * @static
     **/
    Sparrow.Draw.version = '1.0.0';

    /**
     * @property author
     * @type String
     * @static
     */
    Sparrow.Draw.author = 'lilo@c37.co';


    // https://github.com/jquery/jquery-ui/blob/master/ui/widget.js#L58
    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Draw
     * @class Geometry
     * @static
     */
    Sparrow.Draw.Geometry = function() {};

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Draw
     * @class Object
     * @static
     */
    Sparrow.Draw.Object = {};
    
    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Draw
     * @class Math
     * @static
     */
    Sparrow.Draw.Math = {};
    
    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Draw
     * @class Utility
     * @static
     */
    Sparrow.Draw.Utility = {};
    // https://github.com/jquery/jquery-ui/blob/master/ui/widget.js#L58


    window.Sparrow = Sparrow;
}(window));
(function (Sparrow) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape.Geometry
     * @class Group
     */
    function Group(x, y) {

        /**
         * A Universally unique identifier for 
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = 'uuid';
        this.name = '';

        this.visible = true;
        this.data = {};

        this.children = [];

    }

    Sparrow.Shape.Geometry.Group = Group;

}(Sparrow));
(function (Sparrow) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape.Geometry
     * @class Shape
     */
    function Shape(x, y) {

        /**
         * A Universally unique identifier for
         * a single instance of Shape
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = 'uuid';

        /**
         * Template for this view's container...
         *
         * @property name
         * @type String
         * @default ''
         */
        this.name = '';

        this.visible = true;
        this.data = {};

        this.position = '';
        this.scale = 'Math.Vector';
        this.rotate = 'Math.Euler';
        this.x = x || 0;
        this.y = y || 0;

        // private properties
        arguments = arguments;


        /**
         * Returns this model's attributes as MOVE
         *
         * @method move
         * @return {Shape} Copy of ...
         */
        this.move = function (x, y) {
            return true;
        }

        this.delete = function () {
            return true;
        }

        this.toString = function () {
            return "[" + this.constructor.name + " x : " + this.x + ", y : " + this.y + ", position : " + getPosition() + "]";
        }

        // private methods
        function getPosition() {
            return [this.x + 100, this.y + 100];
        }

    }

    Sparrow.Shape.Geometry.Shape = Shape;

}(Sparrow));

 

(function (Sparrow) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape.Object
     * @class Polygon
     * @extends Shape.Geometry.Object
     * @constructor
     */
    function Polygon(x, y, sides) {

        Sparrow.Shape.Geometry.Object.call(this, x, y);

        this.sides = sides || 3;

    }

    Sparrow.Shape.Object.Polygon = Polygon;

}(Sparrow));
