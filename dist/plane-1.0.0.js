/*!
 * C37 in 25-05-2014 at 23:58:18 
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

        Plane.Layers.Create({
            system: true
        });

        for (var xActual = 0; xActual < width; xActual += 50) {
            Plane.Shape.Create({
                type: 'line',
                x: [xActual, 0],
                y: [xActual, height],
                style: {
                    lineColor: color,
                    lineWidth: .6
                }
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
                    style: {
                        lineColor: color,
                        lineWidth: .3
                    }
                });
            }
        }

        // + 40 = fim linha acima
        for (var yActual = 0; yActual < height + 40; yActual += 50) {
            Plane.Shape.Create({
                type: 'line',
                x: [0, yActual],
                y: [width, yActual],
                style: {
                    lineColor: color,
                    lineWidth: .6
                }
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
                    style: {
                        lineColor: color,
                        lineWidth: .3
                    }
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

        get style() {
            return this._style;
        },
        set style(value) {
            this._style = value;
        },

        get zoom() {
            return this._zoom || 1;
        },
        set zoom(value) {

            // Plane.zoom = Math.pow(1.03, 1);  - more
            // Plane.zoom = Math.pow(1.03, -1); - less
            
            var layerActiveUuid = Plane.Layers.Active.uuid;

            Plane.Layers.List('system > true').forEach(function (layer) {
                Plane.Layers.Active = layer.uuid;

                Plane.Render.Update({
                    zoom: value
                });
            });
            
            Plane.Layers.Active = layerActiveUuid;

            this._zoom = value;
        },

        get center() {
            return this._center || {
                x: 0,
                y: 0
            };
        },
        set center(value) {

            Plane.Render.Update({
                center: value
            });

            this._center = value;
        },

        importJson: function (stringJson) {

            var objectJson = JSON.parse(stringJson);

            for (var prop in objectJson) {
                var layer = objectJson[prop],
                    shapes = layer.shapes;

                Plane.Layers.Create(layer);

                shapes.forEach(function (shape) {
                    Plane.Shape.Create(shape);
                });

                Plane.Render.Update();
            }

            return true;
        },
        importSvg: function (stringSvg) {

        },
        importDxf: function (stringDxf) {
            try {
                var stringJson = Plane.Utility.Import.fromDxf(stringDxf);
                var objectDxf = JSON.parse(stringJson.replace(/u,/g, '').replace(/undefined,/g, ''));

                if (stringJson) {
                    Plane.Layers.Create();

                    for (var prop in objectDxf) {
                        Plane.Shape.Create(objectDxf[prop]);
                    }
                    Plane.Render.Update();
                }
            } catch (e) {
                var ppp = e;
            }
        },

        exportJson: function () {

            var stringJson = '[';

            Plane.Layers.List().forEach(function (layer) {

                stringJson += stringJson.substring(stringJson.length - 1, stringJson.length) == '[' ? '' : ',';
                stringJson += layer.toJson();

                stringJson = stringJson.substring(0, stringJson.length - 1);
                stringJson += ', \"shapes\": ['

                Plane.Shape.Search('layer > uuid > '.concat(layer.uuid)).forEach(function (shape) {
                    stringJson += stringJson.substring(stringJson.length - 1, stringJson.length) == '[' ? '' : ',';
                    stringJson += shape.toJson();
                });

                stringJson += ']}';
            });

            return stringJson += ']';

        },
        exportSvg: function () {

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
                var position = {
                    x: event.clientX,
                    y: event.clientY
                };

                position = Plane.Utility.Graphic.mousePosition(viewPort, position);

                Plane.Tools.dispatchEvent('onMouseMove', {
                    type: 'onMouseMove',
                    x: position.x,
                    y: position.y
                });
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

    function Layer(attrs) {
        for (var name in attrs) {
            if (name in this) {
                this[name] = attrs[name];
            }
        }
    }

    Layer.prototype = {

        get uuid() {
            return this._uuid;
        },
        set uuid(value) {
            this._uuid = value;
        },

        get name() {
            return this._name;
        },
        set name(value) {
            if ((value != null) && (value != undefined) && (value != '')) {
                return this._name = value;
            }
        },

        get locked() {
            return this._locked;
        },
        set locked(value) {
            this._locked = value;
        },

        get visible() {
            return this._visible;
        },
        set visible(value) {
            this._visible = value;
        },

        get style() {
            return this._style;
        },
        set style(value) {
            this._style = value;
        },

        get system() {
            return this._system;
        },
        set system(value) {
            this._system = value;
        },

        toJson: function () {
            return JSON.stringify(this).replace(/_/g, '');
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
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Layer - Create - Attrs is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }

            attrs = Plane.Utility.Object.merge({
                uuid: Plane.Utility.Uuid(9, 16),
                name: (attrs && attrs.name) ? attrs.name : 'New Layer ' + layers.count(),
                style: (attrs && attrs.style) ? attrs.style : {
                    fillColor: 'rgb(0,0,0)',
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    lineWidth: 1,
                    lineColor: 'rgb(0, 0, 0)',
                },
                selectable: true,
                locked: false,
                visible: true,
                system: false
            }, attrs);

            var layer = new Layer(attrs);

            // add ao dictionary
            layers.add(layer.uuid, layer);

            // seleciono como ativa
            this.Active = layer.uuid;

            // crio o Render respectivo da Layer
            Plane.Render.Create(layer.uuid);
            // inicializo o Container de shapes respectivo da Layer
            Plane.Shape.Initialize({
                uuid: layer.uuid
            });

            return true;
        },
        Remove: function (uuid) {
            return layers.remove(uuid);
        },
        List: function (selector) {

            var layerList = layers.list().filter(function (layer) {
                return selector ? layer : !layer.system;
            });

            return layerList;
        },
        get Active() {
            return this._active;
        },
        set Active(value) {
            this.dispatchEvent('onDeactive', {
                type: 'onDeactive',
                layer: this.Active
            });

            this._active = layers.find(value);

            this.dispatchEvent('onActive', {
                type: 'onActive',
                layer: this.Active
            });
        }
    };

})(Plane);
Plane.Point = (function (Plane) {
    "use strict";

    return {
        Create: function (attrs) {

        }
    }

    
    
    
})(Plane);
Plane.Render = (function (Plane, Document, Math) {
    "use strict";

    var viewPort = null,
        renders = null;

    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Render - Initialize - Config is not valid - See the documentation');
            }

            if (!Document.createElement('canvas').getContext) {
                throw new Error('No canvas support for this device');
            }

            viewPort = config.viewPort;
            renders = new Plane.Utility.Dictionary();

            return true;
        },
        Create: function (uuid) {
            var render = Document.createElement('canvas');

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
        Update: function (params) {

            Plane.dispatchEvent('onChange', {
                type: 'onChange',
                now: new Date().toISOString()
            });

            var layerUuid = Plane.Layers.Active.uuid,
                layerStyle = Plane.Layers.Active.style,
                shapes = Plane.Shape.Search('layer > uuid > '.concat(layerUuid)),
                render = renders.find(layerUuid),
                context2D = render.getContext('2d');


            // limpando o render
            context2D.clearRect(0, 0, render.width, render.height);

            if (params && params.center) {
                context2D.translate(params.center.x, params.center.y);
            }
            if (params && params.zoom) {
                context2D.scale(params.zoom, params.zoom);
            }

            shapes.forEach(function (shape) {

                // save state of all configuration
                context2D.save();

                context2D.beginPath();

                // style of shape or layer
                context2D.lineWidth = (shape.style && shape.style.lineWidth) ? shape.style.lineWidth : layerStyle.lineWidth;
                context2D.strokeStyle = (shape.style && shape.style.lineColor) ? shape.style.lineColor : layerStyle.lineColor;
                context2D.lineCap = (shape.style && shape.style.lineCap) ? shape.style.lineCap : layerStyle.lineCap;
                context2D.lineJoin = (shape.style && shape.style.lineJoin) ? shape.style.lineJoin : layerStyle.lineJoin;


                //https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes

                switch (shape.type) {
                case 'line':
                    {
                        context2D.moveTo(shape.x[0], shape.x[1]);
                        context2D.rotate((Math.PI / 180) * shape.angle);

                        context2D.lineTo(shape.y[0], shape.y[1]);
                        break;
                    }
                case 'rectangle':
                    {
                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((Math.PI / 180) * shape.angle);

                        context2D.strokeRect(0, 0, shape.width, shape.height);
                        break;
                    }
                case 'arc':
                    {
                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((Math.PI / 180) * shape.angle);

                        context2D.arc(0, 0, shape.radius, (Math.PI / 180) * shape.startAngle, (Math.PI / 180) * shape.endAngle, shape.clockWise);
                        break;
                    }
                case 'circle':
                    {
                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((Math.PI / 180) * shape.angle);

                        context2D.arc(0, 0, shape.radius, 0, Math.PI * 2, true);
                        break;
                    }
                case 'ellipse':
                    {
                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((Math.PI / 180) * shape.angle);

                        context2D.ellipse(0, 0, shape.width, shape.height, 0, 0, Math.PI * 2)
                        break;
                    }
                case 'polygon':
                    {
                        var a = ((Math.PI * 2) / shape.sides);

                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((Math.PI / 180) * shape.angle);

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

                context2D.stroke();

                // restore state of all configuration
                context2D.restore();

            });
        }



    };

})(Plane, window.document, Math);
/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @class Shape
 * @static
 */
