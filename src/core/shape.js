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

            layer = plane.layer.find(layer);

            // atributos 
            attrs = plane.utility.object.merge({
                uuid: plane.utility.math.uuid(9, 16)
            }, attrs);

            // criando pelo type
            var shape = plane.object[attrs.type].create(attrs);

            // verifico se temos os stores para a layer que estamos trabalhando
            if ((!_segments.find(layer.uuid)) && (!_shapes.find(layer.uuid))) {
                // se não existir, crio
                _shapes.add(layer.uuid, plane.math.dictionary.create());
                _segments.add(layer.uuid, plane.math.store.create());
            }

            // de acordo com a layer - add shape in store
            _shapes.find(layer.uuid).add(shape.uuid, shape);

            // de acordo com a layer - add segments in store
            var i = 0;
            do {
                var x = shape._segments[i].x,
                    y = shape._segments[i].y,
                    uuid = shape.uuid;

                _segments.find(layer.uuid).add([x, y, x, y, uuid]);

                i++;
            } while (i < shape._segments.length);


            return shape;
        },
        update: function (shape) {


            return true;
        },
        remove: function (value, layer) {
            // sempre trabalhamos com uma layer
            var layer = plane.layer.find(layer),
                shape = null;

            // value como string == uuid
            if (plane.utility.conversion.toType(value) === 'string') {
                shape = _segments.find(layer.uuid).find(value);
            }
            // value como object == shape
            if (plane.utility.conversion.toType(value) === 'object') {
                shape = value;
            }

            // removendo shape
            _shapes.find(layer.uuid).remove(shape);


            // removendo os segmentos, de acordo com a layer
            var i = 0;
            do {
                var x = shape._segments[i].x,
                    y = shape._segments[i].y,
                    uuid = shape.uuid;

                _segments.find(layer.uuid).remove([x, y, x, y, uuid]);
                i++;
            } while (i < shape._segments.length)

            return true;
        },
        clear: function () {

        },
        list: function (layer) {
            // sempre trabalhamos com uma layer
            layer = plane.layer.find(layer);
            return _shapes.find(layer.uuid).list();
        },
        // melhorar 
        // rectangle || uuid
        find: function (rectangle, layer) {
            if (!rectangle)
                throw new Error('shape - find - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            else {
                // sempre trabalhamos com uma layer
                layer = plane.layer.find(layer);

                var shapes = null,
                    segments = _segments.find(layer.uuid).search(rectangle);

                shapes = segments.map(function (segment) {
                    return segment[4];
                });

                shapes = shapes.filter(function (shape, index, self) {
                    return index === self.indexOf(shape);
                });

                return _shapes.find(layer.uuid).find(shapes);
            }
        }
    };

})(plane);