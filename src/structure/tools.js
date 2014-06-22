define("structure/tools", ['require', 'exports'], function (require, exports) {

    var ObjectUtil = require('utility/object'),
        TypesUtil = require('utility/types'),
        MathUtil = require('utility/math');

    var ToolStore = new TypesUtil.Data.Dictionary();

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
    Tool.prototype = ObjectUtil.Event.prototype;


    var ToolsProxy = ObjectUtil.Extend(new ObjectUtil.Event(), {
        Create: function (attrs) {
            if (typeof attrs == "function") {
                throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            attrs = Object.Merge({
                uuid: MathUtil.Uuid(9, 16),
                name: 'Tool '.concat(ToolStore.count())
            }, attrs);

            var tool = Tool.Create(attrs.uuid, attrs.name);

            toolStore.add(attrs.uuid, tool);

            return true;
        }
    });

    exports.ToolsProxy = ToolsProxy;

});