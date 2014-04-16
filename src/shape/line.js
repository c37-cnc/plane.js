(function (Draw) {
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
    function Line(x, y) {

        Draw.Geometry.Shape.apply(this, arguments[0]);
        
        this.initialize();

    }
    
    Line.prototype = new Draw.Geometry.Shape();
    
    Line.prototype = {
        initialize: function(){
            
            
            return this;
        }
    }
    
    

    Draw.Shape.Line = Line;

}(Draw));