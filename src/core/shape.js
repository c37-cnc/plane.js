(function (plane) {
    "use strict";

    var _shapes = null;


    plane.shape = {
        _initialize: function (config) {

            _shapes = plane.math.dictionary.create();

            return true;

        },
        create: function (attrs, layerUuid) {

            if ((typeof attrs === "function") || (attrs === null)) {
                throw new Error('shape - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline', 'text', 'quote'].indexOf(attrs.type) === -1) {
                throw new Error('shape - create - type is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            var layer = plane.layer.get(layerUuid);

            // atributos 
            attrs = plane.utility.object.merge({
                uuid: plane.utility.math.uuid(9, 16)
            }, attrs);

            // criando pelo type
            var shape = plane.object[attrs.type].create(attrs);

            // verifico se temos os stores para a layer que estamos trabalhando
            if (!_shapes.get(layer.uuid)) {
                // se não existir, crio
                _shapes.add(layer.uuid, plane.math.store.create());
            }

            // de acordo com a layer - add bounds in store
            _shapes.get(layer.uuid).add(shape.uuid, [shape._bounds.from.x, shape._bounds.from.y, shape._bounds.to.x, shape._bounds.to.y, shape]);

            return shape;
        },
        update: function (shapeUuid) {


            return true;
        },
        remove: function (shapeUuid, layerUuid) {
            if ((!shapeUuid) || (typeof shapeUuid !== 'string')) {
                throw new Error('shape - remove - shapeUuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                
                // sempre trabalhamos com uma layer
                var layer = plane.layer.get(layerUuid);
                // removendo shape
                _shapes.get(layer.uuid).remove(shapeUuid);

                return true;
            }
        },
        clear: function () {

        },
        list: function (layerUuid) {
            // sempre trabalhamos com uma layer
            var layer = plane.layer.get(layerUuid);
            return _shapes.get(layer.uuid).list();
        },
        get: function (shapeUuid, layerUuid) {
            if ((!shapeUuid) || (typeof shapeUuid === 'string')) {
                throw new Error('shape - find - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // a layer que vamos trabalhar
                var layer = plane.layer.get(layerUuid);

                return _shapes.get(layer.uuid).get(shapeUuid);
            }
        },
        find: function (rectangle, layerUuid) {
            if ((!rectangle) || (typeof rectangle !== 'object')) {
                throw new Error('shape - find - rectangle is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {

                var layer = plane.layer.get(layerUuid),
                    rectangles = _shapes.get(layer.uuid).search(rectangle);

                // um mapeamendo para separar os shapes dos rectangles
                return rectangles.map(function (segment) {
                    return segment[4];
                });

            }
        }
    };

})(plane);