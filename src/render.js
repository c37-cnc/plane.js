plane.render = (function (plane, document) {
    "use strict";

    var viewPort = null;

    return {
        initialize: function (config) {

            viewPort = config.viewPort;

            return true;
        },
        create: function () {

            var viewer = document.createElement('canvas');

            viewer.width = viewPort.clientWidth;
            viewer.height = viewPort.clientHeight;

            if (!viewer.getContext) {
                throw new Error('no canvas suport');
            }

            viewer.style.position = "absolute";

            viewPort.appendChild(viewer);

            return viewer;
        },
        update: function () {
            
            var shapes = plane.layers.active.shapes.search(),
                viewer = plane.layers.active.viewer;
            

            var context2D = viewer.getContext('2d');

            // Cartesian coordinate system
            context2D.translate(0, viewer.height);
            context2D.scale(1, -1);

            context2D.clearRect(0, 0, viewer.width, viewer.height);

            shapes.forEach(function (shape) {

                // save state of all configuration
                context2D.save();

                context2D.beginPath();

                switch (shape.type) {
                case 'line':
                    {

                        context2D.lineWidth = shape.strokeWidth || 1;
                        context2D.strokeStyle = shape.strokeColor || 'black';

                        context2D.moveTo(shape.x[0], shape.x[1]);
                        context2D.lineTo(shape.y[0], shape.y[1]);

                        break;
                    }
                case 'rectangle':
                    {

                        context2D.lineWidth = shape.strokeWidth || 1;
                        context2D.strokeStyle = shape.strokeColor || 'black';

                        context2D.strokeRect(shape.x, shape.y, shape.width, shape.height);

                        break;
                    }
                case 'arc':
                    {

                        break;
                    }
                case 'circle':
                    {
                        context2D.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);
                        context2D.closePath();

                        break;
                    }
                case 'ellipse':
                    {

                        break;
                    }
                case 'polygon':
                    {
                        if (shape.sides < 3) {
                            throw new Error('shape.sides < 3');
                        }

                        var a = ((Math.PI * 2) / shape.sides);

                        context2D.translate(shape.x, shape.y);
                        context2D.moveTo(shape.radius, 0);

                        for (var i = 1; i < shape.sides; i++) {
                            context2D.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
                        }

                        context2D.closePath();

                        break;
                    }
                default:
                    break;
                }

                context2D.fill();
                context2D.stroke();

                // restore state of all configuration
                context2D.restore();

            });
        }



    };

})(plane, window.document);