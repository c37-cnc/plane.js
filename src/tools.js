Plane.Tools = (function (plane) {
    "use strict";

    var tools = null;

    function Tool() {}

    Tool.prototype = {

        set uuid(value) {
            this._uuid = value;
        },
        get uuid() {
            return this._uuid;
        },

        set name(value) {
            if ((value != null) && (value != undefined) && (value != '')) {
                return this._name = value;
            }
        },
        get name() {
            return this._name;
        },

        set active(value) {
            if ((value == true) || (value == false)) {
                this.dispatchEvent(value ? 'onActive' : 'onDeactive', {
                    type: value ? 'onActive' : 'onDeactive',
                    now: new Date().toISOString()

                });
                this._active = value;
            }
        },
        get active() {
            return this._active;
        }

    }


    return {
        Initialize: function (config) {
            if ((typeof config == "function") || (config == null)) {
                throw new Error('Tools - Initialize - Config is not valid - See the documentation');
            }

            tools = new plane.Utility.Dictionary();

            // inicializando os eventos
            this.addEventListener('onResize', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onResize', event);
                    }
                });
            });
            this.addEventListener('onKeyPress', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onKeyPress', event);
                    }
                });
            });

            this.addEventListener('onClick', function (event) {

                var layerUuid = plane.Layers.Active.uuid;

                plane.Shape.Search('layer > uuid > '.concat(layerUuid)).forEach(function (shape) {

                    if (shape.type == 'line') {

                        var a1 = {
                                x: shape.x[0],
                                y: shape.x[1]
                            },
                            a2 = {
                                x: shape.y[0],
                                y: shape.y[1]
                            },
                            b1 = {
                                x: event.x,
                                y: event.y
                            },
                            b2 = {
                                x: event.x + 1,
                                y: event.y + 1
                            }

                        plane.Utility.Graphic.intersectionLine(a1, a2, b1, b2);

                    }

                });


                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onClick', event);
                    }
                });
            });
            this.addEventListener('onDblClick', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onClick', event);
                    }
                });
            });

            this.addEventListener('onMouseDown', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onMouseDown', event);
                    }
                });
            });
            this.addEventListener('onMouseUp', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onMouseUp', event);
                    }
                });
            });
            this.addEventListener('onMouseMove', function (event) {

                var layerUuid = plane.Layers.Active.uuid;

                plane.Shape.Search('layer > uuid > '.concat(layerUuid)).forEach(function (shape) {

                    if (shape.type == 'line') {

                        var a1 = {
                                x: shape.x[0],
                                y: shape.x[1]
                            },
                            a2 = {
                                x: shape.y[0],
                                y: shape.y[1] 
                            },
                            b1 = {
                                x: event.x,
                                y: event.y
                            },
                            b2 = {
                                x: event.x + 1,
                                y: event.y + 1
                            }

                        plane.Utility.Graphic.intersectionLine(a1, a2, b1, b2);

                    }

                });



                //                tools.list().forEach(function (tool) {
                //                    if (tool.active) {
                //                        tool.dispatchEvent('onMouseMove', event);
                //                    }
                //                });


            });
            this.addEventListener('onMouseWheel', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onMouseWheel', event);
                    }
                });
            });

            this.addEventListener('onContextMenu', function (event) {
                tools.list().forEach(function (tool) {
                    if (tool.active) {
                        tool.dispatchEvent('onContextMenu', event);
                    }
                });
            });
            // inicializando os eventos


            return true;
        },
        Create: function (name) {
            if (name && (typeof name != 'string')) {
                throw new Error('Tools - Create - Layer Name is not valid - See the documentation');
            }

            name = name || 'New Tool ' + tools.count();

            var tool = new Tool(),
                uuid = plane.Utility.Uuid(9, 16);

            tool.__proto__.__proto__ = new plane.Utility.Event();
            tool.uuid = uuid;
            tool.name = name;
            tool.active = false;

            // add ao dictionary
            tools.add(uuid, tool);

            return tool;
        },
        Remove: function (uuid) {
            return tools.remove(uuid);
        },
        List: function (callback) {
            return typeof callback == 'function' ?
                callback.call(this, tools.list()) :
                tools.list();
        }
    }


})(Plane);