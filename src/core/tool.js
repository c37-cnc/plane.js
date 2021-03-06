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
        this.priority = attrs.priority;

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

            // vinculo o event keydown ao window
            window.addEventListener('keydown', onKeyDown, false);

            // vinculo os eventos criados com o componente html
            _viewPort.onmousedown = onMouseDown;
            _viewPort.onmouseup = onMouseUp;
            _viewPort.addEventListener(/Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel", onMouseWheel);
            _viewPort.addEventListener('mousemove', onMouseMove, false);
            _viewPort.addEventListener('mousemove', onMouseDrag, false);
            _viewPort.onmouseleave = onMouseLeave;
            _viewPort.oncontextmenu = function () {
                return false;
            };
            // vinculo os eventos criados com o componente html

            return true;

        },
        create: function (attrs) {
            if ((attrs) && (typeof attrs !== 'object')) {
                throw new Error('tool - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            var uuid = plane.utility.math.uuid(9, 16);

            attrs = plane.utility.object.merge({
                uuid: uuid,
                name: 'tool - '.concat(uuid),
                events: plane.utility.object.event.create(),
                active: false,
                priority: false
            }, attrs);

            // nova tool
            var tool = new Tool(attrs);

            _tools.add(tool.uuid, tool);

            return tool;
        }
    };


    function onKeyDown(event) {

        // se backspace e não um target do tipo text, desabilito o evento default 'retornar para a pagina anterior'
        if ((event.keyCode === 8) && (event.target.tagName !== 'INPUT') && (event.target.tagName !== 'P')) {
            event.preventDefault();
        }

        var pointInCanvas = mousePosition(_viewPort, event.x || event.clientX, event.y || event.clientY),
            pointInView = _matrix.inverseTransform(pointInCanvas);



        // customized event
        event = {
            type: 'onKeyDown',
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            key: plane.utility.string.fromKeyPress(event.keyCode),
            point: plane.point.create(pointInView),
            now: new Date().toISOString()
        };

        // propagação do evento para tools ativas
        var tools = _tools.list(),
            t = tools.length;
        while (t--) {
            if (tools[t].active) {
                tools[t].events.notify('onKeyDown', event);
            }
        }

    }

    function onMouseWheel(event) {

        var pointInCanvas = mousePosition(_viewPort, event.x || event.clientX, event.y || event.clientY),
            pointInView = _matrix.inverseTransform(pointInCanvas);

        // com uma tolerancia para os limites não ficar sem cima dos shapes
        var angleInRadian = 0.7853981634, // 45 graus
            lineSizeValue = 5 / plane.view.zoom; // o valor + o respectivo zoom

        // o rectangle da pesquisa
        var rectangle = {
            from: plane.point.create(pointInView.x + (-lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (-lineSizeValue * Math.sin(angleInRadian))),
            to: plane.point.create(pointInView.x + (+lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (+lineSizeValue * Math.sin(angleInRadian)))
        };


        // customized event
        event = {
            type: 'onMouseWheel',
            delta: event.detail || (event.wheelDelta * -1),
            objects: {
                groups: plane.group.find(rectangle, null, 'shapes'),
                shapes: plane.shape.find(rectangle, null, 'shapes')
            },
            point: plane.point.create(pointInView),
            now: new Date().toISOString()
        };

        var tools = _tools.list(),
            t = tools.length;

        // sort, toda(s) a(s) tools(s) priority(s) devem ser as primeiras
        // procedimento criado afim de ordenar de forma simples a propagação dos eventos
        tools.sort(function (a, b) {
            if (!a.priority)
                return -1;
            if (a.priority)
                return 1;
            return 0;
        });

        while (t--) {
            if (tools[t].active) {
                tools[t].events.notify('onMouseWheel', event);
            }
        }
    }

//    function sleepFor(sleepDuration) {
//        var now = new Date().getTime();
//        while (new Date().getTime() < now + sleepDuration) { /* do nothing */
//        }
//    }

    function onMouseDown(event) {

        var pointInCanvas = mousePosition(_viewPort, event.x, event.y),
            pointInView = _matrix.inverseTransform(pointInCanvas);

        // dizendo que o MouseDown preenche o evento down
        // apenas se for o click com left
//        if (event.button === 0) {
//            _mouseDown = pointInView;
//        }
        if ((event.button === 0) && (_tools.list().filter(function (tool) {
            return tool.active;
        }).length > 0)) {
            _mouseDown = pointInView;
        }

        // com uma tolerancia para os limites não ficar sem cima dos shapes
        var angleInRadian = 0.7853981634, // 45 graus
            lineSizeValue = 5 / plane.view.zoom; // o valor + o respectivo zoom

        // o rectangle da pesquisa
        var rectangle = {
            from: plane.point.create(pointInView.x + (-lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (-lineSizeValue * Math.sin(angleInRadian))),
            to: plane.point.create(pointInView.x + (+lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (+lineSizeValue * Math.sin(angleInRadian)))
        };

        // customized event
        event = {
            type: 'onMouseDown',
            button: event.button === 0 ? 'left' : event.button === 1 ? 'wheel' : 'right',
            objects: {
                groups: plane.group.find(rectangle, null, 'shapes'),
                shapes: plane.shape.find(rectangle, null, 'shapes')
            },
            target: event.target,
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
                pointInView = _matrix.inverseTransform(pointInCanvas);

            // para formar um rectangle com inicio 
            var from = plane.point.create(_mouseDown),
                to = plane.point.create(pointInView);

            // se os pontos de inicio e fim são diferentes, então o evento é disparado
            if (!from.equals(to)) {

                // apenas para as ferramensas activas
                var tools = _tools.list().filter(function (tool) {
                    return tool.active;
                });

                // como filter return array, temos MESMO ferramentas activas?
                if (tools.length > 0) {

                    // para um rectangle sempre - no menor x
                    if (from.x > to.x) {
                        var fromOld = from,
                            toOld = to;

                        from = plane.point.create(toOld.x, fromOld.y);
                        to = plane.point.create(fromOld.x, toOld.y);
                    }
                    // para um rectangle sempre - no menor y
                    if (from.y > to.y) {
                        var fromOld = from,
                            toOld = to;

                        from = plane.point.create(fromOld.x, toOld.y);
                        to = plane.point.create(toOld.x, fromOld.y);
                    }

                    // o rectangle da pesquisa
                    var rectangle = {
                        from: from,
                        to: to
                    };


                    event = {
                        type: 'onMouseDrag',
                        points: {
                            from: from,
                            to: to
                        },
                        objects: {
                            groups: plane.group.find(rectangle, null, 'shapes'),
                            shapes: plane.shape.find(rectangle, null, 'shapes')
                        },
                        now: new Date().toISOString()
                    };


                    var i = 0;
                    do {
                        tools[i].events.notify('onMouseDrag', event);
                        i++;
                    } while (i < tools.length)

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

        // o rectangle da pesquisa
        var rectangle = {
            from: plane.point.create(pointInView.x + (-lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (-lineSizeValue * Math.sin(angleInRadian))),
            to: plane.point.create(pointInView.x + (+lineSizeValue * Math.cos(angleInRadian)), pointInView.y + (+lineSizeValue * Math.sin(angleInRadian)))
        };

        // customized event
        event = {
            type: 'onMouseMove',
            objects: {
                groups: plane.group.find(rectangle, null, 'shapes'),
                shapes: plane.shape.find(rectangle, null, 'shapes')
            },
            point: plane.point.create(pointInView),
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

    function onMouseLeave(event) {
        _mouseDown = null;
    }

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

})(c37.library.plane);