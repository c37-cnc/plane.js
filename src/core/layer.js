(function (plane) {
    "use strict";

    var _store = null,
        _active = null;


    function Layer(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.children = attrs.children;
        this.events = attrs.events;
    }
    ;

    Layer.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            status: this.status, // para ativo || não ativo
            style: this.style,
            children: this.children.list().map(function (shape) {
                return shape.toObject();
            })
        };
    }


    plane.layer = {
        _initialize: function (config) {

            _store = plane.math.dictionary.create();

            return true;

        },
        create: function (attrs) {

            if ((typeof attrs == "function")) {
                throw new Error('layer - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            var uuid = plane.utility.math.uuid(9, 16);

            // parametros para a nova Layer
            attrs = plane.utility.object.merge({
                uuid: uuid,
                name: 'Layer '.concat(uuid),
                style: {
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    lineWidth: .7,
                    lineColor: 'rgb(0, 0, 0)',
                },
                status: 'visible',
                children: plane.math.dictionary.create(),
                events: plane.utility.object.event.create()
            }, attrs);
            // parametros para a nova Layer

            // nova Layer
            var layer = new Layer(attrs);

            // armazenando 
            _store.add(layer.uuid, layer);

            // colocando nova layer como selecionada
            _active = layer;

            return layer;
        },
        list: function () {
            return _store.list()
        },
        find: function (uuid) {

        },
        remove: function (value) {

        },
        get active() {
            return _active;
        },
        set active(value) {

        }
    };

})(plane);