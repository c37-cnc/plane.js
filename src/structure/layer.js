define("structure/layer", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var LayerStore = types.data.dictionary.create(),
        LayerActive = null;

    var Layer = types.object.inherits(function Layer(attrs) {
        this.Uuid = attrs.Uuid;
        this.Name = attrs.Name;
        this.Status = attrs.Status;
        this.Style = attrs.Style;
        this.render = attrs.render;
        this.shapes = attrs.shapes;
    }, types.object.event);

    Layer.prototype.toObject = function () {
        return {
            Uuid: this.Uuid,
            Name: this.Name,
            Locked: this.Locked,
            Visible: this.Visible,
            Style: this.Style,
            shapes: this.shapes.list()
        };
    }


    function create(attrs) {

        var Uuid = types.math.uuid(9, 16);

        // montando o render da Layer
        var render = document.createElement('canvas');

        render.id = types.math.uuid(9, 16);
        render.width = attrs.viewPort.clientWidth;
        render.height = attrs.viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = (attrs.Style && attrs.Style.backgroundColor) ? attrs.Style.backgroundColor : 'transparent';

        // sistema cartesiano de coordenadas
        var context2D = render.getContext('2d');
        context2D.translate(0, render.height);
        context2D.scale(1, -1);

        // parametros para a nova Layer
        attrs = types.object.merge({
            Uuid: Uuid,
            Name: 'New Layer '.concat(Uuid),
            Style: {
                LineCap: 'butt',
                LineJoin: 'miter',
                LineWidth: .7,
                LineColor: 'rgb(0, 0, 0)',
            },
            Status: 'Visible',
            shapes: types.data.dictionary.create(),
            render: render
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // add em viewPort
        attrs.viewPort.appendChild(layer.render);

        if (layer.Status != 'System') {
            LayerStore.Add(layer.Uuid, layer);
            this.active(layer.Uuid);
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
            LayerStore.remove(Layer.Uuid);
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