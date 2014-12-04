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
        'spline': require('plane/shapes/spline')
    };




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

        // criando pelo type
        var shape = shapeType[attrs.type].create(attrs);;

        // adicionando o novo shape na layer ativa
        layer.active.children.add(shape.uuid, shape);
        
        return shape;
    }


    function remove(uuid) {}

    function list() {}

    function find(uuid) {}





    exports.create = create;
    exports.remove = remove;
    exports.list = list;
    exports.find = find;
});