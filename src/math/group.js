(function (plane) {
    "use strict";
    function Group(attrs) {

        this.uuid = null;
        this.name = null;
        this._segments = null;
        this._bounds = null;
        this.status = null;
        this.style = null;
        this.children = null;

        this._initialize(attrs);

    }

    Group.prototype = {
        _initialize: function (attrs) {

            // identificador do group
            var uuid = plane.utility.math.uuid(9, 16);

            // (attributos || parametros) para o novo Group
            attrs = plane.utility.object.merge({
                uuid: uuid,
                name: 'Group - '.concat(uuid)
            }, attrs);

            // completando os campos do group
            plane.utility.object.extend(this, attrs);

            // limpando os segments
            this._segments = [];

            // calculando os segmentos
            this._calculeSegments();

            // calculando os limites
            this._calculeBounds();

            return true;
        },
        _calculeSegments: function () {

            var i = 0;
            do {
                this._segments = this.children[i]._segments.concat(this._segments);
                i++;
            } while (i < this.children.length);

        },
        _calculeBounds: function () {

            var from = plane.point.create(this._segments[0]),
                to = plane.point.create(this._segments[0]);

            this._segments.forEach(function (segment) {
                from = operation.minimum(segment, from);
                to = operation.maximum(segment, to);
            });

            this._bounds = plane.math.bounds.create(from, to);

            return true;
        },
        _render: function (context, zoom, motion) {

            //debugger;

            // sort, todo(s) o(s) group(s) devem ser as primeiras
            // para organizarmos o context.beginPath()
            this.children.sort(function (object) {
                if (!(object instanceof  Group))
                    return 1;
                if ((object instanceof  Group))
                    return -1;
                return 0;
            });

            // possivel personalização
            if (this.style) {
                // salvo as configurações de estilo atuais do contexto
                context.save();

                // personalização para linha pontilhada
                if (this.style.lineDash)
                    context.setLineDash([5, 2]);

                // personalização para a espessura da linha
                if (this.style.lineWidth)
                    context.lineWidth = this.style.lineWidth;

                // personalização para a cor da linha
                if (this.style.lineColor)
                    context.strokeStyle = this.style.lineColor;

                // e deixo iniciado um novo shape
                context.beginPath();
            }

            var i = 0;
            do {
                this.children[i].style = this.children[i].style ? this.children[i].style : null;
                this.children[i]._render(context, zoom, motion);
                i++;
            } while (i < this.children.length)
                
                
            // quando possivel personalização
            if (this.style) {
                // desenho o shape no contexto
                context.stroke();
                // restauro as configurações de estilo anteriores do contexto
                context.restore();
            }
        

            return true;
        },
        toObject: function () {
            return {
                uuid: this.uuid,
                name: this.name,
                status: this.status, // para ativo || não ativo
                children: this.children.map(function (shape) {
                    return shape.toObject();
                })
            };
        }
    };


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