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
        Create: function (name, style) {
            if ((name && (typeof name != 'string')) || (style && (typeof style != 'object'))) {
                throw new Error('Layer - Create - Layer Name is not valid - See the documentation');
            }

            var attrs = {
                    uuid: Plane.Utility.Uuid(9, 16),
                    name: name || 'New Layer ' + layers.count(),
                    style: style || {
                        fillColor: 'rgb(0,0,0)',
                        lineCap: 'butt',
                        lineJoin: 'miter',
                        lineWidth: 1,
                        lineColor: 'rgb(0, 0, 0)',
                    }
                },
                layer = new Layer(attrs);

            // add ao dictionary
            layers.add(layer.uuid, layer);

            // seleciono como ativa
            this.Active = layer.uuid;

            // crio o Render respectivo da Layer
            Plane.Render.Create(layer.uuid);
            
            return true;
        },
        Remove: function (uuid) {
            return layers.remove(uuid);
        },
        List: function (callback) {
            return typeof callback == 'function' ?
                callback.call(this, layers.list()) :
                layers.list();
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