draw.render.canvas = (function () {

    var htmlElement = null,
        htmlContext = null;


    return {
        initialize: function (params) {

            htmlElement = document.createElement('canvas'),
            htmlContext = htmlElement.getContext('2d');

            htmlElement.width = window.innerWidth;
            htmlElement.height = window.innerHeight;

            return htmlElement;

        },
        update: function (shapes) {

            htmlContext.clearRect(0, 0, htmlElement.width, htmlElement.height);

            shapes.forEach(function (shape) {

                htmlContext.translate(0, 0);
                htmlContext.beginPath();

                switch (shape.type) {
                case 'line':
                    {
                        htmlContext.moveTo(shape.x[0], shape.x[1]);
                        htmlContext.lineTo(shape.y[0], shape.y[1]);

                        break;
                    }
                case 'circle':
                    {
                        htmlContext.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2, true);
                        break;
                    }
                case 'polygon':
                    {
                        if (shape.sides < 3) {
                            return;
                        }

                        var a = ((Math.PI * 2) / shape.sides);

                        htmlContext.translate(shape.x, shape.y);
                        htmlContext.moveTo(shape.radius, 0);

                        for (var i = 1; i < shape.sides; i++) {
                            htmlContext.lineTo(shape.radius * Math.cos(a * i), shape.radius * Math.sin(a * i));
                        }

                        htmlContext.closePath();

                        break;
                    }
                default:
                    break;
                }

                htmlContext.stroke();

            });

        }
    }



}(draw));