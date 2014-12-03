define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var types = require('plane/utility/types');

    var matrix = require('plane/geometric/matrix');

    var layer = require('plane/structure/layer'),
        point = require('plane/structure/point'),
        shape = require('plane/structure/shape'),
        group = require('plane/structure/group'),
        tool = require('plane/structure/tool'),
        view = require('plane/structure/view');

    var importer = require('plane/data/importer'),
        exporter = require('plane/data/exporter');

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
        var canvas = document.createElement('canvas');

        canvas.id = types.math.uuid(9, 16);
        canvas.width = viewPort.clientWidth;
        canvas.height = viewPort.clientHeight;

        canvas.style.position = "absolute";
        canvas.style.backgroundColor = 'transparent';

        // add em viewPort HTMLElement
        viewPort.appendChild(canvas);


        // initialize view
        view.initialize({
            viewPort: viewPort,
            context: canvas.getContext('2d')
        });
        // initialize tool
        tool.initialize({
            viewPort: viewPort,
            view: view
        });


        window.onresize = function () {

            canvas.width = viewPort.clientWidth;
            canvas.height = viewPort.clientHeight;

            // sistema cartesiano de coordenadas
            canvas.getContext('2d').translate(0, viewPort.clientHeight);
            canvas.getContext('2d').scale(1, -1);

            view.update();


            events.notify('onResize', {
                '???': '???',
                '!!!': '!!!'
            });
        };


        return true;
    }


    function clear() {

        // reset all parameters in view
        view.reset();

        // remove em todas as layers
        layer.remove();

        return true;
    }


    var events = types.object.event.create();




    exports.initialize = initialize;
    exports.events = events;
    exports.clear = clear;

    exports.view = view;

    exports.point = point;
    exports.shape = shape;
    exports.group = group;

    exports.layer = layer;
    exports.tool = tool;

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
                view.update();
            }
        },
        fromJson: function (stringJson) {

            var objectPlane = JSON.parse(stringJson);

            clear();

            objectPlane.layers.forEach(function (objectLayer) {

                layer.create({
                    uuid: objectLayer.uuid,
                    name: objectLayer.name,
                    status: objectLayer.status,
                    style: objectLayer.style,
                });

                objectLayer.children.forEach(function (objectShape) {
                    shape.create(objectShape);
                });
            });

            view.zoomTo(objectPlane.zoom, point.create(objectPlane.center));

            return true;
        }
    };


    exports.exporter = {
        toJson: function () {

            var plane = {
                center: _view.center,
                zoom: _view.zoom,
                layers: layer.list().map(function (layer) {
                    return layer.status != 'system' ? layer.toObject() : null;
                }).filter(function (layer) {
                    return layer != undefined
                })
            }

            return JSON.stringify(plane);
        }
    };

});