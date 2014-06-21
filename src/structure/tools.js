define("structure/tools", ['require', 'exports'], function (require, exports) {

    var Object = require('utility/object'),
        Types = require('utility/types');

    var ToolStore = new Types.Data.Dictionary();


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
    Tool.prototype = Object.Event.prototype;



    function Create(attrs) {
        if (typeof attrs == "function") {
            throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        attrs = Object.Merge({
            uuid: utility.math.uuid(9, 16),
            name: 'Tool '.concat(toolStore.count())
        }, attrs);

        var tool = new Tool(attrs);

        ToolStore.add(attrs.uuid, tool);

        return true;
    }


    exports.Create = Create;

});