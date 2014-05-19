/*!
 * C37 in 18-05-2014 at 21:33:08 
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
window.Plane = (function (window) {
    "use strict";

    var version = '1.0.0',
        author = 'lilo@c37.co';

    function gridDraw(enabled, width, height, color) {

        if (!enabled) return;

        Plane.Layers.Create();

        for (var xActual = 0; xActual < width; xActual += 50) {
            Plane.Shape.Create({
                type: 'line',
                x: [xActual, 0],
                y: [xActual, height],
                strokeColor: color,
                strokeWidth: .6
            });

            for (var xInternalSub = 1; xInternalSub <= 4; xInternalSub++) {
                // small part = 50/5 = 10px espaço entre as linhas
                var xActualSub = Math.round(xActual + 10 * xInternalSub);

                // como é somado + 10 (afrente) para fazer as sub-linhas
                // verifico se não ultrapassou o width
                //            if (xActualSub > width) {
                //                break;
                //            }

                Plane.Shape.Create({
                    type: 'line',
                    x: [xActualSub, 0],
                    y: [xActualSub, height],
                    strokeColor: color,
                    strokeWidth: .3
                });
            }
        }

        // + 40 = fim linha acima
        for (var yActual = 0; yActual < height + 40; yActual += 50) {
            Plane.Shape.Create({
                type: 'line',
                x: [0, yActual],
                y: [width, yActual],
                strokeColor: color,
                strokeWidth: .6
            });

            // 10/20/30/40 = 4 linhas internas
            for (var yInternalSub = 1; yInternalSub <= 4; yInternalSub++) {
                // small part = 50/5 = 10px espaço entre as linhas
                var yActualSub = Math.round(yActual - 10 * yInternalSub);

                // como é subtraido - 10 (atrás/acima) para fazer as sub-linhas
                // verifico se não ultrapassou o height
                //            if (yActualSub < 0) {
                //                break;
                //            }

                Plane.Shape.Create({
                    type: 'line',
                    x: [0, yActualSub],
                    y: [width, yActualSub],
                    strokeColor: color,
                    strokeWidth: .3
                });
            }
        }
        Plane.Render.Update();
    };


    return {

        Initialize: function (config) {
            if ((config == null) || (typeof config == "function")) {
                throw new Error('Plane - Initialize - Config is not valid - See the documentation');
            }

            Plane.Events.Initialize(config);
            Plane.Render.Initialize(config);
            Plane.Layers.Initialize(config);
            Plane.Tools.Initialize(config);

            var style = Plane.Utility.Object.merge({
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            }, config.style || {});

            this.style = style;

            var gridEnable = style.gridEnable,
                gridColor = style.gridColor,
                width = config.viewPort.clientWidth,
                height = config.viewPort.clientHeight;

            gridDraw(gridEnable, width, height, gridColor);

            return true;

        },

        set style(value) {
            this._style = value;
        },
        get style() {
            return this._style;
        },

        set zoom(value) {
            this._zoom = value;
        },
        get zoom() {
            return this._zoom;
        },

        set center(value) {
            this._center = value;
        },
        get center() {
            return this._center;
        },

        importJSON: function () {

        },
        importSVG: function () {

        },
        importDxf: function () {

        },

        exportJSON: function () {

        },
        exportSVG: function () {

        },
        exportDxf: function () {

        },
        exportPng: function () {

        },
        exportPdf: function () {

        }

    }
}(window));
Plane.Events = (function (window, Plane) {
    "use strict";

    var viewPort = null;


    return {
        Initialize: function (config, callback) {
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Events - Initialize - Config is not valid - See the documentation');
            }

            viewPort = config.viewPort;

            Plane.__proto__ = new Plane.Utility.Event();
            Plane.Render.__proto__ = new Plane.Utility.Event();
            Plane.Layers.__proto__ = new Plane.Utility.Event();
            Plane.Tools.__proto__ = new Plane.Utility.Event();


            //capturando e traduzindo os eventos
            window.onresize = function (event) {
                Plane.dispatchEvent('onResize', event);
            }
            window.onkeydown = function (event) {
                //future: verificar a qual a melhor forma para capturar o maior número de teclas
                event = {
                    type: 'onKeyDown',
                    key: event.keyIdentifier.indexOf('+') > -1 ? String.fromCharCode(event.keyCode) : event.keyIdentifier
                };
                Plane.dispatchEvent('onKeyDown', event);
            };

            viewPort.onclick = function (event) {
                var position = {
                    x: event.clientX,
                    y: event.clientY
                };

                position = Plane.Utility.Graphic.mousePosition(viewPort, position);

                Plane.Tools.dispatchEvent('onClick', {
                    type: 'onClick',
                    x: position.x,
                    y: position.y
                });
            };
            viewPort.ondblclick = function (event) {
                Plane.Tools.dispatchEvent('onDblClick', event);
            };

            viewPort.onmousedown = function (event) {
                Plane.Tools.dispatchEvent('onMouseDown', event);
            };
            viewPort.onmouseup = function (event) {
                Plane.Tools.dispatchEvent('onMouseUp', event);
            };
            viewPort.onmousemove = function (event) {
                Plane.Tools.dispatchEvent('onMouseMove', event);
            };
            viewPort.onmousewheel = function (event) {
                Plane.Tools.dispatchEvent('onMouseWheel', event);
            };

            viewPort.oncontextmenu = function (event) {
                Plane.Tools.dispatchEvent('onContextMenu', event);
            }
            // capturando os eventos

            return true;
        }
    }

})(window, Plane);
Plane.Layers = (function (Plane) {
    "use strict";

    var layers = null;

    function Layer() {}

    Layer.prototype = {

        set uuid(value) {
            this._uuid = value;
        },
        get uuid() {
            return this._uuid;
        },

        set name(value) {
            if ((value != null) && (value != undefined) && (value != '')) {
                return this._name = value;
            }
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
            this._style = value;
        },
        get style() {
            return this._style;
        }
        
    }

    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Layer - Initialize - Config is not valid - See the documentation');
            }

            layers = new Plane.Utility.Dictionary();

            return true;
        },
        Create: function (name, style) {
            if ((name && (typeof name != 'string')) || (style && (typeof style != 'object'))) {
                throw new Error('Layer - Create - Layer Name is not valid - See the documentation');
            }

            name = name || 'New Layer ' + layers.count();
            style = style || {
                fillColor: 'rgb(255,0,0)',
                lineCap: 'round',
                lineWidth: 10,
                lineColor: 'rgb(255,0,0)',
            }

            var layer = new Layer(),
                uuid = Plane.Utility.Uuid(9, 16);

            layer.uuid = uuid;
            layer.name = name;
            layer.style = style;

            // add ao dictionary
            layers.add(uuid, layer);

            // seleciono como ativa
            this.Active = uuid;
            
            // crio o Render respectivo da Layer
            Plane.Render.Create(uuid);

            return true;
        },
        Remove: function (uuid) {
            return layers.remove(uuid);
        },
        List: function (callback) {
            return typeof callback == 'function' ?
                callback.call(this, layers.list()) :
                layers.list();
        },
        get Active() {
            return this._active;
        },
        set Active(uuid) {
            this.dispatchEvent('onDeactive', {
                type: 'onDeactive',
                layer: this.Active
            });

            this._active = layers.find(uuid);

            this.dispatchEvent('onActive', {
                type: 'onActive',
                layer: this.Active
            });
        }
    };

})(Plane);
Plane.Render = (function (Plane, document) {
    "use strict";

    var viewPort = null,
        renders = null;

    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Render - Initialize - Config is not valid - See the documentation');
            }

            if (!document.createElement('canvas').getContext) {
                throw new Error('No canvas support for this device');
            }

            viewPort = config.viewPort;
            renders = new Plane.Utility.Dictionary();

            return true;
        },
        Create: function (uuid) {
            var render = document.createElement('canvas');

            render.width = viewPort.clientWidth;
            render.height = viewPort.clientHeight;

            render.style.position = "absolute";
            render.style.backgroundColor = (renders.count() == 0) ? Plane.style.backgroundColor : 'transparent';

            // sistema cartesiano de coordenadas
            var context2D = render.getContext('2d');
            context2D.translate(0, render.height);
            context2D.scale(1, -1);

            // add ao html documment
            viewPort.appendChild(render);

            // add ao dictionary
            renders.add(uuid, render);

            return true;
        },
        Update: function () {

            Plane.dispatchEvent('onChange', {
                type: 'onChange',
                now: new Date().toISOString()
            });

            var uuid = Plane.Layers.Active.uuid,
                shapes = Plane.Shape.Search(uuid),
                render = renders.find(uuid),
                context2D = render.getContext('2d');

            // limpando o render
            context2D.clearRect(0, 0, render.width, render.height);

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

})(Plane, window.document);
/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @class Shape
 * @static
 */
