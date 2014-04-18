(function (draw) {
    "use strict";

    function svg(params) {

        if (arguments.length == 0) {
            throw new SyntaxError('svg - no arguments');
        } else if (!(this instanceof svg)) {
            return new svg(params);
        }
        
        this.type = 'svg';
        
    }

    draw.render.svg = svg;


}(draw));