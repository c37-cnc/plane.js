define("plane/core/view", ['require', 'exports'], function (require, exports) {

    var matrix = require('plane/math/matrix');

    var layer = require('plane/core/layer'),
        point = require('plane/core/point');

    var utility = require('utility');


    var viewPort = null,
        canvas = null,
        _context = null,
        _transform = null,
        _zoom = 1,
        _center = point.create(0, 0),
        size = {
            height: 0,
            width: 0
        },
        bounds = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };




    function initialize(config) {

        viewPort = config.viewPort;
        canvas = config.canvas;
        _context = canvas.getContext('2d');

        // sistema cartesiano de coordenadas
        _context.translate(0, viewPort.clientHeight);
        _context.scale(1, -1);

        // created the matrix transform
        _transform = matrix.create();

        // o centro inicial
        _center = _center.sum(point.create(viewPort.clientWidth / 2, viewPort.clientHeight / 2));

        // os tamanhos que são fixos
        size.height = viewPort.clientHeight;
        size.width = viewPort.clientWidth;


        window.onresize = function () {

            canvas.width = viewPort.clientWidth;
            canvas.height = viewPort.clientHeight;

            // os tamanhos que são fixos
            size.height = viewPort.clientHeight;
            size.width = viewPort.clientWidth;


            // sistema cartesiano de coordenadas
            canvas.getContext('2d').translate(0, viewPort.clientHeight);
            canvas.getContext('2d').scale(1, -1);

            update();

            events.notify('onResize', {
                size: size,
                now: new Date().toISOString()
            });
        };


    }



    function update() {


        // clear context, +1 is needed on some browsers to really clear the borders
        _context.clearRect(0, 0, viewPort.clientWidth + 1, viewPort.clientHeight + 1);

        var layers = layer.list(),
            l = layers.length;

        // sort, toda(s) a(s) layer(s) system(s) devem ser as primeiras
        // para os demais layers/objetos virem depois 'em cima'
        layers.sort(function (a, b) {
            if (a.status != 'system')
                return -1;
            if (a.status == 'system')
                return 1;
            return 0;
        });

        var numberOfProcessor = navigator.hardwareConcurrency;

        var rectangle = {
            from: point.create(_transform.inverseTransform(point.create(0, 0))),
            to: point.create(_transform.inverseTransform(point.create(size.width, size.height)))
        }


        while (l--) {
            
            var shapes = layers[l].children.list().filter(function (shape) {
                return shape.intersect(rectangle);
            });

            var shapesWithStyle = shapes.filter(function (shape) {
                return shape.style;
            });

            var shapesWithoutStyle = shapes.filter(function (shape) {
                return !shape.style;
            });


            if (shapesWithStyle.length > 0) {

                var s = shapesWithStyle.length;

                while (s--) {
                    shapesWithStyle[s].render(_context, _transform);
                }

            }

            if (shapesWithoutStyle.length > 0) {

                var s = shapesWithoutStyle.length;

                // inicio o conjunto de shapes no contexto
                _context.beginPath();

                // quando o arquivo tiver mais de 500 shapes 
                if (s > 300) {

                    // eu didivo os shapes pelo numero de processadores em outros arrays
                    var parts = utility.array.split(shapesWithoutStyle, numberOfProcessor);

                    parts.forEach(function (part) {
                        // para cada part registro uma nova thread
                        utility.thread.add(function () {

                            var xxx = part,
                                xxz = part.length;

                            while (xxz--) {
                                xxx[xxz].render(_context, _transform);
                            }

                            return false;
                        })
                    });
                    // inicio as threads
                    utility.thread.start();
                } else {
                    while (s--) {
                        shapesWithoutStyle[s].render(_context, _transform);
                    }
                }

                // desenho o conjunto de shapes no contexto
                _context.stroke();

            }

        }
        return this;
    }





    function zoomTo(zoom, center) {

        var factor, motion;

        factor = zoom / _zoom;

        _transform.scale({
            x: factor,
            y: factor
        }, _center);

        _zoom = zoom;


        var centerSubtract = center.subtract(_center);
        centerSubtract = centerSubtract.negate();

        var xxx = matrix.create();
        xxx.translate(centerSubtract.x, centerSubtract.y);

        _transform.concate(xxx);

        _center = center;

        update();

        return true;
    }




    function reset() {
        // no mesmo momento, retorno o zoom para 1 e informe o centro inicial
        zoomTo(1, point.create(size.width / 2, size.height / 2));

        // clear in the matrix transform
        _transform = matrix.create();
    }


    Object.defineProperty(exports, 'context', {
        get: function () {
            return _context;
        }
    });

    Object.defineProperty(exports, 'transform', {
        get: function () {
            return _transform;
        }
    });

    Object.defineProperty(exports, 'size', {
        get: function () {
            return size;
        }
    });

    Object.defineProperty(exports, 'bounds', {
        get: function () {
            var scale = Math.sqrt(_transform.a * _transform.d);

            return {
                x: _transform.tx,
                y: _transform.ty,
                height: size.height * scale,
                width: size.width * scale
            }
        }
    });

    Object.defineProperty(exports, 'center', {
        get: function () {
            return _center;
        },
        set: function (value) {

            var centerSubtract = value.subtract(_center);
            centerSubtract = centerSubtract.negate();

            var xxx = matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _transform.concate(xxx);

            _center = value;

            update();

            return true;
        }
    });

    Object.defineProperty(exports, 'zoom', {
        get: function () {
            return _zoom;
        },
        set: function (value) {

            var factor, motion;

            factor = value / _zoom;

            _transform.scale({
                x: factor,
                y: factor
            }, _center);

            _zoom = value;

            update();

            return true;
        }
    });


    var events = utility.object.event.create();


    exports.initialize = initialize;
    exports.update = update;
    exports.zoomTo = zoomTo;
    exports.reset = reset;
    exports.events = events;

});