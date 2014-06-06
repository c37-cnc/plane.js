var layer = (function () {
    "use strict";

    function Layer(attrs) {

        this.uuid = attrs.uuid;
        //        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.system = attrs.system;
        this.style = attrs.style;

    }
    Layer.prototype = {
        get name() {
            return this._name;
        },
        set name(value) {
            if ((value != null) && (value != undefined) && (value != '')) {
                return this._name = value;
            }
        },
        toJson: function () {
            return JSON.stringify(this);
        }
    }

    return {
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Layer - Create - Attrs is not valid' + '\nhttp://requirejs.org/docs/errors.html#' + 'id');
            }
            
            var layer = new Layer();
            
            return layer;
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
    }

})();