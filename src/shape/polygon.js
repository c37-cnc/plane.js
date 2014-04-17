(function (draw) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Polygon
     * @extends Geometry.Shape
     * @constructor
     */
    function polygon(attrs) {

      if (arguments.length == 0) {
            return 'no arguments';
        }
        

        if (!(this instanceof polygon)) {
            return new polygon(attrs);
        }

        for (var name in attrs) {
            this[name] = attrs[name];
        }


        this.sides = this.sides || 3;
        this.radius = this.radius || 20;
        
        
        draw.geometry.shape.call(this, attrs);

        this.initialize();
        

    }

    polygon.prototype = new draw.geometry.shape();
    
    draw.shape.polygon = polygon;

}(draw));