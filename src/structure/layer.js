define("structure/layer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var LayerStore = types.data.dictionary.create(),
        LayerActive = null;

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
            Locked: this.Locked,
            Visible: this.Visible,
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
        render.style.backgroundColor = (attrs.style && attrs.style.backgroundColor) ? attrs.style.backgroundColor : 'transparent';

        // sistema cartesiano de coordenadas
        var context2D = render.getContext('2d');
        context2D.translate(0, render.height);
        context2D.scale(1, -1);

        // parametros para a nova Layer
        attrs = types.object.merge({
            uuid: uuid,
            name: 'New Layer '.concat(uuid),
            style: {
                LineCap: 'butt',
                LineJoin: 'miter',
                lineWidth: .7,
                lineColor: 'rgb(0, 0, 0)',
            },
            status: 'Visible',
            shapes: types.data.dictionary.create(),
            render: render
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // add em viewPort
        attrs.viewPort.appendChild(layer.render);

        if (layer.status != 'System') {
            LayerStore.Add(layer.uuid, layer);
            this.active(layer.uuid);
            return true;
        } else {
            return layer;
        }
    }

    function active(value) {
        return value ? LayerActive = LayerStore.Find(value) : LayerActive;
    }

    function remove(value) {
        LayerStore.list().forEach(function (Layer) {
            var Element = document.getElementById(Layer.render.id);
            if (Element && Element.parentNode) {
                Element.parentNode.removeChild(Element);
            }
            LayerStore.remove(Layer.uuid);
        });
    }

    function list() {
        return LayerStore.list();
    }



    exports.create = create;
    exports.active = active;
    exports.list = list;
    exports.remove = remove;
});