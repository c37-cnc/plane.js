/*!
 * C37 in 18-12-2014 at 02:07:27 
 *
 * plane version: 3.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 - http://c37.co - 2014
 */

(function (window) {
"use strict";
var define, require;

// http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
(function () {
    var registry = {},
        modules = {};

    define = function (name, dependencies, callback) {
        registry[name] = {
            dependencies: dependencies,
            callback: callback
        };
    };

    require = function (name) {

        if (modules[name]) {
            return modules[name];
        }
        modules[name] = {};

        var module = registry[name];
        if (!module) {
            throw new Error("Module '" + name + "' not found.");
        }

        var dependencies = module.dependencies,
            callback = module.callback,
            parameters = [],
            exports = {};

        for (var i = 0, l = dependencies.length; i < l; i++) {
            if (dependencies[i] == 'require') {
                parameters.push(require);
            } else if (dependencies[i] == 'exports') {
                parameters.push(exports);
            } else {
                parameters.push(require(dependencies[i]));
            }
        }

        var concrete = callback.apply(this, parameters);
        return modules[name] = exports || concrete;
    };
})();
define("plane/core/group", ['require', 'exports'], function (require, exports) {

    function Group() {};

    Group.prototype = {
        initialize: function (attrs) {

            return true;
        },
        contains: function (position, transform) {

            return false;
        },
        intersect: function (rectangle) {

            return true;
        },
        toObject: function () {

            return true;
        }
        
    };

    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Group();
    };

    exports.create = create;

});
define("plane/core/layer", ['require', 'exports'], function (require, exports) {

    var utility = require('utility');

    var store = utility.data.dictionary.create();

    var _active = null;


    function Layer(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.children = attrs.children;
        this.events = attrs.events;
    };

    Layer.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            status: this.status,
            style: this.style,
            children: this.children.list().map(function (shape) {
                return shape.toObject();
            })
        };
    }



    function create(attrs) {
        if ((typeof attrs == "function")) {
            throw new Error('layer - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = utility.math.uuid(9, 16);

        // parametros para a nova Layer
        attrs = utility.object.merge({
            uuid: uuid,
            name: 'Layer '.concat(uuid),
            style: {
                lineCap: 'butt',
                lineJoin: 'miter',
                lineWidth: .7,
                lineColor: 'rgb(0, 0, 0)',
            },
            status: 'visible',
            children: utility.data.dictionary.create(),
            events: utility.object.event.create()
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // armazenando 
        store.add(layer.uuid, layer);

        // colocando nova layer como selecionada
        _active = layer;

        return layer;
    }

    function list() {
        return store.list();
    }

    function find(uuid) {
        return store.find(uuid);
    }

    function remove(value) {
        if (value) {

            var uuid = null;

            // value como string == uuid
            if (utility.conversion.toType(value) == 'string') {
                uuid = value;
            }
            // value como object == layer
            if (utility.conversion.toType(value) == 'object') {
                uuid = value.uuid;
            }

            // removo a layer selecionada
            store.remove(uuid);

            // filtro as layers que não são do sistema
            var layers = store.list().filter(function (layer) {
                return layer.status != 'system';
            });
            
            // coloco a ultima como ativa            
            _active = layers[layers.length - 1];

            return true;

        } else {
            store.list().forEach(function (layer) {
                if (layer.status != 'system') {
                    store.remove(layer.uuid);
                }
            });
            return true;
        }
    }



    Object.defineProperty(exports, 'active', {
        get: function () {
            return _active;

        },
        set: function (value) {

            // value null || undefined == return
            if ((value == null) || (value == undefined)) return;

            var uuid = null;

            // value como string == uuid
            if (utility.conversion.toType(value) == 'string') {
                uuid = value;
            }

            // value como object == shape
            if (utility.conversion.toType(value) == 'object') {
                uuid = value.uuid;
            }


            // só altero a layer quando é diferente, isso para não gerar eventos não desejados
            if (_active.uuid != uuid) {
                // não propagar eventos quando realizar mudanças para Layer do sistema
                if ((_active) && (_active.status != 'system') && (store.find(uuid)) && store.find(uuid).status != 'system') {
                    this.events.notify('onDeactive', {
                        type: 'onDeactive',
                        layer: _active
                    });
                }

                _active = store.find(uuid);

                // não propagar eventos quando realizar mudanças para Layer do sistema
                if ((_active) && (_active.status != 'system') && (store.find(uuid)) && store.find(uuid).status != 'system') {
                    this.events.notify('onActive', {
                        type: 'onActive',
                        layer: _active
                    });
                }
            }

        }
    });


    exports.events = utility.object.event.create();
    exports.create = create;
    exports.list = list;
    exports.find = find;
    exports.remove = remove;
});
define("plane/core/point", ['require', 'exports'], function (require, exports) {

    var utility = require('utility');

    function Point(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype = {
        sum: function (point) {
            return new Point(this.x + point.x, this.y + point.y);
        },
        subtract: function (point) {
            return new Point(this.x - point.x, this.y - point.y);
        },
        negate: function () {
            return new Point(-this.x, -this.y);
        },
        multiply: function (value) {
            return new Point(this.x * value, this.y * value);
        },
        distanceTo: function (point) {
            var dx = this.x - point.x;
            var dy = this.y - point.y;

            return Math.sqrt(dx * dx + dy * dy);
        },
        midTo: function (point) {
            return new Point(this.x + (point.x - this.x) / 2, this.y + (point.y - this.y) / 2);
        },
        angleTo: function (point) {
            return Math.atan2(point.y - this.y, point.x - this.x);
        },
        interpolationLinear: function (point, value) {
            return new Point(
                this.x + (point.x - this.x) * value,
                this.y + (point.y - this.y) * value
            );
        },
        minimum: function (point) {
            return new Point(Math.min(this.x, point.x), Math.min(this.y, point.y));
        },
        maximum: function (point) {
            return new Point(Math.max(this.x, point.x), Math.max(this.y, point.y));
        },
        equals: function(point){
            return (this.x == point.x) && (this.y == point.y);
        }
    };

    function create() {

        if (arguments.length == 2 && (arguments[0] != null && arguments[1] != null)) {
            return new Point(arguments[0], arguments[1]);
        } else if (arguments.length == 1 && (utility.conversion.toType(arguments[0]) == 'object') && (arguments[0].x != null && arguments[0].y != null)) {
            return new Point(arguments[0].x, arguments[0].y);
        } else if (arguments.length == 1 && (utility.conversion.toType(arguments[0]) == 'array') && (arguments[0].length == 2)) {
            return new Point(arguments[0][0], arguments[0][1]);
        }

        throw new Error('Point - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');

    };

    exports.create = create;

});
define("plane/core/shape", ['require', 'exports'], function (require, exports) {

    var utility = require('utility');

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        layer = require('plane/core/layer');

    var shapeType = {
        'arc': require('plane/object/arc'),
        'bezier-cubic': require('plane/object/bezier-cubic'),
        'bezier-quadratic': require('plane/object/bezier-quadratic'),
        'circle': require('plane/object/circle'),
        'ellipse': require('plane/object/ellipse'),
        'line': require('plane/object/line'),
        'polygon': require('plane/object/polygon'),
        'polyline': require('plane/object/polyline'),
        'rectangle': require('plane/object/rectangle'),
        'spline': require('plane/object/spline')
    };


    function create(attrs) {
        // verificação para a chamada da função
        if ((typeof attrs == "function") || (attrs == null)) {
            throw new Error('shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // verifição para o tipo de shape
        if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline'].indexOf(attrs.type) == -1) {
            throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }


        // atributos 
        attrs = utility.object.merge({
            uuid: utility.math.uuid(9, 16),
        }, attrs);

        // criando pelo type
        var shape = shapeType[attrs.type].create(attrs);;

        // adicionando o novo shape na layer ativa
        layer.active.children.add(shape.uuid, shape);

        return shape;
    }


    function update(shape) {

        // neste momento realizo a exclução para inicializar o shape de forma correta

        remove(shape);
        create(shape);

        return true;
    }

    function remove(param) {

        // param null || undefined == return
        if ((param == null) || (param == undefined)) return;

        // param como string == uuid
        if (utility.conversion.toType(param) == 'string') {
            return layer.active.children.remove(param);
        }

        // param como object == shape
        if (utility.conversion.toType(param) == 'object') {
            return layer.active.children.remove(param.uuid);
        }

        throw new Error('Shape - remove - param is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
    }

    function clear() {
        return layer.active.children.clear();
    }

    function list() {
        return layer.active.children.list();
    }

    function find(param) {

        // param null || undefined == return
        if ((param == null) || (param == undefined)) return;

        // param como string == uuid
        if (utility.conversion.toType(param) == 'string') {
            return layer.active.children.find(param);
        }

        // param como object == shape
        if (utility.conversion.toType(param) == 'object') {
            return layer.active.children.find(param.uuid);
        }

        throw new Error('Shape - find - param is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
    }

    function search(query) {
        return '';
    }





    exports.create = create;
    exports.update = update;
    exports.remove = remove;
    exports.clear = clear;
    exports.list = list;
    exports.find = find;
    exports.search = search;
});
define("plane/core/tool", ['require', 'exports'], function (require, exports) {

    var utility = require('utility');

    var store = utility.data.dictionary.create();

    var point = require('plane/core/point');

    var viewPort = null,
        view = null,
        // usado para calculo do evento onMouseDrag
        mouseDown = null;


    function Tool(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.events = attrs.events;

        Object.defineProperty(this, 'active', {
            get: function () {
                return this._active || false;
            },
            set: function (value) {
                // só altero quando o estado é diferente, isso para não gerar eventos não desejados
                if (this._active != value) {
                    this.events.notify(value ? 'onActive' : 'onDeactive', {
                        type: value ? 'onActive' : 'onDeactive',
                        now: new Date().toISOString()

                    });
                    this._active = value;
                }
            }
        });

        this.active = attrs.active;
    };


    function initialize(config) {

        // usado para calcudo da posição do mouse
        viewPort = config.viewPort;

        // usado para obter a matrix (transform) 
        view = config.view;


        function onKeyDown(event) {

            // se backspace e não um target do tipo text, desabilito o evento default 'retornar para a pagina anterior'
            if ((event.keyCode == 8) && (event.target.getAttribute('type') != 'text') && (event.target.tagName != 'P')) {
                event.preventDefault();
            }

            // customized event
            event = {
                type: 'onKeyDown',
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                key: utility.string.fromKeyPress(event.keyCode),
                now: new Date().toISOString()
            };

            // propagação do evento para tools ativas
            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onKeyDown', event);
                }
            }

        }

        function onMouseDown(event) {

            var pointInCanvas = utility.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);

            // dizendo que o mouse preenche o evento down
            mouseDown = pointInView;

            // customized event
            event = {
                type: 'onMouseDown',
                target: event.target,
                point: {
                    // o ponto do mouse dentro do html document
                    inDocument: point.create(event.x, event.y),
                    // o ponto do mouse dentro do componente html canvas
                    inCanvas: point.create(pointInCanvas),
                    // o ponto do mouse dentro de plane.view
                    inView: point.create(pointInView)
                },
                now: new Date().toISOString()
            };

            // propagação do evento para tools ativas
            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseDown', event);
                }
            }

        }

        function onMouseUp(event) {

            var pointInCanvas = utility.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);

            // limpo está variável que é o controle para disparar o evento onMouseDrag
            mouseDown = null;

            // customized event
            event = {
                type: 'onMouseUp',
                point: {
                    inDocument: point.create(event.x, event.y),
                    inCanvas: point.create(pointInCanvas),
                    inView: point.create(pointInView)
                },
                now: new Date().toISOString()
            };

            // propagação do evento para tools ativas
            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseUp', event);
                }
            }
        }

        // Mouse Drag vinculado ao o evento Mouse Move do componente <canvas>
        function onMouseDrag(event) {
            // se Mouse Down preenchido 
            if (mouseDown) {

                var pointInCanvas = utility.graphic.mousePosition(viewPort, event.x, event.y),
                    pointInView = view.transform.inverseTransform(pointInCanvas);

                var pointFirst = point.create(mouseDown),
                    pointLast = point.create(pointInView);

                // os pontos de inicio e fim devem ser diferentes para o evento ser disparado
                //                if ((pointFirst.x != pointLast.x) || (pointFirst.y != pointLast.y)) {
                if (!pointFirst.equals(pointLast)) {

                    event = {
                        type: 'onMouseDrag',
                        point: {
                            inDocument: point.create(event.x, event.y),
                            inCanvas: point.create(pointInCanvas),
                            first: pointFirst,
                            last: pointLast,
                        },
                        now: new Date().toISOString()
                    }

                    var tools = store.list(),
                        t = tools.length;
                    while (t--) {
                        if (tools[t].active) {
                            tools[t].events.notify('onMouseDrag', event);
                        }
                    }

                }
            }
        }

        function onMouseMove(event) {

            var pointInCanvas = utility.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);

            // 2014.12.05 - lilo - cópia de código errado - VERIFICAR!
            // pointInCanvas = utility.graphic.canvasPosition(viewPort, event.x, event.y);

            // customized event
            event = {
                type: 'onMouseMove',
                point: {
                    inDocument: point.create(event.x, event.y),
                    inCanvas: point.create(pointInCanvas),
                    inView: point.create(pointInView)
                },
                now: new Date().toISOString()
            };

            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseMove', event);
                }
            }
        }

        function onMouseLeave(event) {
            mouseDown = null;
        }

        function onMouseWheel(event) {

            var pointInCanvas = utility.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);

            // customized event
            event = {
                type: 'onMouseWheel',
                delta: event.deltaY,
                point: point.create(pointInView),
                now: new Date().toISOString()
            };

            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseWheel', event);
                }
            }
        }

        // vinculando os eventos ao component html 
        window.addEventListener('keydown', onKeyDown, false);
        viewPort.onmousedown = onMouseDown;
        viewPort.onmouseup = onMouseUp;
        viewPort.addEventListener('mousemove', onMouseDrag, false);
        viewPort.addEventListener('mousemove', onMouseMove, false);
        viewPort.onmouseleave = onMouseLeave;
        viewPort.onmousewheel = onMouseWheel;

        return true;
    }

    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = utility.math.uuid(9, 16);

        attrs = utility.object.merge({
            uuid: uuid,
            name: 'tool - '.concat(uuid),
            events: utility.object.event.create(),
            active: false
        }, attrs);

        // nova tool
        var tool = new Tool(attrs)

        store.add(tool.uuid, tool);

        return tool;
    }

    function list() {
        return store.list();
    }

    function find(uuid) {
        return store.find(uuid);
    }

    function remove(uuid) {
        return store.remove(uuid);
    }


    exports.initialize = initialize;

    exports.create = create;
    exports.list = list;
    exports.find = find;
    exports.remove = remove;
});
define("plane/core/view", ['require', 'exports'], function (require, exports) {

    var matrix = require('plane/math/matrix');

    var layer = require('plane/core/layer'),
        point = require('plane/core/point');

    var utility = require('utility');


    var viewPort = null,
        canvas = null,
        _context = null,
        _transform = null,
        _zoom = 1,
        _center = point.create(0, 0),
        size = {
            height: 0,
            width: 0
        },
        bounds = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };




    function initialize(config) {

        viewPort = config.viewPort;
        canvas = config.canvas;
        _context = canvas.getContext('2d');

        // sistema cartesiano de coordenadas
        _context.translate(0, viewPort.clientHeight);
        _context.scale(1, -1);

        // created the matrix transform
        _transform = matrix.create();

        // o centro inicial
        _center = _center.sum(point.create(viewPort.clientWidth / 2, viewPort.clientHeight / 2));

        // os tamanhos que são fixos
        size.height = viewPort.clientHeight;
        size.width = viewPort.clientWidth;


        window.onresize = function () {

            canvas.width = viewPort.clientWidth;
            canvas.height = viewPort.clientHeight;

            // os tamanhos que são fixos
            size.height = viewPort.clientHeight;
            size.width = viewPort.clientWidth;


            // sistema cartesiano de coordenadas
            canvas.getContext('2d').translate(0, viewPort.clientHeight);
            canvas.getContext('2d').scale(1, -1);

            update();

            events.notify('onResize', {
                size: size,
                now: new Date().toISOString()
            });
        };


    }



    function update() {


        // clear context, +1 is needed on some browsers to really clear the borders
        _context.clearRect(0, 0, viewPort.clientWidth + 1, viewPort.clientHeight + 1);

        var layers = layer.list(),
            l = layers.length;
        
        // sort, toda(s) a(s) layer(s) system(s) devem ser as primeiras
        // para os demais layers/objetos virem depois
        layers.sort(function (a, b) {
            if (a.status != 'system')
                return -1;
            if (a.status == 'system')
                return 1;
            return 0;
        });
        
        while (l--) {
            var shapes = layers[l].children.list(),
                s = shapes.length;

            // style of layer
            _context.lineCap = layers[l].style.lineCap;
            _context.lineJoin = layers[l].style.lineJoin;

            while (s--) {
                shapes[s].render(_context, _transform);
            }
        }
        return this;
    }





    function zoomTo(zoom, center) {

        var factor, motion;

        factor = zoom / _zoom;

        _transform.scale({
            x: factor,
            y: factor
        }, _center);

        _zoom = zoom;


        var centerSubtract = center.subtract(_center);
        centerSubtract = centerSubtract.negate();

        var xxx = matrix.create();
        xxx.translate(centerSubtract.x, centerSubtract.y);

        _transform.concate(xxx);

        _center = center;

        update();

        return true;
    }




    function reset() {
        // no mesmo momento, retorno o zoom para 1 e informe o centro inicial
        zoomTo(1, point.create(size.width / 2, size.height / 2));
        
        // clear in the matrix transform
        _transform = matrix.create();
    }


    Object.defineProperty(exports, 'context', {
        get: function () {
            return _context;
        }
    });

    Object.defineProperty(exports, 'transform', {
        get: function () {
            return _transform;
        }
    });

    Object.defineProperty(exports, 'size', {
        get: function () {
            return size;
        }
    });

    Object.defineProperty(exports, 'bounds', {
        get: function () {
            var scale = Math.sqrt(_transform.a * _transform.d);

            return {
                x: _transform.tx,
                y: _transform.ty,
                height: size.height * scale,
                width: size.width * scale
            }
        }
    });

    Object.defineProperty(exports, 'center', {
        get: function () {
            return _center;
        },
        set: function (value) {

            var centerSubtract = value.subtract(_center);
            centerSubtract = centerSubtract.negate();

            var xxx = matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _transform.concate(xxx);

            _center = value;

            update();

            return true;
        }
    });

    Object.defineProperty(exports, 'zoom', {
        get: function () {
            return _zoom;
        },
        set: function (value) {

            var factor, motion;

            factor = value / _zoom;

            _transform.scale({
                x: factor,
                y: factor
            }, _center);

            _zoom = value;

            update();

            return true;
        }
    });


    var events = utility.object.event.create();


    exports.initialize = initialize;
    exports.update = update;
    exports.zoomTo = zoomTo;
    exports.reset = reset;
    exports.events = events;

});
define("plane/data/exporter", ['require', 'exports'], function (require, exports) {
    
    function toSvg (){
        return true;
    }
    
    function toDxf (){
        return true;
    }
    
    function toPng (){
        return true;
    }
    
    function toPdf (){
        return true;
    }

    
    
    
    
    exports.toSvg = toSvg;
    exports.toDxf = toDxf;
    exports.toPng = toPng;
    exports.toPdf = toPdf;

});
define("plane/data/importer", ['require', 'exports'], function (require, exports) {

    var utility = require('utility');

    function parseDxf(stringDxf) {

        function toJson(objectDxf) {

            switch (objectDxf.type) {
            case 'arc':
                {
                    var arc = '{"type": "arc", "center": [{0}, {1}], "radius": {2}, "startAngle": {3}, "endAngle": {4} },';
                    return utility.string.format(arc, [objectDxf.x, objectDxf.y, objectDxf.r, objectDxf.a0, objectDxf.a1]);
                }
            case 'circle':
                {
                    var circle = '{ "type": "circle", "center": [{0}, {1}], "radius": {2} },';
                    return utility.string.format(circle, [objectDxf.x, objectDxf.y, objectDxf.r]);
                }
            case 'ellipse':
                {
                    var ellipse = '{ "type": "ellipse", "center": [{0}, {1}], "radiusY": {2}, "radiusX": {3}, "startAngle": {4}, "endAngle": {5}, "angle": {6} },';

                    var ratio = objectDxf.r;
                    var startAngle = objectDxf.startAngle;
                    var endAngle = objectDxf.endAngle || (2.0 * Math.PI);

                    // clockwise || anticlockwise?
                    while (endAngle < startAngle) {
                        endAngle += 2.0 * Math.PI;
                    }

                    var radiusX = {
                        x: 0 - objectDxf.x1,
                        y: 0 - objectDxf.y1
                    };

                    radiusX = Math.sqrt(radiusX.x * radiusX.x + radiusX.y * radiusX.y);

                    var radiusY = radiusX * ratio;
                    var angle = Math.atan2(objectDxf.y1, objectDxf.x1);



                    return utility.string.format(ellipse, [objectDxf.x, objectDxf.y, radiusY, radiusX, startAngle, endAngle, angle]);
                }
            case 'line':
                {
                    var line = '{ "type": "line", "from": [{0}, {1}], "to": [{2}, {3}] },';
                    return utility.string.format(line, [objectDxf.x, objectDxf.y, objectDxf.x1, objectDxf.y1]);
                }
            case 'lwpolyline':
                {
                    if (objectDxf.vertices) {
                        var polyline = '{"type": "polyline", "points": [{0}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.vertices.length; i++) {

                            var point = i == objectDxf.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += utility.string.format(point, [objectDxf.vertices[i].x, objectDxf.vertices[i].y]);

                        }
                        return utility.string.format(polyline, [points]);
                    }
                    return '';
                }
            case 'polyline':
                {
                    if (objectDxf.vertices) {
                        var polyline = '{"type": "polyline", "points": [{0}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.vertices.length; i++) {

                            var point = i == objectDxf.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += utility.string.format(point, [objectDxf.vertices[i].x, objectDxf.vertices[i].y]);

                        }
                        return utility.string.format(polyline, [points]);
                    }
                    return '';
                }
            case 'spline':
                {
                    if (objectDxf.points) {
                        var spline = '{"type": "spline", "degree": {0}, "knots": [{1}], "points": [{2}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.points.length; i++) {

                            var point = i == objectDxf.points.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += utility.string.format(point, [objectDxf.points[i][0], objectDxf.points[i][1]]);

                        }
                        return utility.string.format(spline, [objectDxf.degree, objectDxf.knots.join(), points]);
                    }
                    return '';
                }
            }

        }


        // certificando que a linha irá terá o caractere de nova linha
        stringDxf = stringDxf.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // entidades suportadas na conversão
        //                var entitiesSupport = ['polyline'],
        var entitiesSupport = ['line', 'circle', 'arc', 'ellipse', 'lwpolyline', 'polyline', 'spline'],
            entitiesSection = false,
            objectParse = null,
            stringAux = '',
            stringJson = '',
            stringLine = '',
            arrayDxf = stringDxf.split('\n');

        for (var i = 0; i <= arrayDxf.length - 1; i++) {

            stringLine = arrayDxf[i].toLowerCase();

            entitiesSection = entitiesSection ? entitiesSection : (stringLine == 'entities');
            //            if (!entitiesSection) continue;

            if (entitiesSupport.indexOf(stringLine) > -1) {
                objectParse = {
                    type: stringLine
                };
                continue;
            }

            if (!objectParse) continue;


            if (stringAux == ' 10') {
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // caso necessário crio um array de points
                    objectParse.points = objectParse.points || [];
                    objectParse.points.push([utility.math.parseFloat(stringLine, 5), 0]);
                } else {
                    objectParse.x = utility.math.parseFloat(stringLine, 5);
                }
                stringAux = '';
                continue;
            }
            if (stringLine == ' 10') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 11') {
                objectParse.x1 = utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }

            if (stringLine == ' 11') {
                stringAux = stringLine;
                continue;
            }

            // TODO: verificar qual logica é melhor para reinterpretação de uma array de pontos
            if (stringAux == ' 20') {
                // de acordo com o tipo localizar o ultimo point em array e add y ?
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // localizando o ultimo point de points para completar add ao valor de y
                    objectParse.points[objectParse.points.length - 1][1] = utility.math.parseFloat(stringLine, 5);
                } else {
                    objectParse.y = utility.math.parseFloat(stringLine, 5);
                }
                // de acordo com o tipo pegar o preenchido de x e y ?
                // verificação especifica para lwpolyline e polyline
                if (objectParse.type == 'lwpolyline' || objectParse.type == 'polyline') {
                    if (objectParse.x && objectParse.y) {
                        objectParse.vertices = objectParse.vertices || [];
                        objectParse.vertices.push({
                            x: objectParse.x,
                            y: objectParse.y
                        });
                    }
                }
                stringAux = '';
                continue;
            }
            if (stringLine == ' 20') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 21') {
                objectParse.y1 = utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 21') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 40') {
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // caso necessário crio um array de points
                    objectParse.knots = objectParse.knots || [];
                    objectParse.knots.push(utility.math.parseFloat(stringLine, 5));
                } else {
                    objectParse.r = utility.math.parseFloat(stringLine, 5);
                }
                stringAux = '';
                continue;
            }
            if (stringLine == ' 40') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 41') {
                objectParse.startAngle = utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 41') {
                stringAux = stringLine;
                continue;
            }

            if (stringAux == ' 42') {
                objectParse.endAngle = utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 42') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 50') {
                objectParse.a0 = utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 50') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 51') {
                objectParse.a1 = utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 51') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 71') {
                objectParse.degree = utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 71') {
                stringAux = stringLine;
                continue;
            }


            // conversão para Json
            if (objectParse && objectParse.type && objectParse.type != 'polyline' && arrayDxf[i] == '  0') {
                stringJson += toJson(objectParse);
                objectParse = null;
            }
            // conversão para Json - verificação especifica para Polyline
            if (objectParse && objectParse.type && objectParse.type == 'polyline' && arrayDxf[i] == 'SEQEND') {
                stringJson += toJson(objectParse);
                objectParse = null;
            }
        }

        return stringJson ? '[' + stringJson.substring(0, stringJson.length - 1) + ']' : '[]';
    }

    function parseDwg(stringDwg) {
        return true;
    }

    function parseJson(stringJson) {
        return true;
    }

    function parseSvg(stringSvg) {
        return true;
    }


    exports.parseDxf = parseDxf;
    exports.parseDwg = parseDwg;
    exports.parseJson = parseJson;
    exports.parseSvg = parseSvg;

});



