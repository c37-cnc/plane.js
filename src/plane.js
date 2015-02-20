define("plane", ['require', 'exports'], function (require, exports) {
    'use strict';

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var utility = require('utility');

    var matrix = require('plane/math/matrix');

    var layer = require('plane/core/layer'),
        point = require('plane/core/point'),
        shape = require('plane/core/shape'),
        group = require('plane/core/group'),
        tool = require('plane/core/tool'),
        view = require('plane/core/view');

    var importer = require('plane/data/importer'),
        exporter = require('plane/data/exporter');

    var viewPort = null;


    function initialize(config) {
        if (config === null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (typeof config === "function") {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (config.viewPort === null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // save in variable viewPort
        viewPort = config.viewPort;


        // montando o render de Plane
        var canvas = document.createElement('canvas');

        canvas.id = utility.math.uuid(9, 16);
        canvas.width = viewPort.clientWidth;
        canvas.height = viewPort.clientHeight;

        canvas.style.position = "absolute";
        canvas.style.backgroundColor = 'transparent';

        // add em viewPort HTMLElement
        viewPort.appendChild(canvas);


        // initialize view
        view.initialize({
            viewPort: viewPort,
            canvas: canvas,
            point: point
        });
        
        
        // initialize tool
        tool.initialize({
            viewPort: viewPort,
            view: view
        });


        // create the first layer
        layer.create();


        return true;
    }


    function clear() {

        // reset all parameters in view
        view.reset();

        // remove em todas as layers
        layer.remove();

        // create the first layer
        layer.create();

        return true;
    }

    function reset() {

        // reset all parameters in view
        view.reset();

        // remove em todas as layers
        layer.remove();

        return true;
    }






    exports.initialize = initialize;
    exports.clear = clear;

    exports.view = view;

    exports.point = point;
    exports.shape = shape;
    exports.group = group;

    exports.layer = layer;
    exports.tool = tool;

    exports.importer = {
        fromSvg: function (stringSvg) {
            // https://github.com/gabelerner/canvg
        },
        fromDxf: function (stringDxf) {
            // reset Plane
            reset();

            var stringJson = importer.parseDxf(stringDxf),
                objectDxf = JSON.parse(stringJson);

            if (stringJson) {
                layer.create();
                for (var prop in objectDxf) {
                    shape.create(objectDxf[prop]);
                }
            }
        },
        fromJson: function (stringJson) {

            var objectPlane = JSON.parse(stringJson);

            reset();

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
        },
        fromObject: function (objectPlane) {

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

            var objectPlane = {
                center: view.center.toObject(),
                zoom: view.zoom,
                layers: layer.list().filter(function (layer) {
                    return layer.status != 'system';
                }).map(function (layer) {
                    return layer.toObject()
                })
            };

            return JSON.stringify(objectPlane);
        },
        toObject: function () {

            var objectPlane = {
                center: view.center.toObject(),
                zoom: view.zoom,
                layers: layer.list().filter(function (layer) {
                    return layer.status != 'system';
                }).map(function (layer) {
                    return layer.toObject()
                })
            };

            return objectPlane;
        }
    };

});