/*!
 * C37 in 27-04-2014 at 16:00:48 
 *
 * plane version: 1.0.0
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
     * @module plane
     */
    var plane = {};

    /**
     * @for plane
     * @property version
     * @type String
     * @static
     **/
    plane.version = '1.0.0';

    /**
     * @for plane
     * @property author
     * @type String
     * @static
     */
    plane.author = 'lilo@c37.co';

    /**
     * Returns this model's attributes as...
     *
     * @method initialize
     * @param htmlElement {HTMLElement} <canvas></canvas> or <svg></svg>
     * @param renderType {String} 'automatic', 'manual' or 'event'
     * @return {Object} instance of Projector
     */
    plane.initialize = function (config) {
 
        // validações para config 

        // validações para config 

        plane.layers.initialize(config);
        plane.render.initialize(config)
 

        //        console.log(plane.layers.getActive().toString());
        //        plane.layers.create();
        //        console.log(plane.layers.getActive().toString());
        //        plane.layers.create();
        //        console.log(plane.layers.getActive().toString());

        console.log(plane.layers.list());

        //        plane.event.initialize(config);
        //        plane.render.initialize(config);




        // configuration//
        // layer
        // event
        // render
        // renderer


        return plane.render.initialize(config);

    }

    /**
     * Descrição para o objeto Utility no arquivo plane.js
     *
     * @class Utility
     * @static
     */
    plane.utility = {};

    window.plane = plane;

}(window));




//plane.initialize(config);
//
//plane.zoom = 2;
//plane.center = [300, 600];
//
//plane.importJSON();
//plane.importSVG();
//plane.importDxf();
//
//plane.exportJSON();
//plane.exportSVG()
//plane.exportDxf()
//plane.exportPng()
//plane.exportPdf()
//
//plane.onChange(function () {});
//plane.onResize(function () {});
//
//
//plane.layers.initialize(config);
//
//plane.layers.create(params);
//plane.layers.remove(layerName);
//
//plane.layers.list();
//plane.layers.select(layerName);
//
//plane.layers.active = plane.layer;
//
//plane.layer.onActivate();
//plane.layer.onDeactivate();
//
//
//plane.render.initialize(config);
//plane.render.update();
//
//
//plane.shape.create();
//plane.shape.search();
//plane.shape.remove();
//
//
//plane.tools.initialize(config);
//
//plane.tools.create(params);
//plane.tools.remove(toolName);
//
//plane.tools.list();
//plane.tools.select(toolName);
//
//plane.tool.active = true || false;
//plane.tool.onActivate();
//plane.tool.onDeactivate();
//
//plane.tool.onMouseDown();
//plane.tool.onMouseUp();
//plane.tool.onMouseDrag();
//plane.tool.onMouseMove();
//
//plane.tool.onKeyDown();
//plane.tool.onKeyUp();
//
//plane.tool.onMouseWheel();
//
//
//plane.utility.math
//plane.utility.event
//(function (Draw) {
//    "use strict";
//
//    /**
//     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
//     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
//     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
//     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
//     *
//     * @namespace Geometry
//     * @class Group
//     * @constructor
//     */
//    function Group(x, y) {
//
//        /**
//         * A Universally unique identifier for
//         * a single instance of Object
//         *
//         * @property uuid
//         * @type String
//         * @default 'uuid'
//         */
//        this.uuid = 'uuid';
//        this.name = '';
//
//        this.visible = true;
//
//        this.children = [];
//
//    }
//
//    Draw.Geometry.Group = Group;
//
//}(Draw));


