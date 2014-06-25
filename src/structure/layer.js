define("structure/layer", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');

    function Layer(Attrs) {

        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Locked = Attrs.Locked;
        this.Visible = Attrs.Visible;
        this.Style = Attrs.Style;
        this.Render = Attrs.Render;
        this.Shapes = Attrs.Shapes;

        Types.Object.Event.call(this);

    }
    Layer.prototype = Types.Object.Event.prototype;

    Layer.prototype.ToJson = function () {
        return JSON.stringify(this).replace(/_/g, '');
    }


    function Create(Attrs) {
        if (typeof Attrs == "function") {
            throw new Error('Layer - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

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
            Shapes: new Types.Data.Dictionary(),
            Render: Render
        }, Attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(Attrs);

        // add em ViewPort
        Attrs.ViewPort.appendChild(layer.Render);

        return layer;
    }
    
    exports.Create = Create;

});