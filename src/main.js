/**
 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
 * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
 * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
 * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
 *
 * @module plane
 */
window.Plane = (function (window) {
    "use strict";

    var version = '1.0.0',
        author = 'lilo@c37.co',
        viewPort = null;

    function gridDraw(enabled, width, height, color) {

        if (!enabled) return;

        Plane.Layers.Create({
            system: true
        });

        for (var xActual = 0; xActual < width; xActual += 50) {
            Plane.Shape.Create({
                type: 'line',
                x: [xActual, 0],
                y: [xActual, height],
                style: {
                    lineColor: color,
                    lineWidth: .6
                }
            });

            for (var xInternalSub = 1; xInternalSub <= 4; xInternalSub++) {
                // small part = 50/5 = 10px espaço entre as linhas
                var xActualSub = Math.round(xActual + 10 * xInternalSub);

                // como é somado + 10 (afrente) para fazer as sub-linhas
                // verifico se não ultrapassou o width
                //            if (xActualSub > width) {
                //                break;
                //            }

                Plane.Shape.Create({
                    type: 'line',
                    x: [xActualSub, 0],
                    y: [xActualSub, height],
                    style: {
                        lineColor: color,
                        lineWidth: .3
                    }
                });
            }
        }

        // + 40 = fim linha acima
        for (var yActual = 0; yActual < height + 40; yActual += 50) {
            Plane.Shape.Create({
                type: 'line',
                x: [0, yActual],
                y: [width, yActual],
                style: {
                    lineColor: color,
                    lineWidth: .6
                }
            });

            // 10/20/30/40 = 4 linhas internas
            for (var yInternalSub = 1; yInternalSub <= 4; yInternalSub++) {
                // small part = 50/5 = 10px espaço entre as linhas
                var yActualSub = Math.round(yActual - 10 * yInternalSub);

                // como é subtraido - 10 (atrás/acima) para fazer as sub-linhas
                // verifico se não ultrapassou o height
                //            if (yActualSub < 0) {
                //                break;
                //            }

                Plane.Shape.Create({
                    type: 'line',
                    x: [0, yActualSub],
                    y: [width, yActualSub],
                    style: {
                        lineColor: color,
                        lineWidth: .3
                    }
                });
            }
        }
        Plane.Render.Update();
    };


    return {

        Initialize: function (config) {
            if ((config == null) || (typeof config == "function")) {
                throw new Error('Plane - Initialize - Config is not valid - See the documentation');
            }

            Plane.Events.Initialize(config);
            Plane.Render.Initialize(config);
            Plane.Layers.Initialize(config);
            Plane.Tools.Initialize(config);

            var style = Plane.Utility.Object.merge({
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            }, config.style || {});

            this.style = style;
            viewPort = config.viewPort;

            var gridEnable = style.gridEnable,
                gridColor = style.gridColor,
                width = viewPort.clientWidth,
                height = viewPort.clientHeight;

            gridDraw(gridEnable, width, height, gridColor);

            return true;

        },

        get style() {
            return this._style;
        },
        set style(value) {
            this._style = value;
        },

        get zoom() {
            return this._zoom || 1;
        },
        set zoom(value) {

            // Plane.zoom = Math.pow(1.03, 1);  - more
            // Plane.zoom = Math.pow(1.03, -1); - less

            var layerActiveUuid = Plane.Layers.Active.uuid;

            Plane.Layers.List('system > true').forEach(function (layer) {
                Plane.Layers.Active = layer.uuid;

                Plane.Shape.Search('layer > uuid > '.concat(layer.uuid)).forEach(function (shape) {
                    shape.scale = [value, value];
                });

                Plane.Render.Update();
            });

            Plane.Layers.Active = layerActiveUuid;

            this._zoom = value;
        },

        get center() {
            return this._center || {
                x: 0,
                y: 0
            };
        },
        set center(value) {

            var layerActiveUuid = Plane.Layers.Active.uuid;

            Plane.Layers.List('system > true').forEach(function (layer) {
                Plane.Layers.Active = layer.uuid;

                Plane.Shape.Search('layer > uuid > '.concat(layer.uuid)).forEach(function (shape) {
                    if (shape.type == 'line') {
                        shape.x[0] += parseInt(value.x);
                        shape.x[1] += parseInt(value.x);
                        shape.y[0] += parseInt(value.y);
                        shape.y[1] += parseInt(value.y);
                    } else {
                        shape.x += parseInt(value.x);
                        shape.y += parseInt(value.y);
                    }
                });

                Plane.Render.Update();
            });

            Plane.Layers.Active = layerActiveUuid;

            this._center = value;
        },

        importJson: function (stringJson) {

            var objectJson = JSON.parse(stringJson);

            for (var prop in objectJson) {
                var layer = objectJson[prop],
                    shapes = layer.shapes;

                Plane.Layers.Create(layer);

                shapes.forEach(function (shape) {
                    Plane.Shape.Create(shape);
                });

                Plane.Render.Update();
            }

            return true;
        },
        importSvg: function (stringSvg) {

        },
        importDxf: function (stringDxf) {
            try {
                var stringJson = Plane.Utility.Import.fromDxf(stringDxf);
                var objectDxf = JSON.parse(stringJson.replace(/u,/g, '').replace(/undefined,/g, ''));

                if (stringJson) {
                    Plane.Layers.Create();

                    for (var prop in objectDxf) {
                        Plane.Shape.Create(objectDxf[prop]);
                    }
                    Plane.Render.Update();
                }
            } catch (e) {
                var ppp = e;
            }
        },

        exportJson: function () {

            var stringJson = '[';

            Plane.Layers.List().forEach(function (layer) {

                stringJson += stringJson.substring(stringJson.length - 1, stringJson.length) == '[' ? '' : ',';
                stringJson += layer.toJson();

                stringJson = stringJson.substring(0, stringJson.length - 1);
                stringJson += ', \"shapes\": ['

                Plane.Shape.Search('layer > uuid > '.concat(layer.uuid)).forEach(function (shape) {
                    stringJson += stringJson.substring(stringJson.length - 1, stringJson.length) == '[' ? '' : ',';
                    stringJson += shape.toJson();
                });

                stringJson += ']}';
            });

            return stringJson += ']';

        },
        exportSvg: function () {

        },
        exportDxf: function () {

        },
        exportPng: function () {

        },
        exportPdf: function () {

        }

    }
}(window));