/*global window:true*/

/*
 * Sparrow Shape
 */

(function (window) {
    "use strict";
    
    var Sparrow = {}; 

    /**
     * Static class holding library specific information
     * the library.
     * @class Sparrow Shape
     **/
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
    

    Sparrow.Shape.Geometry = function () {};
    Sparrow.Shape.Object = function () {};
    Sparrow.Shape.Math = function () {};
    

    window.Sparrow.Shape = Sparrow.Shape;
}(window));