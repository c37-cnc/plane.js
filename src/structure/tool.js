define("structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var toolStore = types.data.dictionary.create(),
        shapeSelected = types.data.dictionary.create();

    var layerManager = require('structure/layer');

    var viewPort = null,
        update = null;


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

        var uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            uuid: uuid,
            name: 'Tool '.concat(uuid)
        }, attrs); 

        // nova tool
        var tool = new Tool(attrs)

        toolStore.Add(tool.uuid, tool);

        return tool;
    }


    var eventProxy = types.object.extend(types.object.event.create(), {

        start: function (config) {

            viewPort = config.viewPort;
            update = config.update;

            viewPort.onmousemove = function (event) {
                
                if (layerManager.active()) {
                    layerManager.active().shapes.list().forEach(function (Shape) {
                        if (Shape.status != 'Selected') {
                            Shape.status = Shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY)) ? 'Over' : 'Out';
                        }
                    });
                    update();
                }
            }

            viewPort.onclick = function (event) {
                if (layerManager.active()) {
                    
                    layerManager.active().shapes.list().forEach(function (Shape) {
                        if (Shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY))) {

                            Shape.status = Shape.status != 'Selected' ? 'Selected' : 'Over';

                            if (Shape.status == 'Selected') {
                                shapeSelected.Add(Shape.uuid, Shape);
                            } else {
                                shapeSelected.remove(Shape.uuid);
                            }

                        }
                    });
                    update();

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
        }

    })

    exports.event = eventProxy;
    exports.create = create;
});