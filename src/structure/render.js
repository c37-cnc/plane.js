define("structure/render", ['require', 'exports'], function (require, exports) {


    function Create(uuid, width, height, backgroundColor) {

        var render = document.createElement('canvas');

        render.width = width;
        render.height = height;

        render.style.position = "absolute";
        render.style.backgroundColor = backgroundColor || 'transparent';

        // sistema cartesiano de coordenadas
        var context2D = render.getContext('2d');
        context2D.translate(0, render.height);
        context2D.scale(1, -1);

        return render;
    };

    function Update() {

        var layerUuid = layerFacade.Active.uuid,
            layerStyle = layerFacade.Active.style,
            layerShapes = shapeStore[layerUuid].list(),
            layerRender = renderStore[layerUuid],
            context2D = layerRender.getContext('2d');

        //https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial

        // limpando o render
        context2D.clearRect(0, 0, layerRender.width, layerRender.height);
        // alinhando com o centro
        context2D.translate(planeFacade.center.x, planeFacade.center.y);

        // style of layer
        context2D.lineCap = layerStyle.lineCap;
        context2D.lineJoin = layerStyle.lineJoin;

        // render para cada shape
        layerShapes.forEach(function (shape) {

            // save state of all configuration
            context2D.save();

            context2D.beginPath();

            // possivel personalização
            context2D.lineWidth = (shape.style && shape.style.lineWidth) ? shape.style.lineWidth : layerStyle.lineWidth;
            context2D.strokeStyle = (shape.style && shape.style.lineColor) ? shape.style.lineColor : layerStyle.lineColor;

            switch (shape.type) {
            case 'line':
                {
                    context2D.moveTo(shape.points[0].x, shape.points[0].y);
                    context2D.lineTo(shape.points[1].x, shape.points[1].y);
                    break;
                }
            case 'rectangle':
                {
                    context2D.translate(shape.point.x, shape.point.y);
                    context2D.strokeRect(0, 0, shape.width, shape.height);
                    break;
                }
            case 'arc':
                {
                    context2D.translate(shape.point.x, shape.point.y);
                    context2D.arc(0, 0, shape.radius, (math.PI / 180) * shape.startAngle, (math.PI / 180) * shape.endAngle, shape.clockWise);
                    break;
                }
            case 'circle':
                {
                    context2D.translate(shape.point.x, shape.point.y);
                    context2D.arc(0, 0, shape.radius, 0, math.PI * 2, true);
                    break;
                }
            case 'ellipse':
                {
                    context2D.translate(shape.point.x, shape.point.y);
                    context2D.ellipse(0, 0, shape.radiusX, shape.radiusY, 0, 0, math.PI * 2)
                    break;
                }
            case 'polygon':
                {
                    context2D.moveTo(shape.points[0].x, shape.points[0].y);

                    shape.points.forEach(function (point) {
                        context2D.lineTo(point.x, point.y);
                    });

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


    exports.Create = Create;
    exports.Update = Update;




});