Plane.Shape = (function (Plane) {
    "use strict";

    var shapes = [];



    return {
        Create: function (params) {

//            Plane.dispatchEvent('onChange', {
//                type: 'onChange',
//                now: new Date().toISOString()
//            });

            var uuid = Plane.Layers.Active.uuid;

            if (!shapes[uuid]) {
                shapes[uuid] = [];
            }

            shapes[uuid].push(params);

            return this;
        },

        Search: function (selector) {

            return shapes[selector];

        },

        Remove: function (shape) {

            return this;
        }
    };

})(Plane);
Plane.Tools = (function (Plane) {
    "use strict";

    var tools = null;

    function Tool() {}

    Tool.prototype = {

        set uuid(value) {
            this._uuid = value;
        },
        get uuid() {
            return this._uuid;
        },

        set name(value) {
            if ((value != null) && (value != undefined) && (value != '')) {
                return this._name = value;
            }
        },
        get name() {
            return this._name;
        },

        set active(value) {
            if ((value == true) || (value == false)) {
                this.dispatchEvent(value ? 'onActive' : 'onDeactive', {
                    type: value ? 'onActive' : 'onDeactive',
                    now: new Date().toISOString()

                });
                this._active = value;
            }
        },
        get active() {
            return this._active;
        }

    }


    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Tools - Initialize - Config is not valid - See the documentation');
            }

            tools = new Plane.Utility.Dictionary();

            // inicializando os eventos
            this.addEventListener('onResize', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onResize', event);
                    }
                });
            });
            this.addEventListener('onKeyPress', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onKeyPress', event);
                    }
                });
            });

            this.addEventListener('onClick', function (event) {

                var uuid = Plane.Layers.Active.uuid;

                Plane.Shape.Search(uuid).forEach(function (shape) {

                    if (shape.type == 'line') {

                        var a1 = {
                                x: shape.x[0],
                                y: shape.x[1]
                            },
                            a2 = {
                                x: shape.y[0],
                                y: shape.y[1]
                            },
                            b1 = {
                                x: event.x,
                                y: event.y
                            },
                            b2 = {
                                x: event.x + 1,
                                y: event.y + 1
                            }

                        Plane.Utility.Graphic.intersectionLine(a1, a2, b1, b2);

                    }

                });


                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onClick', event);
                    }
                });
            });
            this.addEventListener('onDblClick', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onClick', event);
                    }
                });
            });

            this.addEventListener('onMouseDown', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onMouseDown', event);
                    }
                });
            });
            this.addEventListener('onMouseUp', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onMouseUp', event);
                    }
                });
            });
            this.addEventListener('onMouseMove', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onMouseMove', event);
                    }
                });
            });
            this.addEventListener('onMouseWheel', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onMouseWheel', event);
                    }
                });
            });

            this.addEventListener('onContextMenu', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onContextMenu', event);
                    }
                });
            });
            // inicializando os eventos


            return true;
        },
        Create: function (name) {
            if (name && (typeof name != 'string')) {
                throw new Error('Tools - Create - Layer Name is not valid - See the documentation');
            }

            name = name || 'New Tool ' + tools.count();

            var tool = new Tool(),
                uuid = Plane.Utility.Uuid(9, 16);

            tool.__proto__.__proto__ = new Plane.Utility.Event();
            tool.uuid = uuid;
            tool.name = name;
            tool.active = false;

            // add ao dictionary
            tools.add(uuid, tool);

            return tool;
        },
        Remove: function (uuid) {
            return tools.remove(uuid);
        },
        List: function (callback) {
            return typeof callback == 'function' ?
                callback.call(this, tools.list()) :
                tools.list();
        }
    }


})(Plane);


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
Plane.Utility = (function (Plane) {
    "use strict";

    return {
        Uuid: function (length, radix) {

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
        Event: (function () {

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

        })(),
        Dictionary: (function () {

            function Dictionary() {
                this.store = new Array();
            }

            Dictionary.prototype = {
                add: function (key, value) {
                    this.store[key] = value;
                },
                find: function (key) {
                    return this.store[key];
                },
                remove: function (key) {
                    delete this.store[key];
                },
                count: function () {
                    return Object.keys(this.store).length;
                },
                list: function () {
                    var self = this;
                    return Object.keys(this.store).map(function (key) {
                        return self.store[key];
                    });
                }
            }

            return Dictionary;

        })(),
        Graphic: {
            mousePosition: function (element, position) {
                var bb = element.getBoundingClientRect();

                var x = (position.x - bb.left) * (element.clientWidth / bb.width);
                var y = (position.y - bb.top) * (element.clientHeight / bb.height);

                // tradução para o sistema de coordenadas cartesiano
                y = (y - element.clientHeight) * -1;

                return {
                    x: x,
                    y: y
                };
            },
            intersectionLine: function (a1, a2, b1, b2) {
                var uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
                    ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
                    uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
                if (uB !== 0) {
                    var ua = uaT / uB,
                        ub = ubT / uB;
                    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                        var xxx = (a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y));
                        
                        console.log('Intersection');
                        
//                        result = new Intersection('Intersection');
//                        result.points.push(new fabric.Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
                    } else {
                        var zzz = 'aa';
//                        result = new Intersection();
                    }
                } else {
                    if (uaT === 0 || ubT === 0) {
                        var sss = 'Coincident';
//                        result = new Intersection('Coincident');
                    } else {
                        var ttt = 'Parallel';
//                        result = new Intersection('Parallel');
                    }
                }
                return true;

            }
        },
        Object: {
            merge: function (first, second) {
                if (first == null || second == null)
                    return first;

                for (var key in second)
                    if (second.hasOwnProperty(key))
                        first[key] = second[key];

                return first;
            },
        }
    }

})(Plane);