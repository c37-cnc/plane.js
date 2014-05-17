/*!
 * C37 in 17-05-2014 at 00:55:30 
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
window.plane = (function (window) {
    "use strict";

    var version = '1.0.0',
        author = 'lilo@c37.co';

    return {
        initialize: function (config) {
            if ((config == null) || (typeof config == "function")) {
                throw new Error('Plane - Initialize - Config is not valid - See the documentation');
            }

            plane.render.initialize(config);
            plane.layers.initialize(config);
            plane.events.initialize(config);

            return true;

        }
    }
}(window));
plane.events = (function (window, plane) {
    "use strict";

    var viewPort = null;


    return {
        initialize: function (config, callback) {
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Events - Initialize - Config is not valid - See the documentation');
            }

            var viewPort = config.viewPort;

            //plane.__proto__ = new plane.utility.event();


            window.addEventListener('resize', function (event) {

                var size = {
                    width: viewPort.clientWidth,
                    height: viewPort.clientHeight
                };

                //plane.dispatchEvent('onresize', size);


//                var layerActive = plane.layers.active;
//
//                plane.layers.list().forEach(function (layer) {
//
//                    plane.layers.select(layer.name);
//
//                    plane.layers.active.viewer.width = size.width;
//                    plane.layers.active.viewer.height = size.height;
//
//                    plane.render.update();
//
//                });
//
//                plane.layers.select(layerActive.name);




            });


        }
    }

})(window, plane);




//            function getMousePos(canvas, event) {
//                var bb = canvas.getBoundingClientRect();
//
//                var x = (event.clientX - bb.left) * (canvas.width / bb.width);
//                var y = (event.clientY - bb.top) * (canvas.height / bb.height);
//
//                return {
//                    x: x,
//                    y: y
//                };
//            }
//
//
//            function hitPath(canvas, event) {
//                var bb = canvas.getBoundingClientRect();
//
//                var x = (event.clientX - bb.left) * (canvas.width / bb.width);
//                var y = (event.clientY - bb.top) * (canvas.height / bb.height);
//
//                return context2D.isPointInPath(x, y);
//            }
//
//
//
//
//            htmlElement.onmousewheel = function (event) {
//                console.log(event);
//            };
//
//
//            htmlElement.onclick = function (event) {
//
//                var zzz = getMousePos(htmlElement, event);
//
//                var debug = document.getElementById('debug');
//
//                debug.innerHTML = 'x: ' + zzz.x + ', y:' + zzz.y + ', selected: ' + hitPath(htmlElement, event);
//
//                console.log(context2D.getImageData(zzz.x, zzz.y, 3, 3).data);
//
//            };
//
//            //            htmlElement.oncontextmenu = function (event) {
//            //                console.log(event);
//            //
//            //                return false;
//            //            }
plane.layers = (function (plane) {
    "use strict";

    var layers = [];

    function Layer() {

        var shapes = [];

        this.uuid = plane.utility.math.uuid(9, 16);

        this.shapes = {
            add: function (shape) {
                shapes.push(shape);
                return this;
            },
            search: function (selector) {
                return shapes;
            },
            remove: function (shape) {

                shapes = [];

                //                shapes.slice(shapes.indexOf(shape));
                return this;
            }
        }
    }

    Layer.prototype = {

        set name(value) {
            if ((value == null) || (value == undefined) || (value == '')) {
                throw new Error('New name is not defined');
            }

            for (var i = 0; i <= layers.length - 1; i++) {
                if (layers[i].name.toLowerCase() == value.toLowerCase()) {
                    throw new Error('This name ' + value + ' already exists in Layers')
                }
            }

            this._name = value;
        },
        get name() {
            return this._name;
        },

        set locked(value) {
            this._locked = value;
        },
        get locked() {
            return this._locked;
        },

        set visible(value) {
            this._visible = value;
        },
        get visible() {
            return this._visible;
        },

        set style(value) {

            // fillColor: 'rgb(255,0,0)',
            // lineCap: 'round',
            // lineWidth: 10,
            // lineColor: 'rgb(255,0,0)',            

            this._style = value;
        },
        get style() {
            return this._style;
        },
        
        set viewer(value) {
            this._viewer = value;
        },
        get viewer() {
            return this._viewer;
        },        

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
        initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Layer - Initialize - Config is not valid - See the documentation');
            }


            console.log('layer - initialize');

            return true;
        },
        create: function (layerName) {
            try {
                if ((layerName) && (typeof layerName != 'string')) {
                    throw new Error('Layer - Create - Layer Name is not valid - See the documentation');
                }

                layerName = layerName || 'New Layer ' + layers.length;

                var layer = new Layer(),
                    viewer = plane.render.create();

                layer.name = layerName;
                layer.viewer = viewer;
                
                
                
                if (layers.length == 0){
                    layer.viewer.style.backgroundColor = 'rgb(255, 255, 255)';
                }
                

                // add ao Array
                layers.push(layer)

                // seleciono como ativa
                this.select(layerName)

                console.log('layer - create');

                return true;
            } catch (error) {
                layer = null;
                throw error;
            }
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
            var layersList = [];
            for (var i = 0; i <= layers.length - 1; i++) {
                layersList.push({
                    uuid: layers[i].uuid,
                    name: layers[i].name,
                    active: (layers[i] == this.active),
                    locked: layers[i].locked,
                    visible: layers[i].visible
                })
            }
            console.log('layer - list');
            return typeof callback == 'function' ? callback.call(this, layersList) : layersList;
        },
        select: function (layerName) {
            for (var i = 0; i <= layers.length - 1; i++) {
                if (layers[i].name.toUpperCase() == layerName.toUpperCase()) {
                    this.active = layers[i];
                }
            }
            return this;
        },
        active: {}
    };

})(plane);
plane.render = (function (plane, document) {
    "use strict";

    var viewPort = null;

    return {
        initialize: function (config) {

            viewPort = config.viewPort;

            return true;
        },
        create: function () {

            var viewer = document.createElement('canvas');

            viewer.width = viewPort.clientWidth;
            viewer.height = viewPort.clientHeight;

            if (!viewer.getContext) {
                throw new Error('no canvas suport');
            }

            viewer.style.position = "absolute";

            viewPort.appendChild(viewer);

            return viewer;
        },
        update: function () {
            
            var shapes = plane.layers.active.shapes.search(),
                viewer = plane.layers.active.viewer;
            

            var context2D = viewer.getContext('2d');

            // Cartesian coordinate system
            context2D.translate(0, viewer.height);
            context2D.scale(1, -1);

            context2D.clearRect(0, 0, viewer.width, viewer.height);

            shapes.forEach(function (shape) {

                // save state of all configuration
                context2D.save();

                context2D.beginPath();

                switch (shape.type) {
                case 'line':
                    {

                        context2D.lineWidth = shape.strokeWidth || 1;
                        context2D.strokeStyle = shape.strokeColor || 'black';

                        context2D.moveTo(shape.x[0], shape.x[1]);
                        context2D.lineTo(shape.y[0], shape.y[1]);

                        break;
                    }
                case 'rectangle':
                    {

                        context2D.lineWidth = shape.strokeWidth || 1;
                        context2D.strokeStyle = shape.strokeColor || 'black';

                        context2D.strokeRect(shape.x, shape.y, shape.width, shape.height);

                        break;
                    }
                case 'arc':
                    {

                        break;
                    }
                case 'circle':
                    {
                        context2D.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);
                        context2D.closePath();

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

                        context2D.translate(shape.x, shape.y);
                        context2D.moveTo(shape.radius, 0);

                        for (var i = 1; i < shape.sides; i++) {
                            context2D.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
                        }

                        context2D.closePath();

                        break;
                    }
                default:
                    break;
                }

                context2D.fill();
                context2D.stroke();

                // restore state of all configuration
                context2D.restore();

            });
        }



    };

})(plane, window.document);
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
            layers.active.shapes.remove(shape);
            return this;
        }
    };

})(plane.layers);
plane.utility = (function (plane) {
    "use strict";

    return {
        math: {
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
            }
        },
        event: (function () {
            "use strict";

            function Event() {
                this.listeners = {};
            }

            Event.prototype.addEventListener = function (event, handler) {
                if (this.listeners[event] === undefined) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(handler);
            };

            Event.prototype.dispatchEvent = function (event, data) {
                if (this.listeners[event] !== undefined) {
                    for (var callback in this.listeners[event]) {
                        this.listeners[event][callback].call(this, data);
                    }
                }
            };

            Event.prototype.removeEventListener = function (event, handler) {
                if (this.listeners[event] !== undefined) {
                    var index = this.listeners[event].indexOf(handler);
                    if (index !== -1) {
                        this.listeners[event].splice(index, 1);
                    }
                }
            };
            return Event;
        })()
    }

})(plane);