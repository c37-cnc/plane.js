define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var types = require('utility/types'),
        importer = require('utility/importer'),
        exporter = require('utility/exporter');

    var layerManager = require('structure/layer'),
        shapeManager = require('geometric/shape'),
        toolManager = require('structure/tool');

    var layerSystem = null,
        viewPort = null;

    var _center = {
            zoom: 1,
            position: {
                x: 0,
                y: 0
            }
        },
        _settings = {
            metricSystem: 'mm',
            backgroundColor: 'rgb(255, 255, 255)',
            gridEnable: true,
            gridColor: 'rgb(218, 222, 215)'
        };


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

        _settings = config.settings ? config.settings : _settings;

//        gridDraw(viewPort.clientHeight, viewPort.clientWidth, _center);

        toolManager.event.start({
            viewPort: viewPort
        });

        return true;
    }

    function clear() {
        // reset em center
        center({
            factor: 1,
            center: {
                x: _center.position.x * -1,
                y: _center.position.y * -1
            }
        });

        // remove em todas as layers
        layerManager.remove();

        return true;
    }

    // plane.position(plane.position() / .9);  - more
    // plane.position(plane.position() * .9); - less
    function center(value) {
        if (value) {
            // validações para valores
            value = {
                zoom: parseFloat(value.zoom),
                position: {
                    x: parseFloat(value.position.x) * value.zoom,
                    y: parseFloat(value.position.y) * value.zoom
                }
            }

            var layerActive = layerManager.active(),
                zoomFactor = value.zoom / _center.zoom;

            // com o valor do center anterior para retroceder os valores sem perder a medida do centro
            var middlePrevious = {
                x: ((viewPort.clientWidth - (viewPort.clientWidth * _center.zoom)) / 2) * -1,
                y: ((viewPort.clientHeight - (viewPort.clientHeight * _center.zoom)) / 2) * -1,
            };

            var middleCurrent = {
                x: ((viewPort.clientWidth - (viewPort.clientWidth * value.zoom)) / 2) + value.position.x,
                y: (viewPort.clientHeight - (viewPort.clientHeight * value.zoom)) / 2 + value.position.y,
            };

            // Se não alguma Layer Ativa = clear || importer
            if (layerActive) {
                layerManager.list().forEach(function (layer) {

                    layerManager.active(layer.uuid);

                    layerManager.active().shapes.list().forEach(function (shape) {
                        shape.moveTo(middlePrevious);
                        shape.scaleTo(zoomFactor);
                        shape.moveTo(middleCurrent);
                    });

                    layerManager.update();
                });
                layerManager.active(layerActive.uuid);
            }
            
//            debugger;
//
//            value = {
//                zoom: value.zoom,
//                position: {
//                    x: _center.position.x + middleCurrent.x,
//                    y: _center.position.y + middleCurrent.y
//                }
//            }

//            gridDraw(viewPort.clientHeight, viewPort.clientWidth, value);

            return _center = value;
        } else {
            return _center;
        }
    }

    function settings(value) {
        if (value) {
            return _settings = value;
        } else {
            return _settings;
        }
    }




    var layer = types.object.extend(types.object.event.create(), {
        create: function (attrs) {
            if ((typeof attrs == "function")) {
                throw new Error('layer - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            attrs = types.object.union(attrs, {
                viewPort: viewPort
            });

            return layerManager.create(attrs);
        },
        list: function (selector) {
            return layerManager.list();
        },
        remove: function (uuid) {
            layerManager.remove(uuid);
        },
        get active() {
            return layerManager.active();
        },
        set active(value) {
            this.notify('onDeactive', {
                type: 'onDeactive',
                layer: layerManager.active()
            });

            layerManager.active(value);

            this.notify('onActive', {
                type: 'onActive',
                layer: layerManager.active()
            });
        },
        update: function () {
            return layerManager.update();
        }
    });

    var shape = {
        create: function (attrs) {
            if ((typeof attrs == "function") || (attrs == null)) {
                throw new Error('shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier'].indexOf(attrs.type) == -1) {
                throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (((attrs.type != 'polyline') && (attrs.type != 'bezier') && (attrs.type != 'line')) && ((attrs.x == undefined) || (attrs.y == undefined))) {
                throw new Error('shape - create - x and y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            var shape = shapeManager.create(attrs);

            layerManager.active().shapes.add(shape.uuid, shape);

            return true;
        }
    };

    var tool = {
        create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            return toolManager.create(attrs);
        }
    };

    // importer
    function fromJson(stringJson) {

        var planeObject = JSON.parse(stringJson);

        clear();

        _settings = planeObject.settings;
        _center = planeObject.position;
//        _center = planeObject.position;
        //        var __center = planeObject.position;
        //        var __center = planeObject.position;

//        gridDraw(viewPort.clientHeight, viewPort.clientWidth, _center);

        planeObject.layers.forEach(function (layerObject) {

            layerManager.create({
                uuid: layerObject.uuid,
                name: layerObject.name,
                locked: layerObject.locked,
                Visible: layerObject.Visible,
                style: layerObject.style,
                viewPort: viewPort
            });

            layerObject.shapes.forEach(function (shapeObject) {
                shape.create(shapeObject)
            });

            layerManager.update();
        });

        return true;
    };

    function fromSvg(stringSvg) {
        return true;
    };

    function fromDxf(stringDxf) {
        clear();

        var stringJson = importer.fromDxf(stringDxf);
        var objectDxf = JSON.parse(stringJson);

        if (stringJson) {
            layer.create();
            for (var prop in objectDxf) {
                shape.create(objectDxf[prop]);
            }
            layer.update();
        }
    };

    function fromDwg(stringDwg) {
        return true;
    }
    // importer

    // exporter
    function toJson() {

        var planeExport = {
            settings: _settings,
            //            center: types.math.parseFloat(_center, 5),
            //            center: _center,
            layers: layerManager.list().map(function (layer) {
                var layerObject = layer.toObject();

                layerObject.shapes = layerObject.shapes.map(function (shape) {
                    return shape.toObject();
                });

                return layerObject;
            })
        }

        return JSON.stringify(planeExport);
    }

    function toSvg() {
        return true;
    }
    // exporter


    function gridDraw(height, width, center) {
        if (!_settings.gridEnable) return;
        
        if (!layerSystem) {
            var attrs = { // atributos para a layer do grid (sistema) 
                viewPort: viewPort,
                name: 'Plane - System',
                status: 'system',
                style: {
                    backgroundColor: _settings.backgroundColor
                }
            };
            layerSystem = layerManager.create(attrs);
        } else {
            layerSystem.shapes.clear();
        }

        // calculate for center
        width = center.zoom > 1 ? Math.round(width * center.zoom) : Math.round(width / center.zoom);
        height = center.zoom > 1 ? Math.round(height * center.zoom) : Math.round(height / center.zoom);

        //        // range of intervals
        //        var intervals = [];
        //        for (var i = .1; i < 1E5; i *= 10) {
        //            intervals.push(1 * i);
        //            intervals.push(2 * i);
        //            intervals.push(5 * i);
        //        }
        //
        //        // calculate the main number interval
        //        var numberUnit = 1 * center,
        //            numberFactor = 10 / numberUnit,
        //            interval = 1;
        //        
        //        for (var i = 0; i < intervals.length; i++) {
        //            var number = intervals[i];
        //            interval = number;
        //            if (numberFactor <= number) {
        //                break;
        //            }
        //        }

        var interval = 10,
            lineBold = 0;

        if (center.position.x > 0) {
            //            for (var x = (center.x * center); x >= 0; x -= (interval * center)) {
            for (var x = center.position.x; x >= 0; x -= (interval * center.zoom)) {

                //                var position = Math.round((x / center) - center.x),
                shape = shapeManager.create({
                    uuid: types.math.uuid(9, 16),
                    type: 'line',
                    a: [x, 0],
                    b: [x, height],
                    style: {
                        lineColor: _settings.gridColor,
                        lineWidth: lineBold % 50 == 0 ? .8 : .3
                    }
                });

                layerSystem.shapes.add(shape.uuid, shape);
                lineBold += 10;
            }
        }
        
        lineBold = 0;
        //        for (var x = (center.x * center); x <= width; x += (interval * center)) {
        for (var x = center.position.x; x <= width; x += (interval * center.zoom)) {

            //            var position = Math.round((x / center) - center.x),
            shape = shapeManager.create({
                uuid: types.math.uuid(9, 16),
                type: 'line',
                a: [x, 0],
                b: [x, height],
                style: {
                    lineColor: _settings.gridColor,
                    lineWidth: lineBold % 50 == 0 ? .8 : .3
                }
            });

            layerSystem.shapes.add(shape.uuid, shape);
            lineBold += 10;
        }

        lineBold = 0;
        if (center.position.y > 0) {
            //            for (var y = (center.y * center); y >= 0; y -= (interval * center)) {
            for (var y = center.position.y; y >= 0; y -= (interval * center.zoom)) {

                //                var position = Math.round((y / center) - center.y),
                shape = shapeManager.create({
                    uuid: types.math.uuid(9, 16),
                    type: 'line',
                    a: [0, y],
                    b: [width, y],
                    style: {
                        lineColor: _settings.gridColor,
                        lineWidth: lineBold % 50 == 0 ? .8 : .3
                    }
                });

                layerSystem.shapes.add(shape.uuid, shape);
                lineBold += 10;
            }
        }

        lineBold = 0;
        //        for (var y = (center.y * center); y <= height; y += (interval * center)) {
        for (var y = center.position.y; y <= height; y += (interval * center.zoom)) {

            //            var position = Math.round((y / center) - center.y),
            shape = shapeManager.create({
                uuid: types.math.uuid(9, 16),
                type: 'line',
                a: [0, y],
                b: [width, y],
                style: {
                    lineColor: _settings.gridColor,
                    lineWidth: lineBold % 50 == 0 ? .8 : .3
                }
            });

            layerSystem.shapes.add(shape.uuid, shape);
            lineBold += 10;
        }

        layerManager.update(layerSystem);
    };




    exports.initialize = initialize;
    exports.clear = clear;
    exports.center = center;
    exports.settings = settings;

    exports.layer = layer;
    exports.shape = shape;
    exports.tool = tool;

    exports.importer = {
        fromJson: fromJson,
        fromSvg: fromSvg,
        fromDxf: fromDxf,
        fromDwg: fromDwg
    };
    exports.exporter = {
        toJson: toJson,
        toSvg: toSvg
    };
});