// https://github.com/paperjs/paper.js/blob/a9618b50f89c480600bf12868d414e5bed095430/test/tests/PathItem_Contains.js#L49

//	testPoint(path, path.bounds.topCenter, true);
//	testPoint(path, path.bounds.leftCenter, true);
//	testPoint(path, path.bounds.rightCenter, true);
//	testPoint(path, path.bounds.bottomCenter, true);
//	testPoint(path, path.bounds.topLeft, false);
//	testPoint(path, path.bounds.topRight, false);
//	testPoint(path, path.bounds.bottomLeft, false);
//	testPoint(path, path.bounds.bottomRight, false);
// https://github.com/thelonious/js-intersections
// http://www.kevlindev.com/gui/math/intersection/index.htm
define("plane/math/intersection", ['require', 'exports'], function (require, exports) {

    var polynomial = require('plane/math/polynomial'),
        point = require('plane/core/point');


    function Bezout(e1, e2) {
        var AB = e1[0] * e2[1] - e2[0] * e1[1];
        var AC = e1[0] * e2[2] - e2[0] * e1[2];
        var AD = e1[0] * e2[3] - e2[0] * e1[3];
        var AE = e1[0] * e2[4] - e2[0] * e1[4];
        var AF = e1[0] * e2[5] - e2[0] * e1[5];
        var BC = e1[1] * e2[2] - e2[1] * e1[2];
        var BE = e1[1] * e2[4] - e2[1] * e1[4];
        var BF = e1[1] * e2[5] - e2[1] * e1[5];
        var CD = e1[2] * e2[3] - e2[2] * e1[3];
        var DE = e1[3] * e2[4] - e2[3] * e1[4];
        var DF = e1[3] * e2[5] - e2[3] * e1[5];
        var BFpDE = BF + DE;
        var BEmCD = BE - CD;

        return polynomial.create(
            AB * BC - AC * AC,
            AB * BEmCD + AD * BC - 2 * AC * AE,
            AB * BFpDE + AD * BEmCD - AE * AE - 2 * AC * AF,
            AB * DF + AD * BFpDE - 2 * AE * AF,
            AD * DF - AF * AF
        );
    };
    
    
    function isInside(x, y, z1, z2, z3, z4) {
        var x1 = z1.minimum(z3);
        var x2 = z1.maximum(z3);
        var y1 = z2.minimum(z4);
        var y2 = z2.maximum(z4);

        return ((x1.x <= x) && (x <= x2.x) && (y1.y <= y) && (y <= y2.y));
    };

    function segmentsRectangle(segments, tl, tr, bl, br) {

        var inter1 = intersectSegmentsLine(tl, tr, segments),
            inter2 = intersectSegmentsLine(tr, br, segments),
            inter3 = intersectSegmentsLine(br, bl, segments),
            inter4 = intersectSegmentsLine(bl, tl, segments);

        if (inter1 || inter2 || inter3 || inter4) {
            return true;
        }

        for (var i = 0; i < segments.length; i++) {
            if (isInside(segments[i].x, segments[i].y, bl, tl, tr, br)) {
                return true;
            }
        }

        return false;
    };

    function intersectSegmentsLine(a1, a2, points) {
        var result = [],
            length = points.length;

        for (var i = 0; i < length; i++) {
            var b1 = points[i],
                b2 = points[(i + 1) % length];

            if (lineLine(a1, a2, b1, b2)) {
                return true;
            }
        }
        return false;
    };
    
    
    
    
    

    function lineLine(a1, a2, b1, b2) {
        
//        debugger;
        
        var result,
            uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
            ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
            uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (uB !== 0) {
            var ua = uaT / uB,
                ub = ubT / uB;
            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
//                result = new Intersection('Intersection');
                result = [];
                result.push(point.create(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
            } else {
                result = false;
//                result = new Intersection();
            }
        } else {
            if (uaT === 0 || ubT === 0) {
                result = false;
//                result = new Intersection('Coincident');
            } else {
                result = false;
//                result = new Intersection('Parallel');
            }
        }
        return result;
    };

    function circleLine(c, r, a1, a2) {
        var result,
            a = (a2.x - a1.x) * (a2.x - a1.x) + (a2.y - a1.y) * (a2.y - a1.y),
            b = 2 * ((a2.x - a1.x) * (a1.x - c.x) + (a2.y - a1.y) * (a1.y - c.y)),
            cc = c.x * c.x + c.y * c.y + a1.x * a1.x + a1.y * a1.y - 2 * (c.x * a1.x + c.y * a1.y) - r * r,
            deter = b * b - 4 * a * cc;

        if (deter < 0) {
            result = false;
        } else if (deter == 0) {
            result = false;
        } else {
            var e = Math.sqrt(deter),
                u1 = (-b + e) / (2 * a),
                u2 = (-b - e) / (2 * a);

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
    };

    function circleRectangle(c, r, p, h, w) {

        var rightBottom = point.create(p.x + w, p.y),
            rightTop = point.create(p.x + w, p.y + h),
            leftTop = point.create(p.x, p.y + h),
            leftBottom = point.create(p.x, p.y);

        var inter1 = circleLine(c, r, rightBottom, rightTop);
        var inter2 = circleLine(c, r, rightTop, leftTop);
        var inter3 = circleLine(c, r, leftTop, leftBottom);
        var inter4 = circleLine(c, r, leftBottom, rightBottom);

        return inter1 || inter2 || inter3 || inter4;
    };

    function circleCircle(c1, r1, c2, r2) {
        var result;

        // Determine minimum and maximum radii where circles can intersect
        var r_max = r1 + r2;
        var r_min = Math.abs(r1 - r2);

        // Determine actual distance between circle circles
        var c_dist = c1.distanceTo(c2);

        if (c_dist > r_max) {
            result = false;
        } else if (c_dist < r_min) {
            result = false;
        } else {
            result = {
                points: []
            };

            var a = (r1 * r1 - r2 * r2 + c_dist * c_dist) / (2 * c_dist);
            var h = Math.sqrt(r1 * r1 - a * a);
            var p = c1.interpolationLinear(c2, a / c_dist);
            var b = h / c_dist;

            result.points.push(point.create(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x)));
            result.points.push(point.create(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x)));

        }

        return result;
    };

    function circleArc(c, r1, ca, r2, as, ae, ck) {

        var intersection = circleCircle(c, r1, ca, r2);

        if (intersection.points) {

            var radianStart = as / 360 * 2 * Math.PI,
                radianEnd = ae / 360 * 2 * Math.PI,
                radianMid = radianStart > radianEnd ? (radianStart - radianEnd) / 2 : (radianEnd - radianStart) / 2;

            var pointStart = point.create(ca.x + Math.cos(radianStart) * r2, ca.y + Math.sin(radianStart) * r2),
                pointEnd = point.create(ca.x + Math.cos(radianEnd) * r2, ca.y + Math.sin(radianEnd) * r2),
                pointMid = point.create(ca.x + Math.cos(radianMid) * r2, ck ? ca.y - Math.sin(radianMid) * r2 : ca.y + Math.sin(radianMid) * r2);

            var twoPi = (Math.PI + Math.PI);

            for (var i = 0; i <= intersection.points.length - 1; i++) {

                var pointDistance = intersection.points[i].distanceTo(ca),
                    radius = r2;

                if (radius - 4 <= pointDistance && pointDistance <= radius + 4) {

                    var pointstartAngle = ca.angleTo(pointStart),
                        pointMidAngle = ca.angleTo(pointMid),
                        pointendAngle = ca.angleTo(pointEnd),
                        pointMouseAngle = ca.angleTo(intersection.points[i]);

                    if (pointstartAngle <= pointMidAngle && pointMidAngle <= pointendAngle) {
                        // 2014.06.24 - 14:33 - lilo - em observação
                        //                        if (ck) {
                        //                            return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? true : false;
                        //                        } else {
                        //                            return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? false : true;
                        //                        }
                        return (pointstartAngle <= pointMouseAngle && pointMouseAngle <= pointendAngle) ? true : false;

                    } else if (pointendAngle <= pointMidAngle && pointMidAngle <= pointstartAngle) {
                        if (ck) {
                            return (pointendAngle <= pointMouseAngle && pointMouseAngle <= pointstartAngle) ? true : false;
                        } else {
                            return (pointendAngle <= pointMouseAngle && pointMouseAngle <= pointstartAngle) ? false : true;
                        }
                    } else if (pointstartAngle <= pointMidAngle && pointendAngle <= pointMidAngle) {
                        if (pointstartAngle < pointendAngle) {
                            if (ck) {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? false : true;
                            } else {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? true : false;
                            }
                        } else if (pointendAngle < pointstartAngle) {
                            return (pointendAngle < pointMouseAngle && pointMouseAngle < pointstartAngle) ? false : true;
                        }
                    } else if (pointMidAngle <= pointstartAngle && pointMidAngle <= pointendAngle) {
                        if (pointstartAngle < pointendAngle) {
                            if (ck) {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? false : true;
                            } else {
                                return (pointstartAngle < pointMouseAngle && pointMouseAngle < pointendAngle) ? true : false;
                            }
                        } else if (pointendAngle < pointstartAngle) {
                            return (pointendAngle < pointMouseAngle && pointMouseAngle < pointstartAngle) ? false : true;
                        }
                    }

                }
                return false;
            };
        }
        return false;
    };


    function circleEllipse(c1, ry1, rx1, c2, ry2, rx2) {

        var a = [ry1 * ry1, 0, rx1 * rx1, -2 * ry1 * ry1 * c1.x, -2 * rx1 * rx1 * c1.y, ry1 * ry1 * c1.x * c1.x + rx1 * rx1 * c1.y * c1.y - rx1 * rx1 * ry1 * ry1];
        var b = [ry2 * ry2, 0, rx2 * rx2, -2 * ry2 * ry2 * c2.x, -2 * rx2 * rx2 * c2.y, ry2 * ry2 * c2.x * c2.x + rx2 * rx2 * c2.y * c2.y - rx2 * rx2 * ry2 * ry2];

        var yPoly = Bezout(a, b);
        var yRoots = yPoly.getRoots();
        var epsilon = 1e-3;
        var norm0 = (a[0] * a[0] + 2 * a[1] * a[1] + a[2] * a[2]) * epsilon;
        var norm1 = (b[0] * b[0] + 2 * b[1] * b[1] + b[2] * b[2]) * epsilon;

        for (var y = 0; y < yRoots.length; y++) {
            var xPoly = polynomial.create(
                a[0],
                a[3] + yRoots[y] * a[1],
                a[5] + yRoots[y] * (a[4] + yRoots[y] * a[2])
            );
            var xRoots = xPoly.getRoots();

            for (var x = 0; x < xRoots.length; x++) {
                var test =
                    (a[0] * xRoots[x] + a[1] * yRoots[y] + a[3]) * xRoots[x] +
                    (a[2] * yRoots[y] + a[4]) * yRoots[y] + a[5];
                if (Math.abs(test) < norm0) {
                    test =
                        (b[0] * xRoots[x] + b[1] * yRoots[y] + b[3]) * xRoots[x] +
                        (b[2] * yRoots[y] + b[4]) * yRoots[y] + b[5];
                    if (Math.abs(test) < norm1) {
                        return true;
                    }
                }
            }
        }
        return false;
    };


    function circleBezier(p1, p2, p3, ec, rx, ry) {

        var a, b; // temporary variables
        var c2, c1, c0; // coefficients of quadratic
        //        var result = new Intersection("No Intersection");
        var result = {};

        a = p2.multiply(-2);
        c2 = p1.sum(a.sum(p3));

        a = p1.multiply(-2);
        b = p2.multiply(2);
        c1 = a.sum(b);

        c0 = point.create(p1.x, p1.y);

        var rxrx = rx;
        var ryry = ry;

        var roots = polynomial.create(
            ryry * c2.x * c2.x + rxrx * c2.y * c2.y,
            2 * (ryry * c2.x * c1.x + rxrx * c2.y * c1.y),
            ryry * (2 * c2.x * c0.x + c1.x * c1.x) + rxrx * (2 * c2.y * c0.y + c1.y * c1.y) - 2 * (ryry * ec.x * c2.x + rxrx * ec.y * c2.y),
            2 * (ryry * c1.x * (c0.x - ec.x) + rxrx * c1.y * (c0.y - ec.y)),
            ryry * (c0.x * c0.x + ec.x * ec.x) + rxrx * (c0.y * c0.y + ec.y * ec.y) - 2 * (ryry * ec.x * c0.x + rxrx * ec.y * c0.y) - rxrx * ryry
        ).getRoots();

        if (roots.length > 1) {

            //            debugger;

            result.points = [];
            for (var i = 0; i < roots.length; i++) {
                var t = roots[i];

                //                if (t <= 0) {
                //                    result.points.push(c2.multiply(t * t).sum(c1.multiply(t).sum(c0)));
                //                }

                if (0 <= t && t <= 1)
                    result.points.push(c2.multiply(t * t).sum(c1.multiply(t).sum(c0)));
            }
            return (result.points.length > 0);
        }

        return false;
    };


    exports.circleLine = circleLine;
    exports.circleRectangle = circleRectangle;
    exports.circleCircle = circleCircle;
    exports.circleArc = circleArc;
    exports.circleEllipse = circleEllipse;
    exports.circleBezier = circleBezier;
    exports.lineLine = lineLine;
    exports.segmentsRectangle = segmentsRectangle;
});
define("plane/math/matrix", ['require', 'exports'], function (require, exports) {

    // http://www.senocular.com/flash/tutorials/transformmatrix/
    // https://github.com/heygrady/transform/wiki/Calculating-2d-Matrices

    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js
    // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js
    // https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/geom/Matrix2D.js
    // http://eip.epitech.eu/2014/tumbleweed/api/classes/Math.Matrix2D.html
    // https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat2.js

    // https://github.com/kangax/fabric.js/blob/818ab118b30a9205a0e57620452b08bb8f5f18cc/src/static_canvas.class.js#L611
    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js

    function Matrix(a, b, c, d, tx, ty) {
        this.a = a || 1; // x scale
        this.c = c || 0; // x inclinação 

        this.b = b || 0; // y inclinação 
        this.d = d || 1; // y scale

        this.tx = tx || 0; // x translate
        this.ty = ty || 0; // y translate
    };


    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L558
    // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L427
    function getDeterminant(transform) {
        return transform.a * transform.d - transform.b * transform.c;
    };

    function isIdentity() {};

    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L93
    function toPoint(point, transform, offSet) {
        if (offSet) {
            return {
                x: (transform[0] * point.x) + (transform[1] * point.y),
                y: (transform[2] * point.x) + (transform[3] * point.y)
            }
        };
        return {
            x: (transform[0] * point.x) + (transform[1] * point.y) + transform[4],
            y: (transform[2] * point.x) + (transform[3] * point.y) + transform[5]
        };
    };




    //    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L513
    //    var _transformCorners: function (rect) {
    //        var x1 = rect.x,
    //            y1 = rect.y,
    //            x2 = x1 + rect.width,
    //            y2 = y1 + rect.height,
    //            coords = [x1, y1, x2, y1, x2, y2, x1, y2];
    //        return this._transformCoordinates(coords, coords, 4);
    //    };
    //
    //    // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L527
    //    var _transformBounds: function (bounds, dest, _dontNotify) {
    //        var coords = this._transformCorners(bounds),
    //            min = coords.slice(0, 2),
    //            max = coords.slice();
    //        for (var i = 2; i < 8; i++) {
    //            var val = coords[i],
    //                j = i & 1;
    //            if (val < min[j])
    //                min[j] = val;
    //            else if (val > max[j])
    //                max[j] = val;
    //        }
    //        if (!dest)
    //            dest = new Rectangle();
    //        return dest.set(min[0], min[1], max[0] - min[0], max[1] - min[1],
    //            _dontNotify);
    //    };


    // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L113
    function toInverse(transform) {


        return transform;
    }

    Matrix.prototype = {
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L256
        // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L560
        rotate: function (angle, x, y) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            return this.transform(cos, sin, -sin, cos, x - x * cos + y * sin, y - x * sin - y * cos);
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L218
        scale: function (scale, center) {

            if (center)
                this.translate(center.x, center.y);

            this.a *= scale.x;
            this.c *= scale.x;
            this.b *= scale.y;
            this.d *= scale.y;

            if (center)
                this.translate(-center.x, -center.y);

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L189
        translate: function (x, y) {

            this.tx += x * this.a + y * this.b;
            this.ty += x * this.c + y * this.d;

            return this;

        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L150
        reset: function () {

            this.a = this.d = 1;
            this.c = this.b = this.tx = this.ty = 0;

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L117
        clone: function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L352
        concate: function (matrix) {

            var a1 = this.a,
                b1 = this.b,
                c1 = this.c,
                d1 = this.d,
                a2 = matrix.a,
                b2 = matrix.b,
                c2 = matrix.c,
                d2 = matrix.d,
                tx2 = matrix.tx,
                ty2 = matrix.ty;

            this.a = a2 * a1 + c2 * b1;
            this.b = b2 * a1 + d2 * b1;
            this.c = a2 * c1 + c2 * d1;
            this.d = b2 * c1 + d2 * d1;
            this.tx += tx2 * a1 + ty2 * b1;
            this.ty += tx2 * c1 + ty2 * d1;

            return this;

        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L299
        shear: function (shear, center) {

            if (center)
                this.translate(center.x, center.y);

            var a = this.a,
                c = this.c;

            this.a += shear.y * this.b;
            this.c += shear.y * this.d;
            this.b += shear.x * a;
            this.d += shear.x * c;

            if (center)
                this.translate(-center.x, -center.y);

            return this;
        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L337
        skew: function (skew, center) {

            var toRadians = Math.PI / 180,
                shear = {
                    x: Math.tan(skew.x * toRadians),
                    y: Math.tan(skew.y * toRadians)
                };

            return this.shear(shear, center);

        },
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/util/misc.js#L113
        // https://github.com/kangax/fabric.js/blob/4c7ad6a82d5804f17a5cfab37530e0ec3eb0b509/src/object/group.class.js#L459

        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L565
        // https://github.com/tart/Google-Closure-Library/blob/master/goog/graphics/affinetransform.js#L451
        inverse: function () {

            //            var r, t = this.toArray(),
            //                a = 1 / (t[0] * t[3] - t[1] * t[2]);
            //
            //            r = [a * t[3], -a * t[1], -a * t[2], a * t[0], 0, 0];
            //
            //            var o = toPoint({
            //                x: t[4],
            //                y: t[5]
            //            }, r);
            //            r[4] = -o.x;
            //            r[5] = -o.y;
            //            return r;


            var r = this.toArray(),
                a = 1 / (this.a * this.d - this.b * this.c);

            r = [a * this.d, -a * this.b, -a * this.c, a * this.a, 0, 0];

            var o = toPoint({
                x: this.tx,
                y: this.ty
            }, r);

            r[4] = -o.x;
            r[5] = -o.y;

            return r;

        },
        // https://github.com/paperjs/paper.js/blob/master/src/basic/Matrix.js#L727
        inverted: function () {
            var det = getDeterminant(this);

            return det && new Matrix(
                this.d / det, -this.c / det, -this.b / det,
                this.a / det, (this.b * this.ty - this.d * this.tx) / det, (this.c * this.tx - this.a * this.ty) / det);
        },
        inverseTransform: function (point) {
            var det = getDeterminant(this);

            var x = point.x - this.tx,
                y = point.y - this.ty;

            return {
                x: (x * this.d - y * this.b) / det,
                y: (y * this.a - x * this.c) / det
            };
        },
        transform: function (a, b, c, d, tx, ty) {

            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;

            return this;
        },
        toCenter: function (point) {},
        toArray: function () {
            return [this.a, this.b, this.c, this.d, this.tx, this.ty];
        },
        _transformCoordinates: function (src, dst, count) {
            var i = 0,
                j = 0,
                max = 2 * count;
            while (i < max) {
                var x = src[i++],
                    y = src[i++];
                dst[j++] = x * this._a + y * this._b + this._tx;
                dst[j++] = x * this._c + y * this._d + this._ty;
            }
            return dst;
        },
        _transformCorners: function (rect) {
            var x1 = rect.x,
                y1 = rect.y,
                x2 = x1 + rect.width,
                y2 = y1 + rect.height,
                coords = [x1, y1, x2, y1, x2, y2, x1, y2];
            return this._transformCoordinates(coords, coords, 4);
        },
        _transformBounds: function (bounds, dest, _dontNotify) {

            debugger;

            var coords = this._transformCorners(bounds),
                min = coords.slice(0, 2),
                max = coords.slice();
            for (var i = 2; i < 8; i++) {
                var val = coords[i],
                    j = i & 1;
                if (val < min[j])
                    min[j] = val;
                else if (val > max[j])
                    max[j] = val;
            }
            if (!dest)
                dest = new Rectangle();
            return dest.set(min[0], min[1], max[0] - min[0], max[1] - min[1],
                _dontNotify);
        },


    };

    function create() {
        return new Matrix();
    };

    exports.create = create;
    exports.toPoint = toPoint;
});
define("plane/math/polynomial", ['require', 'exports'], function (require, exports) {

    function Polynomial(coefs) {
        this.coefs = new Array();

        for (var i = coefs.length - 1; i >= 0; i--)
            this.coefs.push(coefs[i]);

        this._variable = "t";
        this._s = 0;
    }

    Polynomial.prototype.simplify = function () {
        for (var i = this.getDegree(); i >= 0; i--) {
            if (Math.abs(this.coefs[i]) <= Polynomial.TOLERANCE)
                this.coefs.pop();
            else
                break;
        }
    };

    Polynomial.prototype.getDegree = function () {
        return this.coefs.length - 1;
    };

    Polynomial.prototype.getLinearRoot = function () {
        var result = new Array();
        var a = this.coefs[1];

        if (a != 0)
            result.push(-this.coefs[0] / a);

        return result;
    };

    Polynomial.prototype.getQuadraticRoots = function () {
        var results = new Array();

        if (this.getDegree() == 2) {
            var a = this.coefs[2];
            var b = this.coefs[1] / a;
            var c = this.coefs[0] / a;
            var d = b * b - 4 * c;

            if (d > 0) {
                var e = Math.sqrt(d);

                results.push(0.5 * (-b + e));
                results.push(0.5 * (-b - e));
            } else if (d == 0) {
                // really two roots with same value, but we only return one
                results.push(0.5 * -b);
            }
        }

        return results;
    };

    Polynomial.prototype.getCubicRoots = function () {
        var results = new Array();

        if (this.getDegree() == 3) {
            var c3 = this.coefs[3];
            var c2 = this.coefs[2] / c3;
            var c1 = this.coefs[1] / c3;
            var c0 = this.coefs[0] / c3;

            var a = (3 * c1 - c2 * c2) / 3;
            var b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
            var offset = c2 / 3;
            var discrim = b * b / 4 + a * a * a / 27;
            var halfB = b / 2;

            if (Math.abs(discrim) <= Polynomial.TOLERANCE) discrim = 0;

            if (discrim > 0) {
                var e = Math.sqrt(discrim);
                var tmp;
                var root;

                tmp = -halfB + e;
                if (tmp >= 0)
                    root = Math.pow(tmp, 1 / 3);
                else
                    root = -Math.pow(-tmp, 1 / 3);

                tmp = -halfB - e;
                if (tmp >= 0)
                    root += Math.pow(tmp, 1 / 3);
                else
                    root -= Math.pow(-tmp, 1 / 3);

                results.push(root - offset);
            } else if (discrim < 0) {
                var distance = Math.sqrt(-a / 3);
                var angle = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
                var cos = Math.cos(angle);
                var sin = Math.sin(angle);
                var sqrt3 = Math.sqrt(3);

                results.push(2 * distance * cos - offset);
                results.push(-distance * (cos + sqrt3 * sin) - offset);
                results.push(-distance * (cos - sqrt3 * sin) - offset);
            } else {
                var tmp;

                if (halfB >= 0)
                    tmp = -Math.pow(halfB, 1 / 3);
                else
                    tmp = Math.pow(-halfB, 1 / 3);

                results.push(2 * tmp - offset);
                // really should return next root twice, but we return only one
                results.push(-tmp - offset);
            }
        }

        return results;
    };

    Polynomial.prototype.getQuarticRoots = function () {
        var results = new Array();

        if (this.getDegree() == 4) {
            var c4 = this.coefs[4];
            var c3 = this.coefs[3] / c4;
            var c2 = this.coefs[2] / c4;
            var c1 = this.coefs[1] / c4;
            var c0 = this.coefs[0] / c4;

            var resolveRoots = create(
                1, -c2, c3 * c1 - 4 * c0, -c3 * c3 * c0 + 4 * c2 * c0 - c1 * c1
            ).getCubicRoots();
            var y = resolveRoots[0];
            var discrim = c3 * c3 / 4 - c2 + y;

            if (Math.abs(discrim) <= Polynomial.TOLERANCE) discrim = 0;

            if (discrim > 0) {
                var e = Math.sqrt(discrim);
                var t1 = 3 * c3 * c3 / 4 - e * e - 2 * c2;
                var t2 = (4 * c3 * c2 - 8 * c1 - c3 * c3 * c3) / (4 * e);
                var plus = t1 + t2;
                var minus = t1 - t2;

                if (Math.abs(plus) <= Polynomial.TOLERANCE) plus = 0;
                if (Math.abs(minus) <= Polynomial.TOLERANCE) minus = 0;

                if (plus >= 0) {
                    var f = Math.sqrt(plus);

                    results.push(-c3 / 4 + (e + f) / 2);
                    results.push(-c3 / 4 + (e - f) / 2);
                }
                if (minus >= 0) {
                    var f = Math.sqrt(minus);

                    results.push(-c3 / 4 + (f - e) / 2);
                    results.push(-c3 / 4 - (f + e) / 2);
                }
            } else if (discrim < 0) {
                // no roots
            } else {
                var t2 = y * y - 4 * c0;

                if (t2 >= -Polynomial.TOLERANCE) {
                    if (t2 < 0) t2 = 0;

                    t2 = 2 * Math.sqrt(t2);
                    t1 = 3 * c3 * c3 / 4 - 2 * c2;
                    if (t1 + t2 >= Polynomial.TOLERANCE) {
                        var d = Math.sqrt(t1 + t2);

                        results.push(-c3 / 4 + d / 2);
                        results.push(-c3 / 4 - d / 2);
                    }
                    if (t1 - t2 >= Polynomial.TOLERANCE) {
                        var d = Math.sqrt(t1 - t2);

                        results.push(-c3 / 4 + d / 2);
                        results.push(-c3 / 4 - d / 2);
                    }
                }
            }
        }

        return results;
    };

    Polynomial.prototype.getRoots = function () {
        var result;

        this.simplify();
        switch (this.getDegree()) {
        case 0:
            result = new Array();
            break;
        case 1:
            result = this.getLinearRoot();
            break;
        case 2:
            result = this.getQuadraticRoots();
            break;
        case 3:
            result = this.getCubicRoots();
            break;
        case 4:
            result = this.getQuarticRoots();
            break;
        default:
            result = new Array();
            // should try Newton's method and/or bisection
        }

        return result;
    };
    
    
    function create() {
        return new Polynomial(arguments);
    }


    exports.create = create;

});
define("plane/object/arc", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Arc = utility.object.inherits(function Arc(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.center = null;
        this.radius = null;
        this.startAngle = null;
        this.endAngle = null;

        this.initialize(attrs);

    }, shape.Base);

    Arc.prototype.calculeSegments = function () {

        var end = this.endAngle - this.startAngle;
        
        if (end < 0.0) {
            end += 360.0;
        }

        // .7 resolution
        var num1 = .7 / 180.0 * Math.PI;
        var num2 = this.startAngle / 180.0 * Math.PI;
        var num3 = end / 180.0 * Math.PI;

        if (num3 < 0.0)
            num1 = -num1;
        var size = Math.abs(num3 / num1) + 2;

        var index = 0;
        var num4 = num2;
        while (index < size - 1) {

            var xval = this.center.x + this.radius * Math.cos(num4);
            var yval = this.center.y + this.radius * Math.sin(num4);

            this.segments.push({
                x: xval,
                y: yval
            });
            ++index;
            num4 += num1;
        }

        var xval1 = this.center.x + this.radius * Math.cos(num2 + num3);
        var yval1 = this.center.y + this.radius * Math.sin(num2 + num3);

        this.segments[this.segments.length - 1].x = xval1;
        this.segments[this.segments.length - 1].y = yval1;
        
        return true;
        
    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Arc - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.center = point.create(attrs.center);
        
        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Arc(attrs);
    };

    exports.create = create;

});
define("plane/object/bezier-cubic", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Bezier Cubic
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    var BezierCubic = utility.object.inherits(function BezierCubic(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.points = attrs.points;

        this.initialize(attrs);

    }, shape.Base);


    // https://github.com/MartinDoms/Splines/blob/master/cubicBezier.js
    BezierCubic.prototype.calculeSegments = function () {

        var lineSegments = 100;

        var dot = function (v1, v2) {
            var sum = 0;
            for (var i = 0; i < v1.length; i++) {
                sum += v1[i] * v2[i];
            }
            return sum;
        };

        var cubicBezier = function (points, t) {
            var p0 = points[0];
            var p1 = points[1];
            var p2 = points[2];
            var p3 = points[3];
            var t3 = t * t * t;
            var t2 = t * t;

            var dx = dot([p0.x, p1.x, p2.x, p3.x], [(1 - t) * (1 - t) * (1 - t), 3 * (1 - t) * (1 - t) * t, 3 * (1 - t) * t2, t3]);
            var dy = dot([p0.y, p1.y, p2.y, p3.y], [(1 - t) * (1 - t) * (1 - t), 3 * (1 - t) * (1 - t) * t, 3 * (1 - t) * t2, t3]);

            return {
                x: dx,
                y: dy
            };
        }

        for (var j = 0; j < lineSegments + 1; j++) {
            this.segments.push(cubicBezier(this.points, j / lineSegments));
        }

        return true;
    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Bezier Cubic - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.points[0] = point.create(attrs.points[0]);
        attrs.points[1] = point.create(attrs.points[1]);
        attrs.points[2] = point.create(attrs.points[2]);
        attrs.points[3] = point.create(attrs.points[3]);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new BezierCubic(attrs);
    };

    exports.create = create;

});
define("plane/object/bezier-quadratic", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Structure
     * @extends Shape
     * @class Bezier Quadratic
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    var BezierQuadratic = utility.object.inherits(function BezierQuadratic(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.points = attrs.points;

        this.initialize(attrs);

    }, shape.Base);


    // https://github.com/MartinDoms/Splines/blob/master/quadraticBezier.js
    BezierQuadratic.prototype.calculeSegments = function () {

        var lineSegments = 100;

        var dot = function (v1, v2) {
            var sum = 0;
            for (var i = 0; i < v1.length; i++) {
                sum += v1[i] * v2[i];
            }
            return sum;
        }

        var quadraticBezier = function (points, t) {
            var p0 = points[0];
            var p1 = points[1];
            var p2 = points[2];
            var t3 = t * t * t;
            var t2 = t * t;

            var dx = dot([p0.x, p1.x, p2.x], [(1 - t) * (1 - t), 2 * t * (1 - t), t2]);
            var dy = dot([p0.y, p1.y, p2.y], [(1 - t) * (1 - t), 2 * t * (1 - t), t2]);

            return {
                x: dx,
                y: dy
            };
        }

        for (var j = 0; j < lineSegments + 1; j++) {
            this.segments.push(quadraticBezier(this.points, j / lineSegments));
        }

        return true;
    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Bezier Quadratic - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.points[0] = point.create(attrs.points[0]);
        attrs.points[1] = point.create(attrs.points[1]);
        attrs.points[2] = point.create(attrs.points[2]);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new BezierQuadratic(attrs);
    };

    exports.create = create;

});
define("plane/object/circle", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Circle
     * @constructor
     */
    var Circle = utility.object.inherits(function Circle(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.center = null;
        this.radius = null;

        this.initialize(attrs);

    }, shape.Base);

    Circle.prototype.calculeSegments = function () {

        // em numero de partes - 58 
        var num1 = Math.PI / 58;
        var size = Math.abs(2.0 * Math.PI / num1) + 2;
        var index = 0;
        var num2 = 0.0;

        while (index < size - 1) {
            this.segments.push({
                x: this.center.x + this.radius * Math.cos(num2),
                y: this.center.y + this.radius * Math.sin(num2)
            });
            ++index;
            num2 += num1;
        }

        return true;

    }
    
    Circle.prototype.isInside = function (point) {
        
        var distanceX = point.x - this.center.x,
            distanceY = point.y - this.center.y;
        
        return ((distanceX * distanceX) + (distanceY * distanceY)) <= (this.radius * this.radius);
        
    }
    


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Circle - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.center = point.create(attrs.center);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Circle(attrs);
    };

    exports.create = create;

});
define("plane/object/ellipse", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Ellipse
     * @constructor
     */
    var Ellipse = utility.object.inherits(function Ellipse(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.center = null;
        this.radiusY = null;
        this.radiusX = null;

        this.angle = null;
        this.startAngle = null;
        this.endAngle = null;

        this.initialize(attrs);

    }, shape.Base);

    Ellipse.prototype.calculeSegments = function () {

        var angle = (this.startAngle != undefined && this.endAngle != undefined) ? this.angle : utility.math.radians(this.angle) || 0;
        var startAngle = this.startAngle || 0;
        var endAngle = this.endAngle || (2.0 * Math.PI);

        while (endAngle < startAngle) {
            endAngle += 2.0 * Math.PI;
        }

        var radiusX = this.radiusX;
        var radiusY = this.radiusY;

        var num18 = Math.PI / 60.0;


        var num = Math.cos(angle);
        var num12 = Math.sin(angle);


        while (true) {
            if (startAngle > endAngle) {
                num18 -= startAngle - endAngle;
                startAngle = endAngle;
            }
            var p3 = {
                x: radiusX * Math.cos(startAngle),
                y: radiusY * Math.sin(startAngle)
            };
            // p3 *= matrix4x4F;
            // aplicando a matrix para a rotação
            p3 = {
                x: p3.x * num + p3.y * -num12,
                y: p3.x * num12 + p3.y * num
            }
            // o ponto de centro + o item da ellipse
            p3 = {
                x: this.center.x + p3.x,
                y: this.center.y + p3.y
            };

            // armazenando no array
            this.segments.push(p3);

            // continuando até a volta completa
            if (startAngle != endAngle)
                startAngle += num18;
            else
                break;
        }

        return true;

    }

    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Ellipse - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.center = point.create(attrs.center);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Ellipse(attrs);
    };

    exports.create = create;

});
define("plane/object/line", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Line = utility.object.inherits(function Line(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.from = null;
        this.to = null;

        this.initialize(attrs);

    }, shape.Base);

    Line.prototype.calculeSegments = function () {

        this.segments.push({
            x: this.from.x,
            y: this.from.y
        });
        this.segments.push({
            x: this.to.x,
            y: this.to.y
        });

        return true;

    }



    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Arc - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.from = point.create(attrs.from);
        attrs.to = point.create(attrs.to);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Line(attrs);
    };

    exports.create = create;

});
define("plane/object/polygon", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Polygon = utility.object.inherits(function Polygon(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.center = null;
        this.sides = null;
        this.radius = null;

        this.initialize(attrs);

    }, shape.Base);

    Polygon.prototype.calculeSegments = function () {

        for (var i = 0; i <= this.sides; i++) {

            var pointX = (this.radius * Math.cos(((Math.PI * 2) / this.sides) * i) + this.center.x),
                pointY = (this.radius * Math.sin(((Math.PI * 2) / this.sides) * i) + this.center.y);

            this.segments.push({
                x: pointX,
                y: pointY
            });
        }

        return true;

    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Polygon - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.center = point.create(attrs.center);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Polygon(attrs);
    };

    exports.create = create;

});
define("plane/object/polyline", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Polyline = utility.object.inherits(function Polyline(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.points = null;

        this.initialize(attrs);

    }, shape.Base);
    
    Polyline.prototype.calculeSegments = function(){
        
        this.segments = this.points;
        
        return true;
        
    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Arc - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.points = attrs.points.map(function(item){
            return point.create(item);
        });

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Polyline(attrs);
    };

    exports.create = create;
});
define("plane/object/rectangle", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Rectangle = utility.object.inherits(function Rectangle(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.from = null;
        this.to = null;

        this.initialize(attrs);

    }, shape.Base);

    Rectangle.prototype.calculeSegments = function () {

        this.segments.push({
            x: this.from.x,
            y: this.from.y
        });
        this.segments.push({
            x: this.from.x,
            y: this.to.y
        });
        this.segments.push({
            x: this.to.x,
            y: this.to.y
        });
        this.segments.push({
            x: this.to.x,
            y: this.from.y
        });
        this.segments.push({
            x: this.from.x,
            y: this.from.y
        });

        return true;

    }


    function create(attrs) {
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Arc - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.from = point.create(attrs.from);
        attrs.to = point.create(attrs.to);

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Rectangle(attrs);
    };

    exports.create = create;

});
define("plane/object/shape", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point');

    var utility = require('utility');

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    function Base() {};

    Base.prototype = {
        initialize: function (attrs) {

            // o nome do shape
            attrs.name = utility.string.format('{0} - {1}', [attrs.type, attrs.uuid]);

            // completando os campos do shape
            utility.object.extend(this, attrs);

            // calculando os segmentos
            this.calculeSegments();

            return true;
        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            var segmentA = null,
                segmentB = null;

            for (var i = 0; i < this.segments.length; i++) {

                if (i + 1 == this.segments.length) {
                    segmentA = this.segments[i];
                    segmentB = this.segments[0];
                } else {
                    segmentA = this.segments[i];
                    segmentB = this.segments[i + 1];
                }

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

            return false;

        },
        intersect: function (rectangle) {

            var tl = point.create(rectangle.from.x, rectangle.to.y), // top left
                tr = point.create(rectangle.to.x, rectangle.to.y), // top right
                bl = point.create(rectangle.from.x, rectangle.from.y), // bottom left
                br = point.create(rectangle.to.x, rectangle.from.y); // bottom right

            return intersection.segmentsRectangle(this.segments, tl, tr, bl, br);

        },
        render: function (context, transform) {

            // possivel personalização
            if (this.style) {
                context.save();

                if (this.style.lineDash) {
                    context.setLineDash([5, 2]);
                }
                if (this.style.fillColor){
                    context.fillStyle = this.style.fillColor;
                    context.strokeStyle = this.style.fillColor;
                }
                
                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
            }

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            for (var i = 0; i < this.segments.length; i++) {
                var x = this.segments[i].x * scale + move.x;
                var y = this.segments[i].y * scale + move.y;

                context.lineTo(x, y);
            }


            context.stroke();


            // possivel personalização
            if (this.style && this.style.fillColor) {
                context.fill();
            }
            if (this.style) {
                context.restore();
            }

        },
        toObject: function () {

            // converto para object os campos utilizando parseFloat

            //            return {
            //                uuid: this.uuid,
            //                type: this.type,
            //                name: this.name,
            //                status: this.status,
            //                x: utility.math.parseFloat(this.point.x, 5),
            //                y: utility.math.parseFloat(this.point.y, 5),
            //                radius: utility.math.parseFloat(this.radius, 5),
            //                startAngle: utility.math.parseFloat(this.startAngle, 5),
            //                endAngle: utility.math.parseFloat(this.endAngle, 5),
            //                clockWise: this.clockWise
            //            };

            return true;
        }
    };



    exports.Base = Base;

});
define("plane/object/spline", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        shape = require('plane/object/shape');

    var utility = require('utility');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Spline = utility.object.inherits(function Spline(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.degree = attrs.degree;
        this.knots = attrs.knots;
        this.points = attrs.points;

        this.initialize(attrs);

    }, shape.Base);

    Spline.prototype.calculeSegments = function () {

        /*
                    Finds knot vector span.

                    p : degree
                    u : parametric value
                    U : knot vector

                    returns the span
                */
        var findSpan = function (p, u, U) {
            var n = U.length - p - 1;

            if (u >= U[n]) {
                return n - 1;
            }

            if (u <= U[p]) {
                return p;
            }

            var low = p;
            var high = n;
            var mid = Math.floor((low + high) / 2);

            while (u < U[mid] || u >= U[mid + 1]) {

                if (u < U[mid]) {
                    high = mid;
                } else {
                    low = mid;
                }

                mid = Math.floor((low + high) / 2);
            }

            return mid;
        }

        /*
                    Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2

                    span : span in which u lies
                    u    : parametric point
                    p    : degree
                    U    : knot vector

                    returns array[p+1] with basis functions values.
                */
        var calcBasisFunctions = function (span, u, p, U) {
            var N = [];
            var left = [];
            var right = [];
            N[0] = 1.0;

            for (var j = 1; j <= p; ++j) {

                left[j] = u - U[span + 1 - j];
                right[j] = U[span + j] - u;

                var saved = 0.0;

                for (var r = 0; r < j; ++r) {

                    var rv = right[r + 1];
                    var lv = left[j - r];
                    var temp = N[r] / (rv + lv);
                    N[r] = saved + rv * temp;
                    saved = lv * temp;
                }

                N[j] = saved;
            }

            return N;
        }

        /*
                    Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.

                    p : degree of B-Spline
                    U : knot vector
                    P : control points (x, y, z, w)
                    u : parametric point

                    returns point for given u
                */
        var calcBSplinePoint = function (p, U, P, u) {
            var span = findSpan(p, u, U);
            var N = calcBasisFunctions(span, u, p, U);
            //                    var C = new THREE.Vector4(0, 0, 0, 0);
            var C = {
                x: 0,
                y: 0
            };

            for (var j = 0; j <= p; ++j) {
                var point = P[span - p + j];
                var Nj = N[j];
                //                        var wNj = point.w * Nj;
                C.x += point.x * Nj;
                C.y += point.y * Nj;
                //                        C.z += point.z * wNj;
                //                        C.w += point.w * Nj;
            }

            return C;
        }


        var getPoint = function (t, degree, knots, points) {

            var u = knots[0] + t * (knots[knots.length - 1] - knots[0]); // linear mapping t->u

            // following results in (wx, wy, wz, w) homogeneous point
            var hpoint = calcBSplinePoint(degree, knots, points, u);

            //                    if (hpoint.w != 1.0) { // project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
            //                        hpoint.divideScalar(hpoint.w);
            //                    }

            //                    return new THREE.Vector3(hpoint.x, hpoint.y, hpoint.z);
            return {
                x: hpoint.x,
                y: hpoint.y
            };
        }

        var getPoints = function (divisions, degree, knots, points) {

            var d, pts = [];

            for (d = 0; d <= divisions; d++) {

                pts.push(getPoint(d / divisions, degree, knots, points));

            }
            return pts;
        }

        var LEUWF3cpo = function (_param1, degree, knots, points) {

            var point3Farray = [];

            for (var index1 = 0; index1 < knots.length - 1; ++index1) {
                var num1 = knots[index1];
                var num2 = knots[index1 + 1];

                if (num2 > num1) {
                    for (var index2 = 0; index2 <= (_param1 == 0 ? 12 : _param1); ++index2) {
                        var p = calcBSplinePoint(degree, knots, points, num1 + (num2 - num1) * index2 / (_param1 == 0 ? 12.0 : _param1));
                        point3Farray.push(p);
                    }
                }
            }
            return point3Farray;
        }

        this.segments = LEUWF3cpo(17, this.degree, this.knots, this.points);


        return true;

    }


    function create(attrs) { 
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Spline - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.points = attrs.points.map(function(item){
            return point.create(item);
        });

        // 4 - caso update de um shape não merge em segments
        delete attrs['segments'];

        // 5 - criando um novo shape do tipo arco
        return new Spline(attrs);
    };

    exports.create = create;

});
define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var utility = require('utility');

    var matrix = require('plane/math/matrix');

    var layer = require('plane/core/layer'),
        point = require('plane/core/point'),
        shape = require('plane/core/shape'),
        group = require('plane/core/group'),
        tool = require('plane/core/tool'),
        view = require('plane/core/view');

    var importer = require('plane/data/importer'),
        exporter = require('plane/data/exporter');

    var viewPort = null;


    function initialize(config) {
        if (config == null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (typeof config == "function") {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (config.viewPort == null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // save in variable viewPort
        viewPort = config.viewPort;


        // montando o render de Plane
        var canvas = document.createElement('canvas');

        canvas.id = utility.math.uuid(9, 16);
        canvas.width = viewPort.clientWidth;
        canvas.height = viewPort.clientHeight;

        canvas.style.position = "absolute";
        canvas.style.backgroundColor = 'transparent';

        // add em viewPort HTMLElement
        viewPort.appendChild(canvas);


        // initialize view
        view.initialize({
            viewPort: viewPort,
            canvas: canvas
        });
        // initialize tool
        tool.initialize({
            viewPort: viewPort,
            view: view
        });


        // create the first layer
        layer.create();


        return true;
    }


    function clear() {

        // reset all parameters in view
        view.reset();

        // remove em todas as layers
        layer.remove();

        // create the first layer
        layer.create();

        return true;
    }

    function reset() {

        // reset all parameters in view
        view.reset();

        // remove em todas as layers
        layer.remove();

        return true;
    }






    exports.initialize = initialize;
    exports.clear = clear;

    exports.view = view;

    exports.point = point;
    exports.shape = shape;
    exports.group = group;

    exports.layer = layer;
    exports.tool = tool;

    exports.importer = {
        fromDxf: function (stringDxf) {
            // reset Plane
            reset();

            var stringJson = importer.parseDxf(stringDxf);
            var objectDxf = JSON.parse(stringJson);

            if (stringJson) {
                layer.create();
                for (var prop in objectDxf) {
                    shape.create(objectDxf[prop]);
                }
            }
        },
        fromJson: function (stringJson) {

            var objectPlane = JSON.parse(stringJson);

            reset();

            objectPlane.layers.forEach(function (objectLayer) {

                layer.create({
                    uuid: objectLayer.uuid,
                    name: objectLayer.name,
                    status: objectLayer.status,
                    style: objectLayer.style,
                });

                objectLayer.children.forEach(function (objectShape) {
                    shape.create(objectShape);
                });
            });

            view.zoomTo(objectPlane.zoom, point.create(objectPlane.center));

            return true;
        }
    };


    exports.exporter = {
        toJson: function () {

            var plane = {
                center: _view.center,
                zoom: _view.zoom,
                layers: layer.list().map(function (layer) {
                    return layer.status != 'system' ? layer.toObject() : null;
                }).filter(function (layer) {
                    return layer != undefined
                })
            }

            return JSON.stringify(plane);
        }
    };

});
// lilo003 - 2014.12.12 1009 - Primeira união de utility somando outras versão dos códigos
// lilo003 - 2014.12.12 1039 - Novo método em array = find
define("utility", ['require', 'exports'], function (require, exports) {

    var math = {
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
        },
        parseFloat: function (float, decimal) {
            return Number(parseFloat(float).toFixed(decimal));
        },
        // Converts from degrees to radians.
        radians: function (degrees) {
            return degrees * (Math.PI / 180);
        },
        // Converts from radians to degrees.
        degrees: function (radians) {
            return radians * (180 / Math.PI);
        }
    }


    var date = {

        format: function () {}

    }
    
    var array = {
        find: function (array, item) {
            return array[array.indexOf(item)];
        }
    }

    /**
     * Descrição para o objeto String no arquivo types.js
     *
     * @class String
     * @static
     */
    var string = {

        format: function (str, args) {
            return str.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        },
        contains: function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        },
        fromKeyPress: function (keyCode) {

            var keys = {
                '8': 'Backspace',
                '9': 'Tab',

                '13': 'Enter',
                '16': 'Shift',
                '17': 'Control',
                '18': 'Alt',
                '19': 'Pause/Break',

                '20': 'CapsLock',
                '27': 'Esc',

                '32': 'Spacebar',
                '33': 'PageUp',
                '34': 'PageDown',
                '35': 'End',
                '36': 'Home',
                '37': 'LeftArrow',
                '38': 'UpArrow',
                '39': 'RightArrow',

                '40': 'DownArrow',
                '45': 'Insert',
                '46': 'Delete',
                '48': '0',
                '49': '1',

                '50': '2',
                '51': '3',
                '52': '4',
                '53': '5',
                '54': '6',
                '55': '7',
                '56': '8',
                '57': '9',

                '65': 'A',
                '66': 'B',
                '67': 'C',
                '68': 'D',
                '69': 'E',

                '70': 'F',
                '71': 'G',
                '72': 'H',
                '73': 'I',
                '74': 'J',
                '75': 'K',
                '76': 'L',
                '77': 'M',
                '78': 'N',
                '79': 'O',

                '80': 'P',
                '81': 'Q',
                '82': 'R',
                '83': 'S',
                '84': 'T',
                '85': 'U',
                '86': 'V',
                '87': 'W',
                '88': 'X',
                '89': 'Y',

                '90': 'Z',

                '112': 'F1',
                '113': 'F2',
                '114': 'F3',
                '115': 'F4',
                '116': 'F5',
                '117': 'F6',
                '118': 'F7',
                '119': 'F8',

                '120': 'F9',
                '121': 'F10',
                '122': 'F11',
                '123': 'F12',
                '124': 'F13',

                '144': 'NumLock',
                '145': 'ScrollLock',

                '186': ';:',
                '187': '+=',
                '189': '-_',

                '191': '/?',
                '192': '`~',


            };

            return keys[keyCode];
        }

    }

    var graphic = {

        mousePosition: function (element, x, y) {

            var bb = element.getBoundingClientRect();

            x = (x - bb.left) * (element.clientWidth / bb.width);
            y = (y - bb.top) * (element.clientHeight / bb.height);

            // tradução para o sistema de coordenadas cartesiano
            y = (y - element.clientHeight) * -1;
            // Y - INVERTIDO

            return {
                x: x,
                y: y
            };
        },

        //        ATENÇÃO - quando context.transform() a inversão não é feita
        //        canvasPosition: function (element, x, y) {
        //            var bb = element.getBoundingClientRect();
        //
        //            x = (x - bb.left) * (element.clientWidth / bb.width);
        //            y = (y - bb.top) * (element.clientHeight / bb.height);
        //
        //            return {
        //                x: x,
        //                y: y
        //            };
        //        }

    }

    var data = {

        dictionary: (function () {

            function Dictionary() {
                this.store = [];
            }

            Dictionary.prototype = {
                add: function (key, value) {
                    return this.store[key] = value;
                },
                update: function (key, value) {
                    return this.store[key] = value;
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
                clear: function () {
                    return this.store = new Array();
                },
                list: function () {
                    var self = this;
                    return Object.keys(this.store).map(function (key) {
                        return self.store[key];
                    });
                }
            }

            Dictionary.create = function () {
                return new Dictionary();
            }

            return Dictionary;
        })(),

        list: (function () {

            function List() {
                this.store = [];
                this.size = 0;
                this.position = 0;
            }

            List.prototype = {
                add: function (element) {
                    this.store[this.size++] = element;
                },
                find: function (element) {
                    for (var i = 0; i < this.store.length; ++i) {
                        if (this.store[i] == element) {
                            return i;
                        }
                    }
                    return -1;
                },
                remove: function (element) {
                    var foundAt = this.find(element);
                    if (foundAt > -1) {
                        this.store.splice(foundAt, 1);
                        --this.size;
                        return true;
                    }
                    return false;
                },
                contains: function (element) {
                    for (var i = 0; i < this.store.length; ++i) {
                        if (this.store[i] == element) {
                            return true;
                        }
                    }
                    return false;
                },
                length: function () {
                    return this.size;
                },
                clear: function () {
                    delete this.store;
                    this.store = [];
                    this.size = this.position = 0;
                },
                list: function () {
                    return this.store;
                },
                first: function () {
                    this.position = 0;
                },
                last: function () {
                    this.position = this.size - 1;
                },
                previous: function () {
                    if (this.position > 0) {
                        --this.position;
                    }
                },
                next: function () {
                    if (this.position < this.size - 1) {
                        ++this.position;
                    }
                },
                currentPosition: function () {
                    return this.position;
                },
                moveTo: function (position) {
                    this.position = position;
                },
                getElement: function () {
                    return this.store[this.position];
                }
            }

            List.create = function () {
                return new List();
            }

            return List;

        })()

    }

    var conversion = {
        // http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
        toType: function (obj) {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        },
        toJson: function (obj) {
            return '';
        },
        toObject: function (obj) {
            return {};
        }
    }

    var object = {
        inherits: function (f, p) {
            f.prototype = new p();
            f.constructor = f;
            return f;
        },
        /*
         * Copy the enumerable properties of p to o, and return o
         * If o and p have a property by the same name, o's property is overwritten
         * This function does not handle getters and setters or copy attributes
         */
        extend: function (o, p) {
            for (var prop in p) { // For all props in p.
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor
                // 2014.08.08 11:00 - lilo - alteração para funcionar com propriedas e função "not own (prototype chain)" do objeto
                var desc = Object.getOwnPropertyDescriptor(p, prop);
                if (desc) {
                    Object.defineProperty(o, prop, desc); // add the property to o.
                } else {
                    o[prop] = p[prop];
                }
            }
            return this;
            // 2014.11.27 2047 - lilo - method chaining
            // return o;
        },
        /*
         * Copy the enumerable properties of p to o, and return o
         * If o and p have a property by the same name, o's property is left alone
         * This function does not handle getters and setters or copy attributes
         */
        merge: function (o, p) {
            for (var prop in p) { // For all props in p
                if (o.hasOwnProperty[prop]) continue; // Except those already in o
                o[prop] = p[prop]; // add the property to o
            }
            return o;
        },
        /*
         * Remove properties from o if there is not a property with the same name in p
         * Return o
         */
        restrict: function (o, p) {
            for (var prop in o) { // For all props in o
                if (!(prop in p)) delete o[prop]; // remove if not in p
            }
            return o;
        },
        /*
         * For each property of p, remove the property with the same name from o
         * Return o
         */
        subtract: function (o, p) {
            for (var prop in p) { // For all props in p
                delete o[prop]; // remove from o (deleting a nonexistent prop is harmless)
            }
            return o;
        },
        /* 
         * Return a new object that holds the properties of both o and p.
         * If o and p have properties by the same name, the values from o are used
         */
        union: function (o, p) {
            return object.extend(object.extend({}, o), p);
        },
        /*
         * Return a new object that holds only the properties of o that also appear
         * in p. This is something like the intersection of o and p, but the values of
         * the properties in p are discarded
         */
        intersection: function (o, p) {
            return object.restrict(object.extend({}, o), p);
        },
        /*
         * Return an array that holds the names of the enumerable own properties of o
         */
        keys: function (o) {
            if (typeof o !== "object") throw typeError(); // Object argument required
            var result = []; // The array we will return
            for (var prop in o) { // For all enumerable properties
                if (o.hasOwnProperty(prop)) // If it is an own property
                    result.push(prop); // add it to the array.
            }
            return result; // Return the array.
        },
        event: (function () {

            function Event() {
                this.listeners = {};
            }

            Event.prototype.listen = function (event, handler) {
                (this.listeners[event] = this.listeners[event] || []).push(handler);
            };

            Event.prototype.notify = function (event, data) {
                if (this.listeners[event] !== undefined) {
                    for (var callback in this.listeners[event]) {
                        this.listeners[event][callback].call(this, data);
                    }
                }
            };

            Event.prototype.unListen = function (event, handler) {
                if (this.listeners[event] !== undefined) {
                    var index = this.listeners[event].indexOf(handler);
                    if (index !== -1) {
                        this.listeners[event].splice(index, 1);
                    }
                }
            };

            Event.create = function () {
                return new Event();
            }

            return Event;

        })(),
        mediator: (function () {
            // Storage for our topics/events
            var channels = {};
            // Subscribe to an event, supply a callback to be executed
            // when that event is broadcast
            var subscribe = function (channel, fn) {
                if (!channels[channel]) channels[channel] = [];
                channels[channel].push({
                    context: this,
                    callback: fn
                });
                return this;

            };
            // Publish/broadcast an event to the rest of the application
            var publish = function (channel) {
                if (!channels[channel]) return false;
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, l = channels[channel].length; i < l; i++) {
                    var subscription = channels[channel][i];
                    subscription.callback.apply(subscription.context, args);
                }
                return this;
            };
            return {
                publish: publish,
                subscribe: subscribe,
                installTo: function (obj) {
                    obj.subscribe = subscribe;
                    obj.publish = publish;
                }
            };
        })()
    }

    exports.math = math;
    exports.string = string;
    exports.array = array;
    exports.graphic = graphic;
    exports.data = data;
    exports.date = date;
    exports.object = object;
    exports.conversion = conversion;
});
window.plane = require("plane");
})(window);