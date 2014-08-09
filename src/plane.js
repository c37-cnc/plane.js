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
            get zoom() {
                return zoom;
            },
            set zoom(value) {



                return zoom = value;
            },
            zoomTo: function (zoom, center) {


                return true;
            },
            moveTo: function (moveValue) {



                return true;
            },
            center: {
                get position() {
                    return center;
                },
                add: function (moveValue) {

                    return true;
                },
                reset: function () {

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
    exports.clear = clear;
    exports.view = view;

    exports.layer = layer;
    exports.point = point;
    exports.shape = shape;
    exports.group = group;
    exports.tool = tool;

    exports.importer = importer;
    exports.exporter = exporter;
});