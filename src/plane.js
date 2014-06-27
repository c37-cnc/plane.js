define("plane", ['require', 'exports'], function (require, exports) {

    var Version = '3.0.0',
        Authors = ['lilo@c37.co', 'ser@c37.co'];

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
                MetricSystem: 'mm',
                BackgroundColor: 'rgb(255, 255, 255)',
                GridEnable: true,
                GridColor: 'rgb(218, 222, 215)'
            }, Config.Settings || {});

            // start em eventos
            ViewPort.onmousemove = function (Event) {
                if (LayerActive) {
                    Tools.Event.Notify('onMouseMove', {
                        Type: 'onMouseMove',
                        Position: Types.Graphic.MousePosition(ViewPort, {
                            X: Event.clientX,
                            Y: Event.clientY
                        }),
                        Shapes: LayerActive.Shapes.List(),
                        Scroll: Plane.Scroll,
                        Update: Plane.Update
                    });
                }
            };
            ViewPort.onclick = function (Event) {
                if (LayerActive) {
                    Tools.Event.Notify('onClick', {
                        Type: 'onClick',
                        Position: Types.Graphic.MousePosition(ViewPort, {
                            X: Event.clientX,
                            Y: Event.clientY
                        }),
                        Shapes: LayerActive.Shapes.List(),
                        Scroll: Plane.Scroll,
                        Update: Plane.Update
                    });
                }
            }
            // start em eventos

            GridDraw(Settings.GridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.GridColor, this.Zoom, this.Scroll);

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
            Context2D.lineCap = LayerStyle.LineCap;
            Context2D.lineJoin = LayerStyle.LineJoin;

            // render para cada shape
            LayerShapes.forEach(function (Shape) {
                // save state of all Configuration
                Context2D.save();
                Context2D.beginPath();

                Shape.Render(Context2D, Plane.Zoom);

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

            GridDraw(Settings.GridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.GridColor, this.Zoom, this.Scroll);

            return true;
        },
        Layer: Types.Object.Extend(new Types.Object.Event(), {
            Create: function (Attrs) {

                Attrs = Types.Object.Union(Attrs, {
                    ViewPort: ViewPort
                });

                var layer = Layer.Create(Attrs);

                LayerStore.Add(layer.Uuid, layer);
                this.Active = layer.Uuid;

            },
            List: function (Selector) {
                return LayerStore.List();
            },
            Delete: function (value) {
                LayerStore.List().forEach(function (Layer) {
                    var Element = document.getElementById(Layer.Render.id);
                    if (Element && Element.parentNode) {
                        Element.parentNode.removeChild(Element);
                    }
                    LayerStore.Delete(Layer.Uuid);
                });
            },
            get Active() {
                return LayerActive || {};
            },
            set Active(value) {
                this.Notify('onDeactive', {
                    type: 'onDeactive',
                    layer: LayerActive
                });

                LayerActive = LayerStore.Find(value);

                this.Notify('onActive', {
                    type: 'onActive',
                    layer: LayerActive
                });
            }

        }),
        Shape: {
            Create: function (Attrs) {
                if ((typeof Attrs == "function") || (Attrs == null)) {
                    throw new Error('Shape - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }
                if (['Polygon', 'Rectangle', 'Line', 'Arc', 'Circle', 'Ellipse'].indexOf(Attrs.Type) == -1) {
                    throw new Error('Shape - Create - Type is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }
                if ((Attrs.X == undefined) || (Attrs.Y == undefined)) {
                    throw new Error('Shape - Create - X and Y is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                Attrs = Types.Object.Merge({
                    Uuid: Types.Math.Uuid(9, 16)
                }, Attrs);

                var shape = Shape.Create(Attrs.Uuid, Attrs.Type, Attrs.X, Attrs.Y, Attrs.Style, Attrs.Radius, Attrs.StartAngle,
                    Attrs.EndAngle, Attrs.ClockWise, Attrs.Sides, Attrs.Height, Attrs.Width, Attrs.RadiusY, Attrs.RadiusX);

                LayerActive.Shapes.Add(shape.Uuid, shape);

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

            GridDraw(Settings.GridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.GridColor, value, this.Scroll);

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

            GridDraw(Settings.GridEnable, ViewPort.clientHeight, ViewPort.clientWidth, Settings.GridColor, this.Zoom, MoveFactor);

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
            var Attrs = { // atributos para a layer do grid (sistema) 
                ViewPort: ViewPort,
                Name: 'System - Grid',
                Style: {
                    LineCap: 'butt',
                    LineJoin: 'miter',
                    BackgroundColor: Settings.BackgroundColor
                }
            };
            LayerGrid = Layer.Create(Attrs);
        } else {
            LayerGrid.Shapes = new Types.Data.Dictionary();
        }

        // calculos para o Zoom
        Width = Zoom > 1 ? Math.round(Width * Zoom) : Math.round(Width / Zoom);
        Height = Zoom > 1 ? Math.round(Height * Zoom) : Math.round(Height / Zoom);

        var LineBold = 0;
        if (Scroll.X > 0) {
            for (var X = (Scroll.X * Zoom); X >= 0; X -= (10 * Zoom)) {

                var ShapeGrid = Shape.Create(Types.Math.Uuid(9, 16), 'Line', [X, 0], [X, Height], {
                    LineColor: Color,
                    LineWidth: LineBold % 5 == 0 ? .8 : .3
                });

                LayerGrid.Shapes.Add(ShapeGrid.Uuid, ShapeGrid);
                LineBold++;
            }
        }

        LineBold = 0;
        for (var X = (Scroll.X * Zoom); X <= Width; X += (10 * Zoom)) {

            var ShapeGrid = Shape.Create(Types.Math.Uuid(9, 16), 'Line', [X, 0], [X, Height], {
                LineColor: Color,
                LineWidth: LineBold % 5 == 0 ? .8 : .3
            });

            LayerGrid.Shapes.Add(ShapeGrid.Uuid, ShapeGrid);
            LineBold++;
        }

        LineBold = 0;
        if (Scroll.Y > 0) {
            for (var Y = (Scroll.Y * Zoom); Y >= 0; Y -= (10 * Zoom)) {

                var ShapeGrid = Shape.Create(Types.Math.Uuid(9, 16), 'Line', [0, Y], [Width, Y], {
                    LineColor: Color,
                    LineWidth: LineBold % 5 == 0 ? .8 : .3
                });

                LayerGrid.Shapes.Add(ShapeGrid.Uuid, ShapeGrid);
                LineBold++;
            }
        }

        LineBold = 0;
        for (var Y = (Scroll.Y * Zoom); Y <= Height; Y += (10 * Zoom)) {

            var ShapeGrid = Shape.Create(Types.Math.Uuid(9, 16), 'Line', [0, Y], [Width, Y], {
                LineColor: Color,
                LineWidth: LineBold % 5 == 0 ? .8 : .3
            });

            LayerGrid.Shapes.Add(ShapeGrid.Uuid, ShapeGrid);
            LineBold++;
        }

        Plane.Update(LayerGrid);
    };


    exports.PlaneApi = Plane;
});