(function (plane) {
    "use strict";

    var _tools = null,
        _viewPort = null,
        _matrix = null;


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
                if (this._active !== value) {
                    this.events.notify(value ? 'onActive' : 'onDeactive', {
                        type: value ? 'onActive' : 'onDeactive',
                        now: new Date().toISOString()

                    });
                    this._active = value;
                }
            }
        });

        this.active = attrs.active;

    }


    plane.tool = {
        _initialize: function (config) {

            _viewPort = config.viewPort;
            _matrix = config.matrix;

            _tools = plane.math.dictionary.create();


            function onMouseWheel(event) {

                var pointInCanvas = mousePosition(_viewPort, event.x, event.y),
                    pointInView = _matrix.inverseTransform(pointInCanvas);

                // customized event
                event = {
                    type: 'onMouseWheel',
                    delta: event.deltaY,
                    point: plane.point.create(pointInView),
                    now: new Date().toISOString()
                };

                var tools = _tools.list(),
                    t = tools.length;
                while (t--) {
                    if (tools[t].active) {
                        tools[t].events.notify('onMouseWheel', event);
                    }
                }
            }

            _viewPort.onmousewheel = onMouseWheel;

            return true;

        },
        create: function (attrs) {
            if (plane.utility.conversion.toType(attrs) !== 'object') {
                throw new Error('tool - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            var uuid = plane.utility.math.uuid(9, 16);

            attrs = plane.utility.object.merge({
                uuid: uuid,
                name: 'tool - '.concat(uuid),
                events: plane.utility.object.event.create(),
                active: false
            }, attrs);

            // nova tool
            var tool = new Tool(attrs);

            _tools.add(tool.uuid, tool);

            return tool;
        }
    };


    function mousePosition(element, x, y) {

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
    }

})(plane);