draw.render.canvas = (function () {

    var htmlElement = null,
        elementContext = null;

    return {
        initialize: function (config) {

            htmlElement = document.createElement('canvas');

            htmlElement = config.renderer;

            htmlElement.width = config.renderer.clientWidth;
            htmlElement.height = config.renderer.clientHeight;

            if (!htmlElement.getContext) {
                throw new Error('no canvas suport');
            }

            elementContext = htmlElement.getContext('2d');

            // Cartesian coordinate system
            elementContext.translate(0, htmlElement.height);
            elementContext.scale(1, -1);








            function getMousePos(canvas, evt) {
                var rect = canvas.getBoundingClientRect();
                return {
                    x: evt.clientX - rect.left,
                    y: canvas.height - (evt.clientY - rect.top)
                    //                    y: canvas.height - (evt.clientY - rect.top)
                };
            }

            htmlElement.onmousewheel = function (event) {
                console.log(event);
            };
            //            htmlElement.onmousemove = function (event) {
            //                console.log(event);
            //            };
            htmlElement.onclick = function (event) {

                var zzz = getMousePos(htmlElement, event);

                var element = elementContext.isPointInPath(zzz.x, (parseInt(htmlElement.height) - zzz.y));
                var debug = document.getElementById('debug');

                debug.innerHTML = 'x: ' + zzz.x + ', y:' + zzz.y + ', k:' + (parseInt(htmlElement.height) - zzz.y) + ', selected: ' + element;;

                console.log(zzz);

            };

            return htmlElement;

        },
        update: function (shapes) {

            elementContext.clearRect(0, 0, htmlElement.width, htmlElement.height);

            shapes.forEach(function (shape) {

                // save state of all configuration
                elementContext.save();

                elementContext.beginPath();

                switch (shape.type) {
                case 'line':
                    {

                        elementContext.lineWidth = shape.strokeWidth || 1;
                        elementContext.strokeStyle = shape.strokeColor || 'black';

                        elementContext.moveTo(shape.x[0], shape.x[1]);
                        elementContext.lineTo(shape.y[0], shape.y[1]);

                        break;
                    }
                case 'rectangle':
                    {

                        elementContext.lineWidth = shape.strokeWidth || 1;
                        elementContext.strokeStyle = shape.strokeColor || 'black';
                        
                        elementContext.strokeRect(shape.x, shape.y, shape.width, shape.height);

                        break;
                    }
                case 'arc':
                    {

                        break;
                    }
                case 'circle':
                    {
                        elementContext.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);

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

                        elementContext.translate(shape.x, shape.y);
                        elementContext.moveTo(shape.radius, 0);

                        for (var i = 1; i < shape.sides; i++) {
                            elementContext.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
                        }

                        elementContext.closePath();

                        break;
                    }
                default:
                    break;
                }

                elementContext.stroke();

                // restore state of all configuration
                elementContext.restore();

            });
        }
    }



}(draw));