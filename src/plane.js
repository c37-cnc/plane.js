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


    var plane = types.object.extend(types.object.event.create(), {

        initialize: function (config) {
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

            plane.settings = config.settings ? config.settings : plane.settings;

            gridDraw(viewPort.clientHeight, viewPort.clientWidth, plane.zoom, plane.scroll);

            toolManager.event.start({
                viewPort: viewPort
            });

            return true;
        },
        clear: function () {

            // reset em scroll
            if ((plane.scroll.x != 0) || (plane.scroll.y != 0)) {
                plane.scroll = {
                    x: 0,
                    y: 0
                }
            };

            // reset em zoom
            if (plane.zoom != 1) {
                plane.zoom = 1;
            }

            // remove em todas as layers
            layerManager.remove();

            return true;
        },
        layer: types.object.extend(types.object.event.create(), {
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
                    Layer: layerManager.active()
                });

                layerManager.active(value);

                this.notify('onActive', {
                    type: 'onActive',
                    Layer: layerManager.active()
                });
            },
            update: function () {
                return layerManager.update();
            }
        }),
        shape: {
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
        },
        tool: {
            create: function (attrs) {
                if (typeof attrs == "function") {
                    throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                return toolManager.create(attrs);
            }
        },
        get zoom() {
            return this._zoom || 1;
        },
        set zoom(value) {

            // plane.zoom /= .9;  - more
            // plane.zoom *= .9; - less

            var LayerActive = layerManager.active(),
                zoomFactor = value / plane.zoom;

            gridDraw(viewPort.clientHeight, viewPort.clientWidth, value, this.scroll);

            // Se não alguma Layer Ativa = clear || importer
            if (LayerActive) {
                layerManager.list().forEach(function (Layer) {

                    layerManager.active(Layer.uuid);

                    layerManager.active().shapes.list().forEach(function (Shape) {
                        Shape.scaleTo(zoomFactor);
                    });

                    layerManager.update();
                });
                layerManager.active(LayerActive.uuid);
            }

            this._zoom = value;
        },
        get scroll() {
            return this._scroll || {
                x: 0,
                y: 0
            };
        },
        set scroll(value) {

            var layerActive = layerManager.active(),
                MoveFactor = {
                    x: value.x + this.scroll.x,
                    y: value.y + this.scroll.y
                };

            gridDraw(viewPort.clientHeight, viewPort.clientWidth, this.zoom, MoveFactor);

            // Se não alguma Layer Ativa = clear || importer
            if (layerActive) {
                value.x = value.x * this.zoom;
                value.y = value.y * this.zoom;

                layerManager.list().forEach(function (Layer) {

                    layerManager.active(Layer.uuid);

                    layerManager.active().shapes.list().forEach(function (Shape) {
                        Shape.moveTo(value);
                    });

                    layerManager.update();

                });
                layerManager.active(layerActive.uuid);
            }

            this._scroll = MoveFactor;
        },
        get settings() {
            return this._settings || {
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            };
        },
        set settings(value) {
            this._settings = value;
        },
        importer: {
            fromJson: function (stringJson) {

                var planeObject = JSON.parse(stringJson);

                plane.clear();

                plane.settings = planeObject.settings;
                plane.zoom = planeObject.zoom;
                plane.scroll = planeObject.scroll;

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
                        plane.shape.create(shapeObject)
                    });

                    layerManager.update();
                });

                return true;
            },
            fromSvg: null,
            fromDxf: function (stringDxf) {
                plane.clear();

                var stringJson = importer.fromDxf(stringDxf);
                var objectDxf = JSON.parse(stringJson);

                if (stringJson) {
                    plane.layer.create();
                    for (var prop in objectDxf) {
                        plane.shape.create(objectDxf[prop]);
                    }
                    layerManager.update();
                }
            },
            fromDwg: null
        },
        exporter: {
            toJson: function () {

                var planeExport = {
                    settings: plane.settings,
                    zoom: types.math.parseFloat(plane.zoom, 5),
                    scroll: plane.scroll,
                    layers: layerManager.list().map(function (layerExport) {
                        var layerObject = layerExport.toObject();

                        layerObject.shapes = layerObject.shapes.map(function (shapeExport) {
                            return shapeExport.toObject();
                        });

                        return layerObject;
                    })
                }

                return JSON.stringify(planeExport);

            }
        }
    });


    function gridDraw(height, width, zoom, scroll) {

        if (!plane.settings.gridEnable) return;

        if (!layerSystem) {
            var attrs = { // atributos para a layer do grid (sistema) 
                viewPort: viewPort,
                name: 'Plane - System',
                status: 'system',
                style: {
                    backgroundColor: plane.settings.backgroundColor
                }
            };
            layerSystem = layerManager.create(attrs);
        } else {
            layerSystem.shapes.clear();
        }

        // calculos para o zoom
        width = zoom > 1 ? Math.round(width * zoom) : Math.round(width / zoom);
        height = zoom > 1 ? Math.round(height * zoom) : Math.round(height / zoom);

        var lineBold = 0;
        if (scroll.x > 0) {
            for (var x = (scroll.x * zoom); x >= 0; x -= (10 * zoom)) {

                var shape = shapeManager.create({
                    uuid: types.math.uuid(9, 16),
                    type: 'line',
                    a: [x, 0],
                    b: [x, height],
                    style: {
                        lineColor: plane.settings.gridColor,
                        lineWidth: lineBold % 5 == 0 ? .8 : .3
                    }
                });

                layerSystem.shapes.add(shape.uuid, shape);
                lineBold++;
            }
        }

        lineBold = 0;
        for (var x = (scroll.x * zoom); x <= width; x += (10 * zoom)) {

            var shape = shapeManager.create({
                uuid: types.math.uuid(9, 16),
                type: 'line',
                a: [x, 0],
                b: [x, height],
                style: {
                    lineColor: plane.settings.gridColor,
                    lineWidth: lineBold % 5 == 0 ? .8 : .3
                }
            });

            layerSystem.shapes.add(shape.uuid, shape);
            lineBold++;
        }

        lineBold = 0;
        if (scroll.y > 0) {
            for (var y = (scroll.y * zoom); y >= 0; y -= (10 * zoom)) {

                var shape = shapeManager.create({
                    uuid: types.math.uuid(9, 16),
                    type: 'line',
                    a: [0, y],
                    b: [width, y],
                    style: {
                        lineColor: plane.settings.gridColor,
                        lineWidth: lineBold % 5 == 0 ? .8 : .3
                    }
                });

                layerSystem.shapes.add(shape.uuid, shape);
                lineBold++;
            }
        }

        lineBold = 0;
        for (var y = (scroll.y * zoom); y <= height; y += (10 * zoom)) {

            var shape = shapeManager.create({
                uuid: types.math.uuid(9, 16),
                type: 'line',
                a: [0, y],
                b: [width, y],
                style: {
                    lineColor: plane.settings.gridColor,
                    lineWidth: lineBold % 5 == 0 ? .8 : .3
                }
            });

            layerSystem.shapes.add(shape.uuid, shape);
            lineBold++;
        }
        
        layerManager.update(layerSystem);
    };


    exports.public = plane;
});