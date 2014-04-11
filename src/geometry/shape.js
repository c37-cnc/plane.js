(function (Sparrow) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Draw.Geometry
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