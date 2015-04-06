(function (plane) {
    "use strict";

    function Shape() {
    }

    Shape.prototype = {
        _initialize: function (attrs) {

            // o nome do shape
            this.name = plane.utility.string.format('{0} - {1}', [attrs.type, attrs.uuid]);

            // completando os campos do shape
            plane.utility.object.extend(this, attrs);


            // calculando os segmentos
            this._calculeSegments();

            return true;
        },
        contains: function (position, transform) {

            return false;

        },
        intersect: function (rectangle) {

            return true;

        },
        render: function () {

            console.log('render!');

        }
    };

    plane.math.shape = Shape;

})(plane);