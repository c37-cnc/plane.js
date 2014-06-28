define("structure/tool", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');

    var ToolStore = Types.Data.Dictionary.Create(),
        ShapeSelected = Types.Data.Dictionary.Create();

    var LayerManager = require('structure/layer');

    var ViewPort = null,
        Update = null;


    var Tool = Types.Function.Inherits(function Tool(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;

        Object.defineProperty(this, 'Active', {
            get: function () {
                return this._active || false;
            },
            set: function (Value) {
                this.Notify(Value ? 'onActive' : 'onDeactive', {
                    Type: Value ? 'onActive' : 'onDeactive',
                    Now: new Date().toISOString()

                });
                this._active = Value;
            }
        });
    }, Types.Object.Event);


    function Create(Attrs) {

        var Uuid = Types.Math.Uuid(9, 16);

        Attrs = Types.Object.Merge({
            Uuid: Uuid,
            Name: 'Tool '.concat(Uuid)
        }, Attrs);

        // nova tool
        var tool = new Tool(Attrs)

        ToolStore.Add(tool.Uuid, tool);

        return tool;
    }


    var EventProxy = Types.Object.Extend(Types.Object.Event.Create(), {

        Start: function (Config) {

            ViewPort = Config.ViewPort;
            Update = Config.Update;

            ViewPort.onmousemove = function (Event) {
                
                if (LayerManager.Active()) {
                    LayerManager.Active().Shapes.List().forEach(function (Shape) {
                        if (Shape.Status != 'Selected') {
                            Shape.Status = Shape.Contains(Types.Graphic.MousePosition(ViewPort, Event.clientX, Event.clientY)) ? 'Over' : 'Out';
                        }
                    });
                    Update();
                }
            }

            ViewPort.onclick = function (Event) {
                if (LayerManager.Active()) {
                    
                    LayerManager.Active().Shapes.List().forEach(function (Shape) {
                        if (Shape.Contains(Types.Graphic.MousePosition(ViewPort, Event.clientX, Event.clientY))) {

                            Shape.Status = Shape.Status != 'Selected' ? 'Selected' : 'Over';

                            if (Shape.Status == 'Selected') {
                                ShapeSelected.Add(Shape.Uuid, Shape);
                            } else {
                                ShapeSelected.Delete(Shape.Uuid);
                            }

                        }
                    });
                    Update();

                    ToolStore.List().forEach(function (Tool) {
                        if (Tool.Active) {
                            Tool.Notify('onMouseClick', {
                                Type: 'onMouseClick',
                                Shapes: ShapeSelected.List()
                            });
                        }
                    });
                }
            }
        }

    })

    exports.Event = EventProxy;
    exports.Create = Create;
});