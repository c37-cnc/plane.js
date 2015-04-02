plane.shape = (function (plane) {



    return {
        initialize: function (config) {
            console.log('initialize - shape');
            return true;
        },
        create: function (attrs) {

            var shape = attrs;
            
            return shape;

            //plane.mediator.publish('layer|children|store', shape);
        }
    };

})(plane);