Plane.Shape = (function (Plane, Math) {
    "use strict";

    var shapes = {};

    function Shape(attrs) {
        for (var name in attrs) {
            if (name in this) {
                this[name] = attrs[name];
            }
        }
    }

    Shape.prototype = {

        get uuid() {
            return this._uuid;
        },
        set uuid(value) {
            this._uuid = value;
        },

        get name() {
            return this._name;
        },
        set name(value) {
            this._name = value;
        },

        get type() {
            return this._type;
        },
        set type(value) {
            this._type = value;
        },

        get locked() {
            return this._locked;
        },
        set locked(value) {
            this._locked = value;
        },

        get visible() {
            return this._visible;
        },
        set visible(value) {
            this._visible = value;
        },

        get x() {
            return this._x;
        },
        set x(value) {
            this._x = value;
        },

        get y() {
            return this._y;
        },
        set y(value) {
            this._y = value;
        },

        get angle() {
            return this._angle;
        },
        set angle(value) {
            this._angle = value;
        },

        get scaleX() {
            return this._scaleX;
        },
        set scaleX(value) {
            this._scaleX = value;
        },

        get scaleY() {
            return this._scaleY;
        },
        set scaleY(value) {
            this._scaleY = value;
        },

        get selectable() {
            return this._selectable;
        },
        set selectable(value) {
            this._selectable = value;
        },

        get style() {
            return this._style;
        },
        set style(value) {
            this._style = value;
        },

        get radius() {
            return this._radius;
        },
        set radius(value) {
            if ((this.type != 'polygon') && (this.type != 'arc') && (this.type != 'circle')) {
                throw new Error('Shape - Create - Radius not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._radius = value;
        },

        get sides() {
            return this._sides;
        },
        set sides(value) {
            if ((this.type != 'polygon') && (this.type != 'arc')) {
                throw new Error('Shape - Create - Sides not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            if (value < 3) {
                throw new Error('Shape - Create - Incorrect number of sides \nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._sides = value;
        },

        get height() {
            return this._height;
        },
        set height(value) {
            if ((this.type != 'rectangle') && (this.type != 'ellipse')) {
                throw new Error('Shape - Create - Height not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._height = value;
        },

        get width() {
            return this._width;
        },
        set width(value) {
            if ((this.type != 'rectangle') && (this.type != 'ellipse')) {
                throw new Error('Shape - Create - Width not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._width = value;
        },

        get startAngle() {
            return this._startAngle;
        },
        set startAngle(value) {
            if (this.type != 'arc') {
                throw new Error('Shape - Create - Start Angle not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._startAngle = value;
        },

        get endAngle() {
            return this._endAngle;
        },
        set endAngle(value) {
            if (this.type != 'arc') {
                throw new Error('Shape - Create - End Angle not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._endAngle = value;
        },

        get clockWise() {
            return this._clockWise;
        },
        set clockWise(value) {
            if (this.type != 'arc') {
                throw new Error('Shape - Create - Clockwise not correct for the ' + this.type + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            this._clockWise = value;
        },

        toJson: function () {
            return JSON.stringify(this).replace(/_/g, '');
        }
    }

    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Shape - Initialize - Config is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }

            var layerUuid = config.uuid;
            shapes[layerUuid] = new Plane.Utility.Dictionary();

            return true;
        },
        Create: function (attrs) {
            if ((typeof attrs == "function") || (attrs == null)) {
                throw new Error('Shape - Create - Attrs is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            if (['polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse'].indexOf(attrs.type.toLowerCase()) == -1) {
                throw new Error('Shape - Create - Type is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            if ((attrs.x == undefined) || (attrs.y == undefined)) {
                throw new Error('Shape - Create - X and Y is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }


            var shape = null,
                uuid = Plane.Utility.Uuid(9, 16);

            attrs = Plane.Utility.Object.merge({
                uuid: uuid,
                name: 'Shape ' + uuid,
                type: attrs.type.toLowerCase(),
                selectable: true,
                locked: false,
                visible: true,
                angle: 0,
                scaleX: 0,
                scaleY: 0
            }, attrs);

            shape = new Shape(attrs);

            var layerUuid = Plane.Layers.Active.uuid;
            shapes[layerUuid].add(shape.uuid, shape);

            return this;
        },

        Search: function (selector) {

            if (selector == undefined){
                return [];
            }
            if ((Plane.Layers.Active.system) && !selector.contains('layer') && !selector.contains('uuid')){
                return [];
            }

            var layerUuid = Plane.Layers.Active.uuid;

            if (!selector) {
                return shapes[layerUuid].list();
            }

            if (selector.contains('shape') && selector.contains('uuid')) {
                return shapes[layerUuid].find(selector.substring(selector.length - 9, selector.length));
            }

            if (selector.contains('layer') && selector.contains('uuid')) {
                return shapes[selector.substring(selector.length - 9, selector.length)].list();
            }
        },

        Remove: function (shape) {

            return this;
        }
    };

})(Plane, Math);
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

                Plane.Shape.Search().forEach(function (shape) {

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

                Plane.Shape.Search().forEach(function (shape) {

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



                //                tools.list().forEach(function (tool) {
                //                    if (tool.active) {
                //                        tool.dispatchEvent('onMouseMove', event);
                //                    }
                //                });


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
            intersectionLine: function (A, B, C, D) {

                function ccw(A, B, C) {
                    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
                }

                var xxx = ccw(A, C, D) != ccw(B, C, D) && ccw(A, B, C) != ccw(A, B, D);

                if (xxx) {
                    console.log('Intersection');
                }

                //                def ccw(A, B, C): return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x)
                //
                //                def intersect(A, B, C, D): return ccw(A, C, D) != ccw(B, C, D) and ccw(A, B, C) != ccw(A, B, D)

                return xxx;

                //            intersectionLine: function (a1, a2, b1, b2) {

                //                var uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
                //                    ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
                //                    uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
                //                if (uB !== 0) {
                //                    var ua = uaT / uB,
                //                        ub = ubT / uB;
                //                    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                //                        var xxx = (a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y));
                //                        
                //                        console.log('Intersection');
                //                        
                ////                        result = new Intersection('Intersection');
                ////                        result.points.push(new fabric.Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
                //                    } else {
                //                        var zzz = 'aa';
                ////                        result = new Intersection();
                //                    }
                //                } else {
                //                    if (uaT === 0 || ubT === 0) {
                //                        var sss = 'Coincident';
                ////                        result = new Intersection('Coincident');
                //                    } else {
                //                        var ttt = 'Parallel';
                ////                        result = new Intersection('Parallel');
                //                    }
                //                }
                //                return true;

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
        },
        String: (function () {

            if (!String.prototype.format) {
                String.prototype.format = function () {
                    var args = arguments;
                    return this.replace(/{(\d+)}/g, function (match, number) {
                        return typeof args[number] != 'undefined' ? args[number] : match;
                    });
                };
            }

            if (!String.prototype.contains) {
                String.prototype.contains = function () {
                    return String.prototype.indexOf.apply(this, arguments) !== -1;
                };
            }

        })(),
        Import: {
            fromDxf: function (stringDxf) {
                "use strict";

                function aaaa(dxfObject) {

                    switch (dxfObject.type) {
                    case 'LINE':
                        {
                            var line = '{ "type": "line", "x": [{0}, {1}], "y": [{2}, {3}] }';
                            return line.format(dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1);
                        }
                    case 'CIRCLE':
                        {
                            var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} }';
                            return circle.format(dxfObject.x, dxfObject.y, dxfObject.r);
                        }
                    case 'ARC':
                        {
                            var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2},"startAngle": {3}, "endAngle": {4}, "clockWise": {5} }';
                            return arc.format(dxfObject.x, dxfObject.y, dxfObject.r, dxfObject.a0, dxfObject.a1, false);
                        }
                    }

                }


                function dxfObjectToSvgSnippet(dxfObject) {
                    function getLineSvg(x1, y1, x2, y2) {
                        return '<path d="M{0},{1} {2},{3}"/>\n'.format(x1, y1, x2, y2);
                    }

                    function deg2rad(deg) {
                        return deg * (Math.PI / 180);
                    }

                    switch (dxfObject.type) {
                    case 'LINE':
                        return getLineSvg(dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1);
                    case 'CIRCLE':
                        return '<circle cx="{0}" cy="{1}" r="{2}"/>\n'.format(dxfObject.x, dxfObject.y, dxfObject.r);
                    case 'ARC':
                        var x1 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a0));
                        var y1 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a0));
                        var x2 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a1));
                        var y2 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a1));

                        if (dxfObject.a1 < dxfObject.a0) {
                            dxfObject.a1 += 360;
                        }
                        var largeArcFlag = dxfObject.a1 - dxfObject.a0 > 180 ? 1 : 0;

                        return '<path d="M{0},{1} A{2},{3} 0 {4},1 {5},{6}"/>\n'.format(x1, y1, dxfObject.r, dxfObject.r, largeArcFlag, x2, y2);
                    case 'LWPOLYLINE':
                        var svgSnippet = '';
                        var vertices = dxfObject.vertices;
                        for (var i = 0; i < vertices.length - 1; i++) {
                            var vertice1 = vertices[i];
                            var vertice2 = vertices[i + 1];
                            svgSnippet += getLineSvg(vertice1.x, vertice1.y, vertice2.x, vertice2.y);
                        }
                        return svgSnippet;
                    }
                }

                var groupCodes = {
                    0: 'entityType',
                    2: 'blockName',
                    10: 'x',
                    11: 'x1',
                    20: 'y',
                    21: 'y1',
                    40: 'r',
                    50: 'a0',
                    51: 'a1'
                };

                var supportedEntities = ['LINE', 'CIRCLE', 'ARC', 'LWPOLYLINE'];

                var counter = 0;
                var code = null;
                var isEntitiesSectionActive = false;
                var object = {};
                var svg = '',
                    json = '[';

                // Normalize platform-specific newlines.
                stringDxf = stringDxf.replace(/\r\n/g, '\n');
                stringDxf = stringDxf.replace(/\r/g, '\n');

                stringDxf.split('\n').forEach(function (line) {
                    line = line.trim();

                    if (counter++ % 2 === 0) {
                        code = parseInt(line);
                    } else {
                        var value = line;
                        var groupCode = groupCodes[code];
                        if (groupCode === 'blockName' && value === 'ENTITIES') {
                            isEntitiesSectionActive = true;
                        } else if (isEntitiesSectionActive) {
                            if (groupCode === 'entityType') { // New entity starts.
                                if (object.type) {
                                    json += json.substring(json.length - 1, json.length) == '[' ? '' : ',';
                                    json += aaaa(object);
                                }

                                object = supportedEntities.indexOf(value) > -1 ? {
                                    type: value
                                } : {};

                                if (value === 'ENDSEC') {
                                    isEntitiesSectionActive = false;
                                }
                            } else if (object.type && typeof groupCode !== 'undefined') { // Known entity property recognized.
                                object[groupCode] = parseFloat(value);

                                if (object.type == 'LWPOLYLINE' && groupCode === 'y') {
                                    if (!object.vertices) {
                                        object.vertices = [];
                                    }
                                    object.vertices.push({
                                        x: object.x,
                                        y: object.y
                                    });
                                }
                            }
                        }
                    }
                });

                return json += ']';

            }
        }
    }

})(Plane);