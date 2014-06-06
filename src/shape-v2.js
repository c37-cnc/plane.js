var shape = (function () {
    "use strict";

    function Shape(attrs) {

        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.selected = attrs.selected;

    };
    Shape.prototype = {
        rotate: function (value) {
            return true;
        },
        scale: function (value) {
            return true;
        },
        move: function (point) {
            return true;
        },
        contains: function (point) {
            return true;
        },
        toType: function () {

        },
        toJson: function () {
            return JSON.stringify(this);
        }
    };


    function Arc(attrs) {
        this.point = null;
        this.radius = 0;
        this.startAngle = 0;
        this.endAngle = 0;
        this.clockWise = 0;

        Shape.call(this, attrs);
    };
    Arc.prototype = new Shape();


    function Circle(attrs) {
        this.point = null;
        this.radius = 0;

        Shape.call(this, attrs);
    }
    Circle.prototype = new Shape();


    function Ellipse(attrs) {
        this.point = null;
        this.height = 0;
        this.width = 0;

        Shape.call(this, attrs);
    }
    Ellipse.prototype = new Shape();


    function Line(attrs) {
        this.points = null;

        Shape.call(this, attrs);
    }
    Line.prototype = new Shape();


    function Polygon(attrs) {
        this.points = null;
        this.sides = 0;

        Shape.call(this, attrs);
    }
    Polygon.prototype = new Shape();


    function Rectangle(attrs) {
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;

        Shape.call(this, attrs);
    }
    Rectangle.prototype = new Shape();








    return {
        Create: function () {

        }
    }


})();