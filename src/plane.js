define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var types = require('utility/types');

    var matrix = require('geometric/matrix');

    var layer = require('structure/layer'),
        point = require('structure/point'),
        shape = require('structure/shape'),
        group = require('structure/group'),
        tool = require('structure/tool');

    var importer = require('data/importer'),
        exporter = require('data/exporter');

    var viewPort = null;


    function initialize(config) {
        if (config == null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (typeof config == "function") {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (config.viewPort == null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        viewPort = config.viewPort;

        view.initialize({
            viewPort: viewPort
        });
        tool.initialize({
            viewPort: viewPort
        });

        return true;
    }

    function clear() {

        // reset all parameters in view
        view.reset();

        // remove em todas as layers
        layerManager.remove();

        return true;
    }





    var selected = (function () {


        return {
            get layer() {
                return this._layer;
            },
            set layer(value) {
                this.events.notify('onDeactivated', {
                    type: 'onDeactivated',
                    layer: this.layer
                });

                this._layer = layer.find(value);

                this.events.notify('onActivated', {
                    type: 'onActivated',
                    layer: this.layer
                });
            },
            get shapes() {
                return this._shapes;
            },
            set shapes(value) {},
            get groups() {
                return this._groups;
            },
            set groups(value) {},
            events: types.object.event.create()
        }
    })();



    var view = (function () {

        var transform = matrix.create(),
            viewPort = null,
            _zoom = 1,
            center = {
                x: 0,
                y: 0
            },
            bounds = {
                bottom: 0,
                height: 0,
                left: 0,
                right: 0,
                top: 0,
                width: 0
            },
            size = {
                height: 0,
                width: 0
            };

        return {
            initialize: function (config) {

                viewPort = config.viewPort;

                bounds.height = viewPort.clientHeight;
                bounds.width = viewPort.clientWidth;

                center.x = viewPort.clientWidth / 2;
                center.y = viewPort.clientHeight / 2;

                size.height = viewPort.clientHeight;
                size.width = viewPort.clientWidth;

                return true;
            },
            // zoom level
            get zoom() {

                //                debugger;

                // funcional
                //                return _zoom;
                return Math.sqrt(transform.a * transform.d);
            },
            set zoom(value) {

                this.zoomTo(value, {
                    x: 0,
                    y: 0
                });

                return true;
            },

            /**
             * Descrição para o metodo zoomTo
             *
             * @method zoomTo
             * @param factor {Number} fator de zoom aplicado
             * @param point {Object} local onde o zoom será aplicado
             * @return {Boolean} Copy of ...
             */
            zoomTo: function (factor, point) {

                debugger;
                
                var zoom, motion;
                
                zoom = factor / Math.sqrt(transform.a * transform.d);
                
                transform.scale({
                    x: zoom,
                    y: zoom
                }, point);
                
                motion = {
                    x: transform.tx,
                    y: transform.ty
                }


                //                var zoomFactor = zoom / _zoom;
                //                transform.scale({
                //                    x: zoomFactor,
                //                    y: zoomFactor
                //                }, point);
                //                
                //                _zoom = zoom;

                // funcional
                //                var zoom = value > 0 ? (1.041666666666667 / this.zoom) : (.96 / this.zoom);
                //                transform.scale({
                //                    x: zoom,
                //                    y: zoom
                //                }, point);

                // High Performance - JavaScript - Loops - Page 65
                //                var layers = layer.list(),
                //                    l = layer.list().length;
                //                while (l--) {
                //                    var shapes = layers[l].shapes.list(),
                //                        s = shapes.length;
                //                    while (s--) {
                //                        shapes[s].scaleTo(this.zoom);
                //                        shapes[s].moveTo({
                //                            x: transform.tx,
                //                            y: transform.ty
                //                        });
                //                    }
                //                }

                // movimentando todos os shapes de todas as layers
                var layers = layer.list(),
                    l = layer.list().length - 1;
                do {
                    var shapes = layers[l].shapes.list(),
                        s = shapes.length - 1;
                    do {
                        shapes[s].scaleTo(zoom);
                        shapes[s].moveTo(motion);
                    } while (s--);
                } while (l--);
                layer.update();

                return true;
            },
            moveTo: function (value) { // absolute



                return true;
            },
            center: {
                get position() {
                    return center;
                },
                add: function (value) { // relative

                    return true;
                },
                reset: function () {

                    // goto center initial

                    return true;
                }
            },
            get bounds() {

                //                debugger;                

                //                var bound = this.size;
                //                var iii = transform.inverted()._transformBounds(bound);
                //                var fff = this.size;


                return bounds;
            },
            get size() {
                return size;
            },
            reset: function () {

                transform.reset();

                zoom = 1;

                bounds.height = viewPort.clientHeight;
                bounds.width = viewPort.clientWidth;

                center.x = viewPort.clientWidth / 2;
                center.y = viewPort.clientHeight / 2;

                size.height = viewPort.clientHeight;
                size.width = viewPort.clientWidth;

                return true;
            }
        }
    })();


    exports.initialize = initialize;
    exports.view = view;
    exports.selected = selected;
    exports.clear = clear;

    exports.layer = layer;
    exports.point = point;
    exports.shape = shape;
    exports.group = group;
    exports.tool = tool;

    exports.importer = importer;
    exports.exporter = exporter;
});