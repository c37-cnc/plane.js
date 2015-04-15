(function (plane) {
    "use strict";

    var _tools = null,
        _matrix = null,
        _viewPort = null,
        _mouseDown = null; // usado para calculo do evento onMouseDrag



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

                var pointInCanvas = mousePosition(_viewPort, event.x || event.clientX, event.y || event.clientY),
                    pointInView = _matrix.inverseTransform(pointInCanvas);

                // customized event
                event = {
                    type: 'onMouseWheel',
                    delta: event.detail || (event.wheelDelta * -1),
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

            function onMouseDown(event) {

                var pointInCanvas = mousePosition(_viewPort, event.x, event.y),
                    pointInView = _matrix.inverseTransform(pointInCanvas),
                    objects = [];

                // dizendo que o mouse preenche o evento down
                _mouseDown = pointInView;


                // com uma tolerancia para os limites não ficar sem cima dos shapes
                var angleInRadian = 0.7853981634,
                    lineSizeValue = 5 / plane.view.zoom; // o valor + o respectivo zoom

                var minPoint = plane.point.create(pointInView.x + (-lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (-lineSizeValue * Math.sin(angleInRadian))),
                    maxPoint = plane.point.create(pointInView.x + (+lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (+lineSizeValue * Math.sin(angleInRadian)));

                var rectangle = {
                    from: minPoint,
                    to: maxPoint
                };

                // primeiro - os groups
                var groups = plane.group.find(rectangle);
                if (groups.length > 0) {
                    var i = 0;
                    do {
                        var ii = 0,
                            shapes = groups[i].children.list();
                        do {
                            if (plane.math.intersect(shapes[ii]._segments, rectangle)) {
                                objects.push(groups[i]);
                            }
                            ii++;
                        } while (ii < shapes.length)
                        i++;
                    } while (i < groups.length)
                }

                // segundo - os shapes
                var shapes = plane.shape.find(rectangle);
                if (shapes.length > 0) {
                    var i = 0;
                    do {
                        if (plane.math.intersect(shapes[i]._segments, rectangle)) {
                            objects.push(shapes[i]);
                        }
                        i++;
                    } while (i < shapes.length)
                }

                // customized event
                event = {
                    type: 'onMouseDown',
                    target: event.target,
                    objects: objects,
                    point: plane.point.create(pointInView),
                    now: new Date().toISOString()
                };

                // propagação do evento para tools ativas
                var tools = _tools.list(),
                    t = tools.length;
                while (t--) {
                    if (tools[t].active) {
                        tools[t].events.notify('onMouseDown', event);
                    }
                }

            }

            function onMouseUp(event) {

                var pointInCanvas = mousePosition(_viewPort, event.x, event.y),
                    pointInView = _matrix.inverseTransform(pointInCanvas);

                // limpo está variável que é o controle para disparar o evento onMouseDrag
                _mouseDown = null;

                // customized event
                event = {
                    type: 'onMouseUp',
                    point: plane.point.create(pointInView),
                    now: new Date().toISOString()
                };

                // propagação do evento para tools ativas
                var tools = _tools.list(),
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
                if (_mouseDown) {

                    var pointInCanvas = mousePosition(_viewPort, event.x, event.y),
                        pointInView = _matrix.inverseTransform(pointInCanvas),
                        objects = [];

                    var from = plane.point.create(_mouseDown),
                        to = plane.point.create(pointInView);

                    if (from.x > to.x) {
                        var fromOld = from,
                            toOld = to;

                        from = plane.point.create(toOld.x, fromOld.y);
                        to = plane.point.create(fromOld.x, toOld.y);
                    }
                    if (from.y > to.y) {
                        var fromOld = from,
                            toOld = to;

                        from = plane.point.create(fromOld.x, toOld.y);
                        to = plane.point.create(toOld.x, fromOld.y);
                    }


                    var rectangle = {
                        from: from,
                        to: to
                    };

                    // primeiro - os groups
                    var groups = plane.group.find(rectangle);
                    if (groups.length > 0) {
                        var i = 0;
                        do {
                            var ii = 0,
                                shapes = groups[i].children.list();
                            do {
                                if (plane.math.intersect(shapes[ii]._segments, rectangle)) {
                                    objects.push(groups[i]);
                                }
                                ii++;
                            } while (ii < shapes.length)
                            i++;
                        } while (i < groups.length)
                    }

                    // segundo - os shapes
                    //debugger;

                    var shapes = plane.shape.find(rectangle);
                    if (shapes.length > 0) {
                        var i = 0;
                        do {
                            if (plane.math.intersect(shapes[i]._segments, rectangle)) {
                                objects.push(shapes[i]);
                            }
                            i++;
                        } while (i < shapes.length)
                    }


                    // os pontos de inicio e fim devem ser diferentes para o evento ser disparado
                    if (!from.equals(to)) {

                        event = {
                            type: 'onMouseDrag',
                            point: {
                                from: from,
                                to: to
                            },
                            objects: objects,
                            now: new Date().toISOString()
                        };

                        var tools = _tools.list(),
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

                var pointInCanvas = mousePosition(_viewPort, event.x, event.y),
                    pointInView = _matrix.inverseTransform(pointInCanvas),
                    objects = [];


                // com uma tolerancia para os limites não ficar sem cima dos shapes
                var angleInRadian = 0.7853981634,
                    lineSizeValue = 5 / plane.view.zoom; // o valor + o respectivo zoom

                var minPoint = plane.point.create(pointInView.x + (-lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (-lineSizeValue * Math.sin(angleInRadian))),
                    maxPoint = plane.point.create(pointInView.x + (+lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (+lineSizeValue * Math.sin(angleInRadian)));

                var rectangle = {
                    from: minPoint,
                    to: maxPoint,
                    center: {
                        x: (minPoint.x + maxPoint.x) / 2,
                        y: (minPoint.y + maxPoint.y) / 2
                    }
                };

                // primeiro - os groups
                var groups = plane.group.find(rectangle);
                if (groups.length > 0) {
                    var i = 0;
                    do {
                        var ii = 0,
                            shapes = groups[i].children.list();
                        do {
                            if (plane.math.intersect(shapes[ii]._segments, rectangle)) {
                                objects.push(groups[i]);
                            }
                            ii++;
                        } while (ii < shapes.length)
                        i++;
                    } while (i < groups.length)
                }

                // segundo - os shapes
                var shapes = plane.shape.find(rectangle);
                if (shapes.length > 0) {
                    var i = 0;
                    do {
                        if (plane.math.intersect(shapes[i]._segments, rectangle)) {
                            objects.push(shapes[i]);
                        }
                        i++;
                    } while (i < shapes.length)
                }


                // customized event
                event = {
                    type: 'onMouseMove',
                    point: plane.point.create(pointInView),
                    objects: objects,
                    now: new Date().toISOString()
                };

                var tools = _tools.list(),
                    t = tools.length;
                while (t--) {
                    if (tools[t].active) {
                        tools[t].events.notify('onMouseMove', event);
                    }
                }
            }

            _viewPort.onmousedown = onMouseDown;
            _viewPort.onmouseup = onMouseUp;
            // compatibilidade com Firefox
            _viewPort.addEventListener(/Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel", onMouseWheel);
            _viewPort.addEventListener('mousemove', onMouseMove, false);
            _viewPort.addEventListener('mousemove', onMouseDrag, false);


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