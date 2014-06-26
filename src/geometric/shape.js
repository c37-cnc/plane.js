define("geometric/shape", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types'),
        Point = require('geometric/point'),
        Intersection = require('geometric/intersection');

    function Shape() {};

    Shape.prototype = {
        Rotate: function (value) {
            return true;
        },
        get Scale() {
            return this._scale || 1;
        },
        set Scale(value) {

            switch (this.type) {
            case 'arc':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.radius *= value;

                    break;
                }
            case 'circle':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.radius *= value;

                    break;
                }
            case 'ellipse':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.radiusX *= value;
                    this.radiusY *= value;

                    break;
                }
            case 'line':
                {
                    this.points.forEach(function (point) {
                        point.x *= value;
                        point.y *= value;
                    });

                    break;
                }
            case 'polygon':
                {
                    this.points.forEach(function (point) {
                        point.x *= value;
                        point.y *= value;
                    });

                    break;
                }
            case 'rectangle':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.height *= value;
                    this.width *= value;

                    break;
                }
            }

            this._scale = value;
        },
        MoveTo: function (value) {

            value = {
                x: value.X,
                y: value.Y
            };

            if (this.point) {
                this.point = this.point.Sum(value);
            } else {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i] = this.points[i].Sum(value);
                }
            }
            return true;
        },
        Contains: function (pointActual) {

            var pointOrigin,
                pointDestination,
                pointIntersection = 0;

            switch (this.type) {
            case 'line':
                {

                    //debugger;
                    pointOrigin = this.points[0];
                    pointDestination = this.points[1];

                    if (Intersection.CircleLine(pointActual, 2, pointOrigin, pointDestination))
                        return true;

                    break;
                }
            case 'rectangle':
                {
                    if (Intersection.CircleRectangle(pointActual, 2, this.point, this.height, this.width))
                        return true;

                    break;
                }
            case 'arc':
                {
                    pointActual = Point.Create(pointActual.x, pointActual.y);

                    if (Intersection.CircleArc(pointActual, 2, this.point, this.radius, this.startAngle, this.endAngle, this.clockWise))
                        return true;

                    break;
                }
            case 'circle':
                {
                    pointActual = Point.Create(pointActual.x, pointActual.y);

                    if (Intersection.CircleCircle(pointActual, 2, this.point, this.radius))
                        return true;

                    break;
                }
            case 'ellipse':
                return (Intersection.CircleEllipse(pointActual, 2, 2, this.point, this.radiusY, this.radiusX))
            case 'polygon':
                {
                    for (var i = 0; i < this.points.length; i++) {

                        if (i + 1 == this.points.length) {
                            pointOrigin = this.points[i];
                            pointDestination = this.points[0];
                        } else {
                            pointOrigin = this.points[i];
                            pointDestination = this.points[i + 1];
                        }

                        if (Intersection.CircleLine(pointActual, 2, pointOrigin, pointDestination))
                            return true;
                    }
                    break;
                }
            default:
                break;
            }

            return false;
        },
        render: function (context2D, Zoom) {

            if (this.status == 'Over') {
                context2D.strokeStyle = 'rgb(61, 142, 193)';
            }

            if (this.status == 'Selected') {

                var RectFactor = Math.round(2 * Zoom);

                context2D.strokeStyle = 'rgb(68, 121, 154)';
                if (this.point) {
                    context2D.strokeRect(this.point.x - (RectFactor / 2), this.point.y - (RectFactor / 2), RectFactor, RectFactor);
                }
                if (this.points) {
                    this.points.forEach(function (point) {
                        context2D.strokeRect(point.x - (RectFactor / 2), point.y - (RectFactor / 2), RectFactor, RectFactor);
                    });
                }
            }

            switch (this.type) {
            case 'arc':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.arc(0, 0, this.radius, (Math.PI / 180) * this.startAngle, (Math.PI / 180) * this.endAngle, this.clockWise);

                    return true;
                }
            case 'circle':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.arc(0, 0, this.radius, 0, Math.PI * 2, true);

                    return true;
                }
            case 'ellipse':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2)

                    return true;
                }
            case 'line':
                {
                    // possivel personalização
                    if (this.status != 'Over') {
                        context2D.lineWidth = (this.style && this.style.lineWidth) ? this.style.lineWidth : context2D.lineWidth;
                        context2D.strokeStyle = (this.style && this.style.lineColor) ? this.style.lineColor : context2D.strokeStyle;
                    }

                    context2D.moveTo(this.points[0].x, this.points[0].y);
                    context2D.lineTo(this.points[1].x, this.points[1].y);

                    return true;
                }
            case 'polygon':
                {
                    context2D.moveTo(this.points[0].x, this.points[0].y);

                    this.points.forEach(function (point) {
                        context2D.lineTo(point.x, point.y);
                    });
                    context2D.closePath();

                    return true;
                }
            case 'rectangle':
                {
                    context2D.translate(this.point.x, this.point.y);
                    context2D.strokeRect(0, 0, this.width, this.height);

                    return true;
                }
            }

        },
        ToObject: function () {

            switch (this.type) {
            case 'arc':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    locked: this.locked,
                    visible: this.visible,
                    x: Types.Math.ParseFloat(this.point.x, 5),
                    y: Types.Math.ParseFloat(this.point.y, 5),
                    radius: Types.Math.ParseFloat(this.radius, 5),
                    startAngle: Types.Math.ParseFloat(this.startAngle, 5),
                    endAngle: Types.Math.ParseFloat(this.endAngle, 5),
                    clockWise: this.clockWise
                };
            case 'circle':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    locked: this.locked,
                    visible: this.visible,
                    x: Types.Math.ParseFloat(this.point.x, 5),
                    y: Types.Math.ParseFloat(this.point.y, 5),
                    radius: Types.Math.ParseFloat(this.radius, 5)
                };
            case 'ellipse':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    locked: this.locked,
                    visible: this.visible,
                    x: Types.Math.ParseFloat(this.point.x, 5),
                    y: Types.Math.ParseFloat(this.point.y, 5),
                    radiusX: Types.Math.ParseFloat(this.radiusX, 5),
                    radiusY: Types.Math.ParseFloat(this.radiusY, 5)
                };
            case 'line':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    locked: this.locked,
                    visible: this.visible,
                    x: [Types.Math.ParseFloat(this.points[0].x, 5), Types.Math.ParseFloat(this.points[0].y, 5)],
                    y: [Types.Math.ParseFloat(this.points[1].x, 5), Types.Math.ParseFloat(this.points[1].y, 5)]
                };
            case 'polygon':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    locked: this.locked,
                    visible: this.visible,
                    x: Types.Math.ParseFloat(this.point.x, 5),
                    y: Types.Math.ParseFloat(this.point.y, 5),
                    sides: this.sides
                };
            case 'rectangle':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    locked: this.locked,
                    visible: this.visible,
                    x: Types.Math.ParseFloat(this.point.x, 5),
                    y: Types.Math.ParseFloat(this.point.y, 5),
                    height: Types.Math.ParseFloat(this.height, 5),
                    width: Types.Math.ParseFloat(this.width, 5)
                };
            }

        }
    };


    var Arc = Types.Function.Inherits(function Arc(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.status = attrs.status;

        this.type = 'arc';
        this.point = attrs.point;
        this.radius = attrs.radius;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.clockWise = attrs.clockWise;
    }, Shape);

    var Circle = Types.Function.Inherits(function Circle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.status = attrs.status;

        this.type = 'circle';
        this.point = attrs.point;
        this.radius = attrs.radius;
    }, Shape);

    var Ellipse = Types.Function.Inherits(function Ellipse(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.status = attrs.status;

        this.type = 'ellipse';
        this.point = attrs.point;
        this.radiusY = attrs.radiusY;
        this.radiusX = attrs.radiusX;
    }, Shape);

    var Line = Types.Function.Inherits(function Line(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.status = attrs.status;

        this.type = 'line';
        this.points = attrs.points;
        this.style = attrs.style;
    }, Shape);

    var Polygon = Types.Function.Inherits(function Polygon(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.status = attrs.status;

        this.type = 'polygon';
        this.point = attrs.point;
        this.points = attrs.points;
        this.sides = attrs.sides;
    }, Shape);

    var Rectangle = Types.Function.Inherits(function Rectangle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.status = attrs.status;

        this.type = 'rectangle';
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;
    }, Shape);


    function Create(uuid, type, x, y, style, radius, startAngle, endAngle, clockWise, sides, height, width, radiusY, radiusX) {

        var attrs = {
            uuid: uuid,
            name: 'Shape '.concat(uuid),
            style: style,
            locked: false,
            visible: true,
            status: null
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
                attrs.point = Point.Create(x, y);
                attrs.points = [];
                attrs.sides = sides;

                for (var i = 0; i < sides; i++) {

                    var pointX = (radius * Math.cos(((Math.PI * 2) / sides) * i) + x),
                        pointY = (radius * Math.sin(((Math.PI * 2) / sides) * i) + y);

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