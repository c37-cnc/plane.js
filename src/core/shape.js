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

                _tree.find(plane.layer.active.uuid).insert([x, y, x, y, uuid]);
                //_tree.find(plane.layer.active.uuid).add([x, y, x, y, uuid]);

                i++;
            } while (i < shape._segments.length);


            return shape;
        },
        update: function (shape) {


            return true;
        },
        remove: function (value, layer) {
            // sempre trabalho com uma layer
            var layer = _layerParse(layer),
                shape = null;
            
            // value como string == uuid
            if (plane.utility.conversion.toType(value) === 'string') {
                shape = _store.find(layer.uuid).find(value);
            }
            // value como object == shape
            if (plane.utility.conversion.toType(value) === 'object') {
                shape = value;
            }

            debugger;

            // removendo do store
            _store.find(layer.uuid).remove(shape);
            

            // removendo os segmentos na tree de pesquisa 
            // em shape, de acordo com a layer
            var i = 0;
            do {
                var x = shape._segments[i].x,
                    y = shape._segments[i].y,
                    uuid = shape.uuid;

                _tree.find(layer.uuid).remove([x, y, x, y, uuid]);
                i++;
            } while (i < shape._segments.length)

            return true;
        },
        clear: function () {

        },
        // params = object && obrigatório
        // params.shape 
        list: function (valueeee) {
//            // sempre trabalho com uma layer
//            var layer = _layerParse(layer);
//
//            // se não tenho argumentos
//            if (arguments.length === 0) {
//                // retorno todos os shapes de acordo com a layer
//                return _store.find(layer.uuid).list();
//            }
//
//            debugger;
//
//
//            // shape, layer
//
//
//
//            if (!shape) {
//                return _store.find(layer.uuid).list();
//
//            }
//
//







            if (!value) {
                return _store.find(plane.layer.active.uuid).list();
            } else {
                var uuid = null;

                // value como string == uuid
                if (plane.utility.conversion.toType(value) === 'string') {
                    uuid = value;
                }
                // value como object == layer
                if (plane.utility.conversion.toType(value) === 'object') {
                    uuid = value.uuid;
                }

                return _store.find(uuid).list();
            }
        },
        find: function (rectangle, value) {
            if (!rectangle)
                throw new Error('shape - find - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            else {
                if (!value) {

                    var segmentsFound = _tree.find(plane.layer.active.uuid).search([rectangle.from.x, rectangle.from.y, rectangle.to.x, rectangle.to.y]);

                    segmentsFound = segmentsFound.map(function (segment) {
                        return segment[4];
                    });

                    var shapesFound = segmentsFound.filter(function (segment, index, self) {
                        return index === self.indexOf(segment);
                    });

                    return _store.find(plane.layer.active.uuid).find(shapesFound);

                } else {
                    var uuid = null;

                    // value como string == uuid
                    if (plane.utility.conversion.toType(value) === 'string') {
                        uuid = value;
                    }
                    // value como object == layer
                    if (plane.utility.conversion.toType(value) === 'object') {
                        uuid = value.uuid;
                    }

                    var segmentsFound = _tree.find(uuid).search([rectangle.from.x, rectangle.from.y, rectangle.to.x, rectangle.to.y]);

                    segmentsFound = segmentsFound.map(function (segment) {
                        return segment[4];
                    });

                    var shapesFound = segmentsFound.filter(function (segment, index, self) {
                        return index === self.indexOf(segment);
                    });

                    return _store.find(uuid).find(shapesFound);
                }
            }
        },
        search: function (query) {


            return true;
        }
    };


    // layer = (uuid || layer) && não obrigatório
    // return = object layer
    function _layerParse(layer) {
        if ((layer !== undefined) && (layer !== null)) {
            // value como string == uuid
            if (plane.utility.conversion.toType(layer) === 'string') {
                return plane.layer.find(layer);
            }
            // value como object == layer
            if (plane.utility.conversion.toType(layer) === 'object') {
                return layer;
            }
        } else {
            // se nenhum parametro
            // a layer activa de plane
            return plane.layer.active;
        }
    }


})(plane);