define("plane/core/layer", ['require', 'exports'], function (require, exports) {

    var utility = require('utility');

    var store = utility.data.dictionary.create();

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

        var uuid = utility.math.uuid(9, 16);

        // parametros para a nova Layer
        attrs = utility.object.merge({
            uuid: uuid,
            name: 'Layer '.concat(uuid),
            style: {
                lineCap: 'butt',
                lineJoin: 'miter',
                lineWidth: .7,
                lineColor: 'rgb(0, 0, 0)',
            },
            status: 'visible',
            children: utility.data.dictionary.create(),
            events: utility.object.event.create()
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // armazenando 
        store.add(layer.uuid, layer);

        // colocando nova layer como selecionada
        _active = layer;

        return layer;
    }

    function list() {
        // não é possivel fazer o filtro aqui, pois preciso da layer do sistema 
        // para montar o grid
        return store.list()
    }

    function find(uuid) {
        return store.find(uuid);
    }

    function remove(value) {
        if (value) {

            var uuid = null;

            // value como string == uuid
            if (utility.conversion.toType(value) == 'string') {
                uuid = value;
            }
            // value como object == layer
            if (utility.conversion.toType(value) == 'object') {
                uuid = value.uuid;
            }

            // removo a layer selecionada
            store.remove(uuid);

            // filtro as layers que não são do sistema
            var layers = store.list().filter(function (layer) {
                return layer.status != 'system';
            });

            // coloco a ultima como ativa            
            _active = layers[layers.length - 1];

            return true;

        } else {
            store.list().forEach(function (layer) {
                if (layer.status != 'system') {
                    store.remove(layer.uuid);
                }
            });
            return true;
        }
    }



    Object.defineProperty(exports, 'active', {
        get: function () {
            return _active;

        },
        set: function (value) {

            // value null || undefined == return
            if ((value == null) || (value == undefined)) return;

            var uuid = null;

            // value como string == uuid
            if (utility.conversion.toType(value) == 'string') {
                uuid = value;
            }

            // value como object == shape
            if (utility.conversion.toType(value) == 'object') {
                uuid = value.uuid;
            }


            // só altero a layer quando é diferente, isso para não gerar eventos não desejados
            if (_active.uuid != uuid) {
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

        }
    });


    exports.events = utility.object.event.create();
    exports.create = create;
    exports.list = list;
    exports.find = find;
    exports.remove = remove;
});