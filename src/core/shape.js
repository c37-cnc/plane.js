define("plane/core/shape", ['require', 'exports'], function (require, exports) {

    var utility = require('utility');

    var intersection = require('plane/math/intersection'),
        matrix = require('plane/math/matrix');

    var point = require('plane/core/point'),
        layer = require('plane/core/layer'),
        view = require('plane/core/view');

    var shapeType = {
        'arc': require('plane/object/arc'),
        'bezier-cubic': require('plane/object/bezier-cubic'),
        'bezier-quadratic': require('plane/object/bezier-quadratic'),
        'circle': require('plane/object/circle'),
        'ellipse': require('plane/object/ellipse'),
        'line': require('plane/object/line'),
        'polygon': require('plane/object/polygon'),
        'polyline': require('plane/object/polyline'),
        'rectangle': require('plane/object/rectangle'),
        'spline': require('plane/object/spline')
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
        attrs = utility.object.merge({
            uuid: utility.math.uuid(9, 16),
        }, attrs);

        // criando pelo type
        var shape = shapeType[attrs.type].create(attrs);;

        // adicionando o novo shape na layer ativa
        layer.active.children.add(shape.uuid, shape);

        return shape;
    }


    function update(shape) {

        // neste momento realizo a exclução para inicializar o shape de forma correta

        remove(shape);
        create(shape);

        return true;
    }

    function remove(param) {

        // param null || undefined == return
        if ((param == null) || (param == undefined)) return;

        // param como string == uuid
        if (utility.conversion.toType(param) == 'string') {
            return layer.active.children.remove(param);
        }

        // param como object == shape
        if (utility.conversion.toType(param) == 'object') {
            return layer.active.children.remove(param.uuid);
        }

        throw new Error('Shape - remove - param is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
    }

    function clear(param) {

        if (param && param.status) {


        } else {
            return layer.active.children.clear();
        }

    }

    function list() {
        return layer.active.children.list();
    }

    function find(param) {

        // param null || undefined == return
        if ((param == null) || (param == undefined)) return;

        // param como string == uuid
        if (utility.conversion.toType(param) == 'string') {
            return layer.active.children.find(param);
        }

        // param como object == shape
        if (utility.conversion.toType(param) == 'object') {
            return layer.active.children.find(param.uuid);
        }

        throw new Error('Shape - find - param is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
    }

    function search(query) {

        if (query.type == 'inView') {

            var rectangle = {
                from: point.create(view.transform.inverseTransform(point.create(0, 0))),
                to: point.create(view.transform.inverseTransform(point.create(view.size.width, view.size.height)))
            }

            return layer.active.children.list().filter(function (shape) {
                return shape.intersect(rectangle);
            });

        }


        return '';
    }





    exports.create = create;
    exports.update = update;
    exports.remove = remove;
    exports.clear = clear;
    exports.list = list;
    exports.find = find;
    exports.search = search;
});