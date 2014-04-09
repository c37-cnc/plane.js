(function (Sparrow) {
    "use strict";

    function Object(x, y) {

        // public properties
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