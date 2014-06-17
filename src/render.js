Plane.Render = (function (plane, document, math) {
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
            renders = new plane.Utility.Dictionary();

            return true;
        },
        Create: function (uuid) {
            var render = document.createElement('canvas');

            render.width = viewPort.clientWidth;
            render.height = viewPort.clientHeight;

            render.style.position = "absolute";
            render.style.backgroundColor = (renders.count() == 0) ? plane.style.backgroundColor : 'transparent';

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

            plane.dispatchEvent('onChange', {
                type: 'onChange',
                now: new Date().toISOString()
            });

            var layerUuid = plane.Layers.Active.uuid,
                layerStyle = plane.Layers.Active.style,
                shapes = plane.Shape.Search('layer > uuid > '.concat(layerUuid)),
                render = renders.find(layerUuid),
                context2D = render.getContext('2d');

            // limpando o render
            context2D.clearRect(0, 0, render.width, render.height);
            
            context2D.translate(plane.center.x, plane.center.y);

            // render para cada shape
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
                        context2D.rotate((math.PI / 180) * shape.angle);

                        context2D.lineTo(shape.y[0], shape.y[1]);
                        break;
                    }
                case 'rectangle':
                    {
                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((math.PI / 180) * shape.angle);

                        context2D.strokeRect(0, 0, shape.width, shape.height);
                        break;
                    }
                case 'arc':
                    {
                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((math.PI / 180) * shape.angle);

                        context2D.arc(0, 0, shape.radius, (math.PI / 180) * shape.startAngle, (math.PI / 180) * shape.endAngle, shape.clockWise);
                        break;
                    }
                case 'circle':
                    {
                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((math.PI / 180) * shape.angle);

                        context2D.arc(0, 0, shape.radius, 0, math.PI * 2, true);
                        break;
                    }
                case 'ellipse':
                    {
                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((math.PI / 180) * shape.angle);

                        context2D.ellipse(0, 0, shape.width, shape.height, 0, 0, math.PI * 2)
                        break;
                    }
                case 'polygon':
                    {
                        var a = ((math.PI * 2) / shape.sides);

                        context2D.translate(shape.x, shape.y);
                        context2D.rotate((math.PI / 180) * shape.angle);

                        context2D.moveTo(shape.radius, 0);

                        for (var i = 1; i < shape.sides; i++) {
                            context2D.lineTo(shape.radius * math.cos(a * i), shape.radius * math.sin(a * i));
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
