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
//                    debugger;

                    var ellipse = '{"type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2},"radiusX": {3}, "startAngle": {4}, "endAngle": [{5}], "angle": {6} },',
                        Cx = objectDxf.x,
                        Cy = objectDxf.y,
                        a = -(objectDxf.x1 / 2),
                        b = -(objectDxf.y1 / 2),
                        radiusX = Math.abs(objectDxf.x1),
                        radiusY = Math.abs(objectDxf.y1);
                    //                        radiusY = radiusX * objectDxf.r;

                    var pointA = (Cx + a * Math.cos(objectDxf.startAngle));
                    var pointB = (Cy + b * Math.sin(objectDxf.endAngle))

                    // ok
                    var radians = Math.atan2(objectDxf.y1, objectDxf.x1);
                    var angle = radians * (180 / Math.PI);

                    var startAngle = radiusX * Math.cos(angle);
                    var endAngle = radiusY * Math.sin(angle);


                    var p2 = {
                        x: objectDxf.x1,
                        y: objectDxf.y1
                    };

                    var double2 = objectDxf.r;
                    var double3 = objectParse.startAngle;
                    var double4 = objectParse.endAngle || (2.0 * Math.PI);

                    while (double4 < double3) {
                        double4 += 2.0 * Math.PI;
                    }

                    var num16 = {
                        x: 0 - p2.x,
                        y: 0 - p2.y
                    };

                    num16 = Math.sqrt(num16.x * num16.x + num16.y * num16.y);

                    var num17 = num16 * double2;
                    var th = Math.atan2(p2.y, p2.x);
                    var num18 = Math.PI / 60.0;
                    var num19 = double3;


                    radiusX = num17;
                    radiusY = num16;

                    var polyline2 = [];
                    
//                    debugger;
                    
                    var num = Math.cos(th);
                    var num12 = Math.sin(th);
                    

                    while (true) {
                        if (num19 > double4) {
                            num18 -= num19 - double4;
                            num19 = double4;
                        }
                        var p3 = {
                            x: num16 * Math.cos(num19),
                            y: num17 * Math.sin(num19)
                        };
                        // p3 *= matrix4x4F;
                        // aplicando a matrix para a rotação
                        p3 = {
                            x:  p3.x * num + p3.y * -num12,
                            y: p3.x * num12 + p3.y * num
                        }
                        // o ponto de centro + o item da ellipse
                        p3 = {
                            x: objectDxf.x + p3.x,
                            y: objectDxf.y + p3.y
                        };
                        
                        // armazenando no array
                        polyline2.push(p3);
                        
                        // continuando até a volta completa
                        if (num19 != double4)
                            num19 += num18;
                        else
                            break;
                    }
                    
                    var xxx = polyline2.map(function(item){
                        return [item.x, item.y];
                    });
                    
                    //                        
                    //return types.string.format(ellipse, [objectDxf.x, objectDxf.y, radiusY, radiusX, pointA, pointB, angle]);
                    return types.string.format(ellipse, [objectDxf.x, objectDxf.y, radiusY, radiusX, startAngle, xxx, angle]);
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