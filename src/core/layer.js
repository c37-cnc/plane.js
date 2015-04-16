(function (plane) {
    "use strict";

    var _layers = null, // store - para armazenamento 
        _active = null;


    function Layer(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.events = attrs.events;
    }

    Layer.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            status: this.status, // para ativo || não ativo
            style: this.style
        };
    };


    plane.layer = {
        _initialize: function (config) {

            _layers = plane.math.dictionary.create();

            return true;

        },
        _reset: function () {

            _layers = plane.math.dictionary.create();

            return true;

        },
        create: function (attrs) {
            if (attrs && (plane.utility.conversion.toType(attrs) !== 'object')) {
                throw new Error('layer - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            var uuid = plane.utility.math.uuid(9, 16);

            // (attributos || parametros) para a nova Layer
            attrs = plane.utility.object.merge({
                uuid: uuid,
                name: 'Layer '.concat(uuid),
                style: {
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    lineWidth: .7,
                    lineColor: 'rgb(0, 0, 0)'
                },
                status: 'visible',
                events: plane.utility.object.event.create()
            }, attrs);
            // parametros para a nova Layer

            // nova Layer
            var layer = new Layer(attrs);

            // armazenando 
            _layers.add(layer.uuid, layer);

            // colocando nova layer como selecionada
            _active = layer;

            return layer;
        },
        list: function () {
            return _layers.list();
        },
        get: function (uuid) {
            if ((_active === null) || (_active === undefined))
                throw new Error('layer - find - no layer active \n http://plane.c37.co/docs/errors.html#' + 'errorCode');

            return uuid ? _layers.get(uuid) : _active;
        },
        remove: function (uuid) {

            return _layers.remove(uuid);

        },
        clear: function (uuid) {
            
            // sempre trabalhamos com uma layer
            var layer = plane.layer.get(uuid);
            
            plane.shape.clear(layer.uuid);
            plane.group.clear(layer.uuid);
            
            return true;
            
        },
        get active() {
            return _active;
        },
        set active(value) {

        }
    };

})(c37.library.plane);