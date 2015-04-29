(function (plane) {
    "use strict";




    plane.exporter = {
        toJson: function () {

            var objectPlane = plane.exporter.toObject();

            return JSON.stringify(objectPlane);
        },
        toObject: function () {

            var objectPlane = {
                center: plane.view.center.toObject(),
                zoom: plane.view.zoom,
                layers: plane.layer.list().filter(function (layer) {
                    return layer.status !== 'system';
                }).map(function (layer) {

                    var mountLayer = layer.toObject();

                    mountLayer.children = {
                        groups: plane.group.list(layer.uuid).map(function (group){
                            return group.toObject();
                        }),
                        shapes: plane.shape.list(layer.uuid).map(function (shape) {
                            return shape.toObject();
                        })
                    };

                    return mountLayer;
                }).filter(function (layer) {
                    return (layer.children.groups.length > 0) || (layer.children.shapes.length > 0);
                })
            };

            return objectPlane;
        }
    };

})(c37.library.plane);