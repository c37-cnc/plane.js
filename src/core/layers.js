plane.layers = (function (utility, renderer) {
    "use strict";

    var layersArray = [],
        renderType = null,
        viewPort = null;

    function Layer() {

        var uuid = utility.math.uuid(9, 16),
            name = '',
            style = {},
            locked = false,
            visible = true,
            shapes = [],
            renderer = null;

        this.getUuid = function () {
            return uuid;
        }

        this.getName = function () {
            return name;
        }
        this.setName = function (newName) {
            if ((newName == null) || (newName == undefined) || (newName == '')) {
                throw new Error('New name is not defined');
            }

            for (var i = 0; i <= layersArray.length - 1; i++) {
                if (layersArray[i].getName().toLowerCase() == newName.toLowerCase()) {
                    throw new Error('This name ' + newName + ' already exists in Layers')
                }
            }

            name = newName;

            return this;
        }

        this.getLocked = function () {
            return locked;
        }
        this.setLocked = function (newLocked) {
            return locked = newLocked;
        }

        this.getVisible = function () {
            return visible;
        }
        this.setVisible = function (newVisible) {
            return visible = newVisible;
        }

        this.getStyle = function () {
            return style;
        }
        this.setStyle = function (newStyle) {

            // fillColor: 'rgb(255,0,0)',
            // lineCap: 'round',
            // lineWidth: 10,
            // lineColor: 'rgb(255,0,0)',            

            return this;
        }

        this.setRenderer = function (newRenderer) {
            return renderer = newRenderer;
        }

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
        this.renderer = function () {
            return renderer;
        }

    }

    Layer.prototype = {
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
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Layer - Initialize - Config is not valid - See the documentation');
            }

            renderType = config.rendererType || 'canvas';
            viewPort = config.viewPort;

            // tipos de render implementados
            var renderTypes = {
                canvas: renderer.canvas,
                svg: renderer.svg
            };

            // render Type choice
            renderType = renderTypes[renderType];

            console.log('layer - initialize');

            return true;
        },
        create: function (layerName) {
            try {
                if ((layerName) && (typeof layerName != 'string')) {
                    throw new Error('Layer - Create - Layer Name is not valid - See the documentation');
                }

                layerName = layerName || 'New Layer ' + layersArray.length;

                var layer = new Layer();
                layer.setName(layerName);

                var render = renderType.create(viewPort);
                layer.setRenderer(render.renderer);

                // seleciono como ativa
                this.active = layer;

                // add ao Array
                layersArray.push(layer)

                console.log('layer - create');

                return render.viewer;
            } catch (error) {
                layer = null;
                throw error;
            }
        },
        remove: function (layerName) {
            for (var i = 0; i <= layersArray.length - 1; i++) {
                if (layersArray[i].getName() == layerName) {
                    return delete layersArray[i];
                }
            }
            return false;
        },
        list: function (callback) {
            var layersList = [];
            for (var i = 0; i <= layersArray.length - 1; i++) {
                layersList.push({
                    uuid: layersArray[i].getUuid(),
                    name: layersArray[i].getName(),
                    active: (layersArray[i] == this.active),
                    locked: layersArray[i].getLocked(),
                    visible: layersArray[i].getVisible()
                })
            }
            console.log('layer - list');
            return typeof callback == 'function' ? callback.call(this, layersList) : layersList;
        },
        select: function (layerName) {
            for (var i = 0; i <= layersArray.length - 1; i++) {
                if (layersArray[i].getName().toUpperCase() == layerName.toUpperCase()) {
                    this.active = layersArray[i];
                }
            }
            return this;
        },
        active: null
    };

}(plane.utility, plane.renderer));