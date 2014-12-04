define("plane/structure/layer", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var store = types.data.dictionary.create();

    var _active = null;


    function Layer(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.children = attrs.children;
        this.events = attrs.events;
    };

    Layer.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            status: this.status,
            style: this.style,
            children: this.children.list().map(function (shape) {
                return shape.toObject();
            })
        };
    }



    function create(attrs) {
        if ((typeof attrs == "function")) {
            throw new Error('layer - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = types.math.uuid(9, 16);

        // parametros para a nova Layer
        attrs = types.object.merge({
            uuid: uuid,
            name: 'Layer '.concat(uuid),
            style: {
                lineCap: 'butt',
                lineJoin: 'miter',
                lineWidth: .7,
                lineColor: 'rgb(0, 0, 0)',
            },
            status: 'visible',
            children: types.data.dictionary.create(),
            events: types.object.event.create()
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // armazenando 
        store.add(layer.uuid, layer);

        // colocando nova layer como selecionada
        this.active = layer.uuid;

        return this;
    }

    function list() {
        return store.list();
    }

    function find(uuid) {
        return store.find(uuid);
    }

    function remove(uuid) {
        if (uuid) {
            return store.remove(uuid);
        } else {
            store.list().forEach(function (layer) {
                if (layer.status != 'system') {
                    store.remove(layer.uuid);
                }
            });
            return true;
        }
        //        return uuid ? store.remove(uuid) : store.clear();
    }



    Object.defineProperty(exports, 'active', {
        get: function () {
            return _active;

        },
        set: function (uuid) {

            // não propagar eventos quando realizar mudanças para Layer do sistema
            if ((_active) && (_active.status != 'system') && (store.find(uuid)) && store.find(uuid).status != 'system') {
                this.events.notify('onDeactive', {
                    type: 'onDeactive',
                    layer: _active
                });
            }

            _active = store.find(uuid);

            // não propagar eventos quando realizar mudanças para Layer do sistema
            if ((_active) && (_active.status != 'system') && (store.find(uuid)) && store.find(uuid).status != 'system') {
                this.events.notify('onActive', {
                    type: 'onActive',
                    layer: _active
                });
            }

        }
    });


    exports.events = types.object.event.create();
    exports.create = create;
    exports.list = list;
    exports.find = find;
    exports.remove = remove;
});