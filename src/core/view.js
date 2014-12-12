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
        while (l--) {
            var shapes = layers[l].children.list(),
                s = shapes.length;

            // style of layer
            _context.lineCap = layers[l].style.lineCap;
            _context.lineJoin = layers[l].style.lineJoin;

            while (s--) {
                shapes[s].render(_context, _transform);
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
        zoomTo(1, point.create(size.width / 2, size.height / 2));
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