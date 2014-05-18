Plane.Render = (function (Plane, document) {
    "use strict";

    var viewPort = null,
        renders = null;

    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Render - Initialize - Config is not valid - See the documentation');
            }

            if (!document.createElement('canvas').getContext) {
                throw new Error('No canvas support for this device');
            }

            viewPort = config.viewPort;
            renders = new Plane.Utility.Dictionary();

            return true;
        },
        Create: function (uuid) {
            var render = document.createElement('canvas');

            render.width = viewPort.clientWidth;
            render.height = viewPort.clientHeight;

            render.style.position = "absolute";
            render.style.backgroundColor = (renders.count() == 0) ? Plane.style.backgroundColor : 'transparent';

            // sistema cartesiano de coordenadas
            var context2D = render.getContext('2d');
            context2D.translate(0, render.height);
            context2D.scale(1, -1);

            // add ao html documment
            viewPort.appendChild(render);

            // add ao dictionary
            renders.add(uuid, render);

            return true;
        },
        Update: function () {

            Plane.dispatchEvent('onChange', {
                type: 'onChange',
                now: new Date().toISOString()
            });

            var uuid = Plane.Layers.Active.uuid,
                shapes = Plane.Shape.Search(uuid),
                render = renders.find(uuid),
                context2D = render.getContext('2d');

            // limpando o render
            context2D.clearRect(0, 0, render.width, render.height);

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

})(Plane, window.document);