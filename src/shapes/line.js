define("plane/shapes/line", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');

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


            //            debugger;

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            context.moveTo((this.points[0].x * scale) + move.x, (this.points[0].y * scale) + move.y);
            context.lineTo((this.points[1].x * scale) + move.x, (this.points[1].y * scale) + move.y);

            context.stroke();



            // possivel personalização
            if (this.style) {
                context.restore();
            }

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);

            if (intersection.circleLine(position, 4, this.points[0].multiply(scale).sum(move), this.points[1].multiply(scale).sum(move))) {
                return true;
            }

            return false;

        },
        intersectsWithRect: function (rect) {

            //            debugger;

            var tl = point.create(rect.x, rect.y + rect.height),
                tr = point.create(rect.x + rect.width, rect.y + rect.height),
                bl = point.create(rect.x, rect.y),
                br = point.create(rect.x + rect.width, rect.y);


            return intersectPolygonRectangle(this.points, tl, tr, bl, br);

        }
    }



    function triangleArea(A, B, C) {
        return (C.x * B.y - B.x * C.y) - (C.x * A.y - A.x * C.y) + (B.x * A.y - A.x * B.y);
    };

    function isInsideSquare(A, B, C, D, P) {
        if (triangleArea(A, B, P) > 0 || triangleArea(B, C, P) > 0 || triangleArea(C, D, P) > 0 || triangleArea(D, A, P) > 0) {
            return false;
        }
        return true;
    };


    function intersectPolygonRectangle(points, tl, tr, bl, br) {
        var inter1 = intersectLinePolygon(tl, tr, points),
            inter2 = intersectLinePolygon(tr, br, points),
            inter3 = intersectLinePolygon(br, bl, points),
            inter4 = intersectLinePolygon(bl, tl, points);

        if (inter1 || inter2 || inter3 || inter4) {
            return true;
        }


        if (isInsideSquare(tl, tr, br, bl, points[0])) {
            return true;
        }

        if (isInsideSquare(tl, tr, br, bl, points[1])) {
            return true;
        }

        return false;

    };

    function intersectLinePolygon(a1, a2, points) {
        var result = [],
            length = points.length;

        for (var i = 0; i < length; i++) {
            var b1 = points[i],
                b2 = points[(i + 1) % length];

            if (intersection.lineLine(a1, a2, b1, b2)) {
                return true;
            }
        }
        return false;
    };


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