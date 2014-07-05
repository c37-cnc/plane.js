define("utility/importer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    function fromDxf(stringDxf) {


        function toJson(dxfObject) {

            switch (dxfObject.type) {
            case 'LINE':
                {
                    var line = '{ "type": "line", "x": [{0}, {1}], "y": [{2}, {3}] }';
                    return types.string.format(line, [dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1]);
                }
            case 'CIRCLE':
                {
                    var circle = '{ "type": "circle", "x": {0}, "y": {1}, "radius": {2} }';
                    return types.string.format(circle, [dxfObject.x, dxfObject.y, dxfObject.r]);
                }
            case 'ARC':
                {
                    var arc = '{"type": "arc", "x": {0}, "y": {1}, "radius": {2},"startAngle": {3}, "endAngle": {4}, "clockWise": {5} }';
                    return types.string.format(arc, [dxfObject.x, dxfObject.y, dxfObject.r, dxfObject.a0, dxfObject.a1, false]);
                }
            case 'ELLIPSE':
                {
                    var ellipse = '{"type": "ellipse", "x": {0}, "y": {1}, "radiusY": {2},"radiusX": {3} }',
                        radiusX = Math.abs(dxfObject.x1),
                        radiusY = radiusX * dxfObject.r;

                    return types.string.format(ellipse, [dxfObject.x, dxfObject.y, radiusY, radiusX])
                }
            case 'LWPOLYLINE':
                {
                    if (dxfObject.vertices) {

                        var polyline = '{"type": "polyline", "points": [{0}]}',
                            points = '';

                        for (var i = 0; i < dxfObject.vertices.length; i++) {

                            var point = i == dxfObject.vertices.length - 1 ? '{"x": {0}, "y": {1}}' : '{"x": {0}, "y": {1}},';
                            points += types.string.format(point, [dxfObject.vertices[i].x, dxfObject.vertices[i].y]);

                        }
                        return types.string.format(polyline, [points]);
                    }
                }
            }

        }

        var groupCodes = {
            0: 'entitytype',
            2: 'blockname',
            10: 'x',
            11: 'x1',
            20: 'y',
            21: 'y1',
            40: 'r',
            50: 'a0',
            51: 'a1',
        };

        var supportedEntities = ['LINE', 'CIRCLE', 'ARC', 'ELLIPSE', 'LWPOLYLINE'];

        var counter = 0;
        var code = null;
        var isEntitiesSectionActive = false;
        var object = {};
        var svg = '',
            json = '[';

        // Normalize platform-specific newlines.
        stringDxf = stringDxf.replace(/\r\n/g, '\n');
        stringDxf = stringDxf.replace(/\r/g, '\n');

        stringDxf.split('\n').forEach(function (line) {

            line = line.trim();

            if (counter++ % 2 === 0) {
                code = parseInt(line);
            } else {
                var value = line;
                var groupCode = groupCodes[code];
                if (groupCode === 'blockname' && value === 'ENTITIES') {
                    isEntitiesSectionActive = true;
                } else if (isEntitiesSectionActive) {

                    if (groupCode === 'entitytype') { // New entity starts.
                        if (object.type) {
                            json += json.substring(json.length - 1, json.length) == '[' ? '' : ',';
                            json += toJson(object);
                        }

                        object = supportedEntities.indexOf(value) > -1 ? {
                            type: value
                        } : {};

                        if (value === 'ENDSEC') {
                            isEntitiesSectionActive = false;
                        }
                    } else if (object.type && typeof groupCode !== 'undefined') { // Known entity property recognized.
                        object[groupCode] = parseFloat(value);

                        if (object.type == 'LWPOLYLINE' && groupCode === 'y') {
                            if (!object.vertices) {
                                object.vertices = [];
                            }
                            object.vertices.push({
                                x: object.x,
                                y: object.y
                            });
                        }
                    }
                }
            }
        });

        return json += ']';
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