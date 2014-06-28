define("geometric/shape", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types'),
        point = require('geometric/point'),
        intersection = require('geometric/intersection');


    function Shape() {};

    Shape.prototype = {
        rotateTo: function (value) {
            return true;
        },
        scaleTo: function (value) {

            switch (this.type) {
            case 'Arc':
                {
                    this.point.X *= value;
                    this.point.Y *= value;
                    this.radius *= value;

                    break;
                }
            case 'Circle':
                {
                    this.point.X *= value;
                    this.point.Y *= value;
                    this.radius *= value;

                    break;
                }
            case 'Ellipse':
                {
                    this.point.X *= value;
                    this.point.Y *= value;
                    this.radiusX *= value;
                    this.radiusY *= value;

                    break;
                }
            case 'Line':
                {
                    this.points.forEach(function (point) {
                        point.X *= value;
                        point.Y *= value;
                    });

                    break;
                }
            case 'Polygon':
                {
                    this.point.X *= value;
                    this.point.Y *= value;

                    this.points.forEach(function (point) {
                        point.X *= value;
                        point.Y *= value;
                    });

                    break;
                }
            case 'Rectangle':
                {
                    this.point.X *= value;
                    this.point.Y *= value;
                    this.height *= value;
                    this.width *= value;

                    break;
                }
            }

            this.Scale = value;

        },
        moveTo: function (value) {

            if (this.point) {
                this.point = this.point.sum(value);
            }
            if (this.points) {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i] = this.points[i].sum(value);
                }
            }

            return true;
        },
        contains: function (pointMouse) {

            switch (this.type) {
            case 'Line':
                {
                    var pointA = this.points[0],
                        pointB = this.points[1]

                    if (intersection.circleLine(pointMouse, 2, pointA, pointB))
                        return true;

                    break;
                }
            case 'Rectangle':
                {
                    if (intersection.circleRectangle(pointMouse, 2, this.point, this.height, this.width))
                        return true;

                    break;
                }
            case 'Arc':
                {
                    if (intersection.circleArc(point.create(pointMouse.X, pointMouse.Y), 2, this.point, this.radius, this.startAngle, this.endAngle, this.clockWise))
                        return true;

                    break;
                }
            case 'Circle':
                {
                    if (intersection.circleCircle(pointMouse = point.create(pointMouse.X, pointMouse.Y), 2, this.point, this.radius))
                        return true;

                    break;
                }
            case 'Ellipse':
                return (intersection.circleEllipse(pointMouse, 2, 2, this.point, this.radiusY, this.radiusX))
            case 'Polygon':
                {
                    var pointA = null,
                        pointB = null;

                    for (var i = 0; i < this.points.length; i++) {

                        if (i + 1 == this.points.length) {
                            pointA = this.points[i];
                            pointB = this.points[0];
                        } else {
                            pointA = this.points[i];
                            pointB = this.points[i + 1];
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

            if (this.status == 'Over') {
                context2D.strokeStyle = 'rgb(61, 142, 193)';
            }

            if (this.status == 'Selected') {

                context2D.strokeStyle = 'rgb(68, 121, 154)';
                if (this.point) {
                    context2D.strokeRect(this.point.X - (Math.round(2 * zoom) / 2), this.point.Y - (Math.round(2 * zoom) / 2), Math.round(2 * zoom), Math.round(2 * zoom));
                }
                if (this.points) {
                    this.points.forEach(function (point) {
                        context2D.strokeRect(point.X - (Math.round(2 * zoom) / 2), point.Y - (Math.round(2 * zoom) / 2), Math.round(2 * zoom), Math.round(2 * zoom));
                    });
                }
            }

            switch (this.type) {
            case 'Arc':
                {
                    context2D.translate(this.point.X, this.point.Y);
                    context2D.arc(0, 0, this.radius, (Math.PI / 180) * this.startAngle, (Math.PI / 180) * this.endAngle, this.clockWise);

                    return true;
                }
            case 'Circle':
                {
                    context2D.translate(this.point.X, this.point.Y);
                    context2D.arc(0, 0, this.radius, 0, Math.PI * 2, true);

                    return true;
                }
            case 'Ellipse':
                {
                    context2D.translate(this.point.X, this.point.Y);
                    context2D.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2)

                    return true;
                }
            case 'Line':
                {
                    // possivel personalização
                    if (this.status != 'Over') {
                        context2D.lineWidth = (this.style && this.style.lineWidth) ? this.style.lineWidth : context2D.lineWidth;
                        context2D.strokeStyle = (this.style && this.style.lineColor) ? this.style.lineColor : context2D.strokeStyle;
                    }

                    context2D.moveTo(this.points[0].X, this.points[0].Y);
                    context2D.lineTo(this.points[1].X, this.points[1].Y);

                    return true;
                }
            case 'Polygon':
                {
                    context2D.moveTo(this.points[0].X, this.points[0].Y);

                    this.points.forEach(function (point) {
                        context2D.lineTo(point.X, point.Y);
                    });
                    context2D.closePath();

                    return true;
                }
            case 'Rectangle':
                {
                    context2D.translate(this.point.X, this.point.Y);
                    context2D.strokeRect(0, 0, this.width, this.height);

                    return true;
                }
            }

        },
        toObject: function () {

            switch (this.type) {
            case 'Arc':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    X: types.math.parseFloat(this.point.X, 5),
                    Y: types.math.parseFloat(this.point.Y, 5),
                    radius: types.math.parseFloat(this.radius, 5),
                    startAngle: types.math.parseFloat(this.startAngle, 5),
                    endAngle: types.math.parseFloat(this.endAngle, 5),
                    clockWise: this.clockWise
                };
            case 'Circle':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    X: types.math.parseFloat(this.point.X, 5),
                    Y: types.math.parseFloat(this.point.Y, 5),
                    radius: types.math.parseFloat(this.radius, 5)
                };
            case 'Ellipse':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    X: types.math.parseFloat(this.point.X, 5),
                    Y: types.math.parseFloat(this.point.Y, 5),
                    radiusX: types.math.parseFloat(this.radiusX, 5),
                    radiusY: types.math.parseFloat(this.radiusY, 5)
                };
            case 'Line':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    X: [types.math.parseFloat(this.points[0].X, 5), types.math.parseFloat(this.points[0].Y, 5)],
                    Y: [types.math.parseFloat(this.points[1].X, 5), types.math.parseFloat(this.points[1].Y, 5)]
                };
            case 'Polygon':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    X: types.math.parseFloat(this.point.X, 5),
                    Y: types.math.parseFloat(this.point.Y, 5),
                    sides: this.sides
                };
            case 'Rectangle':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    X: types.math.parseFloat(this.point.X, 5),
                    Y: types.math.parseFloat(this.point.Y, 5),
                    height: types.math.parseFloat(this.height, 5),
                    width: types.math.parseFloat(this.width, 5)
                };
            }

        }
    };


    var Arc = types.object.inherits(function Arc(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'Arc';
        this.point = attrs.point;
        this.radius = attrs.radius;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.clockWise = attrs.clockWise;
    }, Shape);

    var Circle = types.object.inherits(function Circle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'Circle';
        this.point = attrs.point;
        this.radius = attrs.radius;
    }, Shape);

    var Ellipse = types.object.inherits(function Ellipse(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'Ellipse';
        this.point = attrs.point;
        this.radiusY = attrs.radiusY;
        this.radiusX = attrs.radiusX;
    }, Shape);

    var Line = types.object.inherits(function Line(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'Line';
        this.points = attrs.points;
        this.style = attrs.style;
    }, Shape);

    var Polygon = types.object.inherits(function Polygon(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'Polygon';
        this.point = attrs.point;
        this.points = attrs.points;
        this.sides = attrs.sides;
    }, Shape);

    var Rectangle = types.object.inherits(function Rectangle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'Rectangle';
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;
    }, Shape);


    function create(attrs) {

        var uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            uuid: uuid,
            name: 'shape '.concat(uuid),
            style: null,
            status: null
        }, attrs);

        switch (attrs.type) {
        case 'Line':
            {
                attrs.points = [point.create(attrs.X[0], attrs.X[1]), point.create(attrs.Y[0], attrs.Y[1])];
                return new Line(attrs);
            }
        case 'Rectangle':
            {
                attrs.point = point.create(attrs.X, attrs.Y);
                attrs.height = attrs.height;
                attrs.width = attrs.width;
                return new Rectangle(attrs);
            }
        case 'Arc':
            {
                attrs.point = point.create(attrs.X, attrs.Y);
                attrs.radius = attrs.radius;
                attrs.startAngle = attrs.startAngle;
                attrs.endAngle = attrs.endAngle;
                attrs.clockWise = attrs.clockWise;
                return new Arc(attrs);
            }
        case 'Circle':
            {
                attrs.point = point.create(attrs.X, attrs.Y);
                attrs.radius = attrs.radius;
                return new Circle(attrs);
            }
        case 'Ellipse':
            {
                attrs.point = point.create(attrs.X, attrs.Y);
                attrs.radiusY = attrs.radiusY;
                attrs.radiusX = attrs.radiusX;
                return new Ellipse(attrs);
            }
        case 'Polygon':
            {
                attrs.point = point.create(attrs.X, attrs.Y);
                attrs.points = [];

                for (var i = 0; i < attrs.sides; i++) {

                    var pointX = (attrs.radius * Math.cos(((Math.PI * 2) / attrs.sides) * i) + attrs.point.X),
                        pointY = (attrs.radius * Math.sin(((Math.PI * 2) / attrs.sides) * i) + attrs.point.Y);

                    attrs['points'].push(point.create(pointX, pointY));
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