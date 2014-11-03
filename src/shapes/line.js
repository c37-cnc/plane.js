define("plane/shapes/line", ['require', 'exports'], function (require, exports) {

    function Line(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'line';
        this.points = attrs.points;
        this.style = attrs.style;
    };


    Line.prototype = {
        toObject: function () {

            return {
                uuid: this.uuid,
                type: this.type,
                name: this.name,
                status: this.status,
                a: [types.math.parseFloat(this.points[0].x, 5), types.math.parseFloat(this.points[0].y, 5)],
                b: [types.math.parseFloat(this.points[1].x, 5), types.math.parseFloat(this.points[1].y, 5)]
            };

        },
        render: function (context, transform) {

            // possivel personalização
            if (this.style) {
                context.save();

                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
            }
            
            
            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            // possivel personalização
            context.lineWidth = (this.style && this.style.lineWidth) ? this.style.lineWidth : context.lineWidth;
            context.strokeStyle = (this.style && this.style.lineColor) ? this.style.lineColor : context.strokeStyle;

            context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);
            context.lineTo((this.points[1].x * scale) + move.x, (this.points[1].y * scale) + move.y);


            // possivel personalização
            if (this.style) {
                context.restore();
            }

        }
    }


    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Line(attrs);
    };

    exports.create = create;

});