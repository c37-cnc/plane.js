plane.layers = (function (plane) {
    "use strict";

    var layers = [];

    function Layer(config) {

        var uuid = plane.utility.math.uuid(9, 16),
            name = '',
            style = {},
            locked = false,
            visible = true,
            shapes = [];

        this.getUuid = function () {
            return uuid;
        }

        this.setName = function (newName) {
            if ((newName == null) || (newName == undefined) || (newName == '')) {
                throw new Error('New name is not defined');
            }

            for (var i = 0; i <= layers.length - 1; i++) {
                if (layers[i].getName().toLowerCase() == newName.toLowerCase()) {
                    throw new Error('This name ' + newName + ' already exists in Layers')
                }
            }

            name = newName;

            return this;
        }
        this.getName = function () {
            return name;
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

        this.shapes = {
            add: function (shape) {
                shapes.push(shape);
                return this;
            },
            search: function (selector) {
                return shapes;
            },
            remove: function (shape) {
                shapes.slice(shapes.indexOf(shape));                return this;
            }
        }

        this.initialize(config);
    }

    Layer.prototype = {
        initialize: function (config) {

            this.setName(config.name);

            return this;
        },
        toString: function () {
            return '[ Layer' +
                ' uuid:' + this.getUuid() +
                ', name:' + this.getName() +
                ', active:' + this.getActive() +
                ']';
        }
    }


    return {
        initialize: function (config) {
            // validações em config aqui
            if (typeof config == "function") {
                throw new Error('Layer - Initialize - Config is not valid');
            }

            var config = {
                name: config ? config.name || 'New Layer ' + layers.length : 'New Layer ' + layers.length,
                active: config ? config.active || true : true
            }
            // validações em config aqui


            // crio a nova Layer com um config verificado
            var layer = new Layer(config);

            // seleciono como ativa
            plane.layers.active = layer;



            // add ao index
            layers.push(layer)

            return this;
        },
        create: function (config) {
            // validações em config aqui
            if (typeof config == "function") {
                throw new Error('Layer - Create - Config is not valid');
            }

            var config = {
                name: config ? config.name || 'New Layer ' + layers.length : 'New Layer ' + layers.length
            }
            // validações em config aqui


            // crio a nova Layer com um config verificado
            var layer = new Layer(config);


            // seleciono como ativa
            plane.layers.active = layer;


            // add ao index
            layers.push(layer)

            return this;
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

            var listLayer = [];

            layers.forEach(function (layer) {
                listLayer.push({
                    uuid: layer.getUuid(),
                    name: layer.getName()
                })
            })
            
            return typeof callback  == 'function' ? callback.call(this, listLayer) : listLayer;
        },
        select: function (layerName) {
            layers.forEach(function (layer) {
                if (layer.getName() == layerName) {
                    plane.layers.active = layer;
                }
            })
            return this;
        },
        active: null
    };

}(plane));