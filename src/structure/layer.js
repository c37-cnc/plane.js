define("structure/layer", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');

    var LayerStore = new Types.Data.Dictionary(),
        LayerActive = null;

    var Layer = Types.Function.Inherits(function Layer(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Locked = Attrs.Locked;
        this.Visible = Attrs.Visible;
        this.System = Attrs.System;
        this.Style = Attrs.Style;
        this.Render = Attrs.Render;
        this.Shapes = Attrs.Shapes;
    }, Types.Object.Event);

    Layer.prototype.ToObject = function () {
        return {
            Uuid: this.Uuid,
            Name: this.Name,
            Locked: this.Locked,
            Visible: this.Visible,
            Style: this.Style,
            Shapes: this.Shapes.List()
        };
    }


    function Create(Attrs) {

        var Uuid = Types.Math.Uuid(9, 16);

        // montando o Render da Layer
        var Render = document.createElement('canvas');

        Render.id = Types.Math.Uuid(9, 16);
        Render.width = Attrs.ViewPort.clientWidth;
        Render.height = Attrs.ViewPort.clientHeight;

        Render.style.position = "absolute";
        Render.style.backgroundColor = (Attrs.Style && Attrs.Style.BackgroundColor) ? Attrs.Style.BackgroundColor : 'transparent';

        // sistema cartesiano de coordenadas
        var Context2D = Render.getContext('2d');
        Context2D.translate(0, Render.height);
        Context2D.scale(1, -1);

        // parametros para a nova Layer
        Attrs = Types.Object.Merge({
            Uuid: Uuid,
            Name: 'New Layer '.concat(Uuid),
            Style: {
                fillColor: 'rgb(0,0,0)',
                lineCap: 'butt',
                lineJoin: 'miter',
                lineWidth: .7,
                lineColor: 'rgb(0, 0, 0)',
            },
            Locked: false,
            Visible: true,
            System: false,
            Shapes: new Types.Data.Dictionary(),
            Render: Render
        }, Attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(Attrs);

        // add em ViewPort
        Attrs.ViewPort.appendChild(layer.Render);

        if (!layer.System) {

            LayerStore.Add(layer.Uuid, layer);
            this.Active(layer.Uuid);

            return true;
        } else {
            return layer;
        }
    }

    function Active(Value) {
        return Value ? LayerActive = LayerStore.Find(Value) : LayerActive;
    }

    function Delete(Value) {
        LayerStore.List().forEach(function (Layer) {
            var Element = document.getElementById(Layer.Render.id);
            if (Element && Element.parentNode) {
                Element.parentNode.removeChild(Element);
            }
            LayerStore.Delete(Layer.Uuid);
        });
    }
    
    function List() {
        return LayerStore.List();
    }



    exports.Create = Create;
    exports.Active = Active;
    exports.List = List;
    exports.Delete = Delete;
});