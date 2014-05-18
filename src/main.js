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

    return {

        Initialize: function (config) {
            if ((config == null) || (typeof config == "function")) {
                throw new Error('Plane - Initialize - Config is not valid - See the documentation');
            }

            Plane.Events.Initialize(config);
            Plane.Render.Initialize(config);
            Plane.Layers.Initialize(config);
            Plane.Tools.Initialize(config);

            return true;

        },  

        set style(value) {
            this._style = value;
        },
        get style() {
            
            
//            measure - mm || cm || m
//            color - white
//            grid - true || false
            
            this._style;
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