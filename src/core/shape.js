(function (plane) {
    "use strict";

    var _store = null;

    plane.shape = {
        _initialize: function (config) {

            _store = plane.math.dictionary.create();

            return true;

        },
        _reset: function () {

            _store = plane.math.dictionary.create();

            return true;

        },
        create: function (attrs, uuid) {

            if ((typeof attrs === "function") || (attrs === null)) {
                throw new Error('shape - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline', 'text', 'quote'].indexOf(attrs.type) === -1) {
                throw new Error('shape - create - type is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // a layer que vamos trabalhar
            var layer = plane.layer.get(uuid);

            // verifico se temos os stores para a layer que estamos trabalhando
            if (!_store.get(layer.uuid)) {
                // se não existir, crio
                _store.add(layer.uuid, plane.math.store.create());
            }

            // atributos 
            attrs = plane.utility.object.merge({
                uuid: plane.utility.math.uuid(9, 16),
                // criando a referencia de store
                _store: _store.get(layer.uuid)
            }, attrs);

            // criando pelo type
            var shape = plane.object[attrs.type].create(attrs);

            // de acordo com a layer - add bounds in store
            _store.get(layer.uuid).add(shape.uuid, [shape.bounds.from.x, shape.bounds.from.y, shape.bounds.to.x, shape.bounds.to.y, shape]);

            return shape;
        },
        update: function (attrs) {
            if ((!attrs) || (typeof attrs !== 'object')) {
                throw new Error('shape - update - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // sempre trabalhamos com uma layer
                var layer = plane.layer.active;

                // tenho ao menos um shape na layer ativa?
                if (_store.get(layer.uuid)) {
                    // removendo shape
                    _store.get(layer.uuid).remove(attrs.uuid);

                    var shape = plane.object[attrs.type].create(attrs);

                    // de acordo com a layer - add bounds in store
                    _store.get(layer.uuid).add(shape.uuid, [shape.bounds.from.x, shape.bounds.from.y, shape.bounds.to.x, shape.bounds.to.y, shape]);
                }

                return true;
            }
        },
        remove: function (uuid) {
            if ((!uuid) || (typeof uuid !== 'string')) {
                throw new Error('shape - remove - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // sempre trabalhamos com uma layer
                var layer = plane.layer.active;

                // tenho ao menos um shape na layer ativa?
                if (_store.get(layer.uuid)) {
                    // removendo shape
                    _store.get(layer.uuid).remove(uuid);
                }

                return true;
            }
        },
        clear: function (uuid) {
            // sempre trabalhamos com uma layer
            var layer = plane.layer.get(uuid);

            if (_store.get(layer.uuid)) {
                _store.get(layer.uuid).clear();
            }

            return true;
        },
        list: function (uuid) {
            // sempre trabalhamos com uma layer
            var layer = plane.layer.get(uuid);

            // temos groups para esta layer?
            if (_store.get(layer.uuid)) {
                return _store.get(layer.uuid).list();
            } else {
                return [];
            }
        },
        get: function (shapeUuid, layerUuid) {
            if ((!shapeUuid) || (typeof shapeUuid !== 'string')) {
                throw new Error('shape - find - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // a layer que vamos trabalhar
                var layer = plane.layer.get(layerUuid);

                return _store.get(layer.uuid).get(shapeUuid);
            }
        },
        find: function (rectangle, uuid, type) {
            if ((!rectangle) || (typeof rectangle !== 'object')) {
                throw new Error('shape - find - rectangle is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {

                var layer = plane.layer.get(uuid),
                    shapes, shapesIntersect = [];

                // se tenho ao menos um shape, então, tenho uma layer
                if (_store.get(layer.uuid)) {
                    // os rectangles selecionados
                    var rectangles = _store.get(layer.uuid).search(rectangle);

                    // um mapeamendo para separar os shapes dos rectangles
                    shapes = rectangles.map(function (data) {
                        return data[4];
                    });

                    if (type === 'rectangles') {
                        return shapes;
                    }

                    if (type === 'shapes') {
                        if (shapes.length > 0) {
                            var i = 0;
                            do {
                                if ((shapes[i].type === 'circle') || (shapes[i].type === 'polygon') || (shapes[i].type === 'rectangle') || (shapes[i].type === 'ellipse')) {
                                    if (plane.math.intersect(shapes[i].segments, rectangle, 'close')) {
                                        shapesIntersect.push(shapes[i]);
                                    }
                                } else {
                                    if (plane.math.intersect(shapes[i].segments, rectangle, 'open')) {
                                        shapesIntersect.push(shapes[i]);
                                    }
                                }
                                i++;
                            } while (i < shapes.length)
                        }
                        return shapesIntersect;
                    }

                } else {
                    return shapesIntersect;
                }

            }
        }
    };

})(c37.library.plane);