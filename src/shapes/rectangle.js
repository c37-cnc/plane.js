define("plane/shapes/rectangle", ['require', 'exports'], function (require, exports) {

    var point = require('plane/structure/point');
    
    
    function Rectangle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'rectangle';
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;
    };

    Rectangle.prototype = {
        toObject: function () {

            return {
                uuid: this.uuid,
                type: this.type,
                name: this.name,
                status: this.status,
                x: types.math.parseFloat(this.point.x, 5),
                y: types.math.parseFloat(this.point.y, 5),
                height: types.math.parseFloat(this.height, 5),
                width: types.math.parseFloat(this.width, 5)
            };

        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            context.strokeRect((this.point.x * scale) + move.x, (this.point.y * scale) + move.y, this.width * scale, this.height * scale);

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

        return new Rectangle(attrs);
    };

    exports.create = create;

});