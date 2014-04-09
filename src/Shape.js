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
     * @class Shape
     * @static
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
     */
    Sparrow.Shape.author = 'lilo@c37.co';


    // https://github.com/jquery/jquery-ui/blob/master/ui/widget.js#L58
    Sparrow.Shape.Geometry = {};
    Sparrow.Shape.Object = {};
    Sparrow.Shape.Math = {};
    Sparrow.Shape.Utility = {};
    // https://github.com/jquery/jquery-ui/blob/master/ui/widget.js#L58


    window.Sparrow = Sparrow;
}(window));