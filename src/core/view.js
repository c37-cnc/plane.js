(function (plane) {
    "use strict";

    var _viewPort = null,
        _context = null;


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
                            shapes[iii].render(_context);
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
                        shapes[ii].render(_context);
                        ii++;
                    } while (ii < shapes.length)
                        
                    // desenho o conjunto de shapes no contexto
                    _context.stroke();
                }

                i++;
            } while (i < layers.length)



            return this;
        }
    };

})(plane);