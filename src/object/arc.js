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

        this._segments = [];
        this._bounds = {
            from: null,
            to: null,
            center: null,
            radius: null
        };

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
        var num1 = 1 / 180.0 * Math.PI;

        var num2 = this.startAngle / 180.0 * Math.PI;
        var num3 = end / 180.0 * Math.PI;

        var size = (num3 / num1);


        var index = 0;
        var num4 = num2;

        while (index <= size) {

            var xval = this.center.x + this.radius * Math.cos(num4);
            var yval = this.center.y + this.radius * Math.sin(num4);

            this._segments.push({
                x: xval,
                y: yval
            });
            ++index;

            num4 += num1;
        }

        var xval1 = this.center.x + this.radius * Math.cos(num2 + num3);
        var yval1 = this.center.y + this.radius * Math.sin(num2 + num3);

        this._segments.push({
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
        if (point.distanceTo(middlePoint) <= distance){
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

    Arc.prototype.getMiddle = function () {

        var end = this.endAngle - this.startAngle;

        if (end < 0.0) {
            end += 360.0;
        }

        // o tamanho de cada passo
        var num1 = .3 / 180.0 * Math.PI;
        
        // o inicio em graus
        var num2 = this.startAngle / 180.0 * Math.PI;
        
        // o fim em graus
        var num3 = end / 180.0 * Math.PI;

        // meia correção por aproximação, pois não estou conseguindo entender esta conta 
        // para redesenhar toda a lógica do arco
        var size = (num3 / num1) + 1.2;

        var index = 0;
        var num4 = num2;
        
        
        while (index <= (size / 2)) {

            var xval = this.center.x + this.radius * Math.cos(num4);
            var yval = this.center.y + this.radius * Math.sin(num4);

            ++index;
            num4 += num1;
        }
        return plane.point.create(xval, yval);
        

    };

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