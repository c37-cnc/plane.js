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
    function line(attrs) {
        
        if (arguments.length == 0) {
            return 'no arguments';
        }
        

        if (!(this instanceof line)) {
            return new line(attrs);
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

    line.prototype = new draw.geometry.shape();
    //line.prototype.constructor = line;

//    line.prototype.initialize = function () {
//
//        return draw.context.shape.add(this);
//
//        //return draw.render.update(this);
//    }



    draw.shape.line = line;

}(draw));