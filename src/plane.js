window.plane = (function (window, document, undefined) {
    'use strict';

    var version = '4.0.0',
        authors = ['ciro.maciel@c37.co', 'andrea.maciel@c37.co'];



    return {
        initialize: function (config) {
            if (config === null) {
                throw new Error('plane - initialize - config is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }
            if (typeof config === "function") {
                throw new Error('plane - initialize - config is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }
            if (config.viewPort === null) {
                throw new Error('plane - initialize - config is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }


            plane.layer._initialize(config);
            plane.shape._initialize(config);
            plane.view._initialize(config);


            return true;
        },
        math: {},
        object: {}
    }

})(window, document, undefined);