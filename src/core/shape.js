(function (plane) {
    "use strict";

    var _store = null, // store - para armazenamento 
        _tree = null; // tree - para a arvore de pesquisa

    plane.shape = {
        _initialize: function (config) {

            _store = plane.math.dictionary.create();
            _tree = plane.math.dictionary.create();

            return true;

        },
        create: function (attrs) {

            if ((typeof attrs === "function") || (attrs === null)) {
                throw new Error('shape - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline', 'text', 'quote'].indexOf(attrs.type) === -1) {
                throw new Error('shape - create - type is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // atributos 
            attrs = plane.utility.object.merge({
                uuid: plane.utility.math.uuid(9, 16)
            }, attrs);

            // criando pelo type
            var shape = plane.object[attrs.type].create(attrs);

            // verifico se o store para a layer activa existe
            if (!_store.find(plane.layer.active.uuid)) {
                // se não existir, crio
                _store.add(plane.layer.active.uuid, plane.math.dictionary.create());
                _tree.add(plane.layer.active.uuid, plane.math.tree.create());
            }

            // de acordo com a layer - add shape in store
            _store.find(plane.layer.active.uuid).add(shape.uuid, shape);

            // de acordo com a layer - add segments in arvore de pesquisa
            var i = 0;
            do {
                var x = shape._segments[i].x,
                    y = shape._segments[i].y,
                    uuid = shape.uuid;

                _tree.find(plane.layer.active.uuid).add([x, x, y, y, {uuid: uuid}]);

                i++;
            } while (i < shape._segments.length);


            return shape;
        },
        update: function (shape) {


            return true;
        },
        remove: function (value) {


            return true;
        },
        clear: function () {

        },
        list: function () {

        },
        find: function (value) {

            // uuid
            // shape
            // shape - property


            return true;

        },
        search: function (query) {


            return true;
        }
    };

})(plane);