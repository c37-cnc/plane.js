define("plane/core/group", ['require', 'exports'], function (require, exports) {

    var utility = require('utility');

    var point = require('plane/core/point');
    
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

        return true;
    };

    Group.prototype.intersect = function (rectangle) {

        return true;
    };

    Group.prototype.calculeBounds = function () {

        var childrenSegmentsPoints = [];

        this.children.forEach(function (shape) {
            childrenSegmentsPoints = childrenSegmentsPoints.concat(shape.segments);
        });

        var maxPoint = childrenSegmentsPoints.filter(function(pointCheck, idx, arr){
            return 0
            //return pointCheck.maximum()
        }),
            minPoint = 0;

        console.log(childrenSegmentsPoints);

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