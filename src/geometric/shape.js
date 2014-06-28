define("geometric/shape", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types'),
        Point = require('geometric/point'),
        intersection = require('geometric/intersection');


    function Shape() {};

    Shape.prototype = {
        rotateTo: function (value) {
            return true;
        },
        scaleTo: function (value) {

            switch (this.Type) {
            case 'Arc':
                {
                    this.Point.X *= value;
                    this.Point.Y *= value;
                    this.Radius *= value;

                    break;
                }
            case 'Circle':
                {
                    this.Point.X *= value;
                    this.Point.Y *= value;
                    this.Radius *= value;

                    break;
                }
            case 'Ellipse':
                {
                    this.Point.X *= value;
                    this.Point.Y *= value;
                    this.RadiusX *= value;
                    this.RadiusY *= value;

                    break;
                }
            case 'Line':
                {
                    this.Points.forEach(function (Point) {
                        Point.X *= value;
                        Point.Y *= value;
                    });

                    break;
                }
            case 'Polygon':
                {
                    this.Point.X *= value;
                    this.Point.Y *= value;

                    this.Points.forEach(function (Point) {
                        Point.X *= value;
                        Point.Y *= value;
                    });

                    break;
                }
            case 'Rectangle':
                {
                    this.Point.X *= value;
                    this.Point.Y *= value;
                    this.Height *= value;
                    this.Width *= value;

                    break;
                }
            }

            this.Scale = value;

        },
        moveTo: function (value) {

            if (this.Point) {
                this.Point = this.Point.sum(value);
            }
            if (this.Points) {
                for (var i = 0; i <= this.Points.length - 1; i++) {
                    this.Points[i] = this.Points[i].sum(value);
                }
            }

            return true;
        },
        contains: function (pointMouse) {

            switch (this.Type) {
            case 'Line':
                {
                    var pointA = this.Points[0],
                        pointB = this.Points[1]

                    if (intersection.circleLine(pointMouse, 2, pointA, pointB))
                        return true;

                    break;
                }
            case 'Rectangle':
                {
                    if (intersection.circleRectangle(pointMouse, 2, this.Point, this.Height, this.Width))
                        return true;

                    break;
                }
            case 'Arc':
                {
                    if (intersection.circleArc(Point.create(pointMouse.X, pointMouse.Y), 2, this.Point, this.Radius, this.StartAngle, this.EndAngle, this.ClockWise))
                        return true;

                    break;
                }
            case 'Circle':
                {
                    if (intersection.circleCircle(pointMouse = Point.create(pointMouse.X, pointMouse.Y), 2, this.Point, this.Radius))
                        return true;

                    break;
                }
            case 'Ellipse':
                return (intersection.circleEllipse(pointMouse, 2, 2, this.Point, this.RadiusY, this.RadiusX))
            case 'Polygon':
                {
                    var pointA = null,
                        pointB = null;

                    for (var i = 0; i < this.Points.length; i++) {

                        if (i + 1 == this.Points.length) {
                            pointA = this.Points[i];
                            pointB = this.Points[0];
                        } else {
                            pointA = this.Points[i];
                            pointB = this.Points[i + 1];
                        }

                        if (intersection.circleLine(pointMouse, 2, pointA, pointB))
                            return true;
                    }
                    break;
                }
            default:
                break;
            }

            return false;
        },
        render: function (context2D, zoom) {

            if (this.Status == 'Over') {
                context2D.strokeStyle = 'rgb(61, 142, 193)';
            }

            if (this.Status == 'Selected') {

                context2D.strokeStyle = 'rgb(68, 121, 154)';
                if (this.Point) {
                    context2D.strokeRect(this.Point.X - (Math.round(2 * zoom) / 2), this.Point.Y - (Math.round(2 * zoom) / 2), Math.round(2 * zoom), Math.round(2 * zoom));
                }
                if (this.Points) {
                    this.Points.forEach(function (Point) {
                        context2D.strokeRect(Point.X - (Math.round(2 * zoom) / 2), Point.Y - (Math.round(2 * zoom) / 2), Math.round(2 * zoom), Math.round(2 * zoom));
                    });
                }
            }

            switch (this.Type) {
            case 'Arc':
                {
                    context2D.translate(this.Point.X, this.Point.Y);
                    context2D.arc(0, 0, this.Radius, (Math.PI / 180) * this.StartAngle, (Math.PI / 180) * this.EndAngle, this.ClockWise);

                    return true;
                }
            case 'Circle':
                {
                    context2D.translate(this.Point.X, this.Point.Y);
                    context2D.arc(0, 0, this.Radius, 0, Math.PI * 2, true);

                    return true;
                }
            case 'Ellipse':
                {
                    context2D.translate(this.Point.X, this.Point.Y);
                    context2D.ellipse(0, 0, this.RadiusX, this.RadiusY, 0, 0, Math.PI * 2)

                    return true;
                }
            case 'Line':
                {
                    // possivel personalização
                    if (this.Status != 'Over') {
                        context2D.lineWidth = (this.Style && this.Style.LineWidth) ? this.Style.LineWidth : context2D.LineWidth;
                        context2D.strokeStyle = (this.Style && this.Style.LineColor) ? this.Style.LineColor : context2D.strokeStyle;
                    }

                    context2D.moveTo(this.Points[0].X, this.Points[0].Y);
                    context2D.lineTo(this.Points[1].X, this.Points[1].Y);

                    return true;
                }
            case 'Polygon':
                {
                    context2D.moveTo(this.Points[0].X, this.Points[0].Y);

                    this.Points.forEach(function (Point) {
                        context2D.lineTo(Point.X, Point.Y);
                    });
                    context2D.closePath();

                    return true;
                }
            case 'Rectangle':
                {
                    context2D.translate(this.Point.X, this.Point.Y);
                    context2D.strokeRect(0, 0, this.Width, this.Height);

                    return true;
                }
            }

        },
        toObject: function () {

            switch (this.Type) {
            case 'Arc':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: types.math.parseFloat(this.Point.X, 5),
                    Y: types.math.parseFloat(this.Point.Y, 5),
                    Radius: types.math.parseFloat(this.Radius, 5),
                    StartAngle: types.math.parseFloat(this.StartAngle, 5),
                    EndAngle: types.math.parseFloat(this.EndAngle, 5),
                    ClockWise: this.ClockWise
                };
            case 'Circle':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: types.math.parseFloat(this.Point.X, 5),
                    Y: types.math.parseFloat(this.Point.Y, 5),
                    Radius: types.math.parseFloat(this.Radius, 5)
                };
            case 'Ellipse':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: types.math.parseFloat(this.Point.X, 5),
                    Y: types.math.parseFloat(this.Point.Y, 5),
                    RadiusX: types.math.parseFloat(this.RadiusX, 5),
                    RadiusY: types.math.parseFloat(this.RadiusY, 5)
                };
            case 'Line':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: [types.math.parseFloat(this.Points[0].X, 5), types.math.parseFloat(this.Points[0].Y, 5)],
                    Y: [types.math.parseFloat(this.Points[1].X, 5), types.math.parseFloat(this.Points[1].Y, 5)]
                };
            case 'Polygon':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: types.math.parseFloat(this.Point.X, 5),
                    Y: types.math.parseFloat(this.Point.Y, 5),
                    Sides: this.Sides
                };
            case 'Rectangle':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: types.math.parseFloat(this.Point.X, 5),
                    Y: types.math.parseFloat(this.Point.Y, 5),
                    Height: types.math.parseFloat(this.Height, 5),
                    Width: types.math.parseFloat(this.Width, 5)
                };
            }

        }
    };


    var Arc = types.object.inherits(function Arc(attrs) {
        this.Uuid = attrs.Uuid;
        this.Name = attrs.Name;
        this.Visible = attrs.Visible;
        this.Status = attrs.Status;

        this.Type = 'Arc';
        this.Point = attrs.Point;
        this.Radius = attrs.Radius;
        this.StartAngle = attrs.StartAngle;
        this.EndAngle = attrs.EndAngle;
        this.ClockWise = attrs.ClockWise;
    }, Shape);

    var Circle = types.object.inherits(function Circle(attrs) {
        this.Uuid = attrs.Uuid;
        this.Name = attrs.Name;
        this.Visible = attrs.Visible;
        this.Status = attrs.Status;

        this.Type = 'Circle';
        this.Point = attrs.Point;
        this.Radius = attrs.Radius;
    }, Shape);

    var Ellipse = types.object.inherits(function Ellipse(attrs) {
        this.Uuid = attrs.Uuid;
        this.Name = attrs.Name;
        this.Visible = attrs.Visible;
        this.Status = attrs.Status;

        this.Type = 'Ellipse';
        this.Point = attrs.Point;
        this.RadiusY = attrs.RadiusY;
        this.RadiusX = attrs.RadiusX;
    }, Shape);

    var Line = types.object.inherits(function Line(attrs) {
        this.Uuid = attrs.Uuid;
        this.Name = attrs.Name;
        this.Visible = attrs.Visible;
        this.Status = attrs.Status;

        this.Type = 'Line';
        this.Points = attrs.Points;
        this.Style = attrs.Style;
    }, Shape);

    var Polygon = types.object.inherits(function Polygon(attrs) {
        this.Uuid = attrs.Uuid;
        this.Name = attrs.Name;
        this.Visible = attrs.Visible;
        this.Status = attrs.Status;

        this.Type = 'Polygon';
        this.Point = attrs.Point;
        this.Points = attrs.Points;
        this.Sides = attrs.Sides;
    }, Shape);

    var Rectangle = types.object.inherits(function Rectangle(attrs) {
        this.Uuid = attrs.Uuid;
        this.Name = attrs.Name;
        this.Visible = attrs.Visible;
        this.Status = attrs.Status;

        this.Type = 'Rectangle';
        this.Point = attrs.Point;
        this.Height = attrs.Height;
        this.Width = attrs.Width;
    }, Shape);


    function create(attrs) {

        var Uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            Uuid: Uuid,
            Name: 'Shape '.concat(Uuid),
            Style: null,
            Visible: true,
            Status: null
        }, attrs);

        switch (attrs.Type) {
        case 'Line':
            {
                attrs.Points = [Point.create(attrs.X[0], attrs.X[1]), Point.create(attrs.Y[0], attrs.Y[1])];
                return new Line(attrs);
            }
        case 'Rectangle':
            {
                attrs.Point = Point.create(attrs.X, attrs.Y);
                attrs.Height = attrs.Height;
                attrs.Width = attrs.Width;
                return new Rectangle(attrs);
            }
        case 'Arc':
            {
                attrs.Point = Point.create(attrs.X, attrs.Y);
                attrs.Radius = attrs.Radius;
                attrs.StartAngle = attrs.StartAngle;
                attrs.EndAngle = attrs.EndAngle;
                attrs.ClockWise = attrs.ClockWise;
                return new Arc(attrs);
            }
        case 'Circle':
            {
                attrs.Point = Point.create(attrs.X, attrs.Y);
                attrs.Radius = attrs.Radius;
                return new Circle(attrs);
            }
        case 'Ellipse':
            {
                attrs.Point = Point.create(attrs.X, attrs.Y);
                attrs.RadiusY = attrs.RadiusY;
                attrs.RadiusX = attrs.RadiusX;
                return new Ellipse(attrs);
            }
        case 'Polygon':
            {
                attrs.Point = Point.create(attrs.X, attrs.Y);
                attrs.Points = [];

                for (var i = 0; i < attrs.Sides; i++) {

                    var PointX = (attrs.Radius * Math.cos(((Math.PI * 2) / attrs.Sides) * i) + attrs.Point.X),
                        PointY = (attrs.Radius * Math.sin(((Math.PI * 2) / attrs.Sides) * i) + attrs.Point.Y);

                    attrs['Points'].push(Point.create(PointX, PointY));
                }

                return new Polygon(attrs);
            }
        default:
            break;
        }

    }

    function remove(value) {}

    function list() {}

    function find() {}


    exports.create = create;
    exports.remove = remove;
    exports.list = list;
    exports.find = find;
});