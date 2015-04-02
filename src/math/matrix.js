(function (plane) {

    "use strict";

    function Matrix() {}

    Matrix.prototype = {}


    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
    plane.math.matrix = {
        create: function () {
            return new Matrix();
        }
    };

})(plane);