(function (plane) {
    "use strict";

    var _shapes = null,
        _segments = null;


    plane.shape = {
        _initialize: function (config) {

            _shapes = plane.math.dictionary.create();
            _segments = plane.math.dictionary.create();

            return true;

        },
        create: function (attrs, layer) {

            if ((typeof attrs === "function") || (attrs === null)) {
                throw new Error('shape - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline', 'text', 'quote'].indexOf(attrs.type) === -1) {
                throw new Error('shape - create - type is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            layer = plane.layer.get(layer);

            // atributos 
            attrs = plane.utility.object.merge({
                uuid: plane.utility.math.uuid(9, 16)
            }, attrs);

            // criando pelo type
            var shape = plane.object[attrs.type].create(attrs);

            // verifico se temos os stores para a layer que estamos trabalhando
            if ((!_segments.get(layer.uuid)) && (!_shapes.get(layer.uuid))) {
                // se não existir, crio
                _shapes.add(layer.uuid, plane.math.dictionary.create());
                _segments.add(layer.uuid, plane.math.store.create());
            }

            // de acordo com a layer - add shape in store
            _shapes.get(layer.uuid).add(shape.uuid, shape);

            // de acordo com a layer - add segments in store
            var i = 0;
            do {
                var x = shape._segments[i].x,
                    y = shape._segments[i].y,
                    uuid = shape.uuid;

                _segments.get(layer.uuid).add([x, y, x, y, uuid]);

                i++;
            } while (i < shape._segments.length);


            return shape;
        },
        update: function (shape) {


            return true;
        },
        remove: function (shapeUuid, layerUuid) {
            if ((!shapeUuid) || (typeof shapeUuid !== 'string')) {
                throw new Error('shape - remove - shapeUuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // sempre trabalhamos com uma layer
                var layer = plane.layer.get(layerUuid),
                    shape = _shapes.get(layer.uuid).get(shapeUuid);

                // removendo shape
                _shapes.get(layer.uuid).remove(shape.uuid);

                // removendo os segmentos, de acordo com a layer
                var i = 0;
                do {
                    var x = shape._segments[i].x,
                        y = shape._segments[i].y,
                        uuid = shape.uuid;

                    _segments.get(layer.uuid).remove([x, y, x, y, uuid]);
                    i++;
                } while (i < shape._segments.length)

                return true;
            }
        },
        clear: function () {

        },
        list: function (layer) {
            // sempre trabalhamos com uma layer
            layer = plane.layer.get(layer);
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
                    shapes = null,
                    segments = _segments.get(layer.uuid).search(rectangle);

                // um mapeamendo para separar os uuids dos shapes
                shapes = segments.map(function (segment) {
                    return segment[4];
                });

                // um filtro para retirar os uuids duplicados
                shapes = shapes.filter(function (shape, index, self) {
                    return index === self.indexOf(shape);
                });

                // agora procuro e retorno só os shapes encontrados
                return _shapes.get(layer.uuid).get(shapes);
            }
        }
    };

})(plane);