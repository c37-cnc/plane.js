(function (plane) {
    "use strict";

    // https://gist.github.com/Phrogz/845901
    function pathToPolygon(path, samples) {

        if (!samples)
            samples = 0;

        var doc = path.ownerDocument;
        var poly = doc.createElementNS('http://www.w3.org/2000/svg', 'polygon');

        // Put all path segments in a queue
        var segs = [];

        for (var i = 0; i < path.pathSegList.numberOfItems; i++) {
            segs[i] = path.pathSegList[i];
        }

        var segments = segs.concat();

        var segment,
            lastSegment,
            points = [],
            x, y;


        var addSegmentPoint = function (s) {

            if (s.pathSegType === SVGPathSeg.PATHSEG_CLOSEPATH) {

            } else {
                if (s.pathSegType % 2 === 1 && s.pathSegType > 1) {
                    // All odd-numbered path types are relative, except PATHSEG_CLOSEPATH (1)
                    x += s.x;
                    y += s.y;
                } else {
                    x = s.x;
                    y = s.y;
                }
                var lastPoint = points[points.length - 1];
                if (!lastPoint || x !== lastPoint[0] || y !== lastPoint[1])
                    points.push([x, y]);
            }
        };


        for (var d = 0, len = path.getTotalLength(), step = len / samples; d <= len; d += step) {

            segment = segments[path.getPathSegAtLength(d)];
            var point = path.getPointAtLength(d);

            if (segment !== lastSegment) {
                lastSegment = segment;
                while (segs.length && segs[0] !== segment)
                    addSegmentPoint(segs.shift());
            }

            var lastPoint = points[points.length - 1];

            if (!lastPoint || point.x !== lastPoint[0] || point.y !== lastPoint[1]) {
                points.push([point.x, point.y]);
            }

        }

        for (var i = 0, len = segs.length; i < len; ++i)
            addSegmentPoint(segs[i]);

        for (var i = 0, len = points.length; i < len; ++i)
            points[i] = points[i].join(',');


        poly.setAttribute('points', points.join(' '));

        return {
            polygon: poly,
            points: points
        };
    }

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

    function parseSvg(stringSvg) {

        function toObject(svgPoints) {
            return {"type": "polyline", "points": svgPoints};
        }

        // http://stackoverflow.com/questions/3043303/push-svg-string-into-dom
        var documentElement = new DOMParser().parseFromString(stringSvg, 'text/xml'),
            arraySvg = [];

        // se o conteudo é um svg válido
        if (documentElement.childElementCount > 0) {

            // seleciono apenas os tipos paths
            var svgPaths = documentElement.querySelectorAll('path'),
                svgPoints = [];

            [].forEach.call(svgPaths, function (svgPath) {

                debugger;

                // http://www.unet.univie.ac.at/~a9900479/svg4tom/svg4tom1.html
//                svgPath.setAttribute("transform", "scale(" + 6 + " " + 6 + ")");

                // http://whaticode.com/2012/02/01/converting-svg-paths-to-polygons/
                var length = svgPath.getTotalLength(),
                    numberOfParts = 100,
                    step = length / numberOfParts,
                    actualSegment, lastSegment, actualPoint, prevPoint, lastPoint;

//                for (var i = 0; i < length; i = i + step) {
                for (var i = 0; i < length; i = i + .2) {

//                    actualSegment = svgPath.pathSegList[svgPath.getPathSegAtLength(i)];
                    actualPoint = svgPath.getPointAtLength(i);
                    svgPoints.push({x: actualPoint.x, y: actualPoint.y});

                    prevPoint = svgPoints[i === 0 ? 0 : svgPoints.length - 2 % length];
                    lastPoint = svgPoints[svgPoints.length - 1];


                    if (distanceTo(prevPoint, actualPoint) > .3) {

                        svgPoints.pop();

                        svgPoints.push(svgPoints[0]);

                        arraySvg.push(toObject(svgPoints));
                        svgPoints = [];

                    }


                }

                if (svgPoints.length > 0) {
                    svgPoints.push(svgPoints[0]);
                    arraySvg.push(toObject(svgPoints));
                }

            });

        }

        return arraySvg;

    }

    function distanceTo(a, b) {

        if (a && b) {

            var dx = a.x - b.x;
            var dy = a.y - b.y;

            return Math.sqrt(dx * dx + dy * dy);

        }

        return 0;

    }

    function  mirror(p, x0, y0, x1, y1) {

        var dx, dy, a, b, x2, y2, p1; //reflected point to be returned 

        dx = (x1 - x0);
        dy = (y1 - y0);

        a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
        b = 2 * dx * dy / (dx * dx + dy * dy);

        x2 = (a * (p.x - x0) + b * (p.y - y0) + x0);
        y2 = (b * (p.x - x0) - a * (p.y - y0) + y0);

        p1 = {
            x: x2,
            y: y2
        };

        return p1;

    }



    plane.importer = {
        fromDxf: function (stringDxf) {

            var arrayDxf = parseDxf(stringDxf);

            if (arrayDxf.length > 0) {
                plane.layer.create();
                var i = 0;
                do {
                    plane.shape.create(arrayDxf[i]);
                    i++;
                } while (i < arrayDxf.length);
            }

            return true;
        },
        fromJson: function (stringJson) {

            var objectPlane = JSON.parse(stringJson);

            return plane.importer.fromObject(objectPlane);

        },
        fromObject: function (objectPlane) {

            objectPlane.layers.forEach(function (layer) {

                plane.layer.create({
                    uuid: layer.uuid,
                    name: layer.name,
                    status: layer.status,
                    style: layer.style
                });

                layer.children.groups.forEach(function (group) {
                    plane.group.create(group);
                });

                layer.children.shapes.forEach(function (shape) {
                    plane.shape.create(shape);
                });

            });

            plane.view.zoomTo(objectPlane.zoom, plane.point.create(objectPlane.center));

            return true;
        },
        fromSvg: function (stringSvg) {

            var arraySvg = parseSvg(stringSvg),
                arrayPolygons = [];

            if (arraySvg.length > 0) {
                plane.layer.create();
                var i = 0;
                do {
                    arrayPolygons.push(plane.shape.create(arraySvg[i]));
                    i++;
                } while (i < arraySvg.length);
            }

            if (arrayPolygons.length > 0) {

                var from = arrayPolygons[0].bounds.from,
                    to = arrayPolygons[0].bounds.to,
                    bounds, lineCenter;

                arrayPolygons.forEach(function (polygon) {
                    from = plane.point.create(polygon.bounds.from).minimum(from);
                    to = plane.point.create(polygon.bounds.to).maximum(to);
                });

                bounds = plane.math.bounds.create(from, to);

                lineCenter = {
                    from: {
                        x: bounds.from.x,
                        y: bounds.center.y
                    },
                    to: {
                        x: bounds.to.x,
                        y: bounds.center.y
                    }
                };

                arrayPolygons.forEach(function (polygon) {

                    var polygonObject = polygon.toObject(),
                        polygonPoints = polygonObject.points.map(function (point) {
                            return mirror(point, lineCenter.from.x, lineCenter.from.y, lineCenter.to.x, lineCenter.to.y);
                        });


                    polygonPoints = simplify(polygonPoints, .009, true);

                    polygonObject.points = polygonPoints;

                    plane.shape.remove(polygon.uuid);
                    plane.shape.create(polygonObject);

                });


                // https://github.com/ariutta/svg-pan-zoom/blob/789552c17c90ba881ab5abb41242ac942cc34eac/dist/svg-pan-zoom.js#L254
                // o comprimento + o valor do zoom para estar em relação a bounds de view
                var width = bounds.width / plane.view.zoom,
                    // a altura + o valor do zoom para estar em relação a bounds de view
                    height = bounds.height / plane.view.zoom;

                // a escala
                var scale = Math.min((plane.view.bounds.width - 450) / width, (plane.view.bounds.height - 200) / height);

                plane.view.zoomTo(scale, bounds.center);




            }






            return true;

        }
    };

})(c37.library.plane);