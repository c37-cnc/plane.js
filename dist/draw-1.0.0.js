/*!
 * C37 in 17-04-2014 at 23:26:41 
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
     * @module draw
     */
    var draw = {};

    /**
     * @for draw
     * @property version
     * @type String
     * @static
     **/
    draw.version = '1.0.0';

    /**
     * @for draw
     * @property author
     * @type String
     * @static
     */
    draw.author = 'lilo@c37.co';

    /**
     * Returns this model's attributes as...
     *
     * @method initialize
     * @param htmlElement {HTMLElement} <canvas></canvas> or <svg></svg>
     * @param renderType {String} 'automatic', 'manual' or 'event'
     * @return {Object} instance of Projector
     */
//    draw.initialize = function (htmlElement, renderType) {
//
//        var renderer = htmlElement !== undefined ? htmlElement : document.createElement('canvas'),
//            renderType = renderType !== undefined ? renderType : 'automatic';
//        //render = new draw.Render(renderer, renderType);
//
//
//
//
//        draw.render.renderer = renderer;
//
//
//
//
//
//
//        return renderer;
//    }


    draw.init = function (params) {

        return draw.render.init(params);
        
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
    draw.geometry = {};

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @class Shape
     * @static
     */
    draw.shape = (function (draw) {

        var shapes = [];
        

        return {
            create: function (params) {
                
                shapes.push(params);
                
                draw.render.update();
            },

            locate: function (selector) {
                return shapes;
            },

            destroy: function (shape) {
                
                
                
                
                shapes.slice(shapes.indexOf(shape));
            }
        };

    }(draw));
    //    draw.shape = function (params) {
    //
    //        var context = draw.render.renderer.getContext('2d');
    //
    //        context.beginPath();
    //        context.moveTo(params.x[0], params.x[1]);
    //        context.lineTo(params.y[0], params.y[1]);
    //        context.stroke();
    //
    //
    //
    //
    //    };

    /**
     * Descrição para o objeto Utility no arquivo draw.js
     *
     * @class Utility
     * @static
     */
    draw.utility = {};

    window.draw = draw;
}(window));
draw.context = (function (draw) {
    "use strict";

    // Private attribute
    var shapes = [];

    // Private method
    function oo() {
        return ''
    };

    return {
        add: function (shape) {
            
            shapes.push(shape);

            draw.render.update();

        },

        locate: function (selector) {

            return shapes;

        },

        remove: function (shape) {

            shapes.slice(shapes.indexOf(shape));

        }
    }
}(draw));





//(function (draw) {
//    draw.context = {
//
//        shape: {
//            shapes: [],
//
//            add: function (shape) {
//
//                draw.context.shape.shapes.push(shape);
//                
//                
//                
//                draw.render.update(shape);
//
//            },
//
//            locate: function (selector) {
//
//                return draw.context.shape.shapes;
//
//            },
//
//            remove: function (shape) {
//
//                draw.context.shape.shapes.slice(draw.context.shape.shapes.indexOf(shape));
//
//            }
//        }
//    };
//}(draw));
draw.render = (function (draw) {
    "use strict";

    var renderType = null,
        htmlElement = null;


    return {
        init: function (params) {

            var types = {
                canvas: draw.render.canvas,
                svg: draw.render.svg
            };

            renderType = types[params.renderType];
            htmlElement = renderType.init(params);

            return htmlElement;
        },
        update: function () {
            
            renderType.render(htmlElement, draw.shape.locate());

        }
    };

}(draw));


//(function (draw) {
//    "use strict";
//
//    function render(params) {
//
//        if (arguments.length == 0) {
//            throw new SyntaxError('render - no arguments');
//        } else if (!(this instanceof render)) {
//            return new render(params);
//        }
//        
//        var types = {
//            canvas: draw.render.canvas,
//            svg: draw.render.svg
//        };
//
//
//        return types[params.renderType].call(this, params);
//
//    }
//
//    draw.render = render;







