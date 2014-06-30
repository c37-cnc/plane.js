define("structure/layer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var layerStore = types.data.dictionary.create(),
        layerActive = null;

    var Layer = types.object.inherits(function Layer(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.render = attrs.render;
        this.shapes = attrs.shapes;
    }, types.object.event);

    Layer.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            locked: this.locked,
            status: this.status,
            style: this.style,
            shapes: this.shapes.list()
        };
    }


    function create(attrs) {

        var uuid = types.math.uuid(9, 16);

        // montando o render da Layer
        var render = document.createElement('canvas');

        render.id = types.math.uuid(9, 16);
        render.width = attrs.viewPort.clientWidth;
        render.height = attrs.viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = (attrs.status == 'system') ? attrs.style.backgroundColor : 'transparent';

        var context2D = render.getContext('2d');
        
        // sistema cartesiano de coordenadas
        context2D.translate(0, render.height);
        context2D.scale(1, -1);

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
            shapes: types.data.dictionary.create(),
            render: render
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // add em viewPort
        attrs.viewPort.appendChild(layer.render);

        if (layer.status != 'system') {
            layerStore.add(layer.uuid, layer);
            this.active(layer.uuid);
            return true;
        } else {
            return layer;
        }
    }

    function active(value) {
        return value ? layerActive = layerStore.Find(value) : layerActive;
    }

    function remove(value) {
        layerStore.list().forEach(function (layer) {
            var element = document.getElementById(layer.render.id);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
            layerStore.remove(layer.uuid);
        });
    }

    function list() {
        return layerStore.list();
    }



    exports.create = create;
    exports.active = active;
    exports.list = list;
    exports.remove = remove;
});