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

        // save in variable viewPort
        viewPort = config.viewPort;


        // montando o render de Plane
        var render = document.createElement('canvas');

        render.id = types.math.uuid(9, 16);
        render.width = viewPort.clientWidth;
        render.height = viewPort.clientHeight;

        render.style.position = "absolute";
        render.style.backgroundColor = 'transparent';

        // add em viewPort HTMLElement
        viewPort.appendChild(render);

        
        // initialize view

        // add to private view
        _view.context = render.getContext('2d');
        
        // sistema cartesiano de coordenadas
        _view.context.translate(0, viewPort.clientHeight);
        _view.context.scale(1, -1);
        
        // created the matrix transform
        _view.transform = matrix.create();

        // o centro inicial
        _view.center = _view.center.sum(point.create(viewPort.clientWidth / 2, viewPort.clientHeight / 2));

        // os tamanhos que são fixos
        _view.size.height = viewPort.clientHeight;
        _view.size.width = viewPort.clientWidth;

        
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
            view: _view
        });

        return true;
    }

    function clear() {

        // reset all parameters in view
        _view.reset();

        // remove em todas as layers
        layer.remove();

        return true;
    }

    function update() {

        var context = _view.context,
            transform = _view.transform;

        // clear context, +1 is needed on some browsers to really clear the borders
        context.clearRect(0, 0, viewPort.clientWidth + 1, viewPort.clientHeight + 1);

        var layers = layer.list(),
            l = layers.length;
        while (l--) {
            var shapes = layers[l].children.list(),
                s = shapes.length;

            // style of layer
            context.lineCap = layers[l].style.lineCap;
            context.lineJoin = layers[l].style.lineJoin;

            while (s--) {
                context.beginPath();
                shapes[s].render(context, transform);
                context.stroke();
            }
        }
        return this;
    }

    // private view
    var _view = {
        context: null,
        transform: null,
        zoom: 1,
        center: point.create(0, 0),
        size: {
            height: 0,
            width: 0
        },
        bounds: {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        },
        reset: function () {

        }
    };

    // public view
    var view = {
        get zoom() {
            return _view.zoom;
        },
        set zoom(zoom) {

            var factor, motion;

            factor = zoom / _view.zoom;

            _view.transform.scale({
                x: factor,
                y: factor
            }, _view.center);

            _view.zoom = zoom;


            update();

            return true;
        },
        zoomTo: function(zoom, center){
            
            var factor, motion;

            factor = zoom / _view.zoom;

            _view.transform.scale({
                x: factor,
                y: factor
            }, _view.center);

            _view.zoom = zoom;
            
            

            var centerSubtract = center.subtract(_view.center);
            centerSubtract = centerSubtract.negate();

            var xxx = matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _view.transform.concate(xxx);

            _view.center = center;
            
            
            
            
            
            update();
            
            return true;
        },
        get center() {
            return _view.center;
        },
        set center(center) {

//            debugger;

            var centerSubtract = center.subtract(_view.center);
            centerSubtract = centerSubtract.negate();

            var xxx = matrix.create();
            xxx.translate(centerSubtract.x, centerSubtract.y);

            _view.transform.concate(xxx);

            _view.center = center;

            update();

            return true;
        }
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
                return _shapes;
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

    exports.importer = {
        fromDxf: function (stringDxf) {
            // clear Plane
            clear();

            var stringJson = importer.parseDxf(stringDxf);
            var objectDxf = JSON.parse(stringJson);

            if (stringJson) {
                layer.create();
                for (var prop in objectDxf) {
                    shape.create(objectDxf[prop]);
                }
                update();
            }
        }
    };


    exports.exporter = exporter;
});