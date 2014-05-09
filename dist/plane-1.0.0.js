/*!
 * C37 in 08-05-2014 at 22:11:54 
 *
 * plane version: 1.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */
/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @module plane
 */
//window.plane = (function (window) {
//    "use strict";
//
//
//
//    return {
//        /**
//         * @for plane
//         * @property version
//         * @type String
//         * @static
//         **/
//        version: '1.0.0',
//        /**
//         * @for plane
//         * @property author
//         * @type String
//         * @static
//         */
//        author: 'lilo@c37.co',
//        initialize: function (config) {
//
//            if ((config == null) || (typeof config == "function")) {
//                throw new Error('Plane - Initialize - Config is not valid - See the documentation');
//            }
//
//            plane.render.initialize(config, function () {
//                plane.layers.initialize(config);
//                plane.events.initialize(config);
//            });
//
//
//            return true;
//
//        },
//        renderer: {},
//        utility: {},
//        onChange: function () {
//
//        },
//        onResize: function () {
//
//        }
//
//
//
//    }
//
//}(window));



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
        if ((config == null) || (typeof config == "function")) {
            throw new Error('Plane - Initialize - Config is not valid - See the documentation');
        }

        plane.layers.initialize(config);
        plane.render.initialize(config);
        plane.events.initialize(config);

        //        plane.render.initialize(config, function () {
        //            plane.layers.initialize(config);
        //            plane.events.initialize(config);
        //        });

        return true;
    }
    
    /**
     * Descrição para o objeto Utility no arquivo plane.js
     *
     * @class Utility
     * @static
     */
    plane.utility = {};

    window.plane = plane;

})(window);




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
plane.events = (function (window, plane) {
    "use strict";

    var viewPort = null;


    return {
        initialize: function (config, callback) {
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Events - Initialize - Config is not valid - See the documentation');
            }


            window.addEventListener('resize', function (event) {
                console.log(event);
                plane.render.update();
            });






            return true;
        }
    }

})(window, plane);
plane.layers = (function (plane) {
    "use strict";

    var layersArray = [],
        renderType = null,
        viewPort = null;

    function Layer() {

        var uuid = plane.utility.math.uuid(9, 16),
            name = '',
            style = {},
            locked = false,
            visible = true,
            shapes = [],
            render = null;

        this.getUuid = function () {
            return uuid;
        }

        this.getName = function () {
            return name;
        }
        this.setName = function (newName) {
            if ((newName == null) || (newName == undefined) || (newName == '')) {
                throw new Error('New name is not defined');
            }

            for (var i = 0; i <= layersArray.length - 1; i++) {
                if (layersArray[i].getName().toLowerCase() == newName.toLowerCase()) {
                    throw new Error('This name ' + newName + ' already exists in Layers')
                }
            }

            name = newName;

            return this;
        }

        this.getLocked = function () {
            return locked;
        }
        this.setLocked = function (newLocked) {
            return locked = newLocked;
        }

        this.getVisible = function () {
            return visible;
        }
        this.setVisible = function (newVisible) {
            return visible = newVisible;
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

        this.getRender = function () {
            return render;
        }
        this.setRender = function (newRender) {
            return render = newRender;
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
                shapes.slice(shapes.indexOf(shape));
                return this;
            }
        }
    }

    Layer.prototype = {
        toString: function () {
            return '[ Layer' +
                ' uuid:' + this.getUuid() +
                ', name:' + this.getName() +
                ', active:' + this.getActive() +
                ']';
        },
        toJson: function () {

        }
    }

    return {
        initialize: function (config, callback) {
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Layer - Initialize - Config is not valid - See the documentation');
            }

            renderType = config.rendererType || 'canvas';
            viewPort = config.viewPort;

            // tipos de render implementados
            var renderTypes = {
                canvas: plane.render.canvas,
                svg: plane.render.svg
            };

            // render Type choice
            renderType = renderTypes[renderType];

            console.log('layer - initialize');

            return true;
        },
        create: function (layerName) {
            try {
                if ((layerName) && (typeof layerName != 'string')) {
                    throw new Error('Layer - Create - Layer Name is not valid - See the documentation');
                }

                layerName = layerName || 'New Layer ' + layersArray.length;

                var layer = new Layer();
                layer.setName(layerName);

                var render = renderType.create(viewPort);
                layer.setRender(render.render);

                // seleciono como ativa
                this.active = layer;

                // add ao Array
                layersArray.push(layer)

                console.log('layer - create');

                return render.viewer;
            } catch (error) {
                layer = null;
                throw error;
            }
        },
        remove: function (layerName) {
            for (var i = 0; i <= layersArray.length - 1; i++) {
                if (layersArray[i].getName() == layerName) {
                    return delete layersArray[i];
                }
            }
            return false;
        },
        list: function (callback) {
            var layersList = [];
            for (var i = 0; i <= layersArray.length - 1; i++) {
                layersList.push({
                    uuid: layersArray[i].getUuid(),
                    name: layersArray[i].getName(),
                    active: (layersArray[i] == this.active),
                    locked: layersArray[i].getLocked(),
                    visible: layersArray[i].getVisible()
                })
            }
            console.log('layer - list');
            return typeof callback == 'function' ? callback.call(this, layersList) : layersList;
        },
        select: function (layerName) {
            for (var i = 0; i <= layersArray.length - 1; i++) {
                if (layersArray[i].getName().toUpperCase() == layerName.toUpperCase()) {
                    this.active = layersArray[i];
                }
            }
            return this;
        },
        active: {}
    };

})(plane);
plane.render = (function (plane) {
    "use strict";

    return {
        initialize: function (config) {

            //            return callback.call(this, true);
            return true;
        },
        update: function () {
            var shapes = plane.layers.active.shapes.search(),
                render = plane.layers.active.getRender();

            console.log(shapes);

            if (shapes.length > 0) {
                render.update(shapes);
            }
        }
    };

})(plane);
/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @class Shape
 * @static
 */
