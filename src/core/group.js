(function (plane) {
    "use strict";

    var _groups = null; // store - para armazenamento 

    plane.group = {
        _initialize: function (config) {

            _groups = plane.math.dictionary.create();

            return true;

        },
        _reset: function () {

            _groups = plane.math.dictionary.create();

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
            if (!_groups.get(layer.uuid)) {
                // se não existir, crio
                _groups.add(layer.uuid, plane.math.store.create());
            }

            // verifico se devo criar as intancias dos children

            attrs.children.forEach(function (object) {

                if ((!(object instanceof plane.math.group)) && (!(object instanceof plane.math.shape))) {
                    debugger;
                }

            });

            // crio o novo Group
            var group = new plane.math.group(attrs);

            // removo as referencias dos children
            // pois estão todas dentro do group criado
            var i = 0;
            do {
                if (group.children[i] instanceof plane.math.group) {
                    _groups.get(layer.uuid).remove(group.children[i].uuid);
                }

                if (group.children[i] instanceof plane.math.shape) {
                    plane.shape.remove(group.children[i].uuid);
                }

                i++;
            } while (i < group.children.length);


            // de acordo com a layer - add bounds in store
            _groups.get(layer.uuid).add(group.uuid, [group.bounds.from.x, group.bounds.from.y, group.bounds.to.x, group.bounds.to.y, group]);

            return group;
        },
        remove: function (uuid) {
            if ((!uuid) || (typeof uuid !== 'string')) {
                throw new Error('group - remove - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // a layer que vamos trabalhar
                var layer = plane.layer.active,
                    group = _groups.get(layer.uuid).get(uuid);

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

                // removo o group do dictionary de _groups
                _groups.get(layer.uuid).remove(uuid);

                return true;
            }
        },
        clear: function (uuid) {

            // sempre trabalhamos com uma layer
            var layer = plane.layer.get(uuid);

            // temos groups para esta layer?
            if (_groups.get(layer.uuid)) {
                _groups.get(layer.uuid).clear();
            }

            return true;
        },
        list: function (uuid) {

            // sempre trabalhamos com uma layer
            var layer = plane.layer.get(uuid);

            // temos groups para esta layer?
            if (_groups.get(layer.uuid)) {
                return _groups.get(layer.uuid).list();
            } else {
                return [];
            }
        },
        // uuid = respectivo do group
        get: function (uuid) {
            if ((!uuid) || (typeof uuid !== 'string')) {
                throw new Error('group - get - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                return _groups.get(plane.layer.active.uuid).get(uuid);
            }
        },
        // rectangle = area da procura
        // uuid = respectivo da layer
        find: function (rectangle, uuid) {
            if ((!rectangle) || (typeof rectangle !== 'object')) {
                throw new Error('group - find - rectangle is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                var layer = plane.layer.get(uuid);

                // verifico se criei ao menos um group para a layer
                if (_groups.get(layer.uuid)) {

                    // os rectangles selecionados
                    var rectangles = _groups.get(layer.uuid).search(rectangle);

                    // mapeamendo para separar os shapes dos rectangles selecionados
                    return rectangles.map(function (data) {
                        return data[4];
                    });

                } else {
                    return [];
                }

            }
        }
    };

})(c37.library.plane);