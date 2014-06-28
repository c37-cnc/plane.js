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
                viewPort: viewPort,
                update: plane.update
            });

            return true;
        },
        update: function (layerSystem) {

            var layerStyle = layerSystem ? layerSystem.Style : layerManager.active().Style,
                layerShapes = layerSystem ? layerSystem.shapes.list() : layerManager.active().shapes.list(),
                layerRender = layerSystem ? layerSystem.render : layerManager.active().render,
                context2D = layerRender.getContext('2d');

            // limpando o render
            context2D.clearRect(0, 0, viewPort.clientWidth, viewPort.clientHeight);

            // style of layer
            context2D.lineCap = layerStyle.LineCap;
            context2D.lineJoin = layerStyle.LineJoin;

            // render para cada shape
            layerShapes.forEach(function (shape) {
                // save state of all configuration
                context2D.save();
                context2D.beginPath();

                shape.render(context2D, plane.zoom);

                context2D.stroke();
                // restore state of all configuration
                context2D.restore();
            });

            return true;
        },
        clear: function () {

            // reset em scroll
            if ((plane.scroll.X != 0) || (plane.scroll.Y != 0)) {
                plane.scroll = {
                    X: 0,
                    Y: 0
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
                    throw new Error('Layer - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                attrs = types.object.union(attrs, {
                    viewPort: viewPort
                });

                return layerManager.create(attrs);
            },
            list: function (Selector) {
                return Layer.list();
            },
            remove: function (Uuid) {
                Layer.remove(Uuid);
            },
            get active() {
                return layerManager.active();
            },
            set active(value) {
                this.notify('onDeactive', {
                    Type: 'onDeactive',
                    Layer: Layer.active()
                });

                layerManager.active(value);

                this.notify('onActive', {
                    Type: 'onActive',
                    Layer: Layer.active()
                });
            }

        }),
        shape: {
            create: function (attrs) {
                if ((typeof attrs == "function") || (attrs == null)) {
                    throw new Error('Shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }
                if (['Polygon', 'Rectangle', 'Line', 'Arc', 'Circle', 'Ellipse'].indexOf(attrs.Type) == -1) {
                    throw new Error('Shape - create - Type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }
                if ((attrs.X == undefined) || (attrs.Y == undefined)) {
                    throw new Error('Shape - create - X and Y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                var Shape = shapeManager.create(attrs);

                layerManager.active().shapes.Add(Shape.Uuid, Shape);

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

                    layerManager.active(Layer.Uuid);

                    layerManager.active().shapes.list().forEach(function (Shape) {
                        Shape.scaleTo(zoomFactor);
                    });

                    plane.update();
                });
                layerManager.active(LayerActive.Uuid);
            }

            this._zoom = value;
        },
        get scroll() {
            return this._scroll || {
                X: 0,
                Y: 0
            };
        },
        set scroll(value) {

            var LayerActive = layerManager.active(),
                MoveFactor = {
                    X: value.X + this.scroll.X,
                    Y: value.Y + this.scroll.Y
                };

            gridDraw(viewPort.clientHeight, viewPort.clientWidth, this.zoom, MoveFactor);

            // Se não alguma Layer Ativa = clear || importer
            if (LayerActive) {
                value.X = value.X * this.zoom;
                value.Y = value.Y * this.zoom;

                layerManager.list().forEach(function (Layer) {

                    layerManager.active(Layer.Uuid);

                    layerManager.active().shapes.list().forEach(function (Shape) {
                        Shape.moveTo(value);
                    });

                    plane.update();

                });
                layerManager.active(LayerActive.Uuid);
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

                planeObject.Layers.forEach(function (layerObject) {

                    layerManager.create({
                        Uuid: layerObject.Uuid,
                        Name: layerObject.Name,
                        Locked: layerObject.Locked,
                        Visible: layerObject.Visible,
                        Style: layerObject.Style,
                        viewPort: viewPort
                    });

                    layerObject.shapes.forEach(function (shapeObject) {
                        plane.Shape.create(shapeObject)
                    });

                    plane.update();
                });

                return true;
            },
            fromSvg: null,
            fromDxf: function (StringDxf) {
                plane.clear();

                var StringJson = importer.FromDxf(StringDxf);
                var ObjectDxf = JSON.parse(StringJson.replace(/u,/g, '').replace(/undefined,/g, ''));

                if (StringJson) {
                    plane.Layer.create();
                    for (var prop in ObjectDxf) {
                        plane.Shape.create(ObjectDxf[prop]);
                    }
                    plane.update();
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


    function gridDraw(height, Width, zoom, scroll) {

        if (!plane.settings.gridEnable) return;

        if (!layerSystem) {
            var attrs = { // atributos para a layer do grid (sistema) 
                viewPort: viewPort,
                Name: 'Plane - System',
                Status: 'System',
                Style: {
                    backgroundColor: plane.settings.backgroundColor
                }
            };
            layerSystem = layerManager.create(attrs);
        } else {
            layerSystem.shapes.clear();
        }

        // calculos para o zoom
        Width = zoom > 1 ? Math.round(Width * zoom) : Math.round(Width / zoom);
        height = zoom > 1 ? Math.round(height * zoom) : Math.round(height / zoom);

        var lineBold = 0;
        if (scroll.X > 0) {
            for (var X = (scroll.X * zoom); X >= 0; X -= (10 * zoom)) {

                var shape = shapeManager.create({
                    Uuid: types.math.uuid(9, 16),
                    Type: 'Line',
                    X: [X, 0],
                    Y: [X, height],
                    Style: {
                        LineColor: plane.settings.gridColor,
                        LineWidth: lineBold % 5 == 0 ? .8 : .3
                    }
                });

                layerSystem.shapes.Add(shape.Uuid, shape);
                lineBold++;
            }
        }

        lineBold = 0;
        for (var X = (scroll.X * zoom); X <= Width; X += (10 * zoom)) {

            var shape = shapeManager.create({
                Uuid: types.math.uuid(9, 16),
                Type: 'Line',
                X: [X, 0],
                Y: [X, height],
                Style: {
                    LineColor: plane.settings.gridColor,
                    LineWidth: lineBold % 5 == 0 ? .8 : .3
                }
            });

            layerSystem.shapes.Add(shape.Uuid, shape);
            lineBold++;
        }

        lineBold = 0;
        if (scroll.Y > 0) {
            for (var Y = (scroll.Y * zoom); Y >= 0; Y -= (10 * zoom)) {

                var shape = shapeManager.create({
                    Uuid: types.math.uuid(9, 16),
                    Type: 'Line',
                    X: [0, Y],
                    Y: [Width, Y],
                    Style: {
                        LineColor: plane.settings.gridColor,
                        LineWidth: lineBold % 5 == 0 ? .8 : .3
                    }
                });

                layerSystem.shapes.Add(shape.Uuid, shape);
                lineBold++;
            }
        }

        lineBold = 0;
        for (var Y = (scroll.Y * zoom); Y <= height; Y += (10 * zoom)) {

            var shape = shapeManager.create({
                Uuid: types.math.uuid(9, 16),
                Type: 'Line',
                X: [0, Y],
                Y: [Width, Y],
                Style: {
                    LineColor: plane.settings.gridColor,
                    LineWidth: lineBold % 5 == 0 ? .8 : .3
                }
            });

            layerSystem.shapes.Add(shape.Uuid, shape);
            lineBold++;
        }

        plane.update(layerSystem);
    };


    exports.Public = plane;
});