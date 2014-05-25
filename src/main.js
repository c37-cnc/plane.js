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
        author = 'lilo@c37.co';

    function gridDraw(enabled, width, height, color) {

        if (!enabled) return;

        Plane.Layers.Create();

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
            Plane.Shape.Initialize(config);
            Plane.Tools.Initialize(config);

            var style = Plane.Utility.Object.merge({
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            }, config.style || {});

            this.style = style;

            var gridEnable = style.gridEnable,
                gridColor = style.gridColor,
                width = config.viewPort.clientWidth,
                height = config.viewPort.clientHeight;

            gridDraw(gridEnable, width, height, gridColor);

            return true;

        },

        set style(value) {
            this._style = value;
        },
        get style() {
            return this._style;
        },

        set zoom(value) {
            this._zoom = value;
        },
        get zoom() {
            return this._zoom;
        },

        set center(value) {
            this._center = value;
        },
        get center() {
            return this._center;
        },

        importJSON: function () {

        },
        importSVG: function () {

        },
        importDxf: function () {

        },

        exportJSON: function () {

        },
        exportSVG: function () {

        },
        exportDxf: function () {

        },
        exportPng: function () {

        },
        exportPdf: function () {

        }

    }
}(window));