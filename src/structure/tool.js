define("structure/tool", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');

    var ToolStore = new Types.Data.Dictionary();

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


    var EventProxy = Types.Object.Extend(new Types.Object.Event(), {

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



                console.log();

                //                Layer.Shapes.List().forEach(function (Shape) {
                //
                //
                //                    if (Shape.Status != 'Selected') {
                //                        Shape.Status = Shape.Contains(Message.Position) ? 'Over' : 'Out';
                //                    }
                //
                //
                //                });
                //                
                //                Update();

            }




        }

    })



    //    var EventProxy = new Types.Object.Event();

    //    EventProxy.Listen('onMouseMove', function (Message) {
    //
    //        var ShapeSelected = [];
    //
    //        Message.Shapes.forEach(function (Shape) {
    //            if (Shape.Status != 'Selected') {
    //                Shape.Status = Shape.Contains(Message.Position) ? 'Over' : 'Out';
    //            }
    //        });
    //        Message.Update();
    //
    //
    //        var ToolActive = ToolStore.List().filter(function (Tool) {
    //            return Tool.Active
    //        });
    //
    //        ToolActive.forEach(function (Tool) {
    //
    //            Tool.Notify('onMouseMove', {
    //                Type: 'onMouseMove',
    //                Shape: ShapeSelected,
    //                Now: new Date().toISOString()
    //            });
    //
    //        });
    //
    //    });
    //
    //    EventProxy.Listen('onClick', function (Message) {
    //        Message.Shapes.forEach(function (Shape) {
    //            if (Shape.Contains(Message.Position)) {
    //                Shape.Status = Shape.Status != 'Selected' ? 'Selected' : 'Over';
    //            }
    //        });
    //        Message.Update();
    //    });


    exports.Event = EventProxy;
    exports.Create = Create;
});