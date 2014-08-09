define("structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var toolStore = types.data.dictionary.create(),
        shapeSelected = types.data.dictionary.create();

    var layer = require('structure/layer');

    var viewPort = null;


    var Tool = types.object.inherits(function Tool(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;

        Object.defineProperty(this, 'active', {
            get: function () {
                return this._active || false;
            },
            set: function (value) {
                this.notify(value ? 'onActive' : 'onDeactive', {
                    type: value ? 'onActive' : 'onDeactive',
                    Now: new Date().toISOString()

                });
                this._active = value;
            }
        });
    }, types.object.event);


    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        var uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            uuid: uuid,
            name: 'Tool '.concat(uuid)
        }, attrs);

        // nova tool
        var tool = new Tool(attrs)

        toolStore.add(tool.uuid, tool);

        return tool;
    }


    function initialize(config) {

        viewPort = config.viewPort;

        viewPort.onmousemove = function (event) {

            if (layer.active) {
                layer.active.shapes.list().forEach(function (shape) {
                    if (shape.status != 'selected') {
                        shape.status = shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY)) ? 'over' : 'out';
                    }
                });
                layer.update();
            }
        }

        viewPort.onclick = function (event) {
            if (layer.active) {

                layer.active.shapes.list().forEach(function (shape) {
                    if (shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY))) {

                        shape.status = shape.status != 'selected' ? 'selected' : 'over';

                        if (shape.status == 'selected') {
                            shapeSelected.add(shape.uuid, shape);
                        } else {
                            shapeSelected.remove(shape.uuid);
                        }

                    }
                });
                layer.update();

                toolStore.list().forEach(function (Tool) {
                    if (Tool.active) {
                        Tool.notify('onMouseClick', {
                            type: 'onMouseClick',
                            shapes: shapeSelected.list()
                        });
                    }
                });
            }
        }

        return true;
    }






//    var event = types.object.extend(types.object.event.create(), {
//
//        start: function (config) {
//
//            viewPort = config.viewPort;
//
//            viewPort.onmousemove = function (event) {
//
//                if (layer.active) {
//                    layer.active.shapes.list().forEach(function (shape) {
//                        if (shape.status != 'selected') {
//                            shape.status = shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY)) ? 'over' : 'out';
//                        }
//                    });
//                    layer.update();
//                }
//            }
//
//            viewPort.onclick = function (event) {
//                if (layer.active) {
//
//                    layer.active.shapes.list().forEach(function (shape) {
//                        if (shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY))) {
//
//                            shape.status = shape.status != 'selected' ? 'selected' : 'over';
//
//                            if (shape.status == 'selected') {
//                                shapeSelected.add(shape.uuid, shape);
//                            } else {
//                                shapeSelected.remove(shape.uuid);
//                            }
//
//                        }
//                    });
//                    layer.update();
//
//                    toolStore.list().forEach(function (Tool) {
//                        if (Tool.active) {
//                            Tool.notify('onMouseClick', {
//                                type: 'onMouseClick',
//                                shapes: shapeSelected.list()
//                            });
//                        }
//                    });
//                }
//            }
//        }
//    });
    
    

    exports.initialize = initialize;
    exports.create = create;
});