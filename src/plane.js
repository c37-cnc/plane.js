define("plane", ['require', 'exports'], function (require, exports) {

    var Version = '3.0.0',
        Authors = ['lilo@c37.co', 'ser@c37.co'];

    var Types = require('utility/types'),
        Import = require('utility/import'),
        Export = require('utility/export');

    var LayerManager = require('structure/layer'),
        ShapeManager = require('geometric/shape'),
        ToolManager = require('structure/tool');

    var LayerSystem = null,
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

            GridDraw(ViewPort.clientHeight, ViewPort.clientWidth, Plane.Zoom, Plane.Scroll);

            ToolManager.Event.Start({
                ViewPort: ViewPort,
                Update: Plane.Update
            });



            //            // start em eventos
            //            ViewPort.onmousemove = function (Event) {
            //                if (LayerManager.Active()) {
            //                    ToolManager.Event.Notify('onMouseMove', {
            //                        Type: 'onMouseMove',
            //                        Position: Types.Graphic.MousePosition(ViewPort, Event.clientX, Event.clientY),
            //                        Shapes: LayerManager.Active().Shapes.List(),
            //                        Scroll: Plane.Scroll,
            //                        Update: Plane.Update
            //                    });
            //                }
            //            };
            //            ViewPort.onclick = function (Event) {
            //                if (LayerManager.Active()) {
            //                    ToolManager.Event.Notify('onClick', {
            //                        Type: 'onClick',
            //                        Position: Types.Graphic.MousePosition(ViewPort, Event.clientX, Event.clientY),
            //                        Shapes: LayerManager.Active().Shapes.List(),
            //                        Scroll: Plane.Scroll,
            //                        Update: Plane.Update
            //                    });
            //                }
            //            }
            //            // start em eventos

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
            if ((Plane.Scroll.X != 0) || (Plane.Scroll.Y != 0)) {
                Plane.Scroll = {
                    X: 0,
                    Y: 0
                }
            };

            // reset em zoom
            if (Plane.Zoom != 1) {
                Plane.Zoom = 1;
            }

            // delete em todas as layers
            LayerManager.Delete();

            return true;
        },
        Layer: Types.Object.Extend(new Types.Object.Event(), {
            Create: function (Attrs) {
                if ((typeof Attrs == "function")) {
                    throw new Error('Layer - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                Attrs = Types.Object.Union(Attrs, {
                    ViewPort: ViewPort
                });

                return LayerManager.Create(Attrs);
            },
            List: function (Selector) {
                return Layer.List();
            },
            Delete: function (Uuid) {
                Layer.Delete(Uuid);
            },
            get Active() {
                return LayerManager.Active();
            },
            set Active(Value) {
                this.Notify('onDeactive', {
                    Type: 'onDeactive',
                    Layer: Layer.Active()
                });

                LayerManager.Active(Value);

                this.Notify('onActive', {
                    Type: 'onActive',
                    Layer: Layer.Active()
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

                var Shape = ShapeManager.Create(Attrs);

                LayerManager.Active().Shapes.Add(Shape.Uuid, Shape);

                return true;
            }
        },
        Tool: {
            Create: function (Attrs) {
                if (typeof Attrs == "function") {
                    throw new Error('Tool - Create - Attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
                }

                return ToolManager.Create(Attrs);
            }
        },
        get Zoom() {
            return this._zoom || 1;
        },
        set Zoom(Value) {

            // Plane.Zoom /= .9;  - more
            // Plane.Zoom *= .9; - less

            var LayerActive = LayerManager.Active(),
                ZoomFactor = Value / Plane.Zoom;

            GridDraw(ViewPort.clientHeight, ViewPort.clientWidth, Value, this.Scroll);

            // Se não alguma Layer Ativa = Clear || Import
            if (LayerActive) {
                LayerManager.List().forEach(function (Layer) {

                    LayerManager.Active(Layer.Uuid);

                    LayerManager.Active().Shapes.List().forEach(function (Shape) {
                        Shape.ScaleTo(ZoomFactor);
                    });

                    Plane.Update();
                });
                LayerManager.Active(LayerActive.Uuid);
            }

            this._zoom = Value;
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

            GridDraw(ViewPort.clientHeight, ViewPort.clientWidth, this.Zoom, MoveFactor);

            // Se não alguma Layer Ativa = Clear || Import
            if (LayerActive) {
                Value.X = Value.X * this.Zoom;
                Value.Y = Value.Y * this.Zoom;

                LayerManager.List().forEach(function (Layer) {

                    LayerManager.Active(Layer.Uuid);

                    LayerManager.Active().Shapes.List().forEach(function (Shape) {
                        Shape.MoveTo(Value);
                    });

                    Plane.Update();

                });
                LayerManager.Active(LayerActive.Uuid);
            }

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
        }
    });


    function GridDraw(Height, Width, Zoom, Scroll) {

        if (!Plane.Settings.GridEnable) return;

        if (!LayerSystem) {
            var Attrs = { // atributos para a layer do grid (sistema) 
                ViewPort: ViewPort,
                Name: 'Plane - System',
                Status: 'System',
                Style: {
                    BackgroundColor: Plane.Settings.BackgroundColor
                }
            };
            LayerSystem = LayerManager.Create(Attrs);
        } else {
            LayerSystem.Shapes = new Types.Data.Dictionary();
        }

        // calculos para o Zoom
        Width = Zoom > 1 ? Math.round(Width * Zoom) : Math.round(Width / Zoom);
        Height = Zoom > 1 ? Math.round(Height * Zoom) : Math.round(Height / Zoom);

        var LineBold = 0;
        if (Scroll.X > 0) {
            for (var X = (Scroll.X * Zoom); X >= 0; X -= (10 * Zoom)) {

                var Shape = ShapeManager.Create({
                    Uuid: Types.Math.Uuid(9, 16),
                    Type: 'Line',
                    X: [X, 0],
                    Y: [X, Height],
                    Style: {
                        LineColor: Plane.Settings.GridColor,
                        LineWidth: LineBold % 5 == 0 ? .8 : .3
                    }
                });

                LayerSystem.Shapes.Add(Shape.Uuid, Shape);
                LineBold++;
            }
        }

        LineBold = 0;
        for (var X = (Scroll.X * Zoom); X <= Width; X += (10 * Zoom)) {

            var Shape = ShapeManager.Create({
                Uuid: Types.Math.Uuid(9, 16),
                Type: 'Line',
                X: [X, 0],
                Y: [X, Height],
                Style: {
                    LineColor: Plane.Settings.GridColor,
                    LineWidth: LineBold % 5 == 0 ? .8 : .3
                }
            });

            LayerSystem.Shapes.Add(Shape.Uuid, Shape);
            LineBold++;
        }

        LineBold = 0;
        if (Scroll.Y > 0) {
            for (var Y = (Scroll.Y * Zoom); Y >= 0; Y -= (10 * Zoom)) {

                var Shape = ShapeManager.Create({
                    Uuid: Types.Math.Uuid(9, 16),
                    Type: 'Line',
                    X: [0, Y],
                    Y: [Width, Y],
                    Style: {
                        LineColor: Plane.Settings.GridColor,
                        LineWidth: LineBold % 5 == 0 ? .8 : .3
                    }
                });

                LayerSystem.Shapes.Add(Shape.Uuid, Shape);
                LineBold++;
            }
        }

        LineBold = 0;
        for (var Y = (Scroll.Y * Zoom); Y <= Height; Y += (10 * Zoom)) {

            var Shape = ShapeManager.Create({
                Uuid: Types.Math.Uuid(9, 16),
                Type: 'Line',
                X: [0, Y],
                Y: [Width, Y],
                Style: {
                    LineColor: Plane.Settings.GridColor,
                    LineWidth: LineBold % 5 == 0 ? .8 : .3
                }
            });

            LayerSystem.Shapes.Add(Shape.Uuid, Shape);
            LineBold++;
        }

        Plane.Update(LayerSystem);
    };


    exports.Public = Plane;
});