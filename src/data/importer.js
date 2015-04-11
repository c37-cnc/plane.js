(function (plane) {
    "use strict";

//    function parseDxf(stringDxf) {
//
//        function toJson(objectDxf) {
//
//            switch (objectDxf.type) {
//            case 'arc':
//                {
//                    var arc = '{"type": "arc", "center": [{0}, {1}], "radius": {2}, "startAngle": {3}, "endAngle": {4} },';
//                    return plane.utility.string.format(arc, [objectDxf.x, objectDxf.y, objectDxf.r, objectDxf.a0, objectDxf.a1]);
//                }
//            case 'circle':
//                {
//                    var circle = '{ "type": "circle", "center": [{0}, {1}], "radius": {2} },';
//                    return plane.utility.string.format(circle, [objectDxf.x, objectDxf.y, objectDxf.r]);
//                }
//            case 'ellipse':
//                {
//                    var ellipse = '{ "type": "ellipse", "center": [{0}, {1}], "radiusY": {2}, "radiusX": {3}, "startAngle": {4}, "endAngle": {5}, "angle": {6} },';
//
//                    var ratio = objectDxf.r;
//                    var startAngle = objectDxf.startAngle;
//                    var endAngle = objectDxf.endAngle || (2.0 * Math.PI);
//
//                    // clockwise || anticlockwise?
//                    while (endAngle < startAngle) {
//                        endAngle += 2.0 * Math.PI;
//                    }
//
//                    var radiusX = {
//                        x: 0 - objectDxf.x1,
//                        y: 0 - objectDxf.y1
//                    };
//
//                    radiusX = Math.sqrt(radiusX.x * radiusX.x + radiusX.y * radiusX.y);
//
//                    var radiusY = radiusX * ratio;
//                    var angle = Math.atan2(objectDxf.y1, objectDxf.x1);
//
//
//
//                    return plane.utility.string.format(ellipse, [objectDxf.x, objectDxf.y, radiusY, radiusX, startAngle, endAngle, angle]);
//                }
//            case 'line':
//                {
//                    var line = '{ "type": "line", "from": [{0}, {1}], "to": [{2}, {3}] },';
//                    return plane.utility.string.format(line, [objectDxf.x, objectDxf.y, objectDxf.x1, objectDxf.y1]);
//                }
//            case 'lwpolyline':
//                {
//                    if (objectDxf.vertices) {
//                        var polyline = '{"type": "polyline", "points": [{0}]},',
//                            points = '';
//
//                        for (var i = 0; i < objectDxf.vertices.length; i++) {
//
//                            var point = i === objectDxf.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
//                            points += plane.utility.string.format(point, [objectDxf.vertices[i].x, objectDxf.vertices[i].y]);
//
//                        }
//                        return plane.utility.string.format(polyline, [points]);
//                    }
//                    return '';
//                }
//            case 'polyline':
//                {
//                    if (objectDxf.vertices) {
//                        var polyline = '{"type": "polyline", "points": [{0}]},',
//                            points = '';
//
//                        for (var i = 0; i < objectDxf.vertices.length; i++) {
//
//                            var point = i === objectDxf.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
//                            points += plane.utility.string.format(point, [objectDxf.vertices[i].x, objectDxf.vertices[i].y]);
//
//                        }
//                        return plane.utility.string.format(polyline, [points]);
//                    }
//                    return '';
//                }
//            case 'spline':
//                {
//                    if (objectDxf.points) {
//                        var spline = '{"type": "spline", "degree": {0}, "knots": [{1}], "points": [{2}]},',
//                            points = '';
//
//                        for (var i = 0; i < objectDxf.points.length; i++) {
//
//                            var point = i === objectDxf.points.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
//                            points += plane.utility.string.format(point, [objectDxf.points[i][0], objectDxf.points[i][1]]);
//
//                        }
//                        return plane.utility.string.format(spline, [objectDxf.degree, objectDxf.knots.join(), points]);
//                    }
//                    return '';
//                }
//            }
//
//        }
//
//
//        // certificando que a linha irá terá o caractere de nova linha
//        stringDxf = stringDxf.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
//
//        // entidades suportadas na conversão
//        //                var entitiesSupport = ['polyline'],
//        var entitiesSupport = ['line', 'circle', 'arc', 'ellipse', 'lwpolyline', 'polyline', 'spline'],
//            entitiesSection = false,
//            objectParse = null,
//            stringAux = '',
//            stringJson = '',
//            stringLine = '',
//            arrayDxf = stringDxf.split('\n');
//
//        for (var i = 0; i <= arrayDxf.length - 1; i++) {
//
//            stringLine = arrayDxf[i].toLowerCase();
//
//            entitiesSection = entitiesSection ? entitiesSection : (stringLine === 'entities');
//            //            if (!entitiesSection) continue;
//
//            if (entitiesSupport.indexOf(stringLine) > -1) {
//                objectParse = {
//                    type: stringLine
//                };
//                continue;
//            }
//
//            if (!objectParse) continue;
//
//
//            if (stringAux === ' 10') {
//                // verificação especifica para spline
//                if (objectParse.type === 'spline') {
//                    // caso necessário crio um array de points
//                    objectParse.points = objectParse.points || [];
//                    objectParse.points.push([plane.utility.math.parseFloat(stringLine, 5), 0]);
//                } else {
//                    objectParse.x = plane.utility.math.parseFloat(stringLine, 5);
//                }
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 10') {
//                stringAux = stringLine;
//                continue;
//            }
//            if (stringAux === ' 11') {
//                objectParse.x1 = plane.utility.math.parseFloat(stringLine, 5);
//                stringAux = '';
//                continue;
//            }
//
//            if (stringLine === ' 11') {
//                stringAux = stringLine;
//                continue;
//            }
//
//            // TODO: verificar qual logica é melhor para reinterpretação de uma array de pontos
//            if (stringAux === ' 20') {
//                // de acordo com o tipo localizar o ultimo point em array e add y ?
//                // verificação especifica para spline
//                if (objectParse.type === 'spline') {
//                    // localizando o ultimo point de points para completar add ao valor de y
//                    objectParse.points[objectParse.points.length - 1][1] = plane.utility.math.parseFloat(stringLine, 5);
//                } else {
//                    objectParse.y = plane.utility.math.parseFloat(stringLine, 5);
//                }
//                // de acordo com o tipo pegar o preenchido de x e y ?
//                // verificação especifica para lwpolyline e polyline
//                if (objectParse.type === 'lwpolyline' || objectParse.type === 'polyline') {
//                    if (objectParse.x && objectParse.y) {
//                        objectParse.vertices = objectParse.vertices || [];
//                        objectParse.vertices.push({
//                            x: objectParse.x,
//                            y: objectParse.y
//                        });
//                    }
//                }
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 20') {
//                stringAux = stringLine;
//                continue;
//            }
//            if (stringAux === ' 21') {
//                objectParse.y1 = plane.utility.math.parseFloat(stringLine, 5);
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 21') {
//                stringAux = stringLine;
//                continue;
//            }
//
//
//            if (stringAux === ' 40') {
//                // verificação especifica para spline
//                if (objectParse.type === 'spline') {
//                    // caso necessário crio um array de points
//                    objectParse.knots = objectParse.knots || [];
//                    objectParse.knots.push(plane.utility.math.parseFloat(stringLine, 5));
//                } else {
//                    objectParse.r = plane.utility.math.parseFloat(stringLine, 5);
//                }
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 40') {
//                stringAux = stringLine;
//                continue;
//            }
//
//
//            if (stringAux === ' 41') {
//                objectParse.startAngle = plane.utility.math.parseFloat(stringLine, 5);
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 41') {
//                stringAux = stringLine;
//                continue;
//            }
//
//            if (stringAux === ' 42') {
//                objectParse.endAngle = plane.utility.math.parseFloat(stringLine, 5);
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 42') {
//                stringAux = stringLine;
//                continue;
//            }
//
//
//            if (stringAux === ' 50') {
//                objectParse.a0 = plane.utility.math.parseFloat(stringLine, 5);
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 50') {
//                stringAux = stringLine;
//                continue;
//            }
//            if (stringAux === ' 51') {
//                objectParse.a1 = plane.utility.math.parseFloat(stringLine, 5);
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 51') {
//                stringAux = stringLine;
//                continue;
//            }
//
//
//            if (stringAux === ' 71') {
//                objectParse.degree = plane.utility.math.parseFloat(stringLine, 5);
//                stringAux = '';
//                continue;
//            }
//            if (stringLine === ' 71') {
//                stringAux = stringLine;
//                continue;
//            }
//
//
//            // conversão para Json
//            if (objectParse && objectParse.type && objectParse.type !== 'polyline' && arrayDxf[i] === '  0') {
//                stringJson += toJson(objectParse);
//                objectParse = null;
//            }
//            // conversão para Json - verificação especifica para Polyline
//            if (objectParse && objectParse.type && objectParse.type === 'polyline' && arrayDxf[i] === 'SEQEND') {
//                stringJson += toJson(objectParse);
//                objectParse = null;
//            }
//        }
//
//        return stringJson ? '[' + stringJson.substring(0, stringJson.length - 1) + ']' : '[]';
//    }

    function parseDxf(stringDxf) {

        function toObject(objectDxf) {

            switch (objectDxf.type) {
                case 'arc':
                {
                    return {"type": "arc", "center": [objectDxf.x, objectDxf.y], "radius": objectDxf.r, "startAngle": objectDxf.a0, "endAngle": objectDxf.a1};
                }
                case 'circle':
                {
                    return {"type": "circle", "center": [objectDxf.x, objectDxf.y], "radius": objectDxf.r};
                }
                case 'ellipse':
                {
                    var ratio = objectDxf.r;
                    var startAngle = objectDxf.startAngle;
                    var endAngle = objectDxf.endAngle || (2.0 * Math.PI);

                    // clockwise || anticlockwise?
                    while (endAngle < startAngle) {
                        endAngle += 2.0 * Math.PI;
                    }

                    var radiusX = {
                        x: 0 - objectDxf.x1,
                        y: 0 - objectDxf.y1
                    };

                    radiusX = Math.sqrt(radiusX.x * radiusX.x + radiusX.y * radiusX.y);

                    var radiusY = radiusX * ratio;
                    var angle = Math.atan2(objectDxf.y1, objectDxf.x1);

                    return {"type": "ellipse", "center": [objectDxf.x, objectDxf.y], "radiusY": radiusY, "radiusX": radiusX, "startAngle": startAngle, "endAngle": endAngle, "angle": angle};
                }
                case 'line':
                {
                    return {"type": "line", "from": [objectDxf.x, objectDxf.y], "to": [objectDxf.x1, objectDxf.y1]};
                }
                case 'lwpolyline':
                {
                    if (objectDxf.vertices) {
                        var points = [];

                        for (var i = 0; i < objectDxf.vertices.length; i++) {
                            points.push([objectDxf.vertices[i].x, objectDxf.vertices[i].y]);
                        }
                        return {"type": "polyline", "points": points};
                    }
                    return '';
                }
                case 'polyline':
                {
                    if (objectDxf.vertices) {
                        var points = [];

                        for (var i = 0; i < objectDxf.vertices.length; i++) {
                            points.push([objectDxf.vertices[i].x, objectDxf.vertices[i].y]);
                        }
                        return {"type": "polyline", "points": points};
                    }
                    return '';
                }
                case 'spline':
                {
                    if (objectDxf.points) {
                        var points = [];

                        for (var i = 0; i < objectDxf.points.length; i++) {
                            points.push([objectDxf.points[i][0], objectDxf.points[i][1]]);
                        }
                        return {"type": "spline", "degree": objectDxf.degree, "knots": objectDxf.knots, "points": points};
                    }
                    return '';
                }
            }

        }


        // certificando que a linha irá terá o caractere de nova linha
        stringDxf = stringDxf.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // entidades suportadas na conversão
        //                var entitiesSupport = ['polyline'],
        var entitiesSupport = ['line', 'circle', 'arc', 'ellipse', 'lwpolyline', 'polyline', 'spline'],
            entitiesSection = false,
            objectParse = null,
            stringAux = '',
            arrayObject = [],
            stringLine = '',
            arrayDxf = stringDxf.split('\n');

        for (var i = 0; i <= arrayDxf.length - 1; i++) {

            stringLine = arrayDxf[i].toLowerCase();

            entitiesSection = entitiesSection ? entitiesSection : (stringLine === 'entities');
            //            if (!entitiesSection) continue;

            if (entitiesSupport.indexOf(stringLine) > -1) {
                objectParse = {
                    type: stringLine
                };
                continue;
            }

            if (!objectParse)
                continue;


            if (stringAux === ' 10') {
                // verificação especifica para spline
                if (objectParse.type === 'spline') {
                    // caso necessário crio um array de points
                    objectParse.points = objectParse.points || [];
                    objectParse.points.push([plane.utility.math.parseFloat(stringLine, 5), 0]);
                } else {
                    objectParse.x = plane.utility.math.parseFloat(stringLine, 5);
                }
                stringAux = '';
                continue;
            }
            if (stringLine === ' 10') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux === ' 11') {
                objectParse.x1 = plane.utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }

            if (stringLine === ' 11') {
                stringAux = stringLine;
                continue;
            }

            // TODO: verificar qual logica é melhor para reinterpretação de uma array de pontos
            if (stringAux === ' 20') {
                // de acordo com o tipo localizar o ultimo point em array e add y ?
                // verificação especifica para spline
                if (objectParse.type === 'spline') {
                    // localizando o ultimo point de points para completar add ao valor de y
                    objectParse.points[objectParse.points.length - 1][1] = plane.utility.math.parseFloat(stringLine, 5);
                } else {
                    objectParse.y = plane.utility.math.parseFloat(stringLine, 5);
                }
                // de acordo com o tipo pegar o preenchido de x e y ?
                // verificação especifica para lwpolyline e polyline
                if (objectParse.type === 'lwpolyline' || objectParse.type === 'polyline') {
                    if (objectParse.x && objectParse.y) {
                        objectParse.vertices = objectParse.vertices || [];
                        objectParse.vertices.push({
                            x: objectParse.x,
                            y: objectParse.y
                        });
                    }
                }
                stringAux = '';
                continue;
            }
            if (stringLine === ' 20') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux === ' 21') {
                objectParse.y1 = plane.utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine === ' 21') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux === ' 40') {
                // verificação especifica para spline
                if (objectParse.type === 'spline') {
                    // caso necessário crio um array de points
                    objectParse.knots = objectParse.knots || [];
                    objectParse.knots.push(plane.utility.math.parseFloat(stringLine, 5));
                } else {
                    objectParse.r = plane.utility.math.parseFloat(stringLine, 5);
                }
                stringAux = '';
                continue;
            }
            if (stringLine === ' 40') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux === ' 41') {
                objectParse.startAngle = plane.utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine === ' 41') {
                stringAux = stringLine;
                continue;
            }

            if (stringAux === ' 42') {
                objectParse.endAngle = plane.utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine === ' 42') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux === ' 50') {
                objectParse.a0 = plane.utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine === ' 50') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux === ' 51') {
                objectParse.a1 = plane.utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine === ' 51') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux === ' 71') {
                objectParse.degree = plane.utility.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine === ' 71') {
                stringAux = stringLine;
                continue;
            }


            // conversão para Json
            if (objectParse && objectParse.type && objectParse.type !== 'polyline' && arrayDxf[i] === '  0') {
                arrayObject.push(toObject(objectParse));
                objectParse = null;
            }
            // conversão para Json - verificação especifica para Polyline
            if (objectParse && objectParse.type && objectParse.type === 'polyline' && arrayDxf[i] === 'SEQEND') {
                arrayObject.push(toObject(objectParse));
                objectParse = null;
            }
        }

        return arrayObject;
    }



    plane.importer = {
        fromDxf: function (stringDxf) {

            //plane.reset();

            debugger;

            var arrayDxf = parseDxf(stringDxf);

            if (arrayDxf.length > 0) {
                plane.layer.create();
                var i = 0;
                do {
                    plane.shape.create(arrayDxf[i]);
                    i++;
                } while (i < arrayDxf.length);
            }


//            if (objectDxf) {
//                plane.layer.create();
//                for (var prop in objectDxf) {
//                    plane.shape.create(objectDxf[prop]);
//                }
//            }

            //debugger;

            return true;
        }
    };

})(plane);