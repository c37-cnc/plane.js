(function (plane) {
    "use strict";

    var _groups = null, // store - para armazenamento 
        _shapes = null; // tree - para a arvore de pesquisa

    plane.group = {
        _initialize: function (config) {

            _groups = plane.math.dictionary.create();
            _shapes = plane.math.dictionary.create();

            return true;

        },
        _reset: function () {

            _groups = plane.math.dictionary.create();
            _shapes = plane.math.dictionary.create();

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
            if ((!_groups.get(layer.uuid)) && (!_shapes.get(layer.uuid))) {
                // se não existir, crio
                //_groups.add(layer.uuid, plane.math.dictionary.create());
                _groups.add(layer.uuid, plane.math.store.create());
                //_shapes.add(layer.uuid, plane.math.store.create());
            }

//            debugger;

            // crio o novo Group
            var group = plane.math.group.create(attrs);

            // de acordo com a layer - add bounds in store
            _groups.get(layer.uuid).add(group.uuid, [group._bounds.from.x, group._bounds.from.y, group._bounds.to.x, group._bounds.to.y, group]);

            return group;
        },
        remove: function (uuid) {
            if ((!uuid) || (typeof uuid !== 'string')) {
                throw new Error('group - remove - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // a layer que vamos trabalhar
                var layer = plane.layer.active,
                    group = _groups.get(layer.uuid).get(uuid);
                
                //debugger;

                var children = group.children.list(),
                    i = 0;

                do {
                    if (children[i] instanceof plane.math.group) {
                        
                        var xxx = children[i];
                        xxx.children = xxx.children.list();
                        xxx.style = null;
                        
                        plane.group.create(children[i]);

                    }

                    if (children[i] instanceof plane.math.shape) {
                        plane.shape.create(children[i]);
                    }

                    i++;
                } while (i < children.length);


                _groups.get(layer.uuid).remove(uuid);

                return true;
            }
        },
        clear: function (uuid) {
            // sempre trabalhamos com uma layer
            var layer = plane.layer.get(uuid);

            if (_groups.get(layer.uuid) && _shapes.get(layer.uuid)) {
                _groups.get(layer.uuid).clear();
                _shapes.get(layer.uuid).clear();
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
        get: function (groupUuid, layerUuid) {
            if ((!groupUuid) || (typeof groupUuid !== 'string')) {
                throw new Error('group - get - groupUuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // a layer que vamos trabalhar
                var layer = plane.layer.get(layerUuid);
                return _groups.get(layer.uuid).get(groupUuid);
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