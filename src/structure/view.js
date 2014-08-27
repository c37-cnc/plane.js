define("plane/structure/view", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    var matrix = require('plane/geometric/matrix');

    var viewPort = null,
        canvas = {
            context: null,
            transform: null
        };


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
                return _zoom;
                //                return Math.sqrt(transform.a * transform.d);
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
            //            zoomTo: function (factor, point) {
            zoomTo: function (zoom, point) {

                //                                debugger;

                var factor, motion;

                factor = zoom / _zoom;

                transform.scale({
                    x: factor,
                    y: factor
                }, point);

                motion = {
                    x: transform.tx,
                    y: transform.ty
                }

                _zoom = zoom;


                //                var zoom, motion;
                //
                //                zoom = factor > 0 ? (1.041666666666667 / Math.sqrt(transform.a * transform.d)) : (.96 / Math.sqrt(transform.a * transform.d));
                //
                //                transform.scale({
                //                    x: zoom,
                //                    y: zoom
                //                }, point);
                //
                //                motion = {
                //                    x: transform.tx,
                //                    y: transform.ty
                //                }




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

                //                                layer.update(transform);

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


    function initialize(config) {

        viewPort = config.viewPort;

        // montando o render da Layer
        var render = document.createElement('canvas');

        render.id = types.math.uuid(9, 16);
        render.width = viewPort.clientWidth;
        render.height = viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = 'transparent';

        // add em viewPort
        viewPort.appendChild(render);

        // add to public
        canvas.context = render.getContext('2d');
        canvas.transform = matrix.create()

        return true;
    }

    exports.initialize = initialize;
    exports.canvas = canvas;

});