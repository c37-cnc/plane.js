define("plane/shapes/spline-catmull–rom", ['require', 'exports'], function (require, exports) {


    // http://jsbin.com/piyal/15/edit?js,output



    function SplineCatmullRom(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'spline-catmull–rom';
        this.points = attrs.points;
    };


    SplineCatmullRom.prototype = {

        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };
        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            //            return intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move));

            return false;

        }


    }





    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new SplineCatmullRom(attrs);
    };

    exports.create = create;

});