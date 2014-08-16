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


        function onMouseDown(event) {

        }

        function onMouseUp(event) {

        }

        function onMouseDrag(event) {
            // http://paperjs.org/reference/toolevent/#point
            event = {
                pointFirst: null,
                pointMiddle: null,
                pointLast: null
            }

            var tools = store.list(),
                t = tools.length;
            while (t--) {
                if (tools[t].active) {
                    tools[t].events.notify('onMouseDrag', event);
                }
            }
        }

        function onMouseMove(event) {
            // apenas procuro na layer selecionada
            var children = select.layer.children.list(),
                c = children.length,
                shapes = [];

            while (c--) {
                if (children[c].contains(point.create(0, 0), view.transform))
                    shapes.push(children[c]);
            }
            
            
            // customized event
            event = {
                positionInView: {
                    x: 0,
                    y: 0
                },
                shapes: shapes,
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
            
            debugger;
            
//            var lll = point.create(types.graphic.mousePosition(viewPort, event.x, event.y));
            var lll = types.graphic.mousePosition(viewPort, event.x, event.y);
            var fff = view.transform.inverseTransform(lll);
            
            
            
            // customized event
            event = {
                delta: event.deltaY,
                point: point.create(fff),
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
        viewPort.onmousemove = onMouseMove;
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