plane.layers = (function (plane) {
    "use strict";

    var layers = [];

    function Layer(config) {

        var uuid = plane.utility.math.uuid(9, 16),
            name = '',
            style = {},
            locked = false,
            visible = true,
            shapes = [];

        this.getUuid = function () {
            return uuid;
        }

        this.setName = function (newName) {
            if ((newName == null) || (newName == undefined) || (newName == '')) {
                throw new Error('New name is not defined');
            }

            for (var i = 0; i <= layers.length - 1; i++) {
                if (layers[i].getName().toLowerCase() == newName.toLowerCase()) {
                    throw new Error('This name ' + newName + ' already exists in Layers')
                }
            }

            name = newName;

            return this;
        }
        this.getName = function () {
            return name;
        }

        this.getStyle = function () {
            return style;
        }
        this.setStyle = function (newStyle) {

            // fillColor: 'rgb(255,0,0)',
            // lineCap: 'round',
            // lineWidth: 10,
            // lineColor: 'rgb(255,0,0)',            

            return this;
        }

        this.shapes = {
            add: function (shape) {
                shapes.push(shape);
                return this;
            },
            search: function (selector) {
                return shapes;
            },
            remove: function (shape) {
                shapes.slice(shapes.indexOf(shape));                return this;
            }
        }

        this.initialize(config);
    }

    Layer.prototype = {
        initialize: function (config) {

            this.setName(config.name);

            return this;
        },
        toString: function () {
            return '[ Layer' +
                ' uuid:' + this.getUuid() +
                ', name:' + this.getName() +
                ', active:' + this.getActive() +
                ']';
        }
    }


    return {
        initialize: function (config) {
            // validações em config aqui
            if (typeof config == "function") {
                throw new Error('Layer - Initialize - Config is not valid');
            }

            var config = {
                name: config ? config.name || 'New Layer ' + layers.length : 'New Layer ' + layers.length,
                active: config ? config.active || true : true
            }
            // validações em config aqui


            // crio a nova Layer com um config verificado
            var layer = new Layer(config);

            // seleciono como ativa
            plane.layers.active = layer;



            // add ao index
            layers.push(layer)

            return this;
        },
        create: function (config) {
            // validações em config aqui
            if (typeof config == "function") {
                throw new Error('Layer - Create - Config is not valid');
            }

            var config = {
                name: config ? config.name || 'New Layer ' + layers.length : 'New Layer ' + layers.length
            }
            // validações em config aqui


            // crio a nova Layer com um config verificado
            var layer = new Layer(config);


            // seleciono como ativa
            plane.layers.active = layer;


            // add ao index
            layers.push(layer)

            return this;
        },
        remove: function (layerName) {
            for (var i = 0; i <= layers.length - 1; i++) {
                if (layers[i].getName() == layerName) {
                    return delete layers[i];
                }
            }
            return false;
        },
        list: function (callback) {

            var listLayer = [];

            layers.forEach(function (layer) {
                listLayer.push({
                    uuid: layer.getUuid(),
                    name: layer.getName()
                })
            })
            
            return typeof callback  == 'function' ? callback.call(this, listLayer) : listLayer;
        },
        select: function (layerName) {
            layers.forEach(function (layer) {
                if (layer.getName() == layerName) {
                    plane.layers.active = layer;
                }
            })
            return this;
        },
        active: null
    };

}(plane));
plane.render = (function (plane) {
    "use strict";


    var renderType = null,
        renders = [];

    function performanceCalculating() {

        return 'canvas';
    }


    return {
        initialize: function (config) {
            // validações em config aqui
            if (typeof config == "function") {
                throw new Error('Render - Initialize - Config is not valid');
            }

            var config = {
                renderType: config ? config.renderType || performanceCalculating() : performanceCalculating(),
                renderer: config ? config.renderer || null : null
            }
            // validações em config aqui

            
            // tipos de render implementados
            var renderTypes = {
                canvas: plane.render.canvas,
                svg: plane.render.svg
            };
            // tipos de render implementados
            
            
            // render Type choice
            renderType = renderTypes[config.renderType];
            
            // add ao index
            renders.push(renderType.create(config))

            return this;
        },
        update: function () {

            var shapes = plane.layers.active.shapes.search();

            if (shapes.length > 0) {
                renderType.update(shapes);
            }
        }
    };

}(plane));
/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @class Shape
 * @static
 */
plane.shape = (function (plane) {
    "use strict";

    return {
        create: function (params) {
            
            plane.layers.active.shapes.add(params);

            return this;
        },

        search: function (selector) {
            return plane.layers.active.shapes.search();
        },

        remove: function (shape) {
            return plane.layers.active.shapes.remove(shape);
        }
    };

}(plane));


