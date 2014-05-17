plane.layers = (function (plane) {
    "use strict";

    var layers = [];

    function Layer() {

        var shapes = [];

        this.uuid = plane.utility.math.uuid(9, 16);

        this.shapes = {
            add: function (shape) {
                shapes.push(shape);
                return this;
            },
            search: function (selector) {
                return shapes;
            },
            remove: function (shape) {
                shapes.slice(shapes.indexOf(shape));
                return this;
            }
        }
    }

    Layer.prototype = {

        set name(value) {
            if ((value == null) || (value == undefined) || (value == '')) {
                throw new Error('New name is not defined');
            }

            for (var i = 0; i <= layers.length - 1; i++) {
                if (layers[i].name.toLowerCase() == value.toLowerCase()) {
                    throw new Error('This name ' + value + ' already exists in Layers')
                }
            }

            this._name = value;
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

            // fillColor: 'rgb(255,0,0)',
            // lineCap: 'round',
            // lineWidth: 10,
            // lineColor: 'rgb(255,0,0)',            

            this._style = value;
        },
        get style() {
            return this._style;
        },

        set viewer(value) {
            this._viewer = value;
        },
        get viewer() {
            return this._viewer;
        },

        toString: function () {
            return '[ Layer' +
                ' uuid:' + this.getUuid() +
                ', name:' + this.getName() +
                ', active:' + this.getActive() +
                ']';
        },
        toJson: function () {

        }
    }

    return {
        initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Layer - Initialize - Config is not valid - See the documentation');
            }


            console.log('layer - initialize');

            return true;
        },
        create: function (layerName) {
            try {
                if ((layerName) && (typeof layerName != 'string')) {
                    throw new Error('Layer - Create - Layer Name is not valid - See the documentation');
                }

                layerName = layerName || 'New Layer ' + layers.length;

                var layer = new Layer(),
                    viewer = plane.render.create();

                layer.name = layerName;
                layer.viewer = viewer;

                // add ao Array
                layers.push(layer)

                // seleciono como ativa
                this.select(layerName)

                console.log('layer - create');

                return true;
            } catch (error) {
                layer = null;
                throw error;
            }
        },
        remove: function (layerName) {
            for (var i = 0; i <= layers.length - 1; i++) {
                if (layers[i].getName() == layerName) {
                    return delete layers[i];
                }
            }
            return false;
        },
        list: function (callback) {
            var layersList = [];
            for (var i = 0; i <= layers.length - 1; i++) {
                layersList.push({
                    uuid: layers[i].uuid,
                    name: layers[i].name,
                    active: (layers[i] == this.active),
                    locked: layers[i].locked,
                    visible: layers[i].visible
                })
            }
            console.log('layer - list');
            return typeof callback == 'function' ? callback.call(this, layersList) : layersList;
        },
        select: function (layerName) {
            for (var i = 0; i <= layers.length - 1; i++) {
                if (layers[i].name.toUpperCase() == layerName.toUpperCase()) {
                    this.active = layers[i];
                }
            }
            return this;
        },
        active: {}
    };

})(plane);