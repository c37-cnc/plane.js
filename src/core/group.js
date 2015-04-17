define("plane/core/group", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/math/intersection');

    var point = require('plane/core/point'),
        view = require('plane/core/view');

    var utility = require('utility');

    var store = utility.data.dictionary.create();


    function Group(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.status = attrs.status;
        this.style = attrs.style;
        this.children = attrs.children;
        this.bounds = null;

        this.calculeBounds();
    }

    Group.prototype.contains = function (position, transform) {

        var scale = Math.sqrt(transform.a * transform.d);
        var move = point.create(transform.tx, transform.ty);

        this.children.forEach(function (shape) {

            var segmentA = null,
                segmentB = null;

            for (var i = 0; i < shape.segments.length; i++) {

                // correção de lógica, como estou calculando pelos segmentos, 
                // não posso pegar o ultimo + o primeiro, pois será como um shape 'fechado'
                // 2015.02.16 - outra correção IMPORTANTE - se == ao fim CONTINUE
                if (i + 1 === this.segments.length) {
                    continue;
                }

                segmentA = this.segments[i];
                segmentB = this.segments[i + 1];

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

        })

        return false;
    };

    Group.prototype.intersect = function (rectangle) {

        var tl = point.create(rectangle.from.x, rectangle.to.y), // top left
            tr = point.create(rectangle.to.x, rectangle.to.y), // top right
            bl = point.create(rectangle.from.x, rectangle.from.y), // bottom left
            br = point.create(rectangle.to.x, rectangle.from.y), // bottom right
            result = false;


        this.children.forEach(function (shape) {

            if ((shape.type === 'line') || (shape.type === 'text')) {

                // faço a verificação 'pontos dentro do retângulo'
                result = ((shape.to.x >= rectangle.from.x && shape.to.x <= rectangle.to.x) && (shape.to.y >= rectangle.from.y && shape.to.y <= rectangle.to.y)) ||
                    ((shape.from.x >= rectangle.from.x && shape.from.x <= rectangle.to.x) && (shape.from.y >= rectangle.from.y && shape.from.y <= rectangle.to.y));

                if (!result) {
                    result = intersection.segmentsRectangle(shape.segments, tl, tr, bl, br);
                }

            } else {
                result = intersection.segmentsRectangle(shape.segments, tl, tr, bl, br);
            }

        });

        return result;
    };

    Group.prototype.calculeBounds = function () {

        var childrenSegmentsPoints = [];

        this.children.forEach(function (shape) {
            childrenSegmentsPoints = childrenSegmentsPoints.concat(shape.segments);
        });

        var maxPoint = childrenSegmentsPoints[0],
            minPoint = childrenSegmentsPoints[0];

        childrenSegmentsPoints.forEach(function (pointCheck) {

            pointCheck = point.create(pointCheck);

            maxPoint = pointCheck.maximum(maxPoint);
            minPoint = pointCheck.minimum(minPoint);

        });

        // um remendo para o calculo
        var angleInRadian = maxPoint.angleTo(minPoint),
            lineSizeValue = 5 / view.zoom;

        // com uma tolerancia para os limites não ficar sem cima dos shapes
        var maxPoint2 = point.create(maxPoint.x + (-lineSizeValue * Math.cos(angleInRadian)), maxPoint.y + (-lineSizeValue * Math.sin(angleInRadian))),
            minPoint2 = point.create(minPoint.x + (+lineSizeValue * Math.cos(angleInRadian)), minPoint.y + (+lineSizeValue * Math.sin(angleInRadian)));


//        var maxPoint2 = maxPoint,
//            minPoint2 = minPoint;


        //console.log(maxPoint);
        //console.log(maxPoint2);

        //console.log(minPoint);
        //console.log(minPoint2);

        this.bounds = {
            bottomLeft: minPoint2,
            topLeft: point.create(minPoint2.x, maxPoint2.y),
            topRight: maxPoint2,
            bottomRight: point.create(maxPoint2.x, minPoint2.y)
        };

        return true;
    };

    Group.prototype.toObject = function () {
        return {
            uuid: this.uuid,
            name: this.name,
            style: this.style,
            children: this.children.map(function (shape) {
                return shape.toObject();
            })
        };
    }




    function create(attrs) {
        if ((utility.conversion.toType(attrs) !== 'array') || (attrs.length === 0)) {
            throw new Error('Group - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = utility.math.uuid(9, 16),
            children = attrs;

        // parametros para o novo Group
        attrs = utility.object.merge({
            uuid: uuid,
            name: 'Group '.concat(uuid),
            children: children
        }, attrs);
        // parametros para o novo Group

        // novo Group
        var group = new Group(attrs);

        // armazenando 
        store.add(group.uuid, group);

        return group;
    }

    function list() {
        return store.list();
    }

    function find(uuid) {
        return store.find(uuid);
    }

    function remove(value) {

        var uuid = null;

        // value como string == uuid
        if (utility.conversion.toType(value) === 'string') {
            uuid = value;
        }
        // value como object == layer
        if (utility.conversion.toType(value) === 'object') {
            uuid = value.uuid;
        }

        // removo a layer selecionada
        store.remove(uuid);

        return true;

    }


    exports.create = create;
    exports.list = list;
    exports.find = find;
    exports.remove = remove;

});