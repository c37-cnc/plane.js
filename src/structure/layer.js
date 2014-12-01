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
            name: 'New Layer '.concat(uuid),
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




    function active(uuid) {
        return uuid ? active = store.find(uuid) : active;
    }


    Object.defineProperty(exports, 'active', {
        get: function () {
            return _active;

        },
        set: function (uuid) {

            this.events.notify('onDeactivated', {
                type: 'onDeactivated',
                layer: _active
            });

            _active = store.find(uuid);

            this.events.notify('onActivated', {
                type: 'onActivated',
                layer: _active
            });

        }
    });


    exports.events = types.object.event.create();
    exports.create = create;
    exports.list = list;
    exports.find = find;
    exports.remove = remove;
});