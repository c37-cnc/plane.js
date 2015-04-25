(function (plane) {
    "use strict";


    var _groups = null, // store - para armazenamento 
        _shapes = null; // tree - para a arvore de pesquisa


    function Group(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.children = attrs.children;
        this.parent = attrs.parent;
    }

    Group.prototype._render = function (context, zoom, motion) {

        var shapes = this.children.list();

        // se não tenho estilo
        if (!this.style) {
            // inicio o conjunto de shapes no contexto
            context.beginPath();
        }

        var i = 0;
        do {
            // se tenho estilo, passo a herança, caso contrario, limpo qualquer erro
            shapes[i].style = this.style ? this.style : null;

            shapes[i]._render(context, zoom, motion);
            i++;
        } while (i < shapes.length)

        // se não tenho estilo
        if (!this.style) {
            // desenho o conjunto de shapes no contexto
            context.stroke();
        }

        return true;
    };

    Group.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            status: this.status, // para ativo || não ativo
            style: this.style,
            parent: this.parent.toObject(),
            children: this.children.list().map(function (shape) {
                return shape.toObject();
            })
        };
    };



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
        create: function (attrs, layerUuid) {
            if (plane.utility.conversion.toType(attrs) !== 'object') {
                throw new Error('group - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }
            if ((!attrs.children) || (plane.utility.conversion.toType(attrs.children) !== 'array')) {
                throw new Error('group - create - children is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }
            if ((attrs.parent) && (plane.utility.conversion.toType(attrs.parent) !== 'object')) {
                throw new Error('group - create - parent is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            var group = null, // para o novo group
                uuid = plane.utility.math.uuid(9, 16), // identificador do group
                shapes = attrs.children; // os shapes filhos

            // a layer que vamos trabalhar
            var layer = plane.layer.get(layerUuid);

            // verifico se temos os stores para a layer que estamos trabalhando
            if ((!_groups.get(layer.uuid)) && (!_shapes.get(layer.uuid))) {
                // se não existir, crio
                _groups.add(layer.uuid, plane.math.dictionary.create());
                _shapes.add(layer.uuid, plane.math.store.create());
            }

            // apagando a referencia em attrs
            delete attrs.children;

            // (attributos || parametros) para o novo Group
            attrs = plane.utility.object.merge({
                uuid: uuid,
                name: 'Group '.concat(uuid),
                parent: attrs.parent,
                children: plane.math.dictionary.create()
            }, attrs);

            // crio o novo Group
            group = new Group(attrs);

            // para conversão && add de children
            var i = 0;
            do {
                if ((typeof shapes[i] !== 'object') || (!attrs.children)) {
                    throw new Error('group - create - children is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
                }

                // removo o shape de plane
                plane.shape.remove(shapes[i].uuid, layer.uuid);

                // para incluir dentro do group criado
                group.children.add(shapes[i].uuid, shapes[i]);

                // de acordo com a layer - add bounds in store
                _shapes.get(layer.uuid).add(shapes[i].uuid, [shapes[i]._bounds.from.x, shapes[i]._bounds.from.y, shapes[i]._bounds.to.x, shapes[i]._bounds.to.y, shapes[i]]);

                i++;
            } while (i < shapes.length);
            // para conversão && add de children

            // de acordo com a layer - add shape in store
            _groups.get(layer.uuid).add(group.uuid, group);

            return group;
        },
        remove: function (uuid) {
            if ((!uuid) || (typeof uuid !== 'string')) {
                throw new Error('group - remove - uuid is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // a layer que vamos trabalhar
                var layer = plane.layer.active,
                    group = _groups.get(layer.uuid).get(uuid);

                group.children.list().forEach(function (shape) {
                    // removo do store interdo de shapes
                    _shapes.remove(shape.uuid);

                    // nunca mantenho o estado de estilos
                    delete shape.style;

                    //crio em shapes sem group
                    plane.shape.create(shape);
                });

                _groups.get(layer.uuid).remove(group.uuid);

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
        find: function (rectangle, layerUuid) {
            if ((!rectangle) || (typeof rectangle !== 'object')) {
                throw new Error('group - find - rectangle is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                var layer = plane.layer.get(layerUuid);

                // verifico se criei ao menos um group para a layer
                if (_shapes.get(layer.uuid)) {

                    var shapes = null,
                        rectangles = _shapes.get(layer.uuid).search(rectangle);

                    // um mapeamendo para separar os uuids dos shapes
                    shapes = rectangles.map(function (data) {
                        return data[4];
                    });

                    // agora procuro e retorno só os grupos com os shapes encontrados
                    return _groups.get(layer.uuid).list().filter(function (group) {
                        return group.children.has(shapes.map(function (shape) {
                            return shape.uuid;
                        }));
                    });

                } else {
                    return [];
                }

            }
        }
    };

})(c37.library.plane);