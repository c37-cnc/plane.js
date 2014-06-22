define("structure/layer", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');

    function Layer(attrs) {

        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.system = attrs.system;
        this.style = attrs.style;
        this.render = attrs.render;
        this.shapes = attrs.shapes;

        Types.Object.Event.call(this);

    }
    Layer.prototype = Types.Object.Event.prototype;

    Layer.prototype.toJson = function () {
        return JSON.stringify(this).replace(/_/g, '');
    }


    function Create(attrs) {
        if (typeof attrs == "function") {
            throw new Error('Layer - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = Types.Math.Uuid(9, 16);

        // montando o render da Layer
        var render = document.createElement('canvas');

        render.width = attrs.viewPort.clientWidth;
        render.height = attrs.viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = attrs.count == 0 ? attrs.backgroundColor : 'transparent';

        // sistema cartesiano de coordenadas
        var context2D = render.getContext('2d');
        context2D.translate(0, render.height);
        context2D.scale(1, -1);

        // parametros para a nova Layer
        attrs = Types.Object.Merge({
            uuid: uuid,
            name: 'New Layer ' + attrs.count,
            style: {
                fillColor: 'rgb(0,0,0)',
                lineCap: 'butt',
                lineJoin: 'miter',
                lineWidth: .7,
                lineColor: 'rgb(0, 0, 0)',
            },
            locked: false,
            visible: true,
            system: false,
            shapes: new Types.Data.Dictionary(),
            render: render
        }, attrs);
        // parametros para a nova Layer

        // nova Layer
        var layer = new Layer(attrs);

        // add em viewPort
        attrs.viewPort.appendChild(layer.render);

        return layer;
    }

    exports.Create = Create;

});