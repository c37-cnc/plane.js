(function (plane) {
    "use strict";


    var _groups = null, // store - para armazenamento 
        _segments = null; // tree - para a arvore de pesquisa


    function Group(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.children = attrs.children;
        this.parent = attrs.parent;
    }

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
            _segments = plane.math.dictionary.create();

            return true;

        },
        create: function (attrs, layer) {
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
            layer = plane.layer.find(layer);

            // verifico se temos os stores para a layer que estamos trabalhando
            if ((!_groups.find(layer.uuid)) && (!_segments.find(layer.uuid))) {
                // se não existir, crio
                _groups.add(layer.uuid, plane.math.dictionary.create());
                _segments.add(layer.uuid, plane.math.store.create());
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
                if ((plane.utility.conversion.toType(shapes[i]) !== 'object') || (!attrs.children)) {
                    throw new Error('group - create - children is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
                }

                // removo o shape de plane
                plane.shape.remove(shapes[i], layer);

                // para incluir dentro do group criado
                group.children.add(shapes[i].uuid, shapes[i]);

                // de acordo com a layer - add segments in store
                var ii = 0;
                do {
                    var x = shapes[i]._segments[ii].x,
                        y = shapes[i]._segments[ii].y,
                        uuid = shapes[i].uuid;

                    _segments.find(layer.uuid).add([x, y, x, y, uuid]);

                    ii++;
                } while (ii < shapes[i]._segments.length);
                // de acordo com a layer - add segments in store

                i++;
            } while (i < shapes.length);
            // para conversão && add de children

            // de acordo com a layer - add shape in store
            _groups.find(layer.uuid).add(group.uuid, group);

            return group;
        },
        remove: function (group, layer) {


            return true;
        },
        list: function (layer) {
            // sempre trabalhamos com uma layer
            layer = plane.layer.find(layer);
            return _groups.find(layer.uuid).list();
        },
        find: function (type, layer) {
            if (!type) {
                throw new Error('group - find - type is not defined \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            } else {
                // a layer que vamos trabalhar
                layer = plane.layer.find(layer);

                if (type.group) {
                    return _groups.find(layer.uuid).find(group);
                } else if (type.rectangle) {

                    var groups = null,
                        shapes = null,
                        segments = _segments.find(layer.uuid).search(type.rectangle);

                    // um mapeamendo para separar os uuids dos shapes
                    shapes = segments.map(function (segment) {
                        return segment[4];
                    });

                    // um filtro para retirar os uuids duplicados
                    shapes = shapes.filter(function (shape, index, self) {
                        return index === self.indexOf(shape);
                    });

                    // agora procuro e retorno só os grupos com os shapes encontrados
                    return _groups.find(layer.uuid).list().filter(function (group) {
                        return group.children.has(shapes);
                    });

                }

                throw new Error('group - find - type is invalid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }
        }
    };

})(plane);