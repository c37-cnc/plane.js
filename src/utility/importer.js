define("utility/importer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    function fromDxf(stringDxf) {

        function toJson(objectDxf) {

            switch (objectDxf.type) {
            case 'line':
                {
                    var line = '{ "type": "line", "x": [{0}, {1}], "y": [{2}, {3}] },';
                    return types.string.format(line, [objectDxf.x, objectDxf.y, objectDxf.x1, objectDxf.y1]);
                }
            case 'circle':
                {
                    var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} },';
                    return types.string.format(circle, [objectDxf.x, objectDxf.y, objectDxf.r]);
                }
            case 'arc':
                {
                    var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2},"startAngle": {3}, "endAngle": {4}, "clockWise": {5} },';
                    return types.string.format(arc, [objectDxf.x, objectDxf.y, objectDxf.r, objectDxf.a0, objectDxf.a1, false]);
                }
            case 'ellipse':
                {
                    var ellipse = '{"type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2},"radiusX": {3} },',
                        radiusX = Math.abs(objectDxf.x1),
                        radiusY = radiusX * objectDxf.r;

                    return types.string.format(ellipse, [objectDxf.x, objectDxf.y, radiusY, radiusX])
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
        var entitiesSupport = ['line', 'circle', 'arc', 'ellipse', 'lwpolyline', 'polyline'],
            entitiesSection = false,
            objectParse = null,
            stringAux = '',
            stringJson = '',
            stringLine = '',
            arrayDxf = stringDxf.split('\n');

        for (var i = 0; i <= arrayDxf.length - 1; i++) {

            stringLine = arrayDxf[i].trim().toLowerCase();

            entitiesSection = entitiesSection ? entitiesSection : (stringLine == 'entities');

            if (!entitiesSection) continue;

            if (entitiesSupport.indexOf(stringLine) > -1) {
                objectParse = {
                    type: stringLine
                };
                continue;
            }

            if (!objectParse) continue;


            if (stringAux == '10') {
                objectParse.x = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == '10') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == '11') {
                objectParse.x1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == '11') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == '20') {
                objectParse.y = types.math.parseFloat(stringLine, 5);

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
            if (stringLine == '20') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == '21') {
                objectParse.y1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == '21') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == '40') {
                objectParse.r = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == '40') {
                stringAux = stringLine;
                continue;
            }


            if (stringAux == '50') {
                objectParse.a0 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == '50') {
                stringAux = stringLine;
                continue;
            }
            if (stringAux == '51') {
                objectParse.a1 = types.math.parseFloat(stringLine, 5);
                stringAux = '';
                continue;
            }
            if (stringLine == '51') {
                stringAux = stringLine;
                continue;
            }


            // conversão para Json
            if (objectParse && objectParse.type && (objectParse.type != 'polyline') && arrayDxf[i] == '  0') {
                stringJson += toJson(objectParse);
                objectParse = null;
            }
            // conversão para Json - verificação especifica para Polyline
            if (objectParse && objectParse.type && (objectParse.type == 'polyline') && arrayDxf[i] == 'SEQEND') {
                stringJson += toJson(objectParse);
                objectParse = null;
            }
        }

        return stringJson ? '[' + stringJson.substring(0, stringJson.length - 1) + ']' : '[]';
    }

    function fromDwg(stringDwg) {
        return true;
    }

    function fromJson(stringJson) {
        return true;
    }

    function fromSvg(stringSvg) {
        return true;
    }

    exports.fromDxf = fromDxf;
    exports.fromDwg = fromDwg;
    exports.fromJson = fromJson;
    exports.fromSvg = fromSvg;

});