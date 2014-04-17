 (function (draw) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Line
     * @extends Geometry.Shape
     * @constructor
     */
    function circle(attrs) {
        
        if (arguments.length == 0) {
            return 'no arguments';
        }
        

        if (!(this instanceof circle)) {
            return new circle(attrs);
        }

        for (var name in attrs) {
            this[name] = attrs[name];
        }


        //        this.from = this.from ? this.from : null;
        //        
        //        this.to = this.to ? this.to : null;


        draw.geometry.shape.call(this, attrs);

        this.initialize();

    }

    circle.prototype = new draw.geometry.shape();


    draw.shape.circle = circle;

}(draw));