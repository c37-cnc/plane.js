define("plane/data/importer", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    function parseDxf(stringDxf) {

        function toJson(objectDxf) {

            switch (objectDxf.type) {
            case 'line':
                {
                    var line = '{ "type": "line", "a": [{0}, {1}], "b": [{2}, {3}] },';
                    return types.string.format(line, [objectDxf.x, objectDxf.y, objectDxf.x1, objectDxf.y1]);
                }
            case 'spline':
                {
                    if (objectDxf.points) {
                        var spline = '{"type": "spline", "degree": {0}, "knots": [{1}], "points": [{2}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.points.length; i++) {

                            var point = i == objectDxf.points.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [objectDxf.points[i][0], objectDxf.points[i][1]]);

                        }
                        return types.string.format(spline, [objectDxf.degree, objectDxf.knots.join(), points]);
                    }
                    return '';
                }
            case 'circle':
                {
                    var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} },';
                    return types.string.format(circle, [objectDxf.x, objectDxf.y, objectDxf.r]);
                }
            case 'arc':
                {
                    var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2}, "startAngle": {3}, "endAngle": {4}, "clockWise": {5} },';
                    return types.string.format(arc, [objectDxf.x, objectDxf.y, objectDxf.r, objectDxf.a0, objectDxf.a1, false]);
                }
            case 'ellipse':
                {
                    var ellipse = '{ "type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2}, "radiusX": {3}, "startAngle": {4}, "endAngle": {5}, "angle": {6} },';
                    
                    var p2 = {
                        x: objectDxf.x1,
                        y: objectDxf.y1
                    };

                    var ratio = objectDxf.r;
                    var startAngle = objectParse.startAngle;
                    var endAngle = objectParse.endAngle || (2.0 * Math.PI);

                    while (endAngle < startAngle) {
                        endAngle += 2.0 * Math.PI;
                    }

                    var radiusX = {
                        x: 0 - p2.x,
                        y: 0 - p2.y
                    };

                    radiusX = Math.sqrt(radiusX.x * radiusX.x + radiusX.y * radiusX.y);

                    var radiusY = radiusX * ratio;
                    var angle = Math.atan2(p2.y, p2.x);
                    
                    
                    
                    return types.string.format(ellipse, [objectDxf.x, objectDxf.y, radiusY, radiusX, startAngle, endAngle, angle]);
                }
            case 'lwpolyline':
                {
                    if (objectDxf.vertices) {
                        var polyline = '{"type": "polyline", "points": [{0}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.vertices.length; i++) {

                            var point = i == objectDxf.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [objectDxf.vertices[i].x, objectDxf.vertices[i].y]);

                        }
                        return types.string.format(polyline, [points]);
                    }
                    return '';
                }
            case 'polyline':
                {
                    if (objectDxf.vertices) {
                        var polyline = '{"type": "polyline", "points": [{0}]},',
                            points = '';

                        for (var i = 0; i < objectDxf.vertices.length; i++) {

                            var point = i == objectDxf.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [objectDxf.vertices[i].x, objectDxf.vertices[i].y]);

                        }
                        return types.string.format(polyline, [points]);
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
            stringJson = '',
            stringLine = '',
            arrayDxf = stringDxf.split('\n');

        for (var i = 0; i <= arrayDxf.length - 1; i++) {

            stringLine = arrayDxf[i].toLowerCase();

            entitiesSection = entitiesSection ? entitiesSection : (stringLine == 'entities');
            //            if (!entitiesSection) continue;

            if (entitiesSupport.indexOf(stringLine) > -1) {
                objectParse = {
                    type: stringLine
                };
                continue;
            }

            if (!objectParse) continue;


            if (stringAux == ' 10') {
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // caso necessário crio um array de points
                    objectParse.points = objectParse.points || [];
                    objectParse.points.push([types.math.parseFloat(stringLine, 5), 0]);
                } else {
                    objectParse.x = types.math.parseFloat(stringLine, 5);
                }
                stringAux = '';
                continue;
            }
            if (stringLine == ' 10') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 11') {
                objectParse.x1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }

            if (stringLine == ' 11') {
                stringAux = stringLine;
                continue;
            }

            // TODO: verificar qual logica é melhor para reinterpretação de uma array de pontos
            if (stringAux == ' 20') {
                // de acordo com o tipo localizar o ultimo point em array e add y ?
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // localizando o ultimo point de points para completar add ao valor de y
                    objectParse.points[objectParse.points.length - 1][1] = types.math.parseFloat(stringLine, 5);
                } else {
                    objectParse.y = types.math.parseFloat(stringLine, 5);
                }
                // de acordo com o tipo pegar o preenchido de x e y ?
                // verificação especifica para lwpolyline e polyline
                if (objectParse.type == 'lwpolyline' || objectParse.type == 'polyline') {
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
            if (stringLine == ' 20') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 21') {
                objectParse.y1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 21') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 40') {
                // verificação especifica para spline
                if (objectParse.type == 'spline') {
                    // caso necessário crio um array de points
                    objectParse.knots = objectParse.knots || [];
                    objectParse.knots.push(types.math.parseFloat(stringLine, 5));
                } else {
                    objectParse.r = types.math.parseFloat(stringLine, 5);
                }
                stringAux = '';
                continue;
            }
            if (stringLine == ' 40') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 41') {
                objectParse.startAngle = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 41') {
                stringAux = stringLine;
                continue;
            }

            if (stringAux == ' 42') {
                objectParse.endAngle = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 42') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 50') {
                objectParse.a0 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 50') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == ' 51') {
                objectParse.a1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 51') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == ' 71') {
                objectParse.degree = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == ' 71') {
                stringAux = stringLine;
                continue;
            }


            // conversão para Json
            if (objectParse && objectParse.type && objectParse.type != 'polyline' && arrayDxf[i] == '  0') {
                stringJson += toJson(objectParse);
                objectParse = null;
            }
            // conversão para Json - verificação especifica para Polyline
            if (objectParse && objectParse.type && objectParse.type == 'polyline' && arrayDxf[i] == 'SEQEND') {
                stringJson += toJson(objectParse);
                objectParse = null;
            }
        }

        return stringJson ? '[' + stringJson.substring(0, stringJson.length - 1) + ']' : '[]';
    }

    function parseDwg(stringDwg) {
        return true;
    }

    function parseJson(stringJson) {
        return true;
    }

    function parseSvg(stringSvg) {
        return true;
    }


    exports.parseDxf = parseDxf;
    exports.parseDwg = parseDwg;
    exports.parseJson = parseJson;
    exports.parseSvg = parseSvg;

});