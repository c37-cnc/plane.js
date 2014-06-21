define("geometric/shape", ['require', 'exports'], function (require, exports) {

    function Shape(uuid, name, locked, visible, selected) {

        this.uuid = uuid;
        this.name = name;
        this.locked = locked;
        this.visible = visible;
        this.selected = selected;

    };
    Shape.prototype = {
        rotate: function (value) {
            return true;
        },
        scale: function (value) {
            return this;
        },
        move: function (point) {
            return true;
        },
        contains: function (point) {
            return false;
        },
        toJson: function () {
            return JSON.stringify(this);
        }
    };


    function Create(uuid, type, x, y, style, radius, startAngle, endAngle, clockWise, sides, height, width, radiusY, radiusX) {

        var attrs = {
            uuid: uuid,
            name: 'Shape '.concat(uuid),
            style: style,
            locked: false,
            visible: true,
            selected: false
        };

        switch (type) {
        case 'line':
            {
                attrs.points = [Point.Create(x[0], x[1]), Point.Create(y[0], y[1])];
                return new Line(attrs);
            }
        case 'rectangle':
            {
                attrs.point = Point.Create(x, y);
                attrs.height = height;
                attrs.width = width;
                return new Rectangle(attrs);
            }
        case 'arc':
            {
                attrs.point = Point.Create(x, y);
                attrs.radius = radius;
                attrs.startAngle = startAngle;
                attrs.endAngle = endAngle;
                attrs.clockWise = clockWise;
                return new Arc(attrs);
            }
        case 'circle':
            {
                attrs.point = Point.Create(x, y);
                attrs.radius = radius;
                return new Circle(attrs);
            }
        case 'ellipse':
            {
                attrs.point = Point.Create(x, y);
                attrs.radiusY = radiusY;
                attrs.radiusX = radiusX;
                return new Ellipse(attrs);
            }
        case 'polygon':
            {
                attrs.points = [];
                attrs.sides = sides;

                for (var i = 0; i < sides; i++) {

                    var pointX = (radius * math.cos(((math.PI * 2) / sides) * i) + x),
                        pointY = (radius * math.sin(((math.PI * 2) / sides) * i) + y);

                    attrs['points'].push(Point.Create(pointX, pointY));
                }

                return new Polygon(attrs);
            }
        default:
            break;
        }

    }


    exports.Create = Create;

});