define("structure/tools", ['require', 'exports'], function (require, exports) {

    var Types = require('utility/types');

    var ToolStore = new Types.Data.Dictionary();

    //    var Tools = Object.Extend(new Object.Event(), {
    //
    //        this.uuid: null,
    //        this.name: '',
    //        get active() {
    //            return this._active;
    //        },
    //        set active(value) {
    //            this._active = value;
    //        }
    //
    //    });

    function Tool(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;

        this.__defineGetter__('active', function () {
            return this._active || false;
        });
        this.__defineSetter__('active', function (value) {
            this.notify(value ? 'onActive' : 'onDeactive', {
                type: value ? 'onActive' : 'onDeactive',
                now: new Date().toISOString()

            });
            this._active = value;
        });

        utility.object.event.call(this);
    }
    Tool.prototype = Types.Object.Event.prototype;


    function Create(attrs) {
        if (typeof attrs == "function") {
            throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        attrs = Types.Object.Merge({
            uuid: Types.Math.Uuid(9, 16),
            name: 'Tool '.concat(ToolStore.count())
        }, attrs);

        var tool = Tool.Create(attrs.uuid, attrs.name);

        toolStore.add(attrs.uuid, tool);

        return true;
    }

    var EventProxy = new Types.Object.Event();

    EventProxy.listen('onMouseMove', function (Message) {
        Message.Shapes.forEach(function (Shape) {
            if (Shape.status != 'Selected') {
                Shape.status = Shape.Contains(Message.Position) ? 'Over' : 'Out';
            }
        });
        Message.Update();
    });

    EventProxy.listen('onClick', function (Message) {
        Message.Shapes.forEach(function (Shape) {
            if (Shape.Contains(Message.Position)) {
                Shape.status = Shape.status != 'Selected' ? 'Selected' : 'Over' ;
            }
        });
        Message.Update();
    });


    exports.Event = EventProxy;
    exports.Create = Create;

});