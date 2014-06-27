define("plane", ['require', 'exports'], function (require, exports) {

    var Version = '3.0.0',
        Authors = ['lilo@c37.co', 'ser@c37.co'];

    var Types = require('utility/types'),
        Import = require('utility/import');

    var LayerManager = require('structure/layer'),
        ShapeManager = require('geometric/shape'),
        ToolManager = require('structure/tool');

    var LayerGrid = null,
        ViewPort = null;


    var Plane = Types.Object.Extend(new Types.Object.Event(), {

        Initialize: function (Config) {
            if (Config == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (typeof Config == "function") {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }
            if (Config.ViewPort == null) {
                throw new Error('Plane - Initialize - Config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
            }

            ViewPort = Config.ViewPort;

            Plane.Settings = Config.Settings ? Config.Settings : Plane.Settings;

            // start em eventos
            ViewPort.onmousemove = function (Event) {
                if (LayerManager.Active()) {
                    ToolManager.Event.Notify('onMouseMove', {
                        Type: 'onMouseMove',
                        Position: Types.Graphic.MousePosition(ViewPort, {
                            X: Event.clientX,
                            Y: Event.clientY
                        }),
                        Shapes: LayerManager.Active().Shapes.List(),
                        Scroll: Plane.Scroll,
                        Update: Plane.Update
                    });
                }
            };
            ViewPort.onclick = function (Event) {
                if (LayerManager.Active()) {
                    ToolManager.Event.Notify('onClick', {
                        Type: 'onClick',
                        Position: Types.Graphic.MousePosition(ViewPort, {
                            X: Event.clientX,
                            Y: Event.clientY
                        }),
                        Shapes: LayerManager.Active().Shapes.List(),
                        Scroll: Plane.Scroll,
                        Update: Plane.Update
                    });
                }
            }
            // start em eventos

            GridDraw(ViewPort.clientHeight, ViewPort.clientWidth, this.Zoom, this.Scroll);

            return true;
        },
        Update: function (LayerSystem) {

            var LayerStyle = LayerSystem ? LayerSystem.Style : LayerManager.Active().Style,
                LayerShapes = LayerSystem ? LayerSystem.Shapes.List() : LayerManager.Active().Shapes.List(),
                LayerRender = LayerSystem ? LayerSystem.Render : LayerManager.Active().Render,
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

            // reset em scroll
            Plane.Scroll = {
                X: 0,
                Y: 0
            };
            // reset em zoom
            Plane.Zoom = 1;
            // delete em todas as layers
            LayerManager.Delete();
            // um novo grid com as configurações limpas
            GridDraw(ViewPort.clientHeight, ViewPort.clientWidth, this.Zoom, this.Scroll);

            return true;
        },
        Layer: Types.Object.Extend(new Types.Object.Event(), {
            Create: function (Attrs) {
                if ((typeof Attrs == "function") || (Attrs == null)) {
                    throw new Error('Layer - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                Attrs = Types.Object.Union(Attrs, {
                    ViewPort: ViewPort
                });

                return LayerManager.Create(Attrs);
            },
            List: function (Selector) {
                return LayerManager.List();
            },
            Delete: function (Uuid) {
                LayerManager.Delete(Uuid);
            },
            get Active() {
                return LayerManager.Active();
            },
            set Active(Value) {
                this.Notify('onDeactive', {
                    Type: 'onDeactive',
                    Layer: LayerManager.Active()
                });

                LayerManager.Active(Value);

                this.Notify('onActive', {
                    Type: 'onActive',
                    Layer: LayerManager.Active()
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

                var shape = ShapeManager.Create(Attrs);

                LayerManager.Active().Shapes.Add(shape.Uuid, shape);

                return true;
            }
        },
        Tool: {
            Create: function (Attrs) {
                if (typeof Attrs == "function") {
                    throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                ToolManager.Create(Attrs)



                return true;
            }
        },
        Import: {
            FromJson: function (StringJson) {

                var PlaneObject = JSON.parse(StringJson);

                Plane.Clear();

                Plane.Settings = PlaneObject.Settings;
                Plane.Zoom = PlaneObject.Zoom;
                Plane.Scroll = PlaneObject.Scroll;

                PlaneObject.Layers.forEach(function (LayerObject) {

                    LayerManager.Create({
                        Uuid: LayerObject.Uuid,
                        Name: LayerObject.Name,
                        Locked: LayerObject.Locked,
                        Visible: LayerObject.Visible,
                        Style: LayerObject.Style,
                        ViewPort: ViewPort
                    });

                    LayerObject.Shapes.forEach(function (ShapeObject) {
                        Plane.Shape.Create(ShapeObject)
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

                var PlaneExport = {
                    Settings: Plane.Settings,
                    Zoom: Types.Math.ParseFloat(Plane.Zoom, 5),
                    Scroll: Plane.Scroll,
                    Layers: LayerManager.List().map(function (LayerExport) {
                        var LayerObject = LayerExport.ToObject();

                        LayerObject.Shapes = LayerObject.Shapes.map(function (ShapeExport) {
                            return ShapeExport.ToObject();
                        });

                        return LayerObject;
                    })
                }

                return JSON.stringify(PlaneExport);

            }
        },
        get Zoom() {
            return this._zoom || 1;
        },
        set Zoom(value) {

            // Plane.Zoom /= .9;  - more
            // Plane.Zoom *= .9; - less

            var LayerActive = LayerManager.Active(),
                ZoomFactor = value / Plane.Zoom;

            GridDraw(ViewPort.clientHeight, ViewPort.clientWidth, value, this.Scroll);

            LayerManager.List().forEach(function (Layer) {

                LayerManager.Active(Layer.Uuid)

                LayerManager.Active().Shapes.List().forEach(function (Shape) {
                    Shape.Scale = ZoomFactor;
                });

                Plane.Update();
            });

            LayerManager.Active(LayerActive);

            this._zoom = value;
        },
        get Scroll() {
            return this._scroll || {
                X: 0,
                Y: 0
            };
        },
        set Scroll(Value) {

            var LayerActive = LayerManager.Active(),
                MoveFactor = {
                    X: Value.X + this.Scroll.X,
                    Y: Value.Y + this.Scroll.Y
                };

            Value.X = Value.X * this.Zoom;
            Value.Y = Value.Y * this.Zoom;

            GridDraw(ViewPort.clientHeight, ViewPort.clientWidth, this.Zoom, MoveFactor);

            LayerManager.List().forEach(function (Layer) {

                LayerManager.Active(Layer.Uuid);

                LayerManager.Active().Shapes.List().forEach(function (Shape) {
                    Shape.MoveTo(Value);
                });

                Plane.Update();
            });

            LayerManager.Active(LayerActive);

            this._scroll = MoveFactor;
        },
        get Settings() {
            return this._settings || {
                MetricSystem: 'mm',
                BackgroundColor: 'rgb(255, 255, 255)',
                GridEnable: true,
                GridColor: 'rgb(218, 222, 215)'
            };
        },
        set Settings(Value) {
            this._settings = Value;
        }
    });


    function GridDraw(Height, Width, Zoom, Scroll) {

        if (!Plane.Settings.GridEnable) return;

        if (!LayerGrid) {
            var Attrs = { // atributos para a layer do grid (sistema) 
                ViewPort: ViewPort,
                Name: 'System - Grid',
                System: true,
                Style: {
                    BackgroundColor: Plane.Settings.BackgroundColor
                }
            };
            LayerGrid = LayerManager.Create(Attrs);
        } else {
            LayerGrid.Shapes = new Types.Data.Dictionary();
        }

        // calculos para o Zoom
        Width = Zoom > 1 ? Math.round(Width * Zoom) : Math.round(Width / Zoom);
        Height = Zoom > 1 ? Math.round(Height * Zoom) : Math.round(Height / Zoom);

        var LineBold = 0;
        if (Scroll.X > 0) {
            for (var X = (Scroll.X * Zoom); X >= 0; X -= (10 * Zoom)) {

                var ShapeGrid = ShapeManager.Create({
                    Uuid: Types.Math.Uuid(9, 16),
                    Type: 'Line',
                    X: [X, 0],
                    Y: [X, Height],
                    Style: {
                        LineColor: Plane.Settings.GridColor,
                        LineWidth: LineBold % 5 == 0 ? .8 : .3
                    }
                });

                LayerGrid.Shapes.Add(ShapeGrid.Uuid, ShapeGrid);
                LineBold++;
            }
        }

        LineBold = 0;
        for (var X = (Scroll.X * Zoom); X <= Width; X += (10 * Zoom)) {

            var ShapeGrid = ShapeManager.Create({
                Uuid: Types.Math.Uuid(9, 16),
                Type: 'Line',
                X: [X, 0],
                Y: [X, Height],
                Style: {
                    LineColor: Plane.Settings.GridColor,
                    LineWidth: LineBold % 5 == 0 ? .8 : .3
                }
            });

            LayerGrid.Shapes.Add(ShapeGrid.Uuid, ShapeGrid);
            LineBold++;
        }

        LineBold = 0;
        if (Scroll.Y > 0) {
            for (var Y = (Scroll.Y * Zoom); Y >= 0; Y -= (10 * Zoom)) {

                var ShapeGrid = ShapeManager.Create({
                    Uuid: Types.Math.Uuid(9, 16),
                    Type: 'Line',
                    X: [0, Y],
                    Y: [Width, Y],
                    Style: {
                        LineColor: Plane.Settings.GridColor,
                        LineWidth: LineBold % 5 == 0 ? .8 : .3
                    }
                });

                LayerGrid.Shapes.Add(ShapeGrid.Uuid, ShapeGrid);
                LineBold++;
            }
        }

        LineBold = 0;
        for (var Y = (Scroll.Y * Zoom); Y <= Height; Y += (10 * Zoom)) {

            var ShapeGrid = ShapeManager.Create({
                Uuid: Types.Math.Uuid(9, 16),
                Type: 'Line',
                X: [0, Y],
                Y: [Width, Y],
                Style: {
                    LineColor: Plane.Settings.GridColor,
                    LineWidth: LineBold % 5 == 0 ? .8 : .3
                }
            });

            LayerGrid.Shapes.Add(ShapeGrid.Uuid, ShapeGrid);
            LineBold++;
        }

        Plane.Update(LayerGrid);
    };


    exports.PlaneApi = Plane;
});