Plane.Layers = (function (Plane) {
    "use strict";

    var layers = null;

    function Layer() {}

    Layer.prototype = {

        set uuid(value) {
            this._uuid = value;
        },
        get uuid() {
            return this._uuid;
        },

        set name(value) {
            if ((value != null) && (value != undefined) && (value != '')) {
                return this._name = value;
            }
        },
        get name() {
            return this._name;
        },

        set locked(value) {
            this._locked = value;
        },
        get locked() {
            return this._locked;
        },

        set visible(value) {
            this._visible = value;
        },
        get visible() {
            return this._visible;
        },

        set style(value) {
            this._style = value;
        },
        get style() {
            return this._style;
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

            name = name || 'New Layer ' + layers.count();
            style = style || {
                fillColor: 'rgb(255,0,0)',
                lineCap: 'round',
                lineWidth: 10,
                lineColor: 'rgb(255,0,0)',
            }

            var layer = new Layer(),
                uuid = Plane.Utility.Uuid(9, 16);

            layer.uuid = uuid;
            layer.name = name;
            layer.style = style;

            // add ao dictionary
            layers.add(uuid, layer);

            // seleciono como ativa
            this.Active = uuid;
            
            // crio o Render respectivo da Layer
            Plane.Render.Create(uuid);

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
        set Active(uuid) {
            this.dispatchEvent('onDeactive', {
                type: 'onDeactive',
                layer: this.Active
            });

            this._active = layers.find(uuid);

            this.dispatchEvent('onActive', {
                type: 'onActive',
                layer: this.Active
            });
        }
    };

})(Plane);