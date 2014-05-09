plane.events = (function (window, plane) {
    "use strict";

    var viewPort = null;


    return {
        initialize: function (config, callback) {
            if ((typeof config == "function") || (config == null) || (config.viewPort == null)) {
                throw new Error('Events - Initialize - Config is not valid - See the documentation');
            }


            window.addEventListener('resize', function (event) {
                console.log(event);
                plane.render.update();
            });






            return true;
        }
    }

})(window, plane);