(function (plane) {
    "use strict";

    plane.shape = {
        create: function (attrs) {

            if ((typeof attrs === "function") || (attrs === null)) {
                throw new Error('shape - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier-cubic', 'bezier-quadratic', 'spline', 'text', 'quote'].indexOf(attrs.type) === -1) {
                throw new Error('shape - create - type is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }


            // atributos 
            attrs = plane.utility.object.merge({
                uuid: plane.utility.math.uuid(9, 16)
            }, attrs);

            // criando pelo type
            var shape = plane.object[attrs.type].create(attrs);
            
            debugger;

            // adicionando o novo shape na layer ativa
            plane.layer.active.children.add(shape.uuid, shape);

            return shape;
        },
        update: function (shape) {


            return true;
        },
        remove: function (value) {


            return true;
        },
        clear: function () {

        },
        list: function () {

        },
        find: function (value) {

            // uuid
            // shape
            // shape - property


            return true;

        },
        search: function (query) {


            return true;
        }
    };

})(plane);