plane.shape = (function (layers) {
    "use strict";

    return {
        create: function (params) {
            layers.active.shapes.add(params);
            return this;
        },

        search: function (selector) {
            return layers.active.shapes.search();
        },

        remove: function (shape) {
            return layers.active.shapes.remove(shape);
        }
    };

})(plane.layers);

plane.render.canvas = (function () {

    var htmlElement = null,
        elementContext = null;

    return {
        create: function (viewPort) {

            htmlElement = document.createElement('canvas');

            htmlElement.width = viewPort.clientWidth;
            htmlElement.height = viewPort.clientHeight;

            if (!htmlElement.getContext) {
                throw new Error('no canvas suport');
            }

            elementContext = htmlElement.getContext('2d');

            // Cartesian coordinate system
            elementContext.translate(0, htmlElement.height);
            elementContext.scale(1, -1);
            
            
            htmlElement.style.position = "absolute";
            
            viewPort.appendChild(htmlElement);


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

//            htmlElement.oncontextmenu = function (event) {
//                console.log(event);
//
//                return false;
//            }

            return {
                viewer: htmlElement,
                render: this
            };

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



})(plane);
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


})(plane);
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

    Object.prototype.addEventListener = function (type, fn) {

        if ((this[type]) && (this[type] instanceof Function)) {
            var firstFn = this[type];

            this[type] = [];
            this[type].push(firstFn);
            this[type].push(fn);

            return this;
        } else if ((this[type]) && (this[type] instanceof Array)) {
            this[type].push(fn);
        } else {
            this[type] = fn;
        }

        return this;
    }

    Object.prototype.dispatchEvent = function (type, params) {

        if ((this[type] == undefined) || (this[type] == null)) {
            throw new Error('Event is not defined');
        }

        if (this[type] instanceof Function) {
            this[type](params);
        } else if (this[type] instanceof Array) {
            for (var i = 0; i <= this[type].length - 1; i++) {
                this[type][i].call(this, params);
            }
        }

        return this;
    }

})(plane);
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

})(plane);