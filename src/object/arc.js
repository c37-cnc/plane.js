(function (plane) {
    "use strict";

    var Arc = plane.utility.object.inherits(function Arc(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.bounds = null;

        this.status = null;
        this.style = null;

        this.center = null;
        this.radius = null;
        this.startAngle = null;
        this.endAngle = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Arc.prototype._calculeSegments = function () {

        var end = this.endAngle - this.startAngle;
        if (end < 0.0) {
            end += 360.0;
        }

        // 1 resolution
        var num1 = 5 / 180.0 * Math.PI;

        var num2 = this.startAngle / 180.0 * Math.PI;
        var num3 = end / 180.0 * Math.PI;

        var size = (num3 / num1);


        var index = 0;
        var num4 = num2;

        while (index <= size) {

            var xval = this.center.x + this.radius * Math.cos(num4);
            var yval = this.center.y + this.radius * Math.sin(num4);

            this.segments.push({
                x: xval,
                y: yval
            });
            ++index;

            num4 += num1;
        }

        var xval1 = this.center.x + this.radius * Math.cos(num2 + num3);
        var yval1 = this.center.y + this.radius * Math.sin(num2 + num3);

        this.segments.push({
            x: xval1,
            y: yval1
        });

        return true;
    };

    Arc.prototype.fromSnap = function (point, distance) {

        if (point.distanceTo(this.center) <= distance) {
            return {
                status: true,
                point: this.center
            };
        }


        var middlePoint = this.getMiddle();
        if (point.distanceTo(middlePoint) <= distance) {
            return {
                status: true,
                point: middlePoint
            };
        }

        var sX = this.center.x + this.radius * Math.cos(Math.PI * this.startAngle / 180.0),
            sY = this.center.y + this.radius * Math.sin(Math.PI * this.startAngle / 180.0);
        var startPoint = plane.point.create(sX, sY);
        if (point.distanceTo(startPoint) <= distance) {
            return {
                status: true,
                point: startPoint
            };
        }

        var eX = this.center.x + this.radius * Math.cos(Math.PI * this.endAngle / 180.0),
            eY = this.center.y + this.radius * Math.sin(Math.PI * this.endAngle / 180.0);
        var endPoint = plane.point.create(eX, eY);
        if (point.distanceTo(endPoint) <= distance) {
            return {
                status: true,
                point: endPoint
            };
        }


        return {
            status: false,
            point: null
        };

    };

    Arc.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            center: this.center.toObject(),
            radius: this.radius,
            startAngle: this.startAngle,
            endAngle: this.endAngle
        };
    };

    Arc.prototype.toPoints = function () {

        var points = [];

        var sX = this.center.x + this.radius * Math.cos(Math.PI * this.startAngle / 180.0),
            sY = this.center.y + this.radius * Math.sin(Math.PI * this.startAngle / 180.0),
            startPoint = plane.point.create(sX, sY);
        points.push(startPoint);

        var middlePoint = this.getMiddle();
        points.push(middlePoint);

        var eX = this.center.x + this.radius * Math.cos(Math.PI * this.endAngle / 180.0),
            eY = this.center.y + this.radius * Math.sin(Math.PI * this.endAngle / 180.0),
            endPoint = plane.point.create(eX, eY);
        points.push(endPoint);

        return points;

    };


    Arc.prototype.getMiddle = function () {

        var sX = this.center.x + this.radius * Math.cos(Math.PI * this.startAngle / 180.0),
            sY = this.center.y + this.radius * Math.sin(Math.PI * this.startAngle / 180.0),
            startPoint = plane.point.create(sX, sY);

        var eX = this.center.x + this.radius * Math.cos(Math.PI * this.endAngle / 180.0),
            eY = this.center.y + this.radius * Math.sin(Math.PI * this.endAngle / 180.0),
            endPoint = plane.point.create(eX, eY);

        var line1 = {
            from: this.center,
            to: startPoint
        };

        var line2 = {
            from: this.center,
            to: endPoint
        };


        var angleLines = angleBetween2Lines(line1, line2);


        var mX = this.center.x + this.radius * Math.cos(Math.PI * (angleLines / 2) / 180.0),
            mY = this.center.y + this.radius * Math.sin(Math.PI * (angleLines / 2) / 180.0);


        return plane.point.create(mX, mY);

    };
    
    
    // http://stackoverflow.com/questions/3365171/calculating-the-angle-between-two-lines-without-having-to-calculate-the-slope
    function angleBetween2Lines(line1, line2)
    {
        var angle1 = Math.atan2(line1.from.y - line1.to.y, line1.from.x - line1.to.x);
        var angle2 = Math.atan2(line2.from.y - line2.to.y, line2.from.x - line2.to.x);

        return (angle1 - angle2) * (180 / Math.PI); // to degrees;
    }
    

    plane.object.arc = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('arc - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.center = plane.point.create(attrs.center);

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Arc(attrs);
        }
    };

})(c37.library.plane);