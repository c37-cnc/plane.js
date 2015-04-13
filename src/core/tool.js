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

            function onMouseMove(event) {

                var pointInCanvas = mousePosition(_viewPort, event.x, event.y),
                    pointInView = _matrix.inverseTransform(pointInCanvas),
                    objects = [];


                // um remendo para o calculo
                var angleInRadian = 0.7853981634,
                    lineSizeValue = 5 / plane.view.zoom;

                // com uma tolerancia para os limites não ficar sem cima dos shapes
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

                var shapes = plane.shape.find(rectangle);

                if (shapes.length > 0) {

                    var i = 0;
                    do {
                        // clonando os segmentos, para fazer o counter-clockwise da verificação de colisão
//                        var segments = shapes[i]._segments.slice();
//                        var polygon = new plane.math.collision.Polygon(null, segments);
//                        var circle = new plane.math.collision.Circle(new plane.math.collision.Vector(rectangle.center.x, rectangle.center.y), 5 / plane.view.zoom);
//
//                        if (plane.math.collision.testPolygonCircle(polygon, circle)) {
//                            objects.push(shapes[i]);
//                        }
                        
                        //debugger;

//                        var polygon = {
//                            points: shapes[i]._segments
//                        };
//                        var circle = {
//                            center: rectangle.center,
//                            radius: 3 / plane.view.zoom
//                        };
//
//                        if (plane.math.intersect(polygon, circle)) {
//                            objects.push(shapes[i]);
//                        }

                        if (plane.math.intersect(shapes[i]._segments, rectangle)) {
                            objects.push(shapes[i]);
                        }

                        i++;
                    } while (i < shapes.length)


                    console.log(objects);
                }





                // customized event
                event = {
                    type: 'onMouseMove',
                    point: {
                        inDocument: plane.point.create(event.x, event.y),
                        inCanvas: plane.point.create(pointInCanvas),
                        inView: plane.point.create(pointInView)
                    },
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

            // compatibilidade com Firefox
            _viewPort.addEventListener(/Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel", onMouseWheel);

            _viewPort.addEventListener('mousemove', onMouseMove, false);
            //_viewPort.addEventListener('mousemove', onMouseDrag, false);


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