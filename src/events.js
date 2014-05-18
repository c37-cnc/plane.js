Plane.Events = (function (window, Plane) {
    "use strict";

    var viewPort = null;


    return {
        Initialize: function (config, callback) {
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Events - Initialize - Config is not valid - See the documentation');
            }

            viewPort = config.viewPort;

            Plane.__proto__ = new Plane.Utility.Event();
            Plane.Render.__proto__ = new Plane.Utility.Event();
            Plane.Layers.__proto__ = new Plane.Utility.Event();
            Plane.Tools.__proto__ = new Plane.Utility.Event();


            //capturando e traduzindo os eventos
            window.onresize = function (event) {
                Plane.dispatchEvent('onResize', event);
            }
            window.onkeydown = function (event) {
                //future: verificar a qual a melhor forma para capturar o maior número de teclas
                event = {
                    type: 'onKeyDown',
                    key: event.keyIdentifier.indexOf('+') > -1 ? String.fromCharCode(event.keyCode) : event.keyIdentifier
                };
                Plane.dispatchEvent('onKeyDown', event);
            };

            viewPort.onclick = function (event) {
                var position = {
                    x: event.clientX,
                    y: event.clientY
                };

                position = Plane.Utility.Graphic.mousePosition(viewPort, position);

                Plane.Tools.dispatchEvent('onClick', {
                    type: 'onClick',
                    x: position.x,
                    y: position.y
                });
            };
            viewPort.ondblclick = function (event) {
                Plane.Tools.dispatchEvent('onDblClick', event);
            };

            viewPort.onmousedown = function (event) {
                Plane.Tools.dispatchEvent('onMouseDown', event);
            };
            viewPort.onmouseup = function (event) {
                Plane.Tools.dispatchEvent('onMouseUp', event);
            };
            viewPort.onmousemove = function (event) {
                Plane.Tools.dispatchEvent('onMouseMove', event);
            };
            viewPort.onmousewheel = function (event) {
                Plane.Tools.dispatchEvent('onMouseWheel', event);
            };

            viewPort.oncontextmenu = function (event) {
                Plane.Tools.dispatchEvent('onContextMenu', event);
            }
            // capturando os eventos

            return true;
        }
    }

})(window, Plane);