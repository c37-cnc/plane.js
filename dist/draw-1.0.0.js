/*!
 * C37 in 16-04-2014 at 12:33:23 
 *
 * draw version: 1.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */
(function (window) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @module Draw
     */
    var Draw = {};

    /**
     * @for Draw
     * @property version
     * @type String
     * @static
     **/
    Draw.version = '1.0.0';

    /**
     * @for Draw
     * @property author
     * @type String
     * @static
     */
    Draw.author = 'lilo@c37.co';

    /**
     * Returns this model's attributes as...
     *
     * @method initialize
     * @param htmlElement {HTMLElement} <canvas></canvas> or <svg></svg>
     * @param renderType {String} 'automatic' or 'manual'
     * @return {Object} instance of Projector
     */
    Draw.initialize = function (htmlElement, renderType) {

        var renderer = htmlElement !== undefined ? htmlElement : document.createElement('canvas'),
            renderType = renderType !== undefined ? renderType : 'automatic',
            context = new Draw.Context(renderer),
            render = new Draw.Render(renderer);




        
        
        
        

        return {
            status: 'true',
            renderer: renderer,
            context: context,
            render: render
        }
    }

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Geometry
     * @static
     */
    Draw.Geometry = {};

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Math
     * @static
     */
    Draw.Math = {};

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Shape
     * @static
     */
    Draw.Shape = {};

    /**
     * Descrição para o objeto Utility no arquivo draw.js
     *
     * @class Utility
     * @static
     */
    Draw.Utility = {};

    window.Draw = Draw;
}(window));
(function (Draw) {
    "use strict";

    function Context() {

        var shapes = [];

        this.shape = {

            add: function (shape) {

                shapes.push(shape);

            },

            locate: function (selector) {

                return shapes;

            },

            remove: function (shape) {

                shapes.slice(shapes.indexOf(shape));

            }
        }

    }

    Context.prototype = {
        initialize: function () {

            return this;
        }
    }

    Draw.Context = Context;

}(Draw));
(function (Draw) {
    "use strict";

    function Render(renderer, renderType) {

        var renderType = renderType;

    }

    Render.prototype = {
        update: function () {

        }
    }

    Draw.Render = Render;

}(Draw));
(function (Draw) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Geometry
     * @class Group
     * @constructor
     */
    function Group(x, y) {

        /**
         * A Universally unique identifier for 
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = 'uuid';
        this.name = '';

        this.visible = true;
        this.data = {};

        this.children = [];

    }

    Draw.Geometry.Group = Group;

}(Draw));
(function (Draw) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Geometry
     * @class Point
     * @constructor
     */
    function Point(x, y) {

        /**
         * A x point
         *
         * @property x
         * @type String
         * @default '0'
         */
        this.x = 0;

        /**
         * A y point
         *
         * @property y
         * @type String
         * @default '0'
         */
        this.y = 0;
    }

    Point.prototype = {
        addition: function () {

        },
        subtract: function () {

        },
        multiply: function () {

        },
        divide: function () {

        }
    }

    Draw.Geometry.Point = Point;

}(Draw));
(function (Draw) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Geometry
     * @class Shape
     * @constructor
     */
    function Shape() {

        
        if (arguments.length == 0) {
            return 'no arguments';
        }


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

        this.position = 'arguments[0].point';
        this.scale = 'Math.Vector';
        this.angle = 'Math.Euler';


        this.initialize();

    }

    Shape.prototype = {
        initialize: function () {

            return this;
        },
        moveTo: function () {
            return true;
        },
        delete: function () {
            return true;
        },
        toString: function () {
            return "[" + this.constructor.name + " x : " + this.x + ", y : " + this.y + ", position : " + getPosition() + "]";
        }
    }

    Draw.Geometry.Shape = Shape;

}(Draw));



 
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
(function (Draw) {
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
    function Polygon(x, y, sides) {

        Draw.Geometry.Shape.call(this, x, y);

        this.sides = sides || 3;

    }

    Draw.Shape.Polygon = Polygon;

}(Draw));


(function (Draw) {
    "use strict";

    /**
     * Descrição para Utility.Math no arquivo math.js
     *
     * @namespace Utility
     * @class Math
     * @static
     */
    Draw.Utility.Math = {

        /**
         * Descrição para o metodo calculeX
         *
         * @method calculeX
         * @return {Number} Copy of ...
         */
        calculeX: function (a, b) {
            return a + b;
        },

        /**
         * Descrição para o metodo uuid
         *
         * @method calculeX
         * @return {String} Copy of ...
         */
        uuid: function () {
            return '';
        }

    }

}(Draw));
(function (Draw) {
    "use strict";

    Draw.Option = {
    };

}(Draw));