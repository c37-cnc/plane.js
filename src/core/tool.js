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


            // vinculo o event keydown ao window
            window.addEventListener('keydown', onKeyDown, false);

            // vinculo os eventos criados com o componente html
            _viewPort.onmousedown = onMouseDown;
            _viewPort.onmouseup = onMouseUp;
            _viewPort.addEventListener(/Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel", onMouseWheel);
            _viewPort.addEventListener('mousemove', onMouseMove, false);
            _viewPort.addEventListener('mousemove', onMouseDrag, false);
            _viewPort.onmouseleave = onMouseLeave;
            // vinculo os eventos criados com o componente html

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


    function onKeyDown(event) {

        // se backspace e não um target do tipo text, desabilito o evento default 'retornar para a pagina anterior'
        if ((event.keyCode === 8) && (event.target.tagName !== 'INPUT') && (event.target.tagName !== 'P')) {
            event.preventDefault();
        }

        // customized event
        event = {
            type: 'onKeyDown',
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            key: plane.utility.string.fromKeyPress(event.keyCode),
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
            pointInView = _matrix.inverseTransform(pointInCanvas);

        // dizendo que o MouseDown preenche o evento down
        _mouseDown = pointInView;

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
            objects: {
                groups: groupFind(rectangle),
                shapes: shapesFind(rectangle)
            },
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
                        point: {
                            from: from,
                            to: to
                        },
                        objects: {
                            groups: groupFind(rectangle),
                            shapes: shapesFind(rectangle)
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
                groups: groupFind(rectangle),
                shapes: shapesFind(rectangle)
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

    function shapesFind(rectangle) {

        var shapesFinded = [];

        // segundo - os shapes
        var shapes = plane.shape.find(rectangle);
        if (shapes.length > 0) {
            var i = 0;
            do {
                if (plane.math.intersect(shapes[i]._segments, rectangle)) {
                    shapesFinded.push(shapes[i]);
                }
                i++;
            } while (i < shapes.length)
        }

        return shapesFinded;

    }

    function groupFind(rectangle) {

        var groupFinded = [];

        var groups = plane.group.find(rectangle);
        if (groups.length > 0) {
            var i = 0;
            do {
                var ii = 0,
                    shapes = groups[i].children.list();
                do {
                    if (plane.math.intersect(shapes[ii]._segments, rectangle)) {
                        groupFinded.push(groups[i]);
                        // caso seja localizado apenas um shape dentro do group paro
                        // a pesquisa para não add o mesmo grou mais de uma vez
                        break;
                    }
                    ii++;
                } while (ii < shapes.length)
                i++;
            } while (i < groups.length)
        }

        return groupFinded;

    }

})(plane);