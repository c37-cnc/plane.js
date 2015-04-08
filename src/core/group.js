(function (plane, utility, math, layer) {
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

            _store = math.dictionary.create();
            _tree = math.dictionary.create();

            return true;

        },
        create: function (attrs) {

            if ((typeof attrs === "function") || (attrs === null)) {
                throw new Error('group - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }


            // atributos 
            attrs = utility.object.merge({
                uuid: utility.math.uuid(9, 16)
            }, attrs);


            // conversão de parent



            // conversão de children


            var group = new Group(attrs);

            // verifico se o store para a layer activa existe
            if (!_store.find(layer.active.uuid)) {
                // se não existir, crio
                _store.add(layer.active.uuid, math.dictionary.create());
                _tree.add(layer.active.uuid, math.tree.create());
            }

            // de acordo com a layer - add shape in store
            _store.find(plane.layer.active.uuid).add(group.uuid, group);



            return group;
        },
        // group = (uuid || object) && obrigatório
        // layer = (uuid || layer) && não obrigatório
        remove: function (group, layer) {


            return true;
        },
        // group = (uuid || object) && obrigatório
        // layer = (uuid || layer) && não obrigatório
        list: function (group, layer) {
            if (!group) {
                return _store.find(layer.active.uuid).list();
            } else {
                var uuid = null;

                // group como string == uuid
                if (utility.conversion.toType(group) === 'string') {
                    uuid = group;
                }
                // group como object == layer
                if (utility.conversion.toType(group) === 'object') {
                    uuid = group.uuid;
                }

                return _store.find(uuid).list();
            }
        },
        // group = (uuid || object) && obrigatório
        // layer = (uuid || layer) && não obrigatório
        find: function (group, layer) {

        },
        // query = (string || object) && obrigatório
        // layer = (uuid || layer) && não obrigatório
        search: function (query, layer) {

        }
    };

})(plane, plane.utility, plane.math, plane.layer);