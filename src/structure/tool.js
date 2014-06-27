define("structure/tool", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');
    
    var ToolStore = new Types.Data.Dictionary()

    var Tool = Types.Function.Inherits(function Tool(Attrs) {
        this.Uuid = Attrs.Uuid;
        this.Name = Attrs.Name;
        this.__defineGetter__('Active', function () {
            return this._active || false;
        });
        this.__defineSetter__('Active', function (value) {
            this.Notify(value ? 'onActive' : 'onDeactive', {
                Type: value ? 'onActive' : 'onDeactive',
                Now: new Date().toISOString()

            });
            this._active = value;
        });
    }, Types.Object.Event);


    function Create(Attrs) {

        Attrs = Types.Object.Merge({
            Uuid: Types.Math.Uuid(9, 16),
            Name: 'Tool '.concat(ToolStore.count())
        }, Attrs);

        // nova tool
        var tool = Tool.Create(Attrs)
        
        ToolStore.Add(tool.Uuid, tool);
        
        return true;
    }

    
    var EventProxy = new Types.Object.Event();

    EventProxy.Listen('onMouseMove', function (Message) {
        Message.Shapes.forEach(function (Shape) {
            if (Shape.Status != 'Selected') {
                Shape.Status = Shape.Contains(Message.Position) ? 'Over' : 'Out';
            }
        });
        Message.Update();
    });

    EventProxy.Listen('onClick', function (Message) {
        Message.Shapes.forEach(function (Shape) {
            if (Shape.Contains(Message.Position)) {
                Shape.Status = Shape.Status != 'Selected' ? 'Selected' : 'Over';
            }
        });
        Message.Update();
    });


    exports.Event = EventProxy;
    exports.Create = Create;
});