define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var Object = require('utility/object'),
        Types = require('utility/types');

    var Tools = require('structure/tools');


    var LayerStore = new Types.Data.Dictionary();

    var RenderStore = {},
        ShapeStore = {},
        GroupStore = {};

    var ViewPort = null,
        Settings = null;


    function Initialize(config) {
        // verificações para as configurações
        if (config == null) {
            throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (typeof config == "function") {
            throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (config.viewPort == null) {
            throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        // verificações para as configurações

        ViewPort = config.viewPort;


        Settings = Object.Merge({
            metricSystem: 'mm',
            backgroundColor: 'rgb(255, 255, 255)',
            gridEnable: true,
            gridColor: 'rgb(218, 222, 215)'
        }, config.settings || {});

        
        // start em eventos
        ViewPort.onmousemove = function (event) {
            Tools.notify('onMouseMove', event);
        };
        ViewPort.onclick = function (event) {
            Tools.notify('onClick', event);
        }
        // start em eventos

        //gridDraw(settings.gridEnable, viewPort.clientWidth, viewPort.clientHeight, settings.gridColor);

        return true;
    }






    exports.Initialize = Initialize;
});