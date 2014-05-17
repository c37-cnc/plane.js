plane.events = (function (window, plane) {
    "use strict";

    var viewPort = null;


    return {
        initialize: function (config, callback) {
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Events - Initialize - Config is not valid - See the documentation');
            }

            var viewPort = config.viewPort;

            plane.__proto__ = new plane.utility.event();


            window.addEventListener('resize', function (event) {


                var layerActive = plane.layers.active;

                plane.layers.list().forEach(function (layer) {

                    plane.layers.select(layer.name);
                    
                    plane.layers.active.viewer.width = viewPort.clientWidth;
                    plane.layers.active.viewer.height = viewPort.clientHeight;
                    
                    plane.render.update();

                });

                plane.layers.select(layerActive.name);


                

            });


        }
    }

})(window, plane);




//            function getMousePos(canvas, event) {
//                var bb = canvas.getBoundingClientRect();
//
//                var x = (event.clientX - bb.left) * (canvas.width / bb.width);
//                var y = (event.clientY - bb.top) * (canvas.height / bb.height);
//
//                return {
//                    x: x,
//                    y: y
//                };
//            }
//
//
//            function hitPath(canvas, event) {
//                var bb = canvas.getBoundingClientRect();
//
//                var x = (event.clientX - bb.left) * (canvas.width / bb.width);
//                var y = (event.clientY - bb.top) * (canvas.height / bb.height);
//
//                return context2D.isPointInPath(x, y);
//            }
//
//
//
//
//            htmlElement.onmousewheel = function (event) {
//                console.log(event);
//            };
//
//
//            htmlElement.onclick = function (event) {
//
//                var zzz = getMousePos(htmlElement, event);
//
//                var debug = document.getElementById('debug');
//
//                debug.innerHTML = 'x: ' + zzz.x + ', y:' + zzz.y + ', selected: ' + hitPath(htmlElement, event);
//
//                console.log(context2D.getImageData(zzz.x, zzz.y, 3, 3).data);
//
//            };
//
//            //            htmlElement.oncontextmenu = function (event) {
//            //                console.log(event);
//            //
//            //                return false;
//            //            }