//    draw.render = {
//        renderer: null,
//        update: function (shape) {
//            var context = draw.render.renderer.getContext('2d');
//
//            if (shape instanceof draw.shape.line) {
//                var from = shape.x,
//                    to = shape.y;
//
//                context.beginPath();
//                context.moveTo(from[0], from[1]);
//                context.lineTo(to[0], to[1]);
//                context.stroke();
//            }
//
//            if (shape instanceof draw.shape.circle) {
//
//                context.beginPath();
//                context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);
//                context.stroke();
//            }
//
//            if (shape instanceof draw.shape.polygon) {
//
//                if (shape.sides < 3) {
//                    return;
//                }
//
//                context.beginPath();
//
//
//                var a = ((Math.PI * 2) / shape.sides);
//
//                context.translate(shape.x, shape.y);
//                context.moveTo(shape.radius, 0);
//
//
//                for (var i = 1; i < shape.sides; i++) {
//                    context.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
//                }
//                
//                context.closePath();
//                context.stroke();
//
//
//            }
//
//
//
//
//
//
//        }
//    }



//    function Render(renderer, renderType) {
//
//        var renderType = renderType;
//
//    }
//
//    Render.prototype = {
//        update: function () {
//
//        }
//    }
//
//    draw.Render = Render;

//}(draw));
(function (draw) {
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

    draw.geometry.Group = Group;

}(draw));

(function (draw) {
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
    function shape(attrs) {


        if (arguments.length == 0) {
            return 'no arguments';
        }


        if (!(this instanceof shape)) {
            return new shape(attrs);
        }

        for (var name in attrs) {
            this[name] = attrs[name];
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


//        this.from = this.from ? this.from : null;
//
//        this.to = this.to ? this.to : null;



        this.visible = true;
        this.data = {};

        this.x = this.x || 0;
        this.y = this.y || 0;
        
        this.radius = this.radius || 0;
        
        this.scale = 'Math.Vector';
        this.angle = 'Math.Euler';


        //this.initialize();

    }

    shape.prototype = {
        initialize: function () {

            return draw.context.shape.add(this);

            //            return this;
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

    draw.geometry.shape = shape;

}(draw));
draw.render.canvas = (function () {




    return {
        init: function (params) {

            var xxx = document.createElement('canvas');

            xxx.width = window.innerWidth;
            xxx.height = window.innerHeight;

            return xxx;
            
        },
        render: function (htmlElement, shapes) {

            var context = htmlElement.getContext('2d');

            context.beginPath();
            context.moveTo(100, 100);
            context.lineTo(600, 600);
            context.stroke();

            console.log(shapes.length);

        }
    }



}(draw));


//(function (draw) {
//    "use strict";
//
//    function canvas(params) {
//
//        if (arguments.length == 0) {
//            throw new SyntaxError('canvas - no arguments');
//        } else if (!(this instanceof canvas)) {
//            return new canvas(params);
//        }
//
//
//        this.type = 'canvas';
//
//        var xxx = document.createElement('canvas');
//
//
//        xxx.width = window.innerWidth;
//        xxx.height = window.innerHeight;
//
//        return xxx;
//
//    };
//
//    canvas.prototype = {
//        render: function (htmlElement, shapes) {
//
//            var context = htmlElement.getContext('2d');
//
//            context.beginPath();
//            context.moveTo(100, 100);
//            context.lineTo(600, 600);
//            context.stroke();
//
//            console.log(shapes.length);
//
//
//        }
//    }
//
//
//
//    draw.render.canvas = canvas;
//
//
//}(draw));
(function (draw) {
    "use strict";

    function svg(params) {

        if (arguments.length == 0) {
            throw new SyntaxError('svg - no arguments');
        } else if (!(this instanceof svg)) {
            return new svg(params);
        }
        
        this.type = 'svg';
        
    }

    draw.render.svg = svg;


}(draw));
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


(function (draw) {
    "use strict";

    /**
     * Descrição para Utility.Math no arquivo math.js
     *
     * @namespace Utility
     * @class Math
     * @static
     */
    draw.utility.math = {

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

}(draw));