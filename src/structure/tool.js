define("structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var store = types.data.dictionary.create();

    var point = require('structure/point');

    var viewPort = null,
        select = null,
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
        select = config.select;
        view = config.view;

        var pointDown,
            shapesOver = types.data.dictionary.create();


        function onMouseDown(event) {

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas);


            var children = select.layer.children.list(),
                c = children.length,
                shapes = [];

            while (c--) {
                if (children[c].contains(point.create(0, 0), view.transform))
                    shapes.push(children[c]);
            }

            pointDown = point.create(pointInView);


            // customized event
            event = {
                type: 'onMouseDown',
                point: pointDown,
                shapes: shapes,
                now: new Date().toISOString()
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

        function onMouseDrag(event) {

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

            var pointInCanvas = types.graphic.mousePosition(viewPort, event.x, event.y),
                pointInView = view.transform.inverseTransform(pointInCanvas),
                pointMove = point.create(pointInView);


            // apenas procuro na layer selecionada
            var children = select.layer.children.list(),
                c = children.length;

            while (c--) {
                if (children[c].contains(pointMove, view.transform)) {
                    shapesOver.add(children[c].uuid, children[c]);
                } else {
                    shapesOver.remove(children[c].uuid);
                }
            }


            // customized event
            event = {
                type: 'onMouseMove',
                point: pointMove,
                shapes: shapesOver.list(),
                Now: new Date().toISOString()
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