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
        LayerGrid = null,
        ViewPort = null,
        Settings = null;


    var Plane = Types.Object.Extend(new Types.Object.Event(), {

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
            }, Config.Settings || {});


            // start em eventos
            ViewPort.onmousemove = function (Event) {
                if (LayerActive) {
                    Tools.Event.notify('onMouseMove', {
                        Type: 'onMouseMove',
                        Position: Types.Graphic.MousePosition(ViewPort, {
                            x: Event.clientX,
                            y: Event.clientY
                        }),
                        Shapes: LayerActive.Shapes.List(),
                        Scroll: Plane.Scroll,
                        Update: Plane.Update
                    });
                }
            };
            ViewPort.onclick = function (Event) {
                if (LayerActive) {
                    Tools.Event.notify('onClick', {
                        Type: 'onClick',
                        Position: Types.Graphic.MousePosition(ViewPort, {
                            x: Event.clientX,
                            y: Event.clientY
                        }),
                        Shapes: LayerActive.Shapes.List(),
                        Scroll: Plane.Scroll,
                        Update: Plane.Update
                    });
                }
            }
            // start em eventos

            GridDraw(Settings.gridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.gridColor, this.Zoom, this.Scroll);

            return true;
        },
        Update: function (LayerSystem) {

            var LayerStyle = LayerSystem ? LayerSystem.Style : LayerActive.Style,
                LayerShapes = LayerSystem ? LayerSystem.Shapes.List() : LayerActive.Shapes.List(),
                LayerRender = LayerSystem ? LayerSystem.Render : LayerActive.Render,
                Context2D = LayerRender.getContext('2d');

            // limpando o render
            Context2D.clearRect(0, 0, ViewPort.clientWidth, ViewPort.clientHeight);

            // style of layer
            Context2D.lineCap = LayerStyle.lineCap;
            Context2D.lineJoin = LayerStyle.lineJoin;

            // render para cada shape
            LayerShapes.forEach(function (shape) {
                // save state of all Configuration
                Context2D.save();
                Context2D.beginPath();

                shape.render(Context2D, Plane.Zoom);

                Context2D.stroke();
                // restore state of all Configuration
                Context2D.restore();
            });

            return true;
        },
        Clear: function () {

            Plane.Scroll = {
                X: 0,
                Y: 0
            };
            Plane.Zoom = 1;

            Plane.Layer.Delete();

            GridDraw(Settings.gridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.gridColor, this.Zoom, this.Scroll);
            return true;
        },
        Layer: Types.Object.Extend(new Types.Object.Event(), {
            Create: function (attrs) {

                attrs = Types.Object.Union(attrs, {
                    ViewPort: ViewPort
                });

                var layer = Layer.Create(attrs);

                LayerStore.Add(layer.Uuid, layer);
                this.Active = layer.Uuid;

            },
            List: function (Selector) {
                return LayerStore.List();
            },
            Delete: function (value) {
                LayerStore.List().forEach(function (Layer) {
                    var element = document.getElementById(Layer.Render.id);
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                    LayerStore.Delete(Layer.Uuid);
                });
            },
            get Active() {
                return LayerActive || {};
            },
            set Active(value) {
                this.notify('onDeactive', {
                    type: 'onDeactive',
                    layer: LayerActive
                });

                LayerActive = LayerStore.Find(value);

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
            FromJson: function (StringJson) {

                var PlaneObject = JSON.parse(StringJson);

                Plane.Clear();

                Settings = PlaneObject.Settings;
                Plane.Zoom = PlaneObject.Zoom;
                Plane.Scroll = PlaneObject.Scroll;

                PlaneObject.Layers.forEach(function (Layer) {

                    Plane.Layer.Create({
                        Uuid: Layer.Uuid,
                        Name: Layer.Name,
                        Locked: Layer.Locked,
                        Visible: Layer.Visible,
                        Style: Layer.Style
                    });

                    Layer.Shapes.forEach(function (Shape) {
                        Plane.Shape.Create(Shape);
                    });

                    Plane.Update();
                });

                return true;
            },
            FromSvg: null,
            FromDxf: function (StringDxf) {
                try {
                    Plane.Clear();

                    var StringJson = Import.FromDxf(StringDxf);
                    var ObjectDxf = JSON.parse(StringJson.replace(/u,/g, '').replace(/undefined,/g, ''));

                    if (StringJson) {
                        Plane.Layer.Create();
                        for (var prop in ObjectDxf) {
                            Plane.Shape.Create(ObjectDxf[prop]);
                        }
                        Plane.Update();
                    }

                } catch (error) {
                    alert(error);
                }
            },
            FromDwg: null
        },
        Export: {
            ToJson: function () {
                var PlaneObject = {
                    Settings: Settings,
                    Zoom: Types.Math.ParseFloat(Plane.Zoom, 5),
                    Scroll: Plane.Scroll,
                    Layers: LayerStore.List().map(function (Layer) {
                        var LayerObject = Layer.ToObject();

                        LayerObject.Shapes = LayerObject.Shapes.map(function (Shape) {
                            return Shape.ToObject();
                        });

                        return LayerObject;
                    })
                }
                return JSON.stringify(PlaneObject);
            }
        },
        get Zoom() {
            return this._zoom || 1;
        },
        set Zoom(value) {

            // Plane.Zoom /= .9;  - more
            // Plane.Zoom *= .9; - less

            GridDraw(Settings.gridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.gridColor, value, this.Scroll);

            var LayerActive = Plane.Layer.Active,
                ZoomFactor = value / Plane.Zoom;

            Plane.Layer.List().forEach(function (Layer) {

                Plane.Layer.Active = Layer.Uuid;

                Plane.Layer.Active.Shapes.List().forEach(function (Shape) {
                    Shape.Scale = ZoomFactor;
                });

                Plane.Update();
            });

            Plane.Layer.Active = LayerActive.Uuid;

            this._zoom = value;
        },
        get Scroll() {
            return this._scroll || {
                X: 0,
                Y: 0
            };
        },
        set Scroll(value) {

            var LayerActive = Plane.Layer.Active;
            var MoveFactor = {
                X: value.X + this.Scroll.X,
                Y: value.Y + this.Scroll.Y
            };

            value.X = value.X * this.Zoom;
            value.Y = value.Y * this.Zoom;

            GridDraw(Settings.gridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.gridColor, this.Zoom, MoveFactor);

            Plane.Layer.List().forEach(function (Layer) {

                Plane.Layer.Active = Layer.Uuid;

                Plane.Layer.Active.Shapes.List().forEach(function (Shape) {
                    Shape.MoveTo(value);
                });

                Plane.Update();
            });

            Plane.Layer.Active = LayerActive.Uuid;

            this._scroll = MoveFactor;
        }
    });


    function GridDraw(Enabled, Height, Width, Color, Zoom, Scroll) {

        if (!Enabled) return;

        if (!LayerGrid) {
            var attrs = { // atributos para a layer do grid (sistema) 
                ViewPort: ViewPort,
                Name: 'System - Grid',
                Style: {
                    lineCap: 'butt',
                    lineJoin: 'miter',
                    BackgroundColor: Settings.backgroundColor
                }
            };
            LayerGrid = Layer.Create(attrs);
        } else {
            LayerGrid.Shapes = new Types.Data.Dictionary();
        }

        // calculos para o Zoom
        Width = Zoom > 1 ? Math.round(Width * Zoom) : Math.round(Width / Zoom);
        Height = Zoom > 1 ? Math.round(Height * Zoom) : Math.round(Height / Zoom);

        var LineBold = 0;
        if (Scroll.X > 0) {
            for (var x = (Scroll.X * Zoom); x >= 0; x -= (10 * Zoom)) {

                var ShapeGrid = Shape.Create(Types.Math.Uuid(9, 16), 'line', [x, 0], [x, Height], {
                    lineColor: Color,
                    lineWidth: LineBold % 5 == 0 ? .8 : .3
                });

                LayerGrid.Shapes.Add(ShapeGrid.uuid, ShapeGrid);
                LineBold++;
            }
        }

        LineBold = 0;
        for (var x = (Scroll.X * Zoom); x <= Width; x += (10 * Zoom)) {

            var ShapeGrid = Shape.Create(Types.Math.Uuid(9, 16), 'line', [x, 0], [x, Height], {
                lineColor: Color,
                lineWidth: LineBold % 5 == 0 ? .8 : .3
            });

            LayerGrid.Shapes.Add(ShapeGrid.uuid, ShapeGrid);
            LineBold++;
        }

        LineBold = 0;
        if (Scroll.Y > 0) {
            for (var y = (Scroll.Y * Zoom); y >= 0; y -= (10 * Zoom)) {

                var ShapeGrid = Shape.Create(Types.Math.Uuid(9, 16), 'line', [0, y], [Width, y], {
                    lineColor: Color,
                    lineWidth: LineBold % 5 == 0 ? .8 : .3
                });

                LayerGrid.Shapes.Add(ShapeGrid.uuid, ShapeGrid);
                LineBold++;
            }
        }

        LineBold = 0;
        for (var y = (Scroll.Y * Zoom); y <= Height; y += (10 * Zoom)) {

            var ShapeGrid = Shape.Create(Types.Math.Uuid(9, 16), 'line', [0, y], [Width, y], {
                lineColor: Color,
                lineWidth: LineBold % 5 == 0 ? .8 : .3
            });

            LayerGrid.Shapes.Add(ShapeGrid.uuid, ShapeGrid);
            LineBold++;
        }

        Plane.Update(LayerGrid);
    };


    exports.PlaneApi = Plane;
});