define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var Types = require('utility/types'),
        Import = require('utility/import');

    var LayerStore = new Types.Data.Dictionary(),
        ToolsStore = new Types.Data.Dictionary();

    var Layer = require('structure/layer'),
        Shape = require('geometric/shape'),
        Tools = require('structure/tools');

    var LayerActive = null,
        ViewPort = null,
        Settings = null;


    var PlaneFacade = Types.Object.Extend(new Types.Object.Event(), {

        Initialize: function (Config) {
            // verificações para as configurações
            if (Config == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (typeof Config == "function") {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (Config.ViewPort == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            // verificações para as Configurações

            ViewPort = Config.ViewPort;


            Settings = Types.Object.Merge({
                metricSystem: 'mm',
                backgroundColor: 'rgb(255, 255, 255)',
                gridEnable: true,
                gridColor: 'rgb(218, 222, 215)'
            }, Config.settings || {});


            // start em eventos
            ViewPort.onmousemove = function (event) {
                Tools.Event.notify('onMouseMove', event);
            };
            ViewPort.onclick = function (event) {
                Tools.Event.notify('onClick', event);
            }
            // start em eventos

            //gridDraw(settings.gridEnable, ViewPort.clientWidth, ViewPort.clientHeight, settings.gridColor);

            return true;
        },
        Update: function () {

            var LayerStyle = LayerActive.Style,
                LayerShapes = LayerActive.Shapes.List(),
                LayerRender = LayerActive.Render,
                Context2D = LayerRender.getContext('2d');


            // limpando o render
            Context2D.clearRect(0, 0, ViewPort.clientWidth, ViewPort.clientHeight);
            // alinhando com o centro
            //Context2D.translate(planeFacade.center.x, planeFacade.center.y);

            // style of layer
            Context2D.lineCap = LayerStyle.lineCap;
            Context2D.lineJoin = LayerStyle.lineJoin;

            // render para cada shape
            LayerShapes.forEach(function (shape) {
                // save state of all Configuration
                Context2D.save();
                Context2D.beginPath();

                shape.render(Context2D);

                Context2D.stroke();
                // restore state of all Configuration
                Context2D.restore();
            });

            return true;
        },
        Layer: Types.Object.Extend(new Types.Object.Event(), {
            Create: function (attrs) {

                attrs = Types.Object.Union(attrs, {
                    ViewPort: ViewPort,
                    count: LayerStore.Count(),
                    backgroundColor: Settings.backgroundColor
                });

                var layer = Layer.Create(attrs);
                LayerStore.Add(layer.uuid, layer);
                LayerActive = layer;

            },
            Delete: function () {},
            get Active() {
                return LayerActive || {};
            },
            set Active(value) {
                this.notify('onDeactive', {
                    type: 'onDeactive',
                    layer: LayerActive
                });

                LayerActive = LayerStore.find(value);

                this.notify('onActive', {
                    type: 'onActive',
                    layer: LayerActive
                });
            }

        }),
        Shape: {

            Create: function (attrs) {
                if ((typeof attrs == "function") || (attrs == null)) {
                    throw new Error('Shape - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }
                if (['polygon', 'rectangle', 'line', 'arc', 'circle', 'ellipse'].indexOf(attrs.type.toLowerCase()) == -1) {
                    throw new Error('Shape - Create - Type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }
                if ((attrs.x == undefined) || (attrs.y == undefined)) {
                    throw new Error('Shape - Create - X and Y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                attrs = Types.Object.Merge({
                    uuid: Types.Math.Uuid(9, 16)
                }, attrs);

                var shape = Shape.Create(attrs.uuid, attrs.type, attrs.x, attrs.y, attrs.style, attrs.radius, attrs.startAngle,
                    attrs.endAngle, attrs.clockWise, attrs.sides, attrs.height, attrs.width, attrs.radiusY, attrs.radiusX);

                LayerActive.Shapes.Add(shape.uuid, shape);

                return true;
            }

        },

        Import: {
            FromJson: null,
            FromSvg: null,
            FromDxf: function (StringDxf) {
                try {
                    var StringJson = Import.FromDxf(StringDxf);
                    var ObjectDxf = JSON.parse(StringJson.replace(/u,/g, '').replace(/undefined,/g, ''));

                    if (StringJson) {
                        PlaneFacade.Layer.Create();
                        for (var prop in ObjectDxf) {
                            PlaneFacade.Shape.Create(ObjectDxf[prop]);
                        }
                        PlaneFacade.Update();
                    }
                    
                } catch (error) {
                    alert(error);
                }
            },
            FromDwg: null
        }



    });









    exports.PlaneFacade = PlaneFacade;
});