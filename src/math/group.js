(function (plane) {
    "use strict";
    function Group(attrs) {

        this.uuid = null;
        this.name = null;
        this._segments = [];
        this._bounds = null;
        this.status = null;
        this.style = null;
        this.children = null;
        this._initialize(attrs);
    }

    Group.create = function (attrs) {
        return new Group(attrs);
    };

    Group.prototype = {
        _initialize: function (attrs) {

            var uuid = plane.utility.math.uuid(9, 16), // identificador do group
                children = attrs.children.slice(); // os objects filhos

            delete attrs.children;
            // (attributos || parametros) para o novo Group
            attrs = plane.utility.object.merge({
                uuid: uuid,
                name: 'Group - '.concat(uuid),
                children: plane.math.dictionary.create()
            }, attrs);
            
            
            

            // parse to group
            var i = 0;
            do {

                if (children[i] instanceof Group) {
                    
                    //debugger;                    
                    
                    plane.group.remove(children[i].uuid);
                    
                    children[i].children.list().forEach(function (shape){
                        plane.shape.remove(shape.uuid);
                    });
                    
                } 
                
                if (children[i] instanceof plane.math.shape) {

                    this._segments = children[i]._segments.concat(this._segments);
                    plane.shape.remove(children[i].uuid);

                }

                attrs.children.add(children[i].uuid, children[i]);
                i++;
            } while (i < children.length);
            // completando os campos do group
            plane.utility.object.extend(this, attrs);
            //debugger;

            // calculando os limites
            this._calculeBounds();
            return true;
        },
        _calculeBounds: function () {

            var shapes = shapesOfChildren(this);
            var from = plane.point.create(shapes[0]._segments[0]),
                to = plane.point.create(shapes[0]._segments[0]);
            shapes.forEach(function (shape) {
                shape._segments.forEach(function (segment) {
                    from = operation.minimum(segment, from);
                    to = operation.maximum(segment, to);
                });
            });
            this._bounds = plane.math.bounds.create(from, to);
            return true;
        },
        contains: function (position, transform) {

            return false;
        },
        intersect: function (rectangle) {

            return true;
        },
//        _remove: function (uuid) {
//
//            var group = plane.group.get(uuid);
//
//            debugger;
//
//            var children = group.children.list(),
//                i = 0;
//
//            do {
//                if (children[i] instanceof plane.math.group) {
//
//                    plane.group.create(children[i]);
//
//                }
//
//                if (children[i] instanceof plane.math.shape) {
//                    plane.shape.create(children[i]);
//                }
//
//                i++;
//            } while (i < children.length);
//
//
//            plane.group.remove(uuid);
//
//            return true;
//
//        },
        _render: function (context, zoom, motion) {

            var children = this.children.list();
            // sort, todo(s) o(s) group(s) devem ser as primeiras
            // para organizarmos o context.beginPath()
            children.sort(function (object) {
                if (!(object instanceof  Group))
                    return 1;
                if ((object instanceof  Group))
                    return -1;
                return 0;
            });
            // se não tenho estilo
            if (!this.style) {
                // inicio o conjunto de shapes no contexto
                context.beginPath();
            }

            var i = 0;
            do {
                // se tenho estilo, passo a herança, caso contrario, limpo qualquer estilo
                children[i].style = this.style ? this.style : null;
                children[i]._render(context, zoom, motion);
                i++;
            } while (i < children.length)

            // se não tenho estilo
            if (!this.style) {
                // desenho o conjunto de shapes no contexto
                context.stroke();
            }

            return true;
        },
        toObject: function () {
            return {
                uuid: this.uuid,
                name: this.name,
                status: this.status, // para ativo || não ativo
                children: this.children.list().map(function (shape) {
                    return shape.toObject();
                })
            };
        }
    };
    function shapesOfChildren(group) {

        var shapes = [];
        group.children.list().forEach(function (children) {
            if (children instanceof  Group) {
                shapes = shapes.concat(shapesOfChildren(children));
            } else {
                shapes.push(children);
            }
        });
        return shapes;
    }

    var operation = {
        minimum: function (a, b) {
            return {
                x: (a.x < b.x) ? a.x : b.x,
                y: (a.y < b.y) ? a.y : b.y
            };
        },
        maximum: function (a, b) {
            return {
                x: (a.x > b.x) ? a.x : b.x,
                y: (a.y > b.y) ? a.y : b.y
            };
        }
    };
    plane.math.group = Group;
})(c37.library.plane);