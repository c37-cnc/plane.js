/*!
 * C37 in 09-04-2014 at 12:04:34 
 *
 * sparrow-shape version: 1.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */
/*
 * Sparrow
 * @class Sparrow
 */
(function (window) {
    "use strict";

    var Sparrow = {};

    /**
     * Provides the base Shape class
     *
     * @module Shape
     */
    Sparrow.Shape = function () {};

    /**
     * @property version
     * @type String
     * @static
     **/
    Sparrow.Shape.version = '1.0.0';

    /**
     * @property author
     * @type String
     * @static
     **/
    Sparrow.Shape.author = 'lilo@c37.co';


    /**
     * Provides the namespace for Geometry
     * @namespace Geometry
     */
    Sparrow.Shape.Geometry = function () {};

    /**
     * Provides the namespace for Object
     * @namespace Object
     */
    Sparrow.Shape.Object = function () {};

    /**
     * Provides the namespace for Math
     * @namespace Math
     */
    Sparrow.Shape.Math = function () {};

    /**
     * Provides the namespace for Utility
     * @namespace Utility
     */
    Sparrow.Shape.Utility = function () {};

    window.Sparrow = Sparrow;
}(window));
/*
 * Geometry Group
 */
(function (Sparrow) {
    "use strict";

    function Group(x, y) {

        // public properties
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

    /*
     * Object
     * @class Object
     * @constructor
     */
    function Object(x, y) {

        /**
         * My property description.  Like other pieces of your comment blocks,
         * this can span multiple lines.
         *
         * @property uuid
         * @type {Object}
         * @default "uuid"
         */
        this.uuid = 'uuid';
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

        // public methods
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

    Sparrow.Shape.Geometry.Object = Object;

}(Sparrow));

 

(function (Sparrow) {
    "use strict";

    /*
     * Polygon
     * @class Polygon
     * @constructor
     */
    function Polygon(x, y, sides) {

        Sparrow.Shape.Geometry.Object.call(this, x, y);

        this.sides = sides || 3;

    }

    Sparrow.Shape.Object.Polygon = Polygon;

}(Sparrow));
