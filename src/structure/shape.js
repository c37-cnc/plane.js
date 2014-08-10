define("structure/shape", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var intersection = require('geometric/intersection');

    var point = require('structure/point'),
        layer = require('structure/layer');



    function Shape() {};

    Shape.prototype = {
        rotateTo: function (value) {
            return true;
        },
        scaleTo: function (value) {

            switch (this.type) {
            case 'arc':
                {
                    this.point.x *= value;
                    this.point.y *= value;
                    this.radius *= value;

                    break;
                }
            case 'bezier':
                {
                    this.points.forEach(function (point) {
                        point.a = point.a.multiply(value);
                        point.b = point.b.multiply(value);
                        point.c = point.c.multiply(value);
                    });
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
                    for (var i = 0; i <= this.points.length - 1; i++) {
                        this.points[i] = this.points[i].multiply(value);
                    };
                    break;
                }
            case 'polygon':
                {
                    this.point.x *= value;
                    this.point.y *= value;

                    this.points.forEach(function (point) {
                        point.x *= value;
                        point.y *= value;
                    });

                    break;
                }
            case 'polyline':
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

            this.Scale = value;

        },
        moveTo: function (value) {

            if (this.point) {
                this.point = this.point.sum(value);
            }
            if (this.points && this.type != 'bezier') {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i] = this.points[i].sum(value);
                }
            }
            if (this.points && this.type == 'bezier') {
                for (var i = 0; i <= this.points.length - 1; i++) {
                    this.points[i].a = this.points[i].a.sum(value);
                    this.points[i].b = this.points[i].b.sum(value);
                    this.points[i].c = this.points[i].c.sum(value);
                }
            }

            return true;
        },
        contains: function (pointMouse) {

            switch (this.type) {
            case 'line':
                {
                    if (intersection.circleLine(pointMouse, 2, this.points[0], this.points[1]))
                        return true;

                    break;
                }
            case 'bezier':
                {
                    for (var i = 0; i < this.points.length; i++) {
                        if (intersection.circleBezier(this.points[i].a, this.points[i].b, this.points[i].c, point.create(pointMouse.x, pointMouse.y), 2, 2))
                            return true;
                    }
                    break;
                }
            case 'rectangle':
                {
                    if (intersection.circleRectangle(pointMouse, 2, this.point, this.height, this.width))
                        return true;

                    break;
                }
            case 'arc':
                {
                    if (intersection.circleArc(point.create(pointMouse.x, pointMouse.y), 2, this.point, this.radius, this.startAngle, this.endAngle, this.clockWise))
                        return true;

                    break;
                }
            case 'circle':
                {
                    if (intersection.circleCircle(pointMouse = point.create(pointMouse.x, pointMouse.y), 2, this.point, this.radius))
                        return true;

                    break;
                }
            case 'ellipse':
                return (intersection.circleEllipse(pointMouse, 2, 2, this.point, this.radiusY, this.radiusX))
            case 'polygon':
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
            case 'polyline':
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
        render: function (context2D) {

            if (this.status == 'over') {
                context2D.strokeStyle = 'rgb(61, 142, 193)';
            }

            if (this.status == 'selected') {

                context2D.strokeStyle = 'rgb(68, 121, 154)';
                if (this.point) {
                    context2D.strokeRect(this.point.x - (Math.round(2) / 2), this.point.y - (Math.round(2) / 2), Math.round(2), Math.round(2));
                }
                if (this.points) {
                    this.points.forEach(function (point) {
                        context2D.strokeRect(point.x - (Math.round(2) / 2), point.y - (Math.round(2) / 2), Math.round(2), Math.round(2));
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
            case 'bezier':
                {
                    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
                    this.points.forEach(function (point) {
                        context2D.bezierCurveTo(point.a.x, point.a.y, point.b.x, point.b.y, point.c.x, point.c.y);
                    });

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
                    // http://scienceprimer.com/draw-oval-html5-canvas
                    context2D.translate(this.point.x, this.point.y);

                    // angle in radian
                    var sss = 0;
                    for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 0.01) {
                        var xPos = 0 - (this.radiusY * Math.sin(i)) * Math.sin(sss * Math.PI) + (this.radiusX * Math.cos(i)) * Math.cos(sss * Math.PI);
                        var yPos = 0 + (this.radiusX * Math.cos(i)) * Math.sin(sss * Math.PI) + (this.radiusY * Math.sin(i)) * Math.cos(sss * Math.PI);

                        if (i == 0) {
                            context2D.moveTo(xPos, yPos);
                        } else {
                            context2D.lineTo(xPos, yPos);
                        }
                    }

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
            case 'polyline':
                {
                    context2D.moveTo(this.points[0].x, this.points[0].y);

                    this.points.forEach(function (point) {
                        context2D.lineTo(point.x, point.y);
                    });

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
        toObject: function () {

            switch (this.type) {
            case 'arc':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    radius: types.math.parseFloat(this.radius, 5),
                    startAngle: types.math.parseFloat(this.startAngle, 5),
                    endAngle: types.math.parseFloat(this.endAngle, 5),
                    clockWise: this.clockWise
                };
            case 'bezier':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    points: this.points.map(function (point) {
                        return {
                            a: [types.math.parseFloat(point.a.x, 5), types.math.parseFloat(point.a.y, 5)],
                            b: [types.math.parseFloat(point.b.x, 5), types.math.parseFloat(point.b.y, 5)],
                            c: [types.math.parseFloat(point.c.x, 5), types.math.parseFloat(point.c.y, 5)]
                        }
                    })
                };
            case 'circle':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    radius: types.math.parseFloat(this.radius, 5)
                };
            case 'ellipse':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    radiusX: types.math.parseFloat(this.radiusX, 5),
                    radiusY: types.math.parseFloat(this.radiusY, 5)
                };
            case 'line':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    a: [types.math.parseFloat(this.points[0].x, 5), types.math.parseFloat(this.points[0].y, 5)],
                    b: [types.math.parseFloat(this.points[1].x, 5), types.math.parseFloat(this.points[1].y, 5)]
                };
            case 'polygon':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
                    sides: this.sides
                };
            case 'polyline':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    points: this.points.map(function (point) {
                        return {
                            x: types.math.parseFloat(point.x, 5),
                            y: types.math.parseFloat(point.y, 5)
                        }
                    })
                };
            case 'rectangle':
                return {
                    uuid: this.uuid,
                    type: this.type,
                    name: this.name,
                    status: this.status,
                    x: types.math.parseFloat(this.point.x, 5),
                    y: types.math.parseFloat(this.point.y, 5),
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

        this.type = 'arc';
        this.point = attrs.point;
        this.radius = attrs.radius;
        this.startAngle = attrs.startAngle;
        this.endAngle = attrs.endAngle;
        this.clockWise = attrs.clockWise;
    }, Shape);

    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    var Bezier = types.object.inherits(function Bezier(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'bezier';
        this.points = attrs.points;
    }, Shape);

    var Circle = types.object.inherits(function Circle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'circle';
        this.point = attrs.point;
        this.radius = attrs.radius;
    }, Shape);

    var Ellipse = types.object.inherits(function Ellipse(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'ellipse';
        this.point = attrs.point;
        this.radiusY = attrs.radiusY;
        this.radiusX = attrs.radiusX;
    }, Shape);

    var Line = types.object.inherits(function Line(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'line';
        this.points = attrs.points;
        this.style = attrs.style;
    }, Shape);

    var Polygon = types.object.inherits(function Polygon(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'polygon';
        this.point = attrs.point;
        this.points = attrs.points;
        this.sides = attrs.sides;
    }, Shape);

    var Polyline = types.object.inherits(function Polyline(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'polyline';
        this.points = attrs.points;
    }, Shape);

    var Rectangle = types.object.inherits(function Rectangle(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;

        this.type = 'rectangle';
        this.point = attrs.point;
        this.height = attrs.height;
        this.width = attrs.width;
    }, Shape);


    function create(attrs) {
        if ((typeof attrs == "function") || (attrs == null)) {
            throw new Error('shape - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (['polyline', 'polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse', 'bezier'].indexOf(attrs.type) == -1) {
            throw new Error('shape - create - type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (((attrs.type != 'polyline') && (attrs.type != 'bezier') && (attrs.type != 'line')) && ((attrs.x == undefined) || (attrs.y == undefined))) {
            throw new Error('shape - create - x and y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = types.math.uuid(9, 16),
            shape = null;

        // atributos 
        attrs = types.object.merge({
            uuid: uuid,
            name: 'shape '.concat(uuid),
            style: null,
            status: null
        }, attrs);

        switch (attrs.type) {
        case 'line':
            {
                attrs.points = [point.create(attrs.a[0], attrs.a[1]), point.create(attrs.b[0], attrs.b[1])];

                shape = new Line(attrs);

                break;
            }
        case 'bezier':
            {
                attrs.points = attrs.points.map(function (pointAttrs) {
                    return {
                        a: point.create(pointAttrs.a[0], pointAttrs.a[1]),
                        b: point.create(pointAttrs.b[0], pointAttrs.b[1]),
                        c: point.create(pointAttrs.c[0], pointAttrs.c[1])
                    };
                });

                shape = new Bezier(attrs);

                break;
            }
        case 'rectangle':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.height = attrs.height;
                attrs.width = attrs.width;

                shape = new Rectangle(attrs);

                break;
            }
        case 'arc':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radius = attrs.radius;
                attrs.startAngle = attrs.startAngle;
                attrs.endAngle = attrs.endAngle;
                attrs.clockWise = attrs.clockWise;

                shape = new Arc(attrs);

                break;
            }
        case 'circle':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radius = attrs.radius;

                shape = new Circle(attrs);
            }
        case 'ellipse':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.radiusY = attrs.radiusY;
                attrs.radiusX = attrs.radiusX;

                shape = new Ellipse(attrs);

                break;
            }
        case 'polygon':
            {
                attrs.point = point.create(attrs.x, attrs.y);
                attrs.points = [];

                for (var i = 0; i < attrs.sides; i++) {

                    var pointX = (attrs.radius * Math.cos(((Math.PI * 2) / attrs.sides) * i) + attrs.point.x),
                        pointY = (attrs.radius * Math.sin(((Math.PI * 2) / attrs.sides) * i) + attrs.point.y);

                    attrs['points'].push(point.create(pointX, pointY));
                }

                shape = new Polygon(attrs);

                break;
            }
        case 'polyline':
            {
                for (var i = 0; i < attrs.points.length; i++) {
                    attrs.points[i] = point.create(attrs.points[i].x, attrs.points[i].y);
                }

                shape = new Polyline(attrs);

                break;
            }
        default:
            break;
        }

        // adicionando o novo shape na layer ativa
        return layer.active.shapes.add(shape.uuid, shape);
    }

    function remove(value) {}

    function list() {}

    function find() {}


    exports.create = create;
    exports.remove = remove;
    exports.list = list;
    exports.find = find;
});