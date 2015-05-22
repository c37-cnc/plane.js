(function (plane) {
    "use strict";

    var Polygon = plane.utility.object.inherits(function Polygon(attrs) {

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
        this.sides = null;
        this.radius = null;

        this.points = null;

        this._initialize(attrs);

    }, plane.math.shape);

    Polygon.prototype._calculeSegments = function () {
        
        if (this.points === null){
            
            for (var i = 0; i <= this.sides; i++) {

                var pointX = (this.radius * Math.cos(((Math.PI * 2) / this.sides) * i) + this.center.x),
                    pointY = (this.radius * Math.sin(((Math.PI * 2) / this.sides) * i) + this.center.y);

                this.segments.push({
                    x: pointX,
                    y: pointY
                });
            }
        
        }
        
        if (this.points !== null){

            for(var i = 0; i < this.points.length; i++){
                this.segments.push(this.points[i].toObject());
            }
            
            // o primeiro ponto novemente para fechar o polygon
            this.segments.push(this.points[0].toObject());
            
        }

        return true;
    };

    Polygon.prototype.fromSnap = function (point, distance) {

        var center = plane.point.create(get_polygon_centroid(this.segments));
        
        if (point.distanceTo(center) <= distance) {
            return {
                status: true,
                point: center
            };
        }

        for (var i = 0; i < this.segments.length; i++) {

            var calculatePoint = plane.point.create(this.segments[i]);

            if (calculatePoint.distanceTo(point) <= distance) {
                return {
                    status: true,
                    point: calculatePoint
                };
            }
        }

        return {
            status: false,
            point: null
        };

    };

    Polygon.prototype.toObject = function () {
        
        if (this.center !== null){
            return {
                uuid: this.uuid,
                type: this.type,
                center: this.center.toObject(),
                sides: this.sides,
                radius: this.radius
            };
        } else {
            return {
                uuid: this.uuid,
                type: this.type,
                points: this.points.map(function (point) {
                    return point.toObject();
                })
            };
        }
        
    };

    Polygon.prototype.toPoints = function () {

        var points = [];

        for (var i = 0; i < this.segments.length; i++) {

            points.push(plane.point.create(this.segments[i]));

        }
        
        var center = plane.point.create(get_polygon_centroid(this.segments));
        
        // o centro 
        points.push(plane.point.create(center));

        return points;

    };
    
    
    // http://stackoverflow.com/a/9939071
    function get_polygon_centroid(pts) {
       var twicearea=0,
       x=0, y=0,
       nPts = pts.length,
       p1, p2, f;
       for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
          p1 = pts[i]; p2 = pts[j];
          f = p1.x*p2.y - p2.x*p1.y;
          twicearea += f;          
          x += ( p1.x + p2.x ) * f;
          y += ( p1.y + p2.y ) * f;
       }
       f = twicearea * 3;
       return { x:x/f, y:y/f };
    }    


    plane.object.polygon = {
        create: function (attrs) {
            // 0 - verificação da chamada
            if (typeof attrs === 'function') {
                throw new Error('polygon - create - attrs is not valid \n http://plane.c37.co/docs/errors.html#' + 'errorCode');
            }

            // 1 - verificações de quais atributos são usados


            // 2 - validações dos atributos deste tipo


            // 3 - conversões dos atributos
            if (attrs.center) {
                attrs.center = plane.point.create(attrs.center);
            }
            if (attrs.points) {
                attrs.points = attrs.points.map(function (point) {
                    return plane.point.create(point);
                });
            }

            // 4 - caso update de um shape não merge em segments
            delete attrs['segments'];

            // 5 - criando um novo shape do tipo arco
            return new Polygon(attrs);
        }
    };

})(c37.library.plane);