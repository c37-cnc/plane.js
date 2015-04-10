(function (plane) {
    "use strict";

    var _viewPort = null,
        _context = null;

    var _matrix = null,
        _center = null,
        _zoom = 1;


    plane.view = {
        _initialize: function (config) {

            _viewPort = config.viewPort;

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

            // a matrix de transform
            _matrix = plane.math.matrix.create();

            // o centro inicial
            _center = plane.point.create(_viewPort.clientWidth / 2, _viewPort.clientHeight / 2);

            return true;
        },
        update: function () {
            var layers = plane.layer.list();

            if (!layers)
                throw new Error('view - update - no layers \n http://plane.c37.co/docs/errors.html#' + 'errorCode');

            // clear context, +1 is needed on some browsers to really clear the borders
            _context.clearRect(0, 0, _viewPort.clientWidth + 1, _viewPort.clientHeight + 1);

            // area visivel de plane
            var rectangle = {
                from: plane.point.create(0, 0),
                to: plane.point.create(_viewPort.clientWidth, _viewPort.clientHeight)
            };

            var i = 0;
            do {
                // primeiro - os groups
                var groups = plane.group.find(rectangle, layers[i].uuid);

                //console.log(groups);
                // temos groups para render?
                if (groups.length > 0) {
                    var ii = 0;
                    do {
                        var shapes = groups[ii].children.list();

                        // inicio o conjunto de shapes no contexto
                        _context.beginPath();

                        var iii = 0;
                        do {
                            shapes[iii].render(_context, _matrix);
                            iii++;
                        } while (iii < shapes.length)

                        // desenho o conjunto de shapes no contexto
                        _context.stroke();

                        ii++;
                    } while (ii < groups.length)
                }

                // segundo - os shapes
                var shapes = plane.shape.find(rectangle, layers[i].uuid);

                //console.log(shapes);
                // temos shapes para render?
                if (shapes.length > 0) {
                    // inicio o conjunto de shapes no contexto
                    _context.beginPath();

                    var ii = 0;
                    do {
                        shapes[ii].render(_context, _matrix);
                        ii++;
                    } while (ii < shapes.length)

                    // desenho o conjunto de shapes no contexto
                    _context.stroke();
                }

                i++;
            } while (i < layers.length)



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

            plane.view.update();

            return true;
        },
        get center() {
            return _center;
        },
        set active(value) {

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
        reset: function () {
            // no mesmo momento, retorno o zoom para 1 e informe o centro inicial
            plane.view.zoomTo(1, plane.point.create(_viewPort.clientWidth / 2, _viewPort.clientHeight / 2));

            // clear in the matrix transform
            _matrix = plane.math.matrix.create();
            
            return true;
        }
    };

})(plane);