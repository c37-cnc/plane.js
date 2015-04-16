(function (window) {
    'use strict';

    var version = '4.0.0',
        authors = ['ciro.maciel@c37.co', 'andrea.maciel@c37.co'];

    var _matrix = null;

    var plane = {
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

            _matrix = plane.math.matrix.create();

            config.matrix = _matrix;

            plane.view._initialize(config);
            plane.tool._initialize(config);
            plane.layer._initialize(config);
            plane.point._initialize(config);
            plane.group._initialize(config);
            plane.shape._initialize(config);

            return true;
        },
        reset: function () {
            
            plane.layer._reset();
            plane.group._reset();
            plane.shape._reset();
            
            plane.view._reset();
            
        },
        math: {},
        object: {}
    };

    // colocando plane dentro dos namespaces C37
    window.c37 = window.c37 || {};
    window.c37.library = window.c37.library || {};
    window.c37.library.plane = plane;
    // colocando plane dentro dos namespaces C37

})(window);