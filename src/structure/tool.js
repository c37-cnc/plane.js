define("plane/structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var store = types.data.dictionary.create();

    var layer = require('plane/structure/layer'),
        point = require('plane/structure/point');

    var viewPort = null,
        view = null;


    function Tool(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.events = attrs.events;

        Object.defineProperty(this, 'active', {
            get: function () {
                return this._active || false;
            },
            set: function (value) {
                this.events.notify(value ? 'onActive' : 'onDeactive', {
                    type: value ? 'onActive' : 'onDeactive',
                    Now: new Date().toISOString()

                });
                this._active = value;
            }
        });

        this.active = attrs.active;
    };


    function initialize(config) {

        viewPort = config.viewPort;
        //        select = config.select;
        view = config.view;

        var pointDown,
            //            shapesSelect = select.shapes,
            shapesOver = types.data.dictionary.create();


        function onMouseDown(event) {

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                mouseInCanvas = types.graphic.canvasPosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas),
                pointMove = point.create(pointInView),
                shapesSelect = [];

            // to point
            pointInCanvas = point.create(pointInCanvas);

            // dizendo que o mouse preenche o evento down
            pointDown = point.create(pointInView);

            // verifico se o local onde o ponto está possui alguma shape como imagem
            var imageData = [].some.call(view.context.getImageData(mouseInCanvas.x, mouseInCanvas.y, 3, 3).data, function (element) {
                return element > 0;
            });

            //            debugger;

            // caso positivo realizamos a procura 
            if (imageData && layer.active && layer.active.status != 'system') {
                // apenas procuro na layer selecionada
                var children = layer.active.children.list(),
                    c = children.length;

                while (c--) {
                    if (children[c].contains(pointInCanvas, view.transform)) {
                        shapesSelect.push(children[c]);
                        //                        break; - lilo - teste de performance
                    }
                }
            }


            // customized event
            event = {
                type: 'onMouseDown',
                point: pointMove,
                shapes: shapesSelect,
                Now: new Date().toISOString()
            };

            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseDown', event);
                }
            }


        }

        function onMouseUp(event) {
            pointDown = null;
        }

        // Mouse Drag com o evento Mouse Move
        function onMouseDrag(event) {
            // se Mouse Down preenchido 
            if (pointDown) {
                var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                    pointInView = view.transform.inverseTransform(pointInCanvas);

                // http://paperjs.org/reference/toolevent/#point
                event = {
                    type: 'onMouseDrag',
                    pointFirst: pointDown,
                    pointLast: point.create(pointInView),
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

        function onMouseMove(event) {

            //            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
            //                mouseInCanvas = types.graphic.canvasPosition(viewPort, event.x, event.y),
            //                pointInView = view.transform.inverseTransform(pointInCanvas);
            //
            //            // to point para procura em contains
            //            pointInCanvas = point.create(pointInCanvas);
            //
            //            // verifico se o local onde o ponto está possui alguma shape como imagem
            //            var imageData = [].some.call(view.context.getImageData(mouseInCanvas.x, mouseInCanvas.y, 3, 3).data, function (element) {
            //                return element > 0;
            //            });
            //
            //            // caso positivo realizamos a procura 
            //            if (imageData && select.layer && select.layer.status != 'system') {
            //                // apenas procuro na layer selecionada
            //                var children = select.layer.children.list(),
            //                    c = children.length;
            //
            //                while (c--) {
            //                    if (children[c].contains(pointInCanvas, view.transform)) {
            //                        shapesOver.add(children[c].uuid, children[c]);
            //                        //                        break; - lilo - teste de performance
            //                    } else {
            //                        shapesOver.remove(children[c].uuid);
            //                    }
            //                }
            //            } else { // caso negativo - limpamos os shapesOver
            //                shapesOver.clear();
            //            }
            //
            //            // customized event
            //            event = {
            //                type: 'onMouseMove',
            //                point: {
            //                    inDocument: point.create(event.x, event.y),
            //                    inCanvas: point.create(mouseInCanvas.x, mouseInCanvas.y),
            //                    inView: point.create(pointInView)
            //                },
            //                shapes: shapesOver.list(),
            //                Now: new Date().toISOString()
            //            };
            //
            //            var tools = store.list(),
            //                t = tools.length;
            //            while (t--) {
            //                if (tools[t].active) {
            //                    tools[t].events.notify('onMouseMove', event);
            //                }
            //            }
        }

        function onMouseLeave(event) {
            //            pointDown = null;
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


        viewPort.onmousedown = onMouseDown;
        viewPort.onmouseup = onMouseUp;
        viewPort.addEventListener('mousemove', onMouseMove, false);
        viewPort.addEventListener('mousemove', onMouseDrag, false);
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
            name: 'Tool '.concat(uuid),
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