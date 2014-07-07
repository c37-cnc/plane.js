define("utility/importer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    function fromDxf(stringDxf) {

        function toJson(dxfObject) {

            switch (dxfObject.type) {
            case 'line':
                {
                    if (dxfObject.x && dxfObject.y && dxfObject.x1 && dxfObject.y1) {
                        var line = '{ "type": "line", "x": [{0}, {1}], "y": [{2}, {3}] },';
                        return types.string.format(line, [dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1]);
                    }
                    return '';
                }
            case 'circle':
                {
                    var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} },';
                    return types.string.format(circle, [dxfObject.x, dxfObject.y, dxfObject.r]);
                }
            case 'arc':
                {
                    var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2},"startAngle": {3}, "endAngle": {4}, "clockWise": {5} },';
                    return types.string.format(arc, [dxfObject.x, dxfObject.y, dxfObject.r, dxfObject.a0, dxfObject.a1, false]);
                }
            case 'ellipse':
                {
                    var ellipse = '{"type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2},"radiusX": {3} },',
                        radiusX = Math.abs(dxfObject.x1),
                        radiusY = radiusX * dxfObject.r;

                    return types.string.format(ellipse, [dxfObject.x, dxfObject.y, radiusY, radiusX])
                }
            case 'lwpolyline':
                {
                    if (dxfObject.vertices) {
                        var polyline = '{"type": "polyline", "points": [{0}]},',
                            points = '';

                        for (var i = 0; i < dxfObject.vertices.length; i++) {

                            var point = i == dxfObject.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [dxfObject.vertices[i].x, dxfObject.vertices[i].y]);

                        }
                        return types.string.format(polyline, [points]);
                    }
                    return '';
                }
            case 'polyline':
                {
                    if (dxfObject.vertices) {
                        var polyline = '{"type": "polyline", "points": [{0}]},',
                            points = '';

                        for (var i = 0; i < dxfObject.vertices.length; i++) {

                            var point = i == dxfObject.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [dxfObject.vertices[i].x, dxfObject.vertices[i].y]);

                        }
                        return types.string.format(polyline, [points]);
                    }
                    return '';
                }
            }

        }


        // certificando que a linha irá ter o o caractere de nova linha
        stringDxf = stringDxf.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // entidades suportadas na conversão
        var entities = ['LINE'],
            //        var entities = ['CIRCLE', 'ARC', 'LWPOLYLINE', 'POLYLINE'],
            //        var entities = ['LINE', 'CIRCLE', 'ARC', 'LWPOLYLINE', 'POLYLINE'],
            parseObj = null,
            cursor = '',
            stringJson = '[',
            arrayDxf = stringDxf.split('\n');


        for (var i = 0; i <= arrayDxf.length - 1; i++) {
            
            if (entities.indexOf(arrayDxf[i]) > -1) {

                stringJson += parseObj ? toJson(parseObj) : '';

                parseObj = {
                    type: arrayDxf[i].toLowerCase()
                };
                continue;
            }

            if (!parseObj) continue;


            if (cursor == '10') {
                //                if ((parseObj.type == 'lwpolyline' || parseObj.type == 'polyline') && (parseObj.y)) {
                //
                //                    parseObj.vertices = parseObj.vertices || [];
                //                    parseObj.vertices.push({
                //                        x: parseObj.x,
                //                        y: parseObj.y
                //                    });
                //
                //                }
                parseObj.x = types.math.parseFloat(arrayDxf[i].trim(), 5);
                cursor = '';
                continue;
            }
            if (arrayDxf[i].trim() == '10') {
                cursor = arrayDxf[i].trim();
                continue;
            }
            if (cursor == '11') {
                parseObj.x1 = types.math.parseFloat(arrayDxf[i].trim(), 5);
                cursor = '';
                continue;
            }
            if (arrayDxf[i].trim() == '11') {
                cursor = arrayDxf[i].trim();
                continue;
            }


            if (cursor == '20') {
                parseObj.y = types.math.parseFloat(arrayDxf[i].trim(), 5);
                cursor = '';
                continue;
            }
            if (arrayDxf[i].trim() == '20') {
                cursor = arrayDxf[i].trim();
                continue;
            }
            if (cursor == '21') {
                parseObj.y1 = types.math.parseFloat(arrayDxf[i].trim(), 5);
                cursor = '';
                continue;
            }
            if (arrayDxf[i].trim() == '21') {
                cursor = arrayDxf[i].trim();
                continue;
            }
            //
            //
            //            if (cursor == ' 40') {
            //                parseObj.r = types.math.parseFloat(arrayDxf[i].trim(), 5);
            //                cursor = '';
            //                continue;
            //            }
            //            if (arrayDxf[i] == ' 40') {
            //                cursor = arrayDxf[i];
            //                continue;
            //            }
            //
            //
            //            if (cursor == ' 50') {
            //                parseObj.a0 = types.math.parseFloat(arrayDxf[i].trim(), 5);
            //                cursor = '';
            //                continue;
            //            }
            //            if (arrayDxf[i] == ' 50') {
            //                cursor = arrayDxf[i];
            //                continue;
            //            }
            //            if (cursor == ' 51') {
            //                parseObj.a1 = types.math.parseFloat(arrayDxf[i].trim(), 5);
            //                cursor = '';
            //                continue;
            //            }
            //            if (arrayDxf[i] == ' 51') {
            //                cursor = arrayDxf[i];
            //                continue;
            //            }

        }

        stringJson = stringJson.substring(0, stringJson.length - 1);

        return stringJson ? stringJson += ']' : '[]';

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