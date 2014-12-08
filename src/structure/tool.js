define("plane/structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var store = types.data.dictionary.create();

    var point = require('plane/structure/point');

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

            // se backspace desabilito o evento default 'retornar para a pagina anterior'
            if (event.keyCode == 8){
                event.preventDefault();
            }
            
            // customized event
            event = {
                type: 'onKeyDown',
                key: types.string.fromKeyPress(event.keyCode),
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

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);

            // dizendo que o mouse preenche o evento down
            mouseDown = pointInView;

            // customized event
            event = {
                type: 'onMouseDown',
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

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
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

                var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                    pointInView = view.transform.inverseTransform(pointInCanvas);

                var pointFirst = point.create(mouseDown),
                    pointLast = point.create(pointInView);

                // os pontos de inicio e fim devem ser diferentes para o evento ser disparado
//                if ((pointFirst.x != pointLast.x) || (pointFirst.y != pointLast.y)) {
                if (!pointFirst.equals(pointLast)) {

                    event = {
                        type: 'onMouseDrag',
                        pointFirst: pointFirst,
                        pointLast: pointLast,
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

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);

            // 2014.12.05 - lilo - cópia de código errado - VERIFICAR!
            // pointInCanvas = types.graphic.canvasPosition(viewPort, event.x, event.y);

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

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
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

        var uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            uuid: uuid,
            name: 'tool - '.concat(uuid),
            events: types.object.event.create(),
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