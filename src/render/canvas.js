plane.render.canvas = (function () {

    var htmlElement = null,
        elementContext = null;

    return {
        create: function (viewPort) {

            htmlElement = document.createElement('canvas');

            htmlElement.width = viewPort.clientWidth;
            htmlElement.height = viewPort.clientHeight;

            if (!htmlElement.getContext) {
                throw new Error('no canvas suport');
            }

            elementContext = htmlElement.getContext('2d');

            // Cartesian coordinate system
            elementContext.translate(0, htmlElement.height);
            elementContext.scale(1, -1);
            
            
            htmlElement.style.position = "absolute";
            
            viewPort.appendChild(htmlElement);


            function getMousePos(canvas, event) {
                var bb = canvas.getBoundingClientRect();

                var x = (event.clientX - bb.left) * (canvas.width / bb.width);
                var y = (event.clientY - bb.top) * (canvas.height / bb.height);

                return {
                    x: x,
                    y: y
                };
            }


            function hitPath(canvas, event) {
                var bb = canvas.getBoundingClientRect();

                var x = (event.clientX - bb.left) * (canvas.width / bb.width);
                var y = (event.clientY - bb.top) * (canvas.height / bb.height);

                return elementContext.isPointInPath(x, y);
            }




            htmlElement.onmousewheel = function (event) {
                console.log(event);
            };


            htmlElement.onclick = function (event) {

                var zzz = getMousePos(htmlElement, event);

                var debug = document.getElementById('debug');

                debug.innerHTML = 'x: ' + zzz.x + ', y:' + zzz.y + ', selected: ' + hitPath(htmlElement, event);

                console.log(elementContext.getImageData(zzz.x, zzz.y, 3, 3).data);

            };

//            htmlElement.oncontextmenu = function (event) {
//                console.log(event);
//
//                return false;
//            }

            return {
                viewer: htmlElement,
                render: this
            };

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
                        elementContext.closePath();

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

                elementContext.fill();
                elementContext.stroke();

                // restore state of all configuration
                elementContext.restore();

            });
        }
    }



})(plane);