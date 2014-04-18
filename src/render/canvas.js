draw.render.canvas = (function () {




    return {
        init: function (params) {

            var xxx = document.createElement('canvas');

            xxx.width = window.innerWidth;
            xxx.height = window.innerHeight;

            return xxx;
            
        },
        render: function (htmlElement, shapes) {

            var context = htmlElement.getContext('2d');

            context.beginPath();
            context.moveTo(100, 100);
            context.lineTo(600, 600);
            context.stroke();

            console.log(shapes.length);

        }
    }



}(draw));


//(function (draw) {
//    "use strict";
//
//    function canvas(params) {
//
//        if (arguments.length == 0) {
//            throw new SyntaxError('canvas - no arguments');
//        } else if (!(this instanceof canvas)) {
//            return new canvas(params);
//        }
//
//
//        this.type = 'canvas';
//
//        var xxx = document.createElement('canvas');
//
//
//        xxx.width = window.innerWidth;
//        xxx.height = window.innerHeight;
//
//        return xxx;
//
//    };
//
//    canvas.prototype = {
//        render: function (htmlElement, shapes) {
//
//            var context = htmlElement.getContext('2d');
//
//            context.beginPath();
//            context.moveTo(100, 100);
//            context.lineTo(600, 600);
//            context.stroke();
//
//            console.log(shapes.length);
//
//
//        }
//    }
//
//
//
//    draw.render.canvas = canvas;
//
//
//}(draw));