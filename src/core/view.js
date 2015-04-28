(function (plane) {
    "use strict";

    var _viewPort = null,
        _context = null;

    var _matrix = null,
        _center = null,
        _zoom = 1;

    var _updates = [],
        _update = null;

    plane.view = {
        _initialize: function (config) {

            _viewPort = config.viewPort;
            _matrix = config.matrix;

            // montando o render de Plane
            var canvas = document.createElement('canvas');

            canvas.id = plane.utility.math.uuid(9, 16);
            canvas.width = _viewPort.clientWidth;
            canvas.height = _viewPort.clientHeight;

            canvas.style.position = "absolute";
            canvas.style.backgroundColor = 'transparent';

            // add em _viewPort HTMLElement
            _viewPort.appendChild(canvas);

            // get + add context
            _context = canvas.getContext('2d');

            // o sistema de coordenadas cartesiano
            _context.translate(0, _viewPort.clientHeight);
            _context.scale(1, -1);
            // o sistema de coordenadas cartesiano

            // o centro inicial
            _center = plane.point.create(_viewPort.clientWidth / 2, _viewPort.clientHeight / 2);

            // crio o modulo de eventos em view
            plane.view.events = plane.utility.object.event.create();

            // crio o evento onResize
            window.onresize = function () {

                // atualizo o tamanho do canvas
                canvas.width = _viewPort.clientWidth;
                canvas.height = _viewPort.clientHeight;

                // atualizo o sistema cartesiano de coordenadas
                _context.translate(0, _viewPort.clientHeight);
                _context.scale(1, -1);

                // disparo o evento
                plane.view.events.notify('onResize', {
                    now: new Date().toISOString()
                });
            };


            return true;
        },
        events: null,
        _reset: function () {

            // o centro inicial
            _center = plane.point.create(_viewPort.clientWidth / 2, _viewPort.clientHeight / 2);

            // o zoom inicial
            _zoom = 1;

            // clear in the matrix transform
            _matrix.reset();

            return true;
        },
        update: function (priority) {

            if (priority) {

                update();

            } else {

                _update = setTimeout(function () {

                    update();

                }, 50);

                _updates.push(_update);

                if (_updates.length >= 3) {
                    _updates.forEach(function (update) {
                        if (_updates[_updates.length - 1] !== update) {
                            clearTimeout(update);
                        }
                    });
                    _updates = [];
                }

            }

            return this;
        },
        zoomTo: function (zoom, center) {

            var factor;

            factor = zoom / _zoom;

            _matrix.scale({
                x: factor,
                y: factor
            }, _center);

            _zoom = zoom;


            var centerSubtract = center.subtract(_center);
            centerSubtract = centerSubtract.negate();

            var xxx = plane.math.matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _matrix.concate(xxx);

            _center = center;

            // para quando o cliente tiver a necessidade de atualizar
            //plane.view.update();

            return true;
        },
        get center() {
            return _center;
        },
        set center(value) {

            var centerSubtract = value.subtract(_center);
            centerSubtract = centerSubtract.negate();

            var xxx = plane.math.matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _matrix.concate(xxx);

            _center = value;

            plane.view.update();

            return true;
        },
        get zoom() {
            return _zoom;
        },
        set zoom(value) {

            var factor;

            factor = value / _zoom;

            _matrix.scale({
                x: factor,
                y: factor
            }, _center);

            _zoom = value;

            plane.view.update();

            return true;
        },
        get bounds() {
            var from = plane.point.create(_matrix.inverseTransform({x: 0, y: 0})),
                to = plane.point.create(_matrix.inverseTransform({x: _viewPort.clientWidth, y: _viewPort.clientHeight}));

            return plane.math.bounds.create(from, to);
        },
        get size() {
            return {
                height: _viewPort.clientHeight,
                width: _viewPort.clientWidth
            };
        }
    };


    function update() {

        var layers = plane.layer.list();

        if (!layers)
            throw new Error('view - update - no layers \n http://plane.c37.co/docs/errors.html#' + 'errorCode');


        // sort, toda(s) a(s) layer(s) system(s) devem ser as primeiras
        // para os demais layers/objetos virem depois 'em cima'
        layers.sort(function (a, b) {
            if (a.status !== 'system')
                return 1;
            if (a.status === 'system')
                return -1;
            return 0;
        });


        // clear context, +1 is needed on some browsers to really clear the borders
        _context.clearRect(0, 0, _viewPort.clientWidth + 1, _viewPort.clientHeight + 1);

        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
        _context.imageSmoothingEnabled = true;


        // area visivel de plane
        var rectangle = {
            from: _matrix.inverseTransform({x: 0, y: 0}),
            to: _matrix.inverseTransform({x: _viewPort.clientWidth, y: _viewPort.clientHeight})
        };

        // para todas as layers
        var i = 0;
        do {

            // primeiro - os groups
            var groups = plane.group.find(rectangle, layers[i].uuid);

            // os COM estilos
            var groupsWithStyle = groups.filter(function (group) {
                return group.style;
            });

            // temos shapes COM estilo para render?
            if (groupsWithStyle.length > 0) {
                var ii = 0;
                do {
                    groupsWithStyle[ii]._render(
                        _context,
                        Math.sqrt(_matrix.a * _matrix.d),
                        {
                            x: _matrix.tx,
                            y: _matrix.ty
                        }
                    );
                    ii++;
                } while (ii < groupsWithStyle.length)
            }

            // os SEM estilos
            var groupsWithoutStyle = groups.filter(function (group) {
                return !group.style;
            });

            // temos shapes SEM estilo para render?
            if (groupsWithoutStyle.length > 0) {
                var ii = 0;
                do {
                    // inicio o conjunto de shapes no contexto
                    _context.beginPath();

                    groupsWithoutStyle[ii]._render(
                        _context,
                        Math.sqrt(_matrix.a * _matrix.d),
                        {
                            x: _matrix.tx,
                            y: _matrix.ty
                        }
                    );

                    // desenho o conjunto de shapes no contexto
                    _context.stroke();

                    ii++;
                } while (ii < groupsWithoutStyle.length)
            }






            // segundo - todos os demais shapes
            var shapes = plane.shape.find(rectangle, layers[i].uuid);

            // os COM estilos
            var shapesWithStyle = shapes.filter(function (shape) {
                return shape.style || shape.type === 'quote';
            });

            // temos shapes COM estilo para render?
            if (shapesWithStyle.length > 0) {

                // processamento em massa
                if (shapesWithStyle.length >= 4) {

                    //var numberOfProcessor = navigator.hardwareConcurrency;
                    var numberOfProcessor = 4;

                    // eu didivo os shapes pelo numero de processadores em outros arrays
                    var parts = plane.utility.array.split(shapesWithStyle, numberOfProcessor);

                    parts.forEach(function (part) {
                        // para cada part registro uma nova thread
                        plane.utility.thread.add(function () {

                            var xxx = part,
                                xxz = part.length;

                            while (xxz--) {
                                xxx[xxz]._render(
                                    _context,
                                    Math.sqrt(_matrix.a * _matrix.d),
                                    {
                                        x: _matrix.tx,
                                        y: _matrix.ty
                                    }
                                );
                            }

                            return false;
                        });
                    });
                    // inicio as threads
                    plane.utility.thread.start();
                } else {
                    var ii = 0;
                    do {
                        shapesWithStyle[ii]._render(
                            _context,
                            Math.sqrt(_matrix.a * _matrix.d),
                            {
                                x: _matrix.tx,
                                y: _matrix.ty
                            }
                        );
                        ii++;
                    } while (ii < shapesWithStyle.length)
                }

            }


            // os SEM estilos
            var shapesWithoutStyle = shapes.filter(function (shape) {
                return !shape.style && shape.type !== 'quote';
            });

            // temos shapes SEM estilo para render?
            if (shapesWithoutStyle.length > 0) {

                // inicio o conjunto de shapes no contexto
                _context.beginPath();

                // processamento em massa
                if (shapesWithoutStyle.length >= 4) {

                    //var numberOfProcessor = navigator.hardwareConcurrency;
                    var numberOfProcessor = 4;

                    // eu didivo os shapes pelo numero de processadores em outros arrays
                    var parts = plane.utility.array.split(shapesWithoutStyle, numberOfProcessor);

                    parts.forEach(function (part) {
                        // para cada part registro uma nova thread
                        plane.utility.thread.add(function () {

                            var xxx = part,
                                xxz = part.length;

                            while (xxz--) {
                                xxx[xxz]._render(
                                    _context,
                                    Math.sqrt(_matrix.a * _matrix.d),
                                    {
                                        x: _matrix.tx,
                                        y: _matrix.ty
                                    }
                                );
                            }
                            return false;
                        });
                    });
                    // inicio as threads
                    plane.utility.thread.start();
                } else {
                    var ii = 0;
                    do {
                        shapesWithoutStyle[ii]._render(
                            _context,
                            Math.sqrt(_matrix.a * _matrix.d),
                            {
                                x: _matrix.tx,
                                y: _matrix.ty
                            }
                        );
                        ii++;
                    } while (ii < shapesWithoutStyle.length)
                }

                // desenho o conjunto de shapes no contexto
                _context.stroke();
            }

            i++;
        } while (i < layers.length)

        _updates.splice(_updates.indexOf(_update), 1);

        return true;

    }




})(c37.library.plane);