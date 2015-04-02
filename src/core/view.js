(function (plane, document) {
    "use strict";

    var _viewPort = null;


    plane.view = {
        _initialize: function (config) {

            _viewPort = config.viewPort;
            
            console.log('sa');


            // montando o render de Plane
            var canvas = document.createElement('canvas');

            canvas.id = plane.utility.math.uuid(9, 16);
            canvas.width = _viewPort.clientWidth;
            canvas.height = _viewPort.clientHeight;

            canvas.style.position = "absolute";
            canvas.style.backgroundColor = 'transparent';

            // add em _viewPort HTMLElement
            _viewPort.appendChild(canvas);
            
            return true;
        }
    };

})(plane, document);