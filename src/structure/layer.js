define("structure/layer", ['require', 'exports'], function (require, exports) {

    var object = require('utility/object');

    function Layer(attrs) {

        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.locked = attrs.locked;
        this.visible = attrs.visible;
        this.system = attrs.system;
        this.style = attrs.style;

    }
    Layer.prototype = new object.Event();

    Layer.prototype.toJson = function () {
        return JSON.stringify(this).replace(/_/g, '');
    }


    function Create(uuid, name, style, system) {

        var attrs = {
            uuid: uuid,
            name: name,
            style: style,
            locked: false,
            visible: true,
            system: system
        };

        return new Layer(attrs);
    };
    
    
    exports.Create = Create;




});