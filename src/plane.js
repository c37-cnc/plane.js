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
            zoom = 1,
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
                return Math.sqrt(transform.a * transform.d);
            },
            set zoom(value) {

                this.zoomTo(value, {
                    x: 0,
                    y: 0
                });
                
                transform.a = value;
                transform.d = value;
                
                return true;
            },
            zoomTo: function (value, point) {

                debugger;

                var origin = point;
                var point = matrix.toPoint(point, transform.inverse());
//                var point = transform.inversePoint(point);

                transform.a = value;
                transform.d = value;

                var target = matrix.toPoint(point, transform.inverse());
//                var target = transform.inversePoint(point);

                transform.tx += target.x - origin.x;
                transform.ty += target.y - origin.y;

                // movimentando todos os shapes de todas as layers
                layer.list().forEach(function (layer) {
                    layer.shapes.list().forEach(function (shape) {
                        shape.scaleTo(Math.sqrt(transform.a * transform.d));
                        shape.moveTo({
                            x: transform.tx,
                            y: transform.ty
                        });
                    });
                });
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