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

    function update(shape) {
        
        remove(shape);
        create(shape);
        
        return true;
    }

    function remove(param) {
        
        // param null || undefined == return
        if ((param == null) || (param == undefined)) return;
        
        // param como string == uuid
        if (types.conversion.toType(param) == 'string') {
            return layer.active.children.remove(param);
        }

        // param como object == shape
        if (types.conversion.toType(param) == 'object') {
            return layer.active.children.remove(param.uuid);
        }

        throw new Error('Shape - remove - param is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
    }

    function list() {
        return layer.active.children.list();
    }

    function find(param) {

        // param null || undefined == return
        if ((param == null) || (param == undefined)) return;

        // param como string == uuid
        if (types.conversion.toType(param) == 'string') {
            return layer.active.children.find(param);
        }

        // param como object == shape
        if (types.conversion.toType(param) == 'object') {
            return layer.active.children.find(param.uuid);
        }

        throw new Error('Shape - find - param is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
    }

    function search(query) {
        return '';
    }







    exports.create = create;
    exports.update = update;
    exports.remove = remove;
    exports.list = list;
    exports.find = find;
    exports.search = search;
});