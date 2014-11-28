define("plane/structure/shape", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point'),
        layer = require('plane/structure/layer');

    var shapeType = {
        'arc': require('plane/shapes/arc'),
        'bezier-cubic': require('plane/shapes/bezier-cubic'),
        'bezier-quadratic': require('plane/shapes/bezier-quadratic'),
        'circle': require('plane/shapes/circle'),
        'ellipse': require('plane/shapes/ellipse'),
        'line': require('plane/shapes/line'),
        'polygon': require('plane/shapes/polygon'),
        'polyline': require('plane/shapes/polyline'),
        'rectangle': require('plane/shapes/rectangle'),
//        splineCatmullRom: require('plane/shapes/spline-catmull–rom'),
//        splineNurbs: require('plane/shapes/spline-nurbs')
    };


    //    var arc = require('plane/shapes/arc'),
    //        bezierCubic = require('plane/shapes/bezier-cubic'),
    //        bezierQuadratic = require('plane/shapes/bezier-quadratic'),
    //        circle = require('plane/shapes/circle'),
    //        ellipse = require('plane/shapes/ellipse'),
    //        line = require('plane/shapes/line'),
    //        polygon = require('plane/shapes/polygon'),
    //        polyline = require('plane/shapes/polyline'),
    //        rectangle = require('plane/shapes/rectangle'),
    //        splineCatmullRom = require('plane/shapes/spline-catmull–rom'),
    //        splineNurbs = require('plane/shapes/spline-nurbs');






    function create(attrs) {

        // verificação para a chamada da função
        if ((typeof attrs == "function") || (attrs == null)) {
            throw new Error('shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // verifição para o tipo de shape
        if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline'].indexOf(attrs.type) == -1) {
            throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }


        // atributos 
        attrs = types.object.merge({
            uuid: types.math.uuid(9, 16),
        }, attrs);


        var shape = shapeType[attrs.type].create(attrs);;



//
//
//        switch (attrs.type) {
//        case 'arc':
//            {
//                shape = arc.create(types.object.merge({
//                    uuid: types.math.uuid(9, 16),
//                }, attrs));
//
//                break;
//            }
//        case 'line':
//            {
//                attrs.points = [point.create(attrs.a[0], attrs.a[1]), point.create(attrs.b[0], attrs.b[1])];
//
//                shape = line.create(attrs);
//
//                break;
//            }
//        case 'bezier-cubic':
//            {
//                attrs.points[0] = point.create(attrs.points[0][0], attrs.points[0][1]);
//                attrs.points[1] = point.create(attrs.points[1][0], attrs.points[1][1]);
//                attrs.points[2] = point.create(attrs.points[2][0], attrs.points[2][1]);
//                attrs.points[3] = point.create(attrs.points[3][0], attrs.points[3][1]);
//
//                shape = bezierCubic.create(attrs);
//
//                break;
//            }
//        case 'bezier-quadratic':
//            {
//                attrs.points[0] = point.create(attrs.points[0][0], attrs.points[0][1]);
//                attrs.points[1] = point.create(attrs.points[1][0], attrs.points[1][1]);
//                attrs.points[2] = point.create(attrs.points[2][0], attrs.points[2][1]);
//
//                shape = bezierQuadratic.create(attrs);
//
//                break;
//            }
//        case 'rectangle':
//            {
//                attrs.point = point.create(attrs.x, attrs.y);
//                attrs.height = attrs.height;
//                attrs.width = attrs.width;
//
//                shape = rectangle.create(attrs);
//
//                break;
//            }
//        case 'circle':
//            {
//                attrs.point = point.create(attrs.x, attrs.y);
//                attrs.radius = attrs.radius;
//
//                shape = circle.create(attrs);
//
//                break;
//            }
//        case 'ellipse':
//            {
//                attrs.point = point.create(attrs.x, attrs.y);
//                attrs.radiusY = attrs.radiusY;
//                attrs.radiusX = attrs.radiusX;
//
//                shape = ellipse.create(attrs);
//
//                break;
//            }
//        case 'polygon':
//            {
//                attrs.point = point.create(attrs.x, attrs.y);
//                attrs.sides = attrs.sides;
//                attrs.radius = attrs.radius;
//
//                shape = polygon.create(attrs);
//
//                break;
//            }
//        case 'polyline':
//            {
//                for (var i = 0; i < attrs.points.length; i++) {
//                    attrs.points[i] = point.create(attrs.points[i].x, attrs.points[i].y);
//                }
//
//                shape = polyline.create(attrs);
//
//                break;
//            }
//        case 'spline':
//            {
//                for (var i = 0; i < attrs.points.length; i++) {
//                    attrs.points[i] = point.create(attrs.points[i].x, attrs.points[i].y);
//                }
//
//                shape = splineNurbs.create(attrs);
//
//                break;
//            }
//        default:
//            break;
//        }
        
        

        // adicionando o novo shape na layer ativa
        return layer.active.children.add(shape.uuid, shape);
    }


    function remove(value) {}

    function list() {}

    function find() {}





    exports.create = create;
    exports.remove = remove;
    exports.list = list;
    exports.find = find;
});