Plane.Layers = (function (Plane) {
    "use strict";

    var layers = null;

    function Layer(attrs) {
        for (var name in attrs) {
            if (name in this) {
                this[name] = attrs[name];
            }
        } 
    }

    Layer.prototype = {

        get uuid() {
            return this._uuid;
        },
        set uuid(value) {
            this._uuid = value;
        },

        get name() {
            return this._name;
        },
        set name(value) {
            if ((value != null) && (value != undefined) && (value != '')) {
                return this._name = value;
            }
        },

        get locked() {
            return this._locked;
        },
        set locked(value) {
            this._locked = value;
        },

        get visible() {
            return this._visible;
        },
        set visible(value) {
            this._visible = value;
        },

        get style() {
            return this._style;
        },
        set style(value) {
            this._style = value;
        },

        get system() {
            return this._system;
        },
        set system(value) {
            this._system = value;
        },

        toJson: function () {
            return JSON.stringify(this).replace(/_/g, '');
        }

    }

    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Layer - Initialize - Config is not valid - See the documentation');
            }

            layers = new Plane.Utility.Dictionary();

            return true;
        },
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Layer - Create - Attrs is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }

            attrs = Plane.Utility.Object.merge({
                uuid: Plane.Utility.Uuid(9, 16),
                name: (attrs && attrs.name) ? attrs.name : 'New Layer ' + layers.count(),
                style: (attrs && attrs.style) ? attrs.style : {
                    fillColor: 'rgb(0,0,0)',
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    lineWidth: .7,
                    lineColor: 'rgb(0, 0, 0)',
                },
                selectable: true,
                locked: false,
                visible: true,
                system: false
            }, attrs);

            var layer = new Layer(attrs);

            // add ao dictionary
            layers.add(layer.uuid, layer);

            // seleciono como ativa
            this.Active = layer.uuid;

            // crio o Render respectivo da Layer
            Plane.Render.Create(layer.uuid);
            // inicializo o Container de shapes respectivo da Layer
            Plane.Shape.Initialize({
                uuid: layer.uuid
            });

            return true;
        },
        Remove: function (uuid) {
            return layers.remove(uuid);
        },
        List: function (selector) {

            var layerList = layers.list().filter(function (layer) {
                return selector ? layer : !layer.system;
            });

            return layerList;
        },
        get Active() {
            return this._active;
        },
        set Active(value) {
            this.dispatchEvent('onDeactive', {
                type: 'onDeactive',
                layer: this.Active
            });

            this._active = layers.find(value);

            this.dispatchEvent('onActive', {
                type: 'onActive',
                layer: this.Active
            });
        }
    };

})(Plane);