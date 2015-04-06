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

            // clear context, +1 is needed on some browsers to really clear the borders
            _context.clearRect(0, 0, _viewPort.clientWidth + 1, _viewPort.clientHeight + 1);

            var rectangle = {
                from: plane.point.create(0, 0),
                to: plane.point.create(_viewPort.clientWidth, _viewPort.clientHeight)
            };
            
            console.log(rectangle);

            var layers = plane.layer.list(),
                l = 0;
            do {
                var shapes = plane.shape.find(rectangle, layers[0].uuid),
                //var shapes = plane.shape.find(rectangle),
                    s = shapes.length;

                while (s--) {
                    shapes[s].render();
                }

                l++;
            } while (l < layers.length)



            return this;
        }
    };

})(plane);