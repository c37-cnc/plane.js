define("geometric/shape", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types'),
        Point = require('geometric/point'),
        Intersection = require('geometric/intersection');


    function Shape() {};

    Shape.prototype = {
        RotateTo: function (Value) {
            return true;
        },
        ScaleTo: function (Value) {

            switch (this.Type) {
            case 'Arc':
                {
                    this.Point.X *= Value;
                    this.Point.Y *= Value;
                    this.Radius *= Value;

                    break;
                }
            case 'Circle':
                {
                    this.Point.X *= Value;
                    this.Point.Y *= Value;
                    this.Radius *= Value;

                    break;
                }
            case 'Ellipse':
                {
                    this.Point.X *= Value;
                    this.Point.Y *= Value;
                    this.RadiusX *= Value;
                    this.RadiusY *= Value;

                    break;
                }
            case 'Line':
                {
                    this.Points.forEach(function (Point) {
                        Point.X *= Value;
                        Point.Y *= Value;
                    });

                    break;
                }
            case 'Polygon':
                {
                    this.Point.X *= Value;
                    this.Point.Y *= Value;

                    this.Points.forEach(function (Point) {
                        Point.X *= Value;
                        Point.Y *= Value;
                    });

                    break;
                }
            case 'Rectangle':
                {
                    this.Point.X *= Value;
                    this.Point.Y *= Value;
                    this.Height *= Value;
                    this.Width *= Value;

                    break;
                }
            }

            this.Scale = Value;

        },
        MoveTo: function (Value) {

            if (this.Point) {
                this.Point = this.Point.Sum(Value);
            }
            if (this.Points) {
                for (var i = 0; i <= this.Points.length - 1; i++) {
                    this.Points[i] = this.Points[i].Sum(Value);
                }
            }

            return true;
        },
        Contains: function (PointMouse) {

            switch (this.Type) {
            case 'Line':
                {
                    var PointA = this.Points[0],
                        PointB = this.Points[1]

                    if (Intersection.CircleLine(PointMouse, 2, PointA, PointB))
                        return true;

                    break;
                }
            case 'Rectangle':
                {
                    if (Intersection.CircleRectangle(PointMouse, 2, this.Point, this.Height, this.Width))
                        return true;

                    break;
                }
            case 'Arc':
                {
                    if (Intersection.CircleArc(Point.Create(PointMouse.X, PointMouse.Y), 2, this.Point, this.Radius, this.StartAngle, this.EndAngle, this.ClockWise))
                        return true;

                    break;
                }
            case 'Circle':
                {
                    if (Intersection.CircleCircle(PointMouse = Point.Create(PointMouse.X, PointMouse.Y), 2, this.Point, this.Radius))
                        return true;

                    break;
                }
            case 'Ellipse':
                return (Intersection.CircleEllipse(PointMouse, 2, 2, this.Point, this.RadiusY, this.RadiusX))
            case 'Polygon':
                {
                    var PointA = null,
                        PointB = null;

                    for (var i = 0; i < this.Points.length; i++) {

                        if (i + 1 == this.Points.length) {
                            PointA = this.Points[i];
                            PointB = this.Points[0];
                        } else {
                            PointA = this.Points[i];
                            PointB = this.Points[i + 1];
                        }

                        if (Intersection.CircleLine(PointMouse, 2, PointA, PointB))
                            return true;
                    }
                    break;
                }
            default:
                break;
            }

            return false;
        },
        Render: function (Context2D, Zoom) {

            if (this.Status == 'Over') {
                Context2D.strokeStyle = 'rgb(61, 142, 193)';
            }

            if (this.Status == 'Selected') {

                Context2D.strokeStyle = 'rgb(68, 121, 154)';
                if (this.Point) {
                    Context2D.strokeRect(this.Point.X - (Math.round(2 * Zoom) / 2), this.Point.Y - (Math.round(2 * Zoom) / 2), Math.round(2 * Zoom), Math.round(2 * Zoom));
                }
                if (this.Points) {
                    this.Points.forEach(function (Point) {
                        Context2D.strokeRect(Point.X - (Math.round(2 * Zoom) / 2), Point.Y - (Math.round(2 * Zoom) / 2), Math.round(2 * Zoom), Math.round(2 * Zoom));
                    });
                }
            }

            switch (this.Type) {
            case 'Arc':
                {
                    Context2D.translate(this.Point.X, this.Point.Y);
                    Context2D.arc(0, 0, this.Radius, (Math.PI / 180) * this.StartAngle, (Math.PI / 180) * this.EndAngle, this.ClockWise);

                    return true;
                }
            case 'Circle':
                {
                    Context2D.translate(this.Point.X, this.Point.Y);
                    Context2D.arc(0, 0, this.Radius, 0, Math.PI * 2, true);

                    return true;
                }
            case 'Ellipse':
                {
                    Context2D.translate(this.Point.X, this.Point.Y);
                    Context2D.ellipse(0, 0, this.RadiusX, this.RadiusY, 0, 0, Math.PI * 2)

                    return true;
                }
            case 'Line':
                {
                    // possivel personalização
                    if (this.Status != 'Over') {
                        Context2D.lineWidth = (this.Style && this.Style.LineWidth) ? this.Style.LineWidth : Context2D.LineWidth;
                        Context2D.strokeStyle = (this.Style && this.Style.LineColor) ? this.Style.LineColor : Context2D.strokeStyle;
                    }

                    Context2D.moveTo(this.Points[0].X, this.Points[0].Y);
                    Context2D.lineTo(this.Points[1].X, this.Points[1].Y);

                    return true;
                }
            case 'Polygon':
                {
                    Context2D.moveTo(this.Points[0].X, this.Points[0].Y);

                    this.Points.forEach(function (Point) {
                        Context2D.lineTo(Point.X, Point.Y);
                    });
                    Context2D.closePath();

                    return true;
                }
            case 'Rectangle':
                {
                    Context2D.translate(this.Point.X, this.Point.Y);
                    Context2D.strokeRect(0, 0, this.Width, this.Height);

                    return true;
                }
            }

        },
        ToObject: function () {

            switch (this.Type) {
            case 'Arc':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: Types.Math.ParseFloat(this.Point.X, 5),
                    Y: Types.Math.ParseFloat(this.Point.Y, 5),
                    Radius: Types.Math.ParseFloat(this.Radius, 5),
                    StartAngle: Types.Math.ParseFloat(this.StartAngle, 5),
                    EndAngle: Types.Math.ParseFloat(this.EndAngle, 5),
                    ClockWise: this.ClockWise
                };
            case 'Circle':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: Types.Math.ParseFloat(this.Point.X, 5),
                    Y: Types.Math.ParseFloat(this.Point.Y, 5),
                    Radius: Types.Math.ParseFloat(this.Radius, 5)
                };
            case 'Ellipse':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: Types.Math.ParseFloat(this.Point.X, 5),
                    Y: Types.Math.ParseFloat(this.Point.Y, 5),
                    RadiusX: Types.Math.ParseFloat(this.RadiusX, 5),
                    RadiusY: Types.Math.ParseFloat(this.RadiusY, 5)
                };
            case 'Line':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: [Types.Math.ParseFloat(this.Points[0].X, 5), Types.Math.ParseFloat(this.Points[0].Y, 5)],
                    Y: [Types.Math.ParseFloat(this.Points[1].X, 5), Types.Math.ParseFloat(this.Points[1].Y, 5)]
                };
            case 'Polygon':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: Types.Math.ParseFloat(this.Point.X, 5),
                    Y: Types.Math.ParseFloat(this.Point.Y, 5),
                    Sides: this.Sides
                };
            case 'Rectangle':
                return {
                    Uuid: this.Uuid,
                    Type: this.Type,
                    Name: this.Name,
                    Visible: this.Visible,
                    X: Types.Math.ParseFloat(this.Point.X, 5),
                    Y: Types.Math.ParseFloat(this.Point.Y, 5),
                    Height: Types.Math.ParseFloat(this.Height, 5),
                    Width: Types.Math.ParseFloat(this.Width, 5)
                };
            }

        }
    };


    var Arc = Types.Function.Inherits(function Arc(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Visible = Attrs.Visible;
        this.Status = Attrs.Status;

        this.Type = 'Arc';
        this.Point = Attrs.Point;
        this.Radius = Attrs.Radius;
        this.StartAngle = Attrs.StartAngle;
        this.EndAngle = Attrs.EndAngle;
        this.ClockWise = Attrs.ClockWise;
    }, Shape);

    var Circle = Types.Function.Inherits(function Circle(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Visible = Attrs.Visible;
        this.Status = Attrs.Status;

        this.Type = 'Circle';
        this.Point = Attrs.Point;
        this.Radius = Attrs.Radius;
    }, Shape);

    var Ellipse = Types.Function.Inherits(function Ellipse(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Visible = Attrs.Visible;
        this.Status = Attrs.Status;

        this.Type = 'Ellipse';
        this.Point = Attrs.Point;
        this.RadiusY = Attrs.RadiusY;
        this.RadiusX = Attrs.RadiusX;
    }, Shape);

    var Line = Types.Function.Inherits(function Line(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Visible = Attrs.Visible;
        this.Status = Attrs.Status;

        this.Type = 'Line';
        this.Points = Attrs.Points;
        this.Style = Attrs.Style;
    }, Shape);

    var Polygon = Types.Function.Inherits(function Polygon(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Visible = Attrs.Visible;
        this.Status = Attrs.Status;

        this.Type = 'Polygon';
        this.Point = Attrs.Point;
        this.Points = Attrs.Points;
        this.Sides = Attrs.Sides;
    }, Shape);

    var Rectangle = Types.Function.Inherits(function Rectangle(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.Visible = Attrs.Visible;
        this.Status = Attrs.Status;

        this.Type = 'Rectangle';
        this.Point = Attrs.Point;
        this.Height = Attrs.Height;
        this.Width = Attrs.Width;
    }, Shape);


    function Create(Attrs) {

        var Uuid = Types.Math.Uuid(9, 16);

        Attrs = Types.Object.Merge({
            Uuid: Uuid,
            Name: 'Shape '.concat(Uuid),
            Style: null,
            Visible: true,
            Status: null
        }, Attrs);

        switch (Attrs.Type) {
        case 'Line':
            {
                Attrs.Points = [Point.Create(Attrs.X[0], Attrs.X[1]), Point.Create(Attrs.Y[0], Attrs.Y[1])];
                return new Line(Attrs);
            }
        case 'Rectangle':
            {
                Attrs.Point = Point.Create(Attrs.X, Attrs.Y);
                Attrs.Height = Attrs.Height;
                Attrs.Width = Attrs.Width;
                return new Rectangle(Attrs);
            }
        case 'Arc':
            {
                Attrs.Point = Point.Create(Attrs.X, Attrs.Y);
                Attrs.Radius = Attrs.Radius;
                Attrs.StartAngle = Attrs.StartAngle;
                Attrs.EndAngle = Attrs.EndAngle;
                Attrs.ClockWise = Attrs.ClockWise;
                return new Arc(Attrs);
            }
        case 'Circle':
            {
                Attrs.Point = Point.Create(Attrs.X, Attrs.Y);
                Attrs.Radius = Attrs.Radius;
                return new Circle(Attrs);
            }
        case 'Ellipse':
            {
                Attrs.Point = Point.Create(Attrs.X, Attrs.Y);
                Attrs.RadiusY = Attrs.RadiusY;
                Attrs.RadiusX = Attrs.RadiusX;
                return new Ellipse(Attrs);
            }
        case 'Polygon':
            {
                Attrs.Point = Point.Create(Attrs.X, Attrs.Y);
                Attrs.Points = [];

                for (var i = 0; i < Attrs.Sides; i++) {

                    var PointX = (Attrs.Radius * Math.cos(((Math.PI * 2) / Attrs.Sides) * i) + Attrs.Point.X),
                        PointY = (Attrs.Radius * Math.sin(((Math.PI * 2) / Attrs.Sides) * i) + Attrs.Point.Y);

                    Attrs['Points'].push(Point.Create(PointX, PointY));
                }

                return new Polygon(Attrs);
            }
        default:
            break;
        }

    }

    function Delete(value) {}

    function List() {}

    function Find() {}


    exports.Create = Create;
    exports.Delete = Delete;
    exports.List = List;
    exports.Find = Find;
});