define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var types = require('utility/types');

    var layer = require('structure/layer'),
        point = require('structure/point'),
        shape = require('structure/shape'),
        group = require('structure/group'),
        tool = require('structure/tool'),
        view = require('structure/view');

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
            viewPort: viewPort,
            select: select
        });
        layer.initialize({
            select: select
        });
        tool.initialize({
            viewPort: viewPort,
            select: select
        });

        return true;
    }

    function clear() {

        // reset all parameters in view
        view.reset();

        // remove em todas as layers
        layer.remove();

        return true;
    }

    function update() {


        return true;
    }

    var select = (function () {

        var _layer = null,
            _shapes = types.data.dictionary.create(),
            _groups = types.data.dictionary.create();

        return {
            get layer() {
                return _layer;
            },
            set layer(uuid) {
                this.events.notify('onDeactivated', {
                    type: 'onDeactivated',
                    layer: _layer
                });

                _layer = layer.find(uuid);
                _shapes.clear();
                _groups.clear();

                this.events.notify('onActivated', {
                    type: 'onActivated',
                    layer: _layer
                });
            },
            get shapes() {
                return _shapes.list();
            },
            set shapes(shape) {
                return _shapes.add(shape.uuid, shape);
            },
            get groups() {
                return _groups.list();
            },
            set groups(group) {
                return _groups.add(group.uuid, group);
            },
            events: types.object.event.create()
        }
    })();






    exports.initialize = initialize;
    exports.update = update;
    exports.clear = clear;

    exports.view = view;
    exports.select = select;

    exports.layer = layer;
    exports.point = point;
    exports.shape = shape;
    exports.group = group;
    exports.tool = tool;

    exports.importer = importer;
    exports.exporter = exporter;
});