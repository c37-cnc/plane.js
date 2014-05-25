Plane.Render = (function (Plane, Document, Math) {
    "use strict";

    var viewPort = null,
        renders = null;

    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Render - Initialize - Config is not valid - See the documentation');
            }

            if (!Document.createElement('canvas').getContext) {
                throw new Error('No canvas support for this device');
            }

            viewPort = config.viewPort;
            renders = new Plane.Utility.Dictionary();

            return true;
        },
        Create: function (uuid) {
            var render = Document.createElement('canvas');

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

            var layerUuid = Plane.Layers.Active.uuid,
                layerStyle = Plane.Layers.Active.style,
                shapes = Plane.Shape.Search(layerUuid),
                render = renders.find(layerUuid),
                context2D = render.getContext('2d');

            // limpando o render
            context2D.clearRect(0, 0, render.width, render.height);

            shapes.forEach(function (shape) {

                // save state of all configuration
                context2D.save();

                context2D.beginPath();
                // style of shape or layer
                context2D.lineWidth = (shape.style && shape.style.lineWidth) ? shape.style.lineWidth : layerStyle.lineWidth;
                context2D.strokeStyle = (shape.style && shape.style.lineColor) ? shape.style.lineColor : layerStyle.lineColor;
                context2D.lineCap = (shape.style && shape.style.lineCap) ? shape.style.lineCap : layerStyle.lineCap;
                context2D.lineJoin = (shape.style && shape.style.lineJoin) ? shape.style.lineJoin : layerStyle.lineJoin;

                //https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes

                switch (shape.type) {
                case 'line':
                    {
                        context2D.moveTo(shape.x[0], shape.x[1]);
                        context2D.lineTo(shape.y[0], shape.y[1]);

                        break;
                    }
                case 'rectangle':
                    {
                        context2D.strokeRect(shape.x, shape.y, shape.width, shape.height);
                        break;
                    }
                case 'arc':
                    {
                        context2D.arc(shape.x, shape.y, shape.radius, (Math.PI / 180) * shape.startAngle, (Math.PI / 180) * shape.endAngle, shape.clockWise);
                        break;
                    }
                case 'circle':
                    {
                        context2D.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);
                        break;
                    }
                case 'ellipse':
                    {
                        context2D.ellipse(shape.x, shape.y, shape.width, shape.height, 0, 0, Math.PI * 2)
                        break;
                    }
                case 'polygon':
                    {
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

                context2D.stroke();

                // restore state of all configuration
                context2D.restore();

            });
        }



    };

})(Plane, window.document, Math);