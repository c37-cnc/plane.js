(function (plane) {
    "use strict";

    var _store = null; // store - para armazenamento 

    plane.group = {
        _initialize: function (config) {

            _store = plane.math.dictionary.create();

            return true;

        },
        _reset: function () {

            _store = plane.math.dictionary.create();

            return true;

        },
        create: function (attrs) {
            if (plane.utility.conversion.toType(attrs) !== 'object') {
                throw new Error('group - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }
            if ((!attrs.children) || (plane.utility.conversion.toType(attrs.children) !== 'array')) {
                throw new Error('group - create - children is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // a layer que vamos trabalhar
            var layer = plane.layer.active;

            // verifico se temos os stores para a layer que estamos trabalhando
            if (!_store.get(layer.uuid)) {
                // se não existir, crio
                _store.add(layer.uuid, plane.math.store.create());
            }

            // verifico se devo criar as intancias dos children
            if ((!(attrs.children[0] instanceof plane.math.group)) && (!(attrs.children[0] instanceof plane.math.shape))) {
                mountChildren(attrs);
            }

            // verifico quais os shapes que são duplicados
            var verifyHash = [],
                duplicatesShapes = attrs.children.slice(),
                onlyShapes = [];

            for (var i = 0; i < duplicatesShapes.length; i++) {

                // verificação para os shapes
                if (duplicatesShapes[i].type !== 'group') {

                    var arrayPoints = duplicatesShapes[i].toPoints().map(function (point) {

                        var pointObject = point.toObject();
                        // o round para pontos proximos
                        return JSON.stringify({
                            x: plane.utility.math.parseFloat(pointObject.x, 2),
                            y: plane.utility.math.parseFloat(pointObject.y, 2)
                        });
                        
                    }),
                        hashCode = plane.utility.string.hashCode(arrayPoints.join(''));

                    if (verifyHash.indexOf(hashCode) === -1) {

                        verifyHash.push(hashCode);
                        onlyShapes.push(duplicatesShapes.slice(i, i + 1)[0]);

                    }

                } else {
                    onlyShapes.push(duplicatesShapes.slice(i, i + 1)[0]);
                }

            }
            // apenas os shapes 
            attrs.children = onlyShapes;



            // criando a referencia de store
            attrs._store = _store.get(layer.uuid);

            // crio o novo Group
            var group = new plane.math.group(attrs);

            // removo as referencias dos children
            // pois estão todas dentro do group criado
            var i = 0;
            do {
                if (group.children[i] instanceof plane.math.group) {
                    _store.get(layer.uuid).remove(group.children[i].uuid);
                }

                if (group.children[i] instanceof plane.math.shape) {
                    plane.shape.remove(group.children[i].uuid);
                }

                // apagando a referencia de store
                delete group.children[i]._store;

                i++;
            } while (i < group.children.length);


            // de acordo com a layer - add bounds in store
            _store.get(layer.uuid).add(group.uuid, [group.bounds.from.x, group.bounds.from.y, group.bounds.to.x, group.bounds.to.y, group]);

            return group;
        },
        remove: function (uuid, type) {
            if ((!uuid) || (typeof uuid !== 'string')) {
                throw new Error('group - remove - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // a layer que vamos trabalhar
                var layer = plane.layer.active,
                    group = _store.get(layer.uuid).get(uuid);

                if (type && (type === 'unGroup')) {
                    var i = 0;
                    do {
                        // limpo qualquer estilo de children
                        group.children[i].style = null;

                        if (group.children[i] instanceof plane.math.group) {
                            plane.group.create(group.children[i]);
                        }

                        if (group.children[i] instanceof plane.math.shape) {
                            plane.shape.create(group.children[i]);
                        }

                        i++;
                    } while (i < group.children.length);
                }


                // removo o group do dictionary de _groups
                _store.get(layer.uuid).remove(uuid);

                return true;
            }
        },
        clear: function (uuid) {

            // sempre trabalhamos com uma layer
            var layer = plane.layer.get(uuid);

            // temos groups para esta layer?
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
        // uuid = respectivo do group
        get: function (uuid) {
            if ((!uuid) || (typeof uuid !== 'string')) {
                throw new Error('group - get - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                return _store.get(plane.layer.active.uuid).get(uuid);
            }
        },
        // rectangle = area da procura
        // uuid = respectivo da layer
        find: function (rectangle, uuid, type) {
            if ((!rectangle) || (typeof rectangle !== 'object')) {
                throw new Error('group - find - rectangle is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {

                var layer = plane.layer.get(uuid),
                    groups;

                // verifico se criei ao menos um group para a layer
                if (_store.get(layer.uuid)) {
                    // os rectangles selecionados
                    var rectangles = _store.get(layer.uuid).search(rectangle);

                    // mapeamendo para separar os shapes dos rectangles selecionados
                    groups = rectangles.map(function (data) {
                        return data[4];
                    });

                    if (type === 'rectangles') {
                        return groups;
                    }

                    if (type === 'shapes') {
                        if (groups.length > 0) {
                            return groups.filter(function (group) {
                                return intersectChildren(group, rectangle);
                            });

                        } else {
                            return [];
                        }
                    }

                } else {
                    return [];
                }

            }
        }
    };



    function mountChildren(attrs) {

        for (var i = 0; i < attrs.children.length; i++) {

            if (attrs.children[i].type === 'group') {

                mountChildren(attrs.children[i]);

                attrs.children[i] = new plane.math.group(attrs.children[i]);
            }

            if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline', 'text', 'quote'].indexOf(attrs.children[i].type) !== -1) {
                attrs.children[i] = plane.object[attrs.children[i].type].create(attrs.children[i]);
            }
        }

        return true;
    }

    function intersectChildren(group, rectangle) {

        for (var i = 0; i < group.children.length; i++) {

            if (group.children[i].type === 'group') {
                if (intersectChildren(group.children[i], rectangle)) {
                    return true;
                }
            }


            if ((group.children[i].type === 'circle') || (group.children[i].type === 'polygon') || (group.children[i].type === 'rectangle') || (group.children[i].type === 'ellipse')) {
                if (plane.math.intersect(group.children[i].segments, rectangle, 'close')) {
                    return true;
                }
            } else {
                if (plane.math.intersect(group.children[i].segments, rectangle, 'open')) {
                    return true;
                }
            }

        }

        return false;
    }



})(c37.library.plane);