define("utility/importer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    function fromDxf(stringDxf) {

        function toJson(objectDxf) {

            switch (objectDxf.type) {
            case 'line':
                {
                    if (objectDxf.x && objectDxf.y && objectDxf.x1 && objectDxf.y1) {
                        var line = '{ "type": "line", "x": [{0}, {1}], "y": [{2}, {3}] },';
                        return types.string.format(line, [objectDxf.x, objectDxf.y, objectDxf.x1, objectDxf.y1]);
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


        // certificando que a linha irá ter o o caractere de nova linha
        stringDxf = stringDxf.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // entidades suportadas na conversão
        var entities = ['line'],
            entitiesSection = false,
            //        var entities = ['CIRCLE', 'ARC', 'LWPOLYLINE', 'POLYLINE'],
            //        var entities = ['LINE', 'CIRCLE', 'ARC', 'LWPOLYLINE', 'POLYLINE'],
            objectParse = null,
            stringAux = '',
            stringJson = '',
            arrayDxf = stringDxf.split('\n');
        
        
        stringDxf.split('\n').forEach(function(line){
            
            var lineContent = line.trim().toLowerCase();
            
            if (entities.indexOf(lineContent) > -1) {
                
                stringJson += objectParse ? toJson(objectParse) : '';

                objectParse = {
                    type: lineContent
                };
            }
            
            
            if (stringAux == '10') {
                //                if ((objectParse.type == 'lwpolyline' || objectParse.type == 'polyline') && (objectParse.y)) {
                //
                //                    objectParse.vertices = objectParse.vertices || [];
                //                    objectParse.vertices.push({
                //                        x: objectParse.x,
                //                        y: objectParse.y
                //                    });
                //
                //                }
                objectParse.x = types.math.parseFloat(lineContent, 5);
                stringAux = '';
                //                continue;
            }
            if ((objectParse) && (lineContent == '10')) {
                stringAux = lineContent;
            }
            if (stringAux == '11') {
                objectParse.x1 = types.math.parseFloat(lineContent, 5);
                stringAux = '';
            }
            if ((objectParse) && (lineContent == '11')) {
                stringAux = lineContent;
            }



            if (stringAux == '20') {
                objectParse.y = types.math.parseFloat(lineContent, 5);
                stringAux = '';
            }
            if ((objectParse) && (lineContent == '20')) {
                stringAux = lineContent;
            }
            if (stringAux == '21') {
                objectParse.y1 = types.math.parseFloat(lineContent, 5);
                stringAux = '';
            }
            if ((objectParse) && (lineContent == '21')) {
                stringAux = lineContent;
            }
            
            
        });
        


//        for (var i = 0; i <= arrayDxf.length - 1; i++) {
//
//            var lineContent = arrayDxf[i].trim().toLowerCase();
//
//            entitiesSection = entitiesSection ? entitiesSection : (lineContent == 'entities');
//            
//            if (!entitiesSection) continue;
//
//            if (entities.indexOf(lineContent) > -1) {
//                
//                stringJson += objectParse ? toJson(objectParse) : '';
//
//                objectParse = {
//                    type: lineContent
//                };
//            }
//
//            if (!objectParse) continue;
//
//
//            if (stringAux == '10') {
//                //                if ((objectParse.type == 'lwpolyline' || objectParse.type == 'polyline') && (objectParse.y)) {
//                //
//                //                    objectParse.vertices = objectParse.vertices || [];
//                //                    objectParse.vertices.push({
//                //                        x: objectParse.x,
//                //                        y: objectParse.y
//                //                    });
//                //
//                //                }
//                objectParse.x = types.math.parseFloat(lineContent, 5);
//                stringAux = '';
//                //                continue;
//            }
//            if ((objectParse) && (lineContent == '10')) {
//                stringAux = lineContent;
//            }
//            if (stringAux == '11') {
//                objectParse.x1 = types.math.parseFloat(lineContent, 5);
//                stringAux = '';
//            }
//            if ((objectParse) && (lineContent == '11')) {
//                stringAux = lineContent;
//            }
//
//
//
//            if (stringAux == '20') {
//                objectParse.y = types.math.parseFloat(lineContent, 5);
//                stringAux = '';
//            }
//            if ((objectParse) && (lineContent == '20')) {
//                stringAux = lineContent;
//            }
//            if (stringAux == '21') {
//                objectParse.y1 = types.math.parseFloat(lineContent, 5);
//                stringAux = '';
//            }
//            if ((objectParse) && (lineContent == '21')) {
//                stringAux = lineContent;
//            }
//
//
//        }

        stringJson = stringJson.substring(0, stringJson.length - 1);

        console.log(stringJson);

        return stringJson ? '[' + stringJson + ']' : '[]';

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