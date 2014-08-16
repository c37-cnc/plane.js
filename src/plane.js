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


        // montando o render de Plane
        var render = document.createElement('canvas');

        render.id = types.math.uuid(9, 16);
        render.width = viewPort.clientWidth;
        render.height = viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = 'transparent';

        // add em viewPort
        viewPort.appendChild(render);

        // add to view
        view.context = render.getContext('2d');
        view.transform = matrix.create();


        // initialize structure
        layer.initialize({
            select: select
        });
        shape.initialize({
            select: select
        });
        tool.initialize({
            viewPort: viewPort,
            select: select,
            view: view
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

        var context = view.context,
            transform = view.transform;

        // reset context
        context.resetTransform();
        
        // clear context, +1 is needed on some browsers to really clear the borders
        context.clearRect(0, 0, viewPort.clientWidth + 1, viewPort.clientHeight + 1);

        // transform da view
        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);

        // sistema cartesiano de coordenadas
        context.translate(0, viewPort.clientHeight);
        context.scale(1, -1);

        var layers = layer.list(),
            l = layers.length;
        while (l--) {
            var shapes = layers[l].children.list(),
                s = shapes.length;

            // style of layer
            context.lineCap = layers[l].style.lineCap;
            context.lineJoin = layers[l].style.lineJoin;

            while (s--) {
                // save state of all configuration
                context.save();
                context.beginPath();

                shapes[s].render(context);

                context.stroke();
                // restore state of all configuration
                context.restore();
            }
        }

        return this;
    }

    var view = {
        context: null,
        transform: null,
        reset: function () {

        },
        get zoom() {
            return this._zoom || 1;
            //                return Math.sqrt(transform.a * transform.d);
        },
        set zoom(value) {

            this.zoomTo(value, {
                x: 500,
                y: 0
            });

            return true;
        },
        zoomTo: function (zoom, point) {

            debugger;

            var factor, motion;

            factor = zoom / this.zoom;

            this.transform.scale({
                x: factor,
                y: factor
            }, point);

            this._zoom = zoom;

            update();



            return true;
        },

    };



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

    exports.view = view
    exports.select = select;

    exports.point = point;
    exports.shape = shape;
    exports.group = group;
    exports.layer = {
        create: layer.create,
        list: layer.list,
        find: layer.find,
        remove: layer.remove
    };
    exports.tool = {
        create: tool.create,
        list: tool.list,
        find: tool.find,
        remove: tool.remove
    };

    exports.importer = importer;
    exports.exporter = exporter;
});