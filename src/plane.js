window.Plane = (function (window, document, math) {
    "use strict";

    var version = '1.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var layerStore = null,
        renderStore = null,
        toolStore = null;

    var shapeStore = null,
        groupStore = null;

    var viewPort = null,
        settings = null;


    function gridDraw(enabled, width, height, color) {

        if (!enabled) return;

        Plane.Layer.Create({
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


    var utility = (function () {

        var utility = {
            math: {
                uuid: function (length, radix) {
                    // http://www.ietf.org/rfc/rfc4122.txt
                    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
                        uuid = [],
                        i;
                    radix = radix || chars.length;

                    if (length) {
                        for (i = 0; i < length; i++) uuid[i] = chars[0 | Math.random() * radix];
                    } else {
                        var r;

                        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                        uuid[14] = '4';

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
            object: {
                merge: function (first, second) {
                    if (first == null || second == null)
                        return first;

                    for (var key in second)
                        if (second.hasOwnProperty(key))
                            first[key] = second[key];

                    return first;
                },
                extend: function (base, object) {
                    var obj = new base();
                    for (var prop in object)
                        obj[prop] = object[prop];
                    return obj;
                },
                inherit: function (subClass, superClass) {},
                event: (function () {

                    function Event() {
                        this.listeners = {};
                    }

                    Event.prototype.listen = function (event, handler) {
                        if (this.listeners[event] === undefined) {
                            this.listeners[event] = [];
                        }
                        this.listeners[event].push(handler);
                    };

                    Event.prototype.notify = function (event, data) {
                        if (this.listeners[event] !== undefined) {
                            for (var callback in this.listeners[event]) {
                                this.listeners[event][callback].call(this, data);
                            }
                        }
                    };

                    Event.prototype.unlisten = function (event, handler) {
                        if (this.listeners[event] !== undefined) {
                            var index = this.listeners[event].indexOf(handler);
                            if (index !== -1) {
                                this.listeners[event].splice(index, 1);
                            }
                        }
                    };

                    return Event;
                })(),
                dictionary: (function () {

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
                })()
            },
            graphic: {
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
                intersection: {
                    circleLine: function (c, r, a1, a2) {
                        var result;
                        var a = (a2.x - a1.x) * (a2.x - a1.x) +
                            (a2.y - a1.y) * (a2.y - a1.y);
                        var b = 2 * ((a2.x - a1.x) * (a1.x - c.x) +
                            (a2.y - a1.y) * (a1.y - c.y));
                        var cc = c.x * c.x + c.y * c.y + a1.x * a1.x + a1.y * a1.y -
                            2 * (c.x * a1.x + c.y * a1.y) - r * r;
                        var deter = b * b - 4 * a * cc;

                        if (deter < 0) {
                            result = false;
                        } else if (deter == 0) {
                            result = false;
                        } else {
                            var e = Math.sqrt(deter);
                            var u1 = (-b + e) / (2 * a);
                            var u2 = (-b - e) / (2 * a);

                            if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
                                if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
                                    result = false;
                                } else {
                                    result = false;
                                }
                            } else {
                                result = true;
                            }
                        }
                        return result;
                    },
                    circleRectangle: function (c, r, p, h, w) {

                        var rightBottom = Point.Create(p.x + w, p.y),
                            rightTop = Point.Create(p.x + w, p.y + h),
                            leftTop = Point.Create(p.x, p.y + h),
                            leftBottom = Point.Create(p.x, p.y);

                        var inter1 = this.circleLine(c, r, rightBottom, rightTop);
                        var inter2 = this.circleLine(c, r, rightTop, leftTop);
                        var inter3 = this.circleLine(c, r, leftTop, leftBottom);
                        var inter4 = this.circleLine(c, r, leftBottom, rightBottom);

                        return inter1 || inter2 || inter3 || inter4;
                    }
                }
            },
            string: {
                format: function () {
                    return this.replace(/{(\d+)}/g, function (match, number) {
                        return typeof arguments[number] != 'undefined' ? arguments[number] : match;
                    });
                },
                contains: function () {
                    return String.prototype.indexOf.apply(this, arguments) !== -1;
                }
            },
            import: {
                fromJson: null,
                fromSvg: null,
                fromDxf: null,
                fromDwg: null
            },
            export: {
                toJson: null,
                toSvg: null,
                toDxf: null,
                toPng: null,
                toPdf: null
            }
        };

        return utility;

    })();


    var Layer = (function () {

        function Layer(attrs) {

            this.uuid = attrs.uuid;
            this.name = attrs.name;
            this.locked = attrs.locked;
            this.visible = attrs.visible;
            this.system = attrs.system;
            this.style = attrs.style;

        }
        Layer.prototype = new utility.object.event();

        Layer.prototype.toJson = function () {
            return JSON.stringify(this).replace(/_/g, '');
        }

        return {
            Create: function (uuid, name, style, system) {

                var attrs = {
                    uuid: uuid,
                    name: name,
                    style: style,
                    locked: false,
                    visible: true,
                    system: system
                };

                return new Layer(attrs);
            }
        };
    })();

    var Point = (function () {

        function Point(x, y) {
            this.x = x;
            this.y = y;
        };

        return {
            Create: function (x, y) {
                return new Point(x, y);
            }
        }
    })();

    var Shape = (function () {

        function Shape(uuid, name, locked, visible, selected) {

            this.uuid = uuid;
            this.name = name;
            this.locked = locked;
            this.visible = visible;
            this.selected = selected;

        };
        Shape.prototype = {
            rotate: function (value) {
                return true;
            },
            scale: function (value) {
                return this;
            },
            move: function (point) {
                return true;
            },
            contains: function (pointActual) {

                var pointOrigin,
                    pointDestination,
                    pointIntersection = 0;

                switch (this.type) {
                case 'line' || 'polygon':
                    {
                        for (var i = 0; i < this.points.length; i++) {

                            if (i + 1 == this.points.length) {
                                pointOrigin = this.points[i];
                                pointDestination = this.points[0];
                            } else {
                                pointOrigin = this.points[i];
                                pointDestination = this.points[i + 1];
                            }

                            if (utility.graphic.intersection.circleLine(pointActual, 2, pointOrigin, pointDestination))
                                return true;
                        }
                    }
                case 'rectangle':
                    {
                        if (utility.graphic.intersection.circleRectangle(pointActual, 2, this.point, this.height, this.width))
                            return true;
                    }
                case 'arc':
                    {}
                case 'circle':
                    {}
                case 'ellipse':
                    {}
                default:
                    break;
                }

                return false;
            },
            toJson: function () {
                return JSON.stringify(this);
            }
        };

        function Arc(attrs) {
            this.point = null;
            this.radius = 0;
            this.startAngle = 0;
            this.endAngle = 0;
            this.clockWise = 0;

            Shape.call(this, attrs);
        };
        Arc.prototype = new Shape();

        function Circle(attrs) {
            this.point = null;
            this.radius = 0;

            Shape.call(this, attrs);
        }
        Circle.prototype = new Shape();

        function Ellipse(attrs) {
            this.point = null;
            this.height = 0;
            this.width = 0;

            Shape.call(this, attrs);
        }
        Ellipse.prototype = new Shape();

        function Line(attrs) {
            this.type = 'line';
            this.points = attrs.points;
            this.style = attrs.style;
            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Line.prototype = Shape.prototype;

        function Polygon(attrs) {
            this.type = 'polygon';
            this.points = attrs.points;
            this.sides = attrs.sides;
            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Polygon.prototype = Shape.prototype;

        function Rectangle(attrs) {
            this.type = 'rectangle';
            this.point = attrs.point;
            this.height = attrs.height;
            this.width = attrs.width;
            Shape.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Rectangle.prototype = new Shape();

        return {
            Create: function (uuid, type, x, y, style, radius, startAngle, endAngle, clockWise, sides, height, width) {

                var attrs = {
                    uuid: uuid,
                    name: 'Shape '.concat(uuid),
                    style: style,
                    locked: false,
                    visible: true,
                    selected: false
                };

                switch (type) {
                case 'line':
                    {
                        attrs.points = [Point.Create(x[0], x[1]), Point.Create(y[0], y[1])];
                        return new Line(attrs);
                    }
                case 'rectangle':
                    {
                        attrs.point = Point.Create(x, y);
                        attrs.height = height;
                        attrs.width = width;
                        return new Rectangle(attrs);
                    }
                case 'arc':
                    {

                        break;
                    }
                case 'circle':
                    {

                        break;
                    }
                case 'ellipse':
                    {

                        break;
                    }
                case 'polygon':
                    {
                        attrs.points = [];
                        attrs.sides = sides;

                        for (var i = 0; i < sides; i++) {

                            var pointX = (radius * math.cos(((math.PI * 2) / sides) * i) + x),
                                pointY = (radius * math.sin(((math.PI * 2) / sides) * i) + y);

                            attrs['points'].push(Point.Create(pointX, pointY));
                        }

                        return new Polygon(attrs);
                    }
                default:
                    break;
                }

            }
        }


    })();

    var Group = (function () {

    })();

    var Tool = (function () {

        function Tool(attrs) {
            this.uuid = attrs.uuid;
            this.name = attrs.name;

            this.__defineGetter__('active', function () {
                return this._active || false;
            });
            this.__defineSetter__('active', function (value) {
                this.notify(value ? 'onActive' : 'onDeactive', {
                    type: value ? 'onActive' : 'onDeactive',
                    now: new Date().toISOString()

                });
                this._active = value;
            });

            utility.object.event.call(this);
        }
        Tool.prototype = utility.object.event.prototype;

        return {
            Create: function (uuid, name) {

                var attrs = {
                        uuid: uuid,
                        name: name
                    },
                    tool = new Tool(attrs);

                return tool;
            }
        }


    })();

    var Render = (function () {

        return {
            Create: function (uuid, width, height, backgroundColor) {

                var render = document.createElement('canvas');

                render.width = width;
                render.height = height;

                render.style.position = "absolute";
                render.style.backgroundColor = backgroundColor || 'transparent';

                // sistema cartesiano de coordenadas
                var context2D = render.getContext('2d');
                context2D.translate(0, render.height);
                context2D.scale(1, -1);

                return render;
            },
            Update: function () {

                var layerUuid = layerFacade.Active.uuid,
                    layerStyle = layerFacade.Active.style,
                    layerShapes = shapeStore[layerUuid].list(),
                    layerRender = renderStore[layerUuid],
                    context2D = layerRender.getContext('2d');

                //https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial

                // limpando o render
                context2D.clearRect(0, 0, layerRender.width, layerRender.height);
                // alinhando com o centro
                context2D.translate(planeFacade.center.x, planeFacade.center.y);

                //                debugger;

                // save state of all configuration
                context2D.save();

                // style of layer
                context2D.lineCap = layerStyle.lineCap;
                context2D.lineJoin = layerStyle.lineJoin;

                // render para cada shape
                layerShapes.forEach(function (shape) {

                    context2D.beginPath();

                    // possivel personalização
                    context2D.lineWidth = (shape.style && shape.style.lineWidth) ? shape.style.lineWidth : layerStyle.lineWidth;
                    context2D.strokeStyle = (shape.style && shape.style.lineColor) ? shape.style.lineColor : layerStyle.lineColor;

                    switch (shape.type) {
                    case 'line':
                        {
                            context2D.moveTo(shape.points[0].x, shape.points[0].y);
                            context2D.lineTo(shape.points[1].x, shape.points[1].y);
                            break;
                        }
                    case 'rectangle':
                        {
                            context2D.translate(shape.point.x, shape.point.y);
                            context2D.strokeRect(0, 0, shape.width, shape.height);
                            break;
                        }
                    case 'arc':
                        {
                            context2D.translate(shape.x, shape.y);
                            context2D.rotate((math.PI / 180) * shape.angle);

                            context2D.arc(0, 0, shape.radius, (math.PI / 180) * shape.startAngle, (math.PI / 180) * shape.endAngle, shape.clockWise);
                            break;
                        }
                    case 'circle':
                        {
                            context2D.translate(shape.x, shape.y);
                            context2D.rotate((math.PI / 180) * shape.angle);

                            context2D.arc(0, 0, shape.radius, 0, math.PI * 2, true);
                            break;
                        }
                    case 'ellipse':
                        {
                            context2D.translate(shape.x, shape.y);
                            context2D.rotate((math.PI / 180) * shape.angle);

                            context2D.ellipse(0, 0, shape.width, shape.height, 0, 0, math.PI * 2)
                            break;
                        }
                    case 'polygon':
                        {
                            context2D.moveTo(shape.points[0].x, shape.points[0].y);

                            shape.points.forEach(function (point) {
                                context2D.lineTo(point.x, point.y);
                            });

                            context2D.closePath();
                            break;
                        }
                    default:
                        break;
                    }

                    context2D.stroke();
                });
                // restore state of all configuration
                context2D.restore();
            }
        }

    })();

    var layerFacade = utility.object.extend(utility.object.event, {
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Layer - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            var uuid = utility.math.uuid(9, 16),
                attrs = utility.object.merge({
                    uuid: uuid,
                    name: 'New Layer ' + layerStore.count(),
                    style: {
                        fillColor: 'rgb(0,0,0)',
                        lineCap: 'butt',
                        lineJoin: 'miter',
                        lineWidth: .7,
                        lineColor: 'rgb(0, 0, 0)',
                    },
                    locked: false,
                    visible: true,
                    system: false
                }, attrs),
                layer = Layer.Create(attrs.uuid, attrs.name, attrs.style, attrs.system),
                render = Render.Create(uuid, viewPort.clientWidth, viewPort.clientHeight, layerStore.count() == 0 ? settings.backgroundColor : null);

            // add render ao html 76yv
            viewPort.appendChild(render);

            // add layer ao dictionary
            layerStore.add(uuid, layer);

            // add render & shape & group ao object
            renderStore[uuid] = render;
            shapeStore[uuid] = new utility.object.dictionary();
            groupStore[uuid] = new utility.object.dictionary();

            // colocando a nova layer como ativa
            this.Active = layer.uuid;
        },
        Delete: null
    });
    Object.defineProperty(layerFacade, 'Active', {
        get: function () {
            return this._active || {};
        },
        set: function (value) {
            this.notify('onDeactive', {
                type: 'onDeactive',
                layer: this._active
            });

            this._active = layerStore.find(value);

            this.notify('onActive', {
                type: 'onActive',
                layer: this._active
            });
        }
    });

    var shapeFacade = utility.object.extend(utility.object.event, {
        Create: function (attrs) {
            if ((typeof attrs == "function") || (attrs == null)) {
                throw new Error('Shape - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (['polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse'].indexOf(attrs.type.toLowerCase()) == -1) {
                throw new Error('Shape - Create - Type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if ((attrs.x == undefined) || (attrs.y == undefined)) {
                throw new Error('Shape - Create - X and Y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            attrs = utility.object.merge({
                uuid: utility.math.uuid(9, 16)
            }, attrs);

            var shape = Shape.Create(attrs.uuid, attrs.type, attrs.x, attrs.y, attrs.style, attrs.radius, attrs.starAngle,
                attrs.endAngle, attrs.clockWise, attrs.sides, attrs.height, attrs.width);

            shapeStore[layerFacade.Active.uuid].add(shape.uuid, shape);

            return true;
        },
        Delete: null
    });

    var groupFacade = utility.object.extend(utility.object.event, {
        Create: null,
        Update: null,
        Delete: null
    });

    var toolFacade = utility.object.extend(utility.object.event, {
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            attrs = utility.object.merge({
                uuid: utility.math.uuid(9, 16),
                name: 'Tool '.concat(toolStore.count())
            }, attrs);

            var tool = Tool.Create(attrs.uuid, attrs.name);

            toolStore.add(attrs.uuid, tool);

            return true;
        },
        Delete: null
    });
    // register events
    toolFacade.listen('onMouseMove', function (event) {
        //    toolFacade.listen('onClick', function (event) {
        var position = {
            x: event.clientX,
            y: event.clientY
        };

        position = utility.graphic.mousePosition(viewPort, position);

        console.log(position);

        var layerUuid = layerFacade.Active.uuid,
            layerShapes = shapeStore[layerUuid].list();


        layerShapes.forEach(function (shape) {

            if (shape.contains(Point.Create(position.x, position.y))) {

                console.log(shape);

            }


        });






        //        toolFacade.notify('onMouseMove', {
        //            type: 'onMouseMove',
        //            x: position.x,
        //            y: position.y
        //        });

        //        console.log(event);
        //console.log(position);
    });
    // register events

    var renderFacade = utility.object.extend(utility.object.event, {
        Update: function () {

            this.notify('onChange', {
                type: 'onChange',
                now: new Date().toISOString()
            });

            Render.Update();
        }
    });


    var planeFacade = utility.object.extend(utility.object.event, {
        Initialize: function (config) {
            // verificações para as configurações
            if (config == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (typeof config == "function") {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (config.viewPort == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            // verificações para as configurações

            viewPort = config.viewPort;
            settings = utility.object.merge({
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            }, config.settings || {});

            // dicionarios para dados
            layerStore = new utility.object.dictionary();
            toolStore = new utility.object.dictionary();
            // dicionarios para dados

            // objetos para dados
            renderStore = {};
            shapeStore = {};
            groupStore = {};
            // objetos para dados

            // start em eventos
            viewPort.onmousemove = function (event) {
                toolFacade.notify('onMouseMove', event);
            };
            viewPort.onclick = function (event) {
                toolFacade.notify('onClick', event);
            }
            // start em eventos

            gridDraw(settings.gridEnable, viewPort.clientWidth, viewPort.clientHeight, settings.gridColor);

            return true;
        },
        Layer: layerFacade,
        Shape: shapeFacade,
        Group: groupFacade,
        Tool: toolFacade,
        Render: renderFacade,
        Import: {
            fromJson: null,
            fromSvg: null,
            fromDxf: null,
            fromDwg: null
        },
        Export: {
            toJson: null,
            toSvg: null,
            toDxf: null,
            toPng: null,
            toPdf: null
        }
    });
    Object.defineProperty(planeFacade, 'center', {
        get: function () {
            return this._center || {
                x: 0,
                y: 0
            };
        },
        set: function (value) {
            this._center = value;
        }
    })
    Object.defineProperty(planeFacade, 'zoom', {
        get: function () {
            return this._zoom || {
                x: 0,
                y: 0
            };
        },
        set: function (value) {
            this._zoom = value;
        }
    })

    return planeFacade;

})(window, window.document, Math);