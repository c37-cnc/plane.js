plane.events = (function (window, render) {
    "use strict";

    var viewPort = null,
        duru = render;


    return {
        initialize: function (config, callback) {
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Events - Initialize - Config is not valid - See the documentation');
            }


            window.addEventListener('resize', function (event) {
                console.log(event);
                render.update();
            });






            return true;
        }
    }

})(window, plane.render);