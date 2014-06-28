define("structure/tool", ['require', 'exports'], function (require, exports) {

    var types = require('utility/types');

    var toolStore = types.data.dictionary.create(),
        shapeSelected = types.data.dictionary.create();

    var layerManager = require('structure/layer');

    var viewPort = null,
        update = null;


    var Tool = types.object.inherits(function Tool(attrs) {
        this.Uuid = attrs.Uuid;
        this.Name = attrs.Name;

        Object.defineProperty(this, 'active', {
            get: function () {
                return this._active || false;
            },
            set: function (value) {
                this.notify(value ? 'onActive' : 'onDeactive', {
                    Type: value ? 'onActive' : 'onDeactive',
                    Now: new Date().toISOString()

                });
                this._active = value;
            }
        });
    }, types.object.event);


    function create(attrs) {

        var Uuid = types.math.uuid(9, 16);

        attrs = types.object.merge({
            Uuid: Uuid,
            Name: 'Tool '.concat(Uuid)
        }, attrs); 

        // nova tool
        var tool = new Tool(attrs)

        toolStore.Add(tool.Uuid, tool);

        return tool;
    }


    var eventProxy = types.object.extend(types.object.event.create(), {

        start: function (config) {

            viewPort = config.viewPort;
            update = config.update;

            viewPort.onmousemove = function (event) {
                
                if (layerManager.active()) {
                    layerManager.active().shapes.list().forEach(function (Shape) {
                        if (Shape.Status != 'Selected') {
                            Shape.Status = Shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY)) ? 'Over' : 'Out';
                        }
                    });
                    update();
                }
            }

            viewPort.onclick = function (event) {
                if (layerManager.active()) {
                    
                    layerManager.active().shapes.list().forEach(function (Shape) {
                        if (Shape.contains(types.graphic.mousePosition(viewPort, event.clientX, event.clientY))) {

                            Shape.Status = Shape.Status != 'Selected' ? 'Selected' : 'Over';

                            if (Shape.Status == 'Selected') {
                                shapeSelected.Add(Shape.Uuid, Shape);
                            } else {
                                shapeSelected.remove(Shape.Uuid);
                            }

                        }
                    });
                    update();

                    toolStore.list().forEach(function (Tool) {
                        if (Tool.active) {
                            Tool.notify('onMouseClick', {
                                Type: 'onMouseClick',
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