//(function (plane) {
//    "use strict";
//
//    /**
//     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
//     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
//     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
//     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
//     *
//     * @namespace Geometry
//     * @class Shape
//     * @constructor
//     */
//    function shape(attrs) {
//
//
//        if (arguments.length == 0) {
//            return 'no arguments';
//        }
//
//
//        if (!(this instanceof shape)) {
//            return new shape(attrs);
//        }
//
//        for (var name in attrs) {
//            this[name] = attrs[name];
//        }
//        
//        /**
//         * A Universally unique identifier for
//         * a single instance of Shape
//         *
//         * @property uuid
//         * @type String
//         * @default 'uuid'
//         */
//        this.uuid = 'uuid';
//
//        /**
//         * Template for this view's container...
//         *
//         * @property name
//         * @type String
//         * @default ''
//         */
//        this.name = '';

//        this.uuid = 'uuid';
//        this.name = '';
//
//        this.visible = true;
//        this.data = {};
//
//        this.children = [];


//
//
////        this.from = this.from ? this.from : null;
////
////        this.to = this.to ? this.to : null;
//
//
//
//        this.visible = true;
//        this.data = {};
//
//        this.x = this.x || 0;
//        this.y = this.y || 0;
//        
//        this.radius = this.radius || 0;
//        
//        this.scale = 'Math.Vector';
//        this.angle = 'Math.Euler';
//
//
//        //this.initialize();
//
//    }
//
//    shape.prototype = {
//        initialize: function () {
//
//            return plane.context.shape.add(this);
//
//            //            return this;
//        },
//        moveTo: function () {
//            return true;
//        },
//        delete: function () {
//            return true;
//        },
//        toString: function () {
//            return "[" + this.constructor.name + " x : " + this.x + ", y : " + this.y + ", position : " + getPosition() + "]";
//        }
//    }
//
//    plane.geometry.shape = shape;
//
//}(plane));
plane.render.canvas = (function () {

    var htmlElement = null,
        elementContext = null;

    return {
        create: function (config) {

            htmlElement = document.createElement('canvas');

            htmlElement = config.renderer;

            htmlElement.width = config.renderer.clientWidth;
            htmlElement.height = config.renderer.clientHeight;

            if (!htmlElement.getContext) {
                throw new Error('no canvas suport');
            }

            elementContext = htmlElement.getContext('2d');

            // Cartesian coordinate system
            elementContext.translate(0, htmlElement.height);
            elementContext.scale(1, -1);








            function getMousePos(canvas, event) {
                var bb = canvas.getBoundingClientRect();

                var x = (event.clientX - bb.left) * (canvas.width / bb.width);
                var y = (event.clientY - bb.top) * (canvas.height / bb.height);

                return {
                    x: x,
                    y: y
                };
            }


            function hitPath(canvas, event) {
                var bb = canvas.getBoundingClientRect();

                var x = (event.clientX - bb.left) * (canvas.width / bb.width);
                var y = (event.clientY - bb.top) * (canvas.height / bb.height);

                return elementContext.isPointInPath(x, y);
            }




            htmlElement.onmousewheel = function (event) {
                console.log(event);
            };


            htmlElement.onclick = function (event) {

                var zzz = getMousePos(htmlElement, event);

                var debug = document.getElementById('debug');

                debug.innerHTML = 'x: ' + zzz.x + ', y:' + zzz.y + ', selected: ' + hitPath(htmlElement, event);

                console.log(elementContext.getImageData(zzz.x, zzz.y, 3, 3).data);

            };

            htmlElement.oncontextmenu = function (event) {
                console.log(event);

                return false;
            }

            return htmlElement;

        },
        update: function (shapes) {

            elementContext.clearRect(0, 0, htmlElement.width, htmlElement.height);

            shapes.forEach(function (shape) {

                // save state of all configuration
                elementContext.save();

                elementContext.beginPath();

                switch (shape.type) {
                case 'line':
                    {

                        elementContext.lineWidth = shape.strokeWidth || 1;
                        elementContext.strokeStyle = shape.strokeColor || 'black';

                        elementContext.moveTo(shape.x[0], shape.x[1]);
                        elementContext.lineTo(shape.y[0], shape.y[1]);

                        break;
                    }
                case 'rectangle':
                    {

                        elementContext.lineWidth = shape.strokeWidth || 1;
                        elementContext.strokeStyle = shape.strokeColor || 'black';

                        elementContext.strokeRect(shape.x, shape.y, shape.width, shape.height);

                        break;
                    }
                case 'arc':
                    {

                        break;
                    }
                case 'circle':
                    {
                        elementContext.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);
                        elementContext.closePath();

                        break;
                    }
                case 'ellipse':
                    {

                        break;
                    }
                case 'polygon':
                    {
                        if (shape.sides < 3) {
                            throw new Error('shape.sides < 3');
                        }

                        var a = ((Math.PI * 2) / shape.sides);

                        elementContext.translate(shape.x, shape.y);
                        elementContext.moveTo(shape.radius, 0);

                        for (var i = 1; i < shape.sides; i++) {
                            elementContext.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
                        }

                        elementContext.closePath();

                        break;
                    }
                default:
                    break;
                }

                elementContext.fill();
                elementContext.stroke();

                // restore state of all configuration
                elementContext.restore();

            });
        }
    }



}(plane));
(function (plane) {
    "use strict";

    function svg(params) {

        if (arguments.length == 0) {
            throw new SyntaxError('svg - no arguments');
        } else if (!(this instanceof svg)) {
            return new svg(params);
        }
        
        this.type = 'svg';
        
    }

    plane.render.svg = svg;


}(plane));
/**
In other terms, producers publish
information on a software bus (an event
manager) and consumers subscribe to the
information they want to receive from
that bus. 


Subscribers register
their interest in events by typically
calling a subscribe() operation on the
event service, without knowing the effective
sources of these events. This subscription
information remains stored in
the event service and is not forwarded
to publishers. The symmetric operation
unsubscribe() terminates a subscription.

To generate an event, a publisher typically
calls a publish() operation. The
event service propagates the event to all
relevant subscribers; it can thus be viewed
as a proxy for the subscribers.
*/
plane.utility.events = (function (plane) {
    "use strict";

    var subscribers = [];

    return {

        subscribe: function () {


        },
        
        publish: function(){
            
        },
        
        advertise: function(){
            
        },

        unsubscribe: function () {

            
        }

    };

}(plane));
(function (plane) {
    "use strict";

    /**
     * Descrição para Utility.Math no arquivo math.js
     *
     * @namespace Utility
     * @class Math
     * @static
     */
    plane.utility.math = {

        /*
         * Generate a random uuid.
         *
         * USAGE: Math.uuid(length, radix)
         *   length - the desired number of characters
         *   radix  - the number of allowable values for each character.
         *
         * EXAMPLES:
         *   // No arguments  - returns RFC4122, version 4 ID
         *   >>> Math.uuid()
         *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
         *
         *   // One argument - returns ID of the specified length
         *   >>> Math.uuid(15)     // 15 character ID (default base=62)
         *   "VcydxgltxrVZSTV"
         *
         *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
         *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
         *   "01001010"
         *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
         *   "47473046"
         *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
         *   "098F4D35"
         */
        uuid: function (length, radix) {
            
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
                uuid = [],
                i;
            radix = radix || chars.length;

            if (length) {
                // Compact form
                for (i = 0; i < length; i++) uuid[i] = chars[0 | Math.random() * radix];
            } else {
                // rfc4122, version 4 form
                var r;

                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                // Fill in random data.  At i==19 set the high bits of clock sequence as
                // per rfc4122, sec. 4.1.5
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }

            return uuid.join('').toLowerCase();
        },

        /**
         * Descrição para o metodo calculeX
         *
         * @method calculeX
         * @return {Number} Copy of ...
         */
        calculeX: function (a, b) {
            return a + b;
        }


    }

}(plane));