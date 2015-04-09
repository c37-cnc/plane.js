(function (plane) {
    "use strict";

    var _store = null, // store - para armazenamento 
        _tree = null; // tree - para a arvore de pesquisa


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
            children: this.children.list().map(function (shape) {
                return shape.toObject();
            }),
            parent: this.parent
        };
    };



    plane.group = {
        _initialize: function (config) {

            _store = plane.math.dictionary.create();
            _tree = plane.math.dictionary.create();

            return true;

        },
        // attrs = object && obrigatório
        // layer = (uuid || layer) && não obrigatório
        create: function (attrs, layer) {
            if ((plane.utility.conversion.toType(attrs) !== 'object') || (!attrs.children)) {
                throw new Error('group - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            var group = null, // para o novo group
                groupUuid = plane.utility.math.uuid(9, 16), // identificador do group
                shapes = attrs.children, // os shapes filhos
                s = 0; // a quantidade de shapes filhos

            // a layer que vamos trabalhar
            layer = _layerParse(layer);
            
            // apagando a referencia em attrs
            delete attrs.children;

            // (attributos || parametros) para o novo Group
            attrs = plane.utility.object.merge({
                uuid: groupUuid,
                name: 'Group '.concat(groupUuid),
                children: plane.math.dictionary.create()
            }, attrs);

            // crio o novo Group
            group = new Group(attrs);

            // para conversão && add de parent
            attrs.parent = plane.group.find(attrs.parent, layer);
            
            // para conversão && add de children
            do {
                // removo o shape de plane
                plane.shape.remove(shapes[s], layer);
                
                // para incluir dentro do group criado
                //group.children.add(shapes[s].uuid, shapes[s]);
                
                // e dentro da tree para a layer
                // fazendo referencia ao group
                
                



                s++;
            } while (s < shapes.length);


            // verifico se temos store && tree para a layer 
            if ((!_store.find(layer.uuid)) && (!_tree.find(layer.uuid))) {
                // se não existir, crio
                _store.add(layer.uuid, plane.math.dictionary.create());
                _tree.add(layer.uuid, plane.math.tree.create());
            }

            // de acordo com a layer - add shape in store
            _store.find(layer.uuid).add(group.uuid, group);

            // de acordo com a layer - add segments de shape in tree


            return group;
        },
        // group = (uuid || object) && obrigatório
        // layer = (uuid || layer) && não obrigatório
        remove: function (group, layer) {


            return true;
        },
        // group = (uuid || object) && obrigatório
        // layer = (uuid || layer) && não obrigatório
        // return = array groups
        list: function (group, layer) {



        },
        // group = (uuid || object) && obrigatório
        // layer = (uuid || layer) && não obrigatório
        // return = object group
        find: function (group, layer) {
            if (!group) {
                //throw new Error('group - find - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
                return null;
            } else {
                // group como object = group
                if (plane.utility.conversion.toType(group) === 'object') {
                    return group;
                }

                // group como string = uuid
                if (plane.utility.conversion.toType(group) === 'string') {
                    layer = _layerParse(layer);
                    return _store.find(layer.uuid).find(group);
                }
            }
        },
        // query = (string || object) && obrigatório
        // layer = (uuid || layer) && não obrigatório
        search: function (query, layer) {

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