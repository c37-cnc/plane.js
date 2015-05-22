(function (plane) {
    "use strict";

    var Rectangle = plane.utility.object.inherits(function Rectangle(attrs) {

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

        this.points = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Rectangle.prototype._calculeSegments = function () {
        
        if (this.points.length === 2){
            
            var from = this.points[0],
                to = this.points[1];
            
            //  left + bottom 
            this.segments.push({
                x: from.x,
                y: from.y
            });
            // left + top
            this.segments.push({
                x: from.x,
                y: to.y
            });
            // right + top
            this.segments.push({
                x: to.x,
                y: to.y
            });
            // right + bottom 
            this.segments.push({
                x: to.x,
                y: from.y
            });
            //  left + bottom 
            this.segments.push({
                x: from.x,
                y: from.y
            });
        } 
        
        if (this.points.length === 4){
            
            var leftBottom = this.points[0],
                leftTop = this.points[1],
                rightTop = this.points[2],
                rightBottom = this.points[3];
            
            //  left + bottom 
            this.segments.push(leftBottom.toObject());
            // left + top
            this.segments.push(leftTop.toObject());
            // right + top
            this.segments.push(rightTop.toObject());
            // right + bottom 
            this.segments.push(rightBottom.toObject());
            //  left + bottom 
            this.segments.push(leftBottom.toObject());
            
        }
        
        return true;
    };
    
    Rectangle.prototype.fromSnap = function (point, distance) {

        // pelas pontas
        for (var i = 0; i < this.segments.length; i++) {

            var calculatePoint = plane.point.create(this.segments[i]);

            if (calculatePoint.distanceTo(point) <= distance) {
                return {
                    status: true,
                    point: calculatePoint
                };
            }
        }

        // pelos meios 
        var p1 = plane.point.create(this.segments[0]),
            p2 = plane.point.create(this.segments[1]);

        if (point.distanceTo(p1.midTo(p2)) <= distance) {
            return {
                status: true,
                point: p1.midTo(p2)
            };
        }

        var p3 = plane.point.create(this.segments[1]),
            p4 = plane.point.create(this.segments[2]);

        if (point.distanceTo(p3.midTo(p4)) <= distance) {
            return {
                status: true,
                point: p3.midTo(p4)
            };
        }

        var p5 = plane.point.create(this.segments[2]),
            p6 = plane.point.create(this.segments[3]);

        if (point.distanceTo(p5.midTo(p6)) <= distance) {
            return {
                status: true,
                point: p5.midTo(p6)
            };
        }

        var p7 = plane.point.create(this.segments[3]),
            p8 = plane.point.create(this.segments[4]);

        if (point.distanceTo(p7.midTo(p8)) <= distance) {
            return {
                status: true,
                point: p7.midTo(p8)
            };
        }


        return {
            status: false,
            point: null
        };

    };

    Rectangle.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            type: this.type,
            points: this.points.map(function (point) {
                return point.toObject();
            })
        };
    };

    Rectangle.prototype.toPoints = function () {

        var points = [];

        // os segmentos
        // MENOS o ponto de ligação
        for (var i = 0; i < this.segments.length -1; i++) {

            points.push(plane.point.create(this.segments[i]));

        }

        // o centro
        //points.push(this.bounds.center.clone());

        return points;

    };

    plane.object.rectangle = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('rectangle - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }
            if ((!attrs.points) || (attrs.points.length !== 2) && (attrs.points.length !== 4)) {
                throw new Error('rectangle - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            attrs.points = attrs.points.map(function (point) {
                return plane.point.create(point);
            });

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Rectangle(attrs);
        }
    };

})(c37.library.plane);