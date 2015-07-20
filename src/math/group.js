(function (plane) {
    "use strict";

    function Group(attrs) {

        this.uuid = null;
        this.type = 'group';
        this.name = null;
        this.segments = [];
        this.bounds = null;
        this.status = null;
        this.style = null;
        this.children = null;

        this._initialize(attrs);

    }

    Group.prototype = {
        _initialize: function (attrs) {

            // identificador do group
            var uuid = attrs.uuid ? attrs.uuid : plane.utility.math.uuid(9, 16);

            // (attributos || parametros) para o novo Group
            attrs = plane.utility.object.merge({
                uuid: uuid,
                name: 'Group - '.concat(uuid)
            }, attrs);

            // completando os campos do group
            plane.utility.object.extend(this, attrs);

            // calculando os segmentos
            this._calculeSegments();

            // calculando os limites
            this._calculeBounds();

            return true;
        },
        _calculeSegments: function () {

            var i = 0;
            do {
                this.segments = this.children[i].segments.concat(this.segments);
                i++;
            } while (i < this.children.length);

        },
        _calculeBounds: function () {

            var from = plane.point.create(this.segments[0]),
                to = plane.point.create(this.segments[0]);

            this.segments.forEach(function (segment) {
                from = operation.minimum(segment, from);
                to = operation.maximum(segment, to);
            });

            this.bounds = plane.math.bounds.create(from, to);

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

                // personalização para texto
                context.fillStyle = this.style.fillColor || this.style.lineColor;

                // personalização para a cor da linha
                if (this.style.lineColor)
                    context.strokeStyle = this.style.lineColor;

                // e deixo iniciado um novo shape
                context.beginPath();
            }

            var i = 0;
            do {
                if ((this.children[i].style === 'quote') && (this.style)) {
                    this.children[i].style = this.style;
                } else {
                    this.children[i].style = this.children[i].style ? this.children[i].style : null;
                }
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
                type: this.type,
                name: this.name,
                status: this.status, // para ativo || não ativo
                children: this.children.map(function (object) {
                    return object.toObject();
                })
            };
        },
        isClosed: function () {
            // DESENVOLVER A FUNÇÃO PARA UNIÃO DE PONTOS DA DURU!!
            if (isOnlyShapes(this)) {

                var disorderShapes = this.children.slice(),
                    orderShapes = [],
                    orderSegments = [],
                    actualPointTest = 'end',
                    isBreak = false,
                    resultClosed = [];


                disorderShapes.sort(function (a, b) {
                    if (a.type === 'line')
                        return -1;
                    if (a.type !== 'line')
                        return 1;
                    return 0;
                });

                // insiro o primeiro shape na lista dos 'ordenados'
                orderShapes.push(disorderShapes.splice(0, 1).first());
                orderShapes.last().segments.slice().forEach(function (segment) {
                    orderSegments.push(segment);
                });

                // enquanto houver shapes desordenados
                for (var ii = 0; ii <= disorderShapes.length; ii++) {

                    // o ultimo shape da lista dos ordenados
                    var lastOrderShape = orderShapes.last(),
                        lastOrderShapeStartPoint = lastOrderShape.segments.first(),
                        lastOrderShapeEndPoint = lastOrderShape.segments.last();

                    // testo o ponto end do ultimo shape
                    if (actualPointTest === 'end') {

                        for (var i = 0; i < disorderShapes.length; i++) {

                            var actualDisorderShape = disorderShapes[i],
                                actualDisorderShapeStartPoint = actualDisorderShape.segments.first();

                            if ((plane.utility.math.parseFloat(lastOrderShapeEndPoint.x, 3) === plane.utility.math.parseFloat(actualDisorderShapeStartPoint.x, 3)) &&
                                (plane.utility.math.parseFloat(lastOrderShapeEndPoint.y, 3) === plane.utility.math.parseFloat(actualDisorderShapeStartPoint.y, 3))) {

                                // add a lista dos ordenados
                                orderShapes.push(disorderShapes.splice(i, 1).first());

                                orderShapes.last().segments.slice().forEach(function (segment) {
                                    orderSegments.push(segment);
                                });

                                actualPointTest = 'end';

                                ii = 0;

                                isBreak = true;

                                break;
                            }

                        }

                        if (isBreak) {
                            isBreak = false;
                            continue;
                        }

                        for (var i = 0; i < disorderShapes.length; i++) {

                            var actualDisorderShape = disorderShapes[i],
                                actualDisorderShapeEndPoint = actualDisorderShape.segments.last();

                            if ((plane.utility.math.parseFloat(lastOrderShapeEndPoint.x, 3) === plane.utility.math.parseFloat(actualDisorderShapeEndPoint.x, 3)) &&
                                (plane.utility.math.parseFloat(lastOrderShapeEndPoint.y, 3) === plane.utility.math.parseFloat(actualDisorderShapeEndPoint.y, 3))) {

                                // add a lista dos ordenados
                                orderShapes.push(disorderShapes.splice(i, 1).first());

                                orderShapes.last().segments.slice().reverse().forEach(function (segment) {
                                    orderSegments.push(segment);
                                });

                                actualPointTest = 'start';

                                ii = 0;

                                isBreak = true;

                                break;
                            }

                        }

                    }

                    if (isBreak) {
                        isBreak = false;
                        continue;
                    }

                    // testo o ponto start do ultimo shape
                    if (actualPointTest === 'start') {

                        for (var i = 0; i < disorderShapes.length; i++) {

                            var actualDisorderShape = disorderShapes[i],
                                actualDisorderShapeStartPoint = actualDisorderShape.segments.first();

                            if ((plane.utility.math.parseFloat(lastOrderShapeStartPoint.x, 3) === plane.utility.math.parseFloat(actualDisorderShapeStartPoint.x, 3)) &&
                                (plane.utility.math.parseFloat(lastOrderShapeStartPoint.y, 3) === plane.utility.math.parseFloat(actualDisorderShapeStartPoint.y, 3))) {

                                // add a lista dos ordenados
                                orderShapes.push(disorderShapes.splice(i, 1).first());

                                orderShapes.last().segments.slice().forEach(function (segment) {
                                    orderSegments.push(segment);
                                });

                                actualPointTest = 'end';

                                ii = 0;

                                isBreak = true;

                                break;
                            }

                        }

                        if (isBreak) {
                            isBreak = false;
                            continue;
                        }

                        for (var i = 0; i < disorderShapes.length; i++) {

                            var actualDisorderShape = disorderShapes[i],
                                actualDisorderShapeEndPoint = actualDisorderShape.segments.last();

                            if ((plane.utility.math.parseFloat(lastOrderShapeStartPoint.x, 3) === plane.utility.math.parseFloat(actualDisorderShapeEndPoint.x, 3)) &&
                                (plane.utility.math.parseFloat(lastOrderShapeStartPoint.y, 3) === plane.utility.math.parseFloat(actualDisorderShapeEndPoint.y, 3))) {

                                // add a lista dos ordenados
                                orderShapes.push(disorderShapes.splice(i, 1).first());

                                orderShapes.last().segments.slice().reverse().forEach(function (segment) {
                                    orderSegments.push(segment);
                                });

                                actualPointTest = 'start';

                                ii = 0;

                                break;
                            }

                        }

                    }

                    // do primeiro shape os segmentos
                    var firstSegment = orderSegments.first(),
                        lastSegment = orderSegments.last();

                    //verifico se o group formou um polygon 'fechado'
                    if ((Math.abs((plane.utility.math.parseFloat(firstSegment.x, 3) - plane.utility.math.parseFloat(lastSegment.x, 3))) <= 2) &&
                        (Math.abs((plane.utility.math.parseFloat(firstSegment.y, 3) - plane.utility.math.parseFloat(lastSegment.y, 3))) <= 2)) {
                        resultClosed.push(true);
                    } else {
                        resultClosed.push(false);
                    }

                }

                if (resultClosed.length > 0) {
                    
                    // se estou aqui dentro significa que:
                    // estou em um group que contem shapes FECHADOS e ABERTOS, exemplo - o esqueleto do halloween de testes
                    // desta forma NO FUTURO vamos considerar se formamos um group com TODOS os shapes aberto formando um objeto FECHADO!

                } else {
                    // do primeiro shape os segmentos
                    var firstSegment = orderSegments.first(),
                        lastSegment = orderSegments.last();

                    //verifico se o group formou um polygon 'fechado'
                    if ((Math.abs((plane.utility.math.parseFloat(firstSegment.x, 3) - plane.utility.math.parseFloat(lastSegment.x, 3))) <= 2) &&
                        (Math.abs((plane.utility.math.parseFloat(firstSegment.y, 3) - plane.utility.math.parseFloat(lastSegment.y, 3))) <= 2)) {
                        return true;
                    }
                }

                return false;
            } else {
                return false;
            }
        },
        toPolyline: function () {
            // DESENVOLVER A FUNÇÃO PARA UNIÃO DE PONTOS DA DURU!!
            if (isOnlyShapes(this)) {

                var disorderShapes = this.children.slice(),
                    orderShapes = [],
                    orderSegments = [],
                    actualPointTest = 'end',
                    isBreak = false;


                disorderShapes.sort(function (a, b) {
                    if (a.type === 'line')
                        return -1;
                    if (a.type !== 'line')
                        return 1;
                    return 0;
                });

                // insiro o primeiro shape na lista dos 'ordenados'
                orderShapes.push(disorderShapes.splice(0, 1).first());
                orderShapes.last().segments.slice().forEach(function (segment) {
                    orderSegments.push(segment);
                });

                // enquanto houver shapes desordenados
                for (var ii = 0; ii <= disorderShapes.length; ii++) {

                    // o ultimo shape da lista dos ordenados
                    var lastOrderShape = orderShapes.last(),
                        lastOrderShapeStartPoint = lastOrderShape.segments.first(),
                        lastOrderShapeEndPoint = lastOrderShape.segments.last();

                    // testo o ponto end do ultimo shape
                    if (actualPointTest === 'end') {

                        for (var i = 0; i < disorderShapes.length; i++) {

                            var actualDisorderShape = disorderShapes[i],
                                actualDisorderShapeStartPoint = actualDisorderShape.segments.first();

                            if ((plane.utility.math.parseFloat(lastOrderShapeEndPoint.x, 3) === plane.utility.math.parseFloat(actualDisorderShapeStartPoint.x, 3)) &&
                                (plane.utility.math.parseFloat(lastOrderShapeEndPoint.y, 3) === plane.utility.math.parseFloat(actualDisorderShapeStartPoint.y, 3))) {

                                // add a lista dos ordenados
                                orderShapes.push(disorderShapes.splice(i, 1).first());

                                orderShapes.last().segments.slice().forEach(function (segment) {
                                    orderSegments.push(segment);
                                });

                                actualPointTest = 'end';

                                ii = 0;

                                isBreak = true;

                                break;
                            }

                        }

                        if (isBreak) {
                            isBreak = false;
                            continue;
                        }

                        for (var i = 0; i < disorderShapes.length; i++) {

                            var actualDisorderShape = disorderShapes[i],
                                actualDisorderShapeEndPoint = actualDisorderShape.segments.last();

                            if ((plane.utility.math.parseFloat(lastOrderShapeEndPoint.x, 3) === plane.utility.math.parseFloat(actualDisorderShapeEndPoint.x, 3)) &&
                                (plane.utility.math.parseFloat(lastOrderShapeEndPoint.y, 3) === plane.utility.math.parseFloat(actualDisorderShapeEndPoint.y, 3))) {

                                // add a lista dos ordenados
                                orderShapes.push(disorderShapes.splice(i, 1).first());

                                orderShapes.last().segments.slice().reverse().forEach(function (segment) {
                                    orderSegments.push(segment);
                                });

                                actualPointTest = 'start';

                                ii = 0;

                                isBreak = true;

                                break;
                            }

                        }

                    }

                    if (isBreak) {
                        isBreak = false;
                        continue;
                    }

                    // testo o ponto start do ultimo shape
                    if (actualPointTest === 'start') {

                        for (var i = 0; i < disorderShapes.length; i++) {

                            var actualDisorderShape = disorderShapes[i],
                                actualDisorderShapeStartPoint = actualDisorderShape.segments.first();

                            if ((plane.utility.math.parseFloat(lastOrderShapeStartPoint.x, 3) === plane.utility.math.parseFloat(actualDisorderShapeStartPoint.x, 3)) &&
                                (plane.utility.math.parseFloat(lastOrderShapeStartPoint.y, 3) === plane.utility.math.parseFloat(actualDisorderShapeStartPoint.y, 3))) {

                                // add a lista dos ordenados
                                orderShapes.push(disorderShapes.splice(i, 1).first());

                                orderShapes.last().segments.slice().forEach(function (segment) {
                                    orderSegments.push(segment);
                                });

                                actualPointTest = 'end';

                                ii = 0;

                                isBreak = true;

                                break;
                            }

                        }

                        if (isBreak) {
                            isBreak = false;
                            continue;
                        }

                        for (var i = 0; i < disorderShapes.length; i++) {

                            var actualDisorderShape = disorderShapes[i],
                                actualDisorderShapeEndPoint = actualDisorderShape.segments.last();

                            if ((plane.utility.math.parseFloat(lastOrderShapeStartPoint.x, 3) === plane.utility.math.parseFloat(actualDisorderShapeEndPoint.x, 3)) &&
                                (plane.utility.math.parseFloat(lastOrderShapeStartPoint.y, 3) === plane.utility.math.parseFloat(actualDisorderShapeEndPoint.y, 3))) {

                                // add a lista dos ordenados
                                orderShapes.push(disorderShapes.splice(i, 1).first());

                                orderShapes.last().segments.slice().reverse().forEach(function (segment) {
                                    orderSegments.push(segment);
                                });

                                actualPointTest = 'start';

                                ii = 0;

                                break;
                            }

                        }

                    }

                }


                // do primeiro shape os segmentos
                var firstSegment = orderSegments.first(),
                    lastSegment = orderSegments.last();

                //verifico se o group formou um polygon 'fechado'
                if ((Math.abs((plane.utility.math.parseFloat(firstSegment.x, 3) - plane.utility.math.parseFloat(lastSegment.x, 3))) <= 2) &&
                    (Math.abs((plane.utility.math.parseFloat(firstSegment.y, 3) - plane.utility.math.parseFloat(lastSegment.y, 3))) <= 2)) {
                    return orderSegments;
                }

                return [];
            } else {
                return [];
            }
        }
    };

    function isOnlyShapes(group) {

        for (var i = 0; i < group.children.length; i++) {
            if (group.children[i].type === 'group') {
                return false;
            }
        }

        return true;
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