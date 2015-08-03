(function (plane) {
    "use strict";

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

    function parseSvg2(stringSvg) {

        function distanceTo(a, b) {

            if (a && b) {

                var dx = a.x - b.x;
                var dy = a.y - b.y;

                return Math.sqrt(dx * dx + dy * dy);

            }

            return 0;

        }

        function toObject(svgPoints) {
            return {"type": "polyline", "points": svgPoints};
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/SVGPathElement
        // http://stackoverflow.com/questions/3043303/push-svg-string-into-dom
        var documentElement = new DOMParser().parseFromString(stringSvg, 'text/xml'),
            arraySvg = [];

        // se o conteudo é um svg válido
        if (documentElement.childElementCount > 0) {

            // seleciono apenas os tipos paths
            var svgPaths = documentElement.querySelectorAll('path'),
                svgPoints = [];

            // http://www.w3schools.com/svg/svg_path.asp
            [].forEach.call(svgPaths, function (svgPath) {

                // http://whaticode.com/2012/02/01/converting-svg-paths-to-polygons/
                var length = svgPath.getTotalLength(),
                    numberOfParts = 8000,
                    step = length / numberOfParts,
                    actualPoint, prevPoint, lastPoint;

                // inicio um novo polygon, garanto a limpeza do restante anterior
                svgPoints = [];

//                for (var i = 0; i < length; i = i + .25) {
                for (var i = 0; i < length; i = i + step) {

                    actualPoint = svgPath.getPointAtLength(i);
                    svgPoints.push({x: actualPoint.x, y: actualPoint.y});

                    prevPoint = svgPoints[i === 0 ? 0 : svgPoints.length - 2];
                    lastPoint = svgPoints[svgPoints.length - 1];

                    // a distancia entre os pontos é maior que a distancia do passo para o mapeamento do path
                    if (distanceTo(prevPoint, actualPoint) > (step + 1)) {
//                    if (distanceTo(prevPoint, actualPoint) > .3) {

                        // exlcuo o ultimpo ponto o do MOVIMENTO
                        svgPoints.pop();

                        // fecho o polygon
                        svgPoints.push(svgPoints[0]);

                        // converto os pontos em poligon e adiciono na lista
                        arraySvg.push(toObject(svgPoints));

                        // inicio um novo polygon
                        svgPoints = [];

                    }

                }

                // tenho pontos formando um path?
                if (svgPoints.length > 0) {

                    // fecho o polygon
                    svgPoints.push(svgPoints[0]);
                    // converto os pontos em poligon e adiciono na lista
                    arraySvg.push(toObject(svgPoints));

                }

            });

        }

        return arraySvg;

    }

    function parseSvg(stringSvg) {

        function toObject(svgPoints) {
            return {"type": "polyline", "points": svgPoints};
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/SVGPathElement
        // http://stackoverflow.com/questions/3043303/push-svg-string-into-dom
        var documentElement = new DOMParser().parseFromString(stringSvg, 'text/xml'),
            arraySvg = [];

        // se o conteudo é um svg válido
        if (documentElement.childElementCount > 0) {

            // seleciono apenas os tipos paths
            var svgPaths = documentElement.querySelectorAll('path'),
                svgPoints = [],
                svgWidth = documentElement.children[0].viewBox.baseVal.width || documentElement.children[0].width.baseVal.value,
//                svgHeight = documentElement.children[0].viewBox.baseVal.height || documentElement.children[0].height.baseVal.value,
//                svgSizeFactor = svgWidth / svgHeight,
                svgTolerance = 0;

            if (svgWidth >= 0) {
                svgTolerance = .07;
            }
            if (svgWidth >= 150) {
                svgTolerance = .5;
            }
            if (svgWidth >= 350) {
                svgTolerance = 1;
            }
            if (svgWidth >= 1100) {
                svgTolerance = 132;
            }




            // http://www.w3schools.com/svg/svg_path.asp
            [].forEach.call(svgPaths, function (svgPath) {

//                debugger;


                var svgPolygons = omgsvg.constructPolygonFromSVGPath(svgPath.getAttribute('d'), {tolerance: svgTolerance});
//                var svgPolygons = omgsvg.constructPolygonFromSVGPath(svgPath.getAttribute('d'), {});

                svgPolygons.forEach(function (svgPolygon) {

                    var svgPointsArray = plane.utility.array.split(svgPolygon, svgPolygon.length / 2);
                    var svgPoints = svgPointsArray.map(function (pointArray) {
                        return {x: pointArray[0], y: pointArray[1]};
                    });


                    arraySvg.push(toObject(svgPoints));


                });









            });

        }

        return arraySvg;

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

                    var polygonPoints = polygon.points.map(function (point) {
                        return point.mirror(lineCenter.from.x, lineCenter.from.y, lineCenter.to.x, lineCenter.to.y);
                    });

                    polygonPoints = simplify(polygonPoints, .009, true);

                    plane.shape.remove(polygon.uuid);
                    plane.shape.create({
                        type: 'polyline',
                        points: polygonPoints
                    });

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

        },
        fromImg: function (fileImg, update, cccc) {

            if (update || (update === null) || (update === undefined)) {
                plane.layer.create();
            }



            Potrace.loadImageFromFile(fileImg);

            Potrace.process(function () {

                var svgString;
                svgString = Potrace.getSVG(1);

                if (svgString.length > 11) {

                    plane.importer.fromSvg(svgString);

                    if (update || (update === null) || (update === undefined)) {
                        plane.view.update(true);
                    }

                }

                return cccc ? cccc(true) : true;

            });

        }
    };

})(c37.library.plane);





//pathToAbsolute = R._pathToAbsolute = function (pathArray) {
//    var pth = paths(pathArray);
//    if (pth.abs) {
//        return pathClone(pth.abs);
//    }
//    if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
//        pathArray = R.parsePathString(pathArray);
//    }
//    if (!pathArray || !pathArray.length) {
//        return [["M", 0, 0]];
//    }
//    var res = [],
//        x = 0,
//        y = 0,
//        mx = 0,
//        my = 0,
//        start = 0;
//    if (pathArray[0][0] == "M") {
//        x = +pathArray[0][1];
//        y = +pathArray[0][2];
//        mx = x;
//        my = y;
//        start++;
//        res[0] = ["M", x, y];
//    }
//    var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
//    for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
//        res.push(r = []);
//        pa = pathArray[i];
//        if (pa[0] != upperCase.call(pa[0])) {
//            r[0] = upperCase.call(pa[0]);
//            switch (r[0]) {
//                case "A":
//                    r[1] = pa[1];
//                    r[2] = pa[2];
//                    r[3] = pa[3];
//                    r[4] = pa[4];
//                    r[5] = pa[5];
//                    r[6] = +(pa[6] + x);
//                    r[7] = +(pa[7] + y);
//                    break;
//                case "V":
//                    r[1] = +pa[1] + y;
//                    break;
//                case "H":
//                    r[1] = +pa[1] + x;
//                    break;
//                case "R":
//                    var dots = [x, y][concat](pa.slice(1));
//                    for (var j = 2, jj = dots.length; j < jj; j++) {
//                        dots[j] = +dots[j] + x;
//                        dots[++j] = +dots[j] + y;
//                    }
//                    res.pop();
//                    res = res[concat](catmullRom2bezier(dots, crz));
//                    break;
//                case "M":
//                    mx = +pa[1] + x;
//                    my = +pa[2] + y;
//                default:
//                for (j = 1, jj = pa.length; j < jj; j++) {
//                    r[j] = +pa[j] + ((j % 2) ? x : y);
//                }
//            }
//        } else if (pa[0] == "R") {
//            dots = [x, y][concat](pa.slice(1));
//            res.pop();
//            res = res[concat](catmullRom2bezier(dots, crz));
//            r = ["R"][concat](pa.slice(-2));
//        } else {
//            for (var k = 0, kk = pa.length; k < kk; k++) {
//                r[k] = pa[k];
//            }
//        }
//        switch (r[0]) {
//            case "Z":
//                x = mx;
//                y = my;
//                break;
//            case "H":
//                x = r[1];
//                break;
//            case "V":
//                y = r[1];
//                break;
//            case "M":
//                mx = r[r.length - 2];
//                my = r[r.length - 1];
//            default:
//                x = r[r.length - 2];
//                y = r[r.length - 1];
//        }
//    }
//    res.toString = R._path2string;
//    pth.abs = pathClone(res);
//    return res;
//}

// http://raphaeljs.com/reference.html#Raphael.path2curve
// https://github.com/DmitryBaranovskiy/raphael/blob/master/raphael.js
//path2curve = R._path2curve = cacher(function (path, path2) {
//    var pth = !path2 && paths(path);
//    if (!path2 && pth.curve) {
//        return pathClone(pth.curve);
//    }
//    var p = pathToAbsolute(path),
//        p2 = path2 && pathToAbsolute(path2),
//        attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
//    attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
//    processPath = function (path, d, pcom) {
//        var nx, ny, tq = {T: 1, Q: 1};
//        if (!path) {
//            return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
//        }
//        !(path[0] in tq) && (d.qx = d.qy = null);
//        switch (path[0]) {
//            case "M":
//                d.X = path[1];
//                d.Y = path[2];
//                break;
//            case "A":
//                path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
//                break;
//            case "S":
//                if (pcom == "C" || pcom == "S") { // In "S" case we have to take into account, if the previous command is C/S.
//                    nx = d.x * 2 - d.bx;          // And reflect the previous
//                    ny = d.y * 2 - d.by;          // command's control point relative to the current point.
//                } else {                            // or some else or nothing
//                    nx = d.x;
//                    ny = d.y;
//                }
//                path = ["C", nx, ny][concat](path.slice(1));
//                break;
//            case "T":
//                if (pcom == "Q" || pcom == "T") { // In "T" case we have to take into account, if the previous command is Q/T.
//                    d.qx = d.x * 2 - d.qx;        // And make a reflection similar
//                    d.qy = d.y * 2 - d.qy;        // to case "S".
//                } else {                            // or something else or nothing
//                    d.qx = d.x;
//                    d.qy = d.y;
//                }
//                path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
//                break;
//            case "Q":
//                d.qx = path[1];
//                d.qy = path[2];
//                path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
//                break;
//            case "L":
//                path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
//                break;
//            case "H":
//                path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
//                break;
//            case "V":
//                path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
//                break;
//            case "Z":
//                path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
//                break;
//        }
//        return path;
//    },
//        fixArc = function (pp, i) {
//            if (pp[i].length > 7) {
//                pp[i].shift();
//                var pi = pp[i];
//                while (pi.length) {
//                    pcoms1[i] = "A"; // if created multiple C:s, their original seg is saved
//                    p2 && (pcoms2[i] = "A"); // the same as above
//                    pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
//                }
//                pp.splice(i, 1);
//                ii = mmax(p.length, p2 && p2.length || 0);
//            }
//        },
//        fixM = function (path1, path2, a1, a2, i) {
//            if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
//                path2.splice(i, 0, ["M", a2.x, a2.y]);
//                a1.bx = 0;
//                a1.by = 0;
//                a1.x = path1[i][1];
//                a1.y = path1[i][2];
//                ii = mmax(p.length, p2 && p2.length || 0);
//            }
//        },
//        pcoms1 = [], // path commands of original path p
//        pcoms2 = [], // path commands of original path p2
//        pfirst = "", // temporary holder for original path command
//        pcom = ""; // holder for previous path command of original path
//    for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
//        p[i] && (pfirst = p[i][0]); // save current path command
//
//        if (pfirst != "C") // C is not saved yet, because it may be result of conversion
//        {
//            pcoms1[i] = pfirst; // Save current path command
//            i && (pcom = pcoms1[i - 1]); // Get previous path command pcom
//        }
//        p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath
//
//        if (pcoms1[i] != "A" && pfirst == "C")
//            pcoms1[i] = "C"; // A is the only command
//        // which may produce multiple C:s
//        // so we have to make sure that C is also C in original path
//
//        fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1
//
//        if (p2) { // the same procedures is done to p2
//            p2[i] && (pfirst = p2[i][0]);
//            if (pfirst != "C")
//            {
//                pcoms2[i] = pfirst;
//                i && (pcom = pcoms2[i - 1]);
//            }
//            p2[i] = processPath(p2[i], attrs2, pcom);
//
//            if (pcoms2[i] != "A" && pfirst == "C")
//                pcoms2[i] = "C";
//
//            fixArc(p2, i);
//        }
//        fixM(p, p2, attrs, attrs2, i);
//        fixM(p2, p, attrs2, attrs, i);
//        var seg = p[i],
//            seg2 = p2 && p2[i],
//            seglen = seg.length,
//            seg2len = p2 && seg2.length;
//        attrs.x = seg[seglen - 2];
//        attrs.y = seg[seglen - 1];
//        attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
//        attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
//        attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
//        attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
//        attrs2.x = p2 && seg2[seg2len - 2];
//        attrs2.y = p2 && seg2[seg2len - 1];
//    }
//    if (!p2) {
//        pth.curve = pathClone(p);
//    }
//    return p2 ? [p, p2] : p;
//}