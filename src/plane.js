define("plane", ['require', 'exports'], function (require, exports) {

    var version = '3.0.0',
        authors = ['lilo@c37.co', 'ser@c37.co'];

    var types = require('utility/types');
    
    var layer = require('structure/layer'),
        point = require('structure/point'),
        shape = require('structure/shape'),
        group = require('structure/group'),
        tool = require('structure/tool');
    
    var importer = require('data/importer'),
        exporter = require('data/exporter');
    

    var centerHistory = types.data.list.create();

    var viewPort = null,
        _view = {
            zoom: 1,
            center: {
                x: 0,
                y: 0,
                reset: function () {

                    var layerActive = layerManager.active(),
                        centerInitial = {
                            x: (_view.size.width * _view.zoom) / 2,
                            y: (_view.size.height * _view.zoom) / 2
                        };


                    // utilizo o histórico de movimentação de centro 
                    // para retornar ao inicio
                    var moveFactor = {
                        x: 0,
                        y: 0
                    };

                    // calculando o centro através do histórico de movimentos
                    centerHistory.list().forEach(function (itemHistory) {
                        moveFactor.x += itemHistory.x;
                        moveFactor.y += itemHistory.y;
                    });

                    // aplicando o zoom atual na soma 
                    moveFactor.x *= _view.zoom;
                    moveFactor.y *= _view.zoom;

                    // negativo
                    moveFactor.x *= -1;
                    moveFactor.y *= -1;

                    // limpando os históricos de centro
                    centerHistory.clear();

                    // limpando os limites
                    _view.bounds.height = _view.size.height * _view.zoom;
                    _view.bounds.width = _view.size.width * _view.zoom;
                    _view.bounds.x = 0;
                    _view.bounds.y = 0;


                    _view.center.x += moveFactor.x;
                    _view.center.y += moveFactor.y;

                    // movimentando todos os shapes de todas as layers
                    layerManager.list().forEach(function (layer) {

                        layerManager.active(layer.uuid);

                        layerManager.active().shapes.list().forEach(function (shape) {
                            shape.moveTo(moveFactor);
                        });

                        layerManager.update();
                    });
                    layerManager.active(layerActive.uuid);

                    return true;
                },
                add: function (moveFactor) {

                    // adicionado ao histórico dos movimentos de centro
                    centerHistory.add({
                        x: moveFactor.x,
                        y: moveFactor.y
                    });

                    _view.center.x += moveFactor.x;
                    _view.center.y += moveFactor.y;

                    var layerActive = layerManager.active();
                    // movimentando todos os shapes de todas as layers
                    layerManager.list().forEach(function (layer) {

                        layerManager.active(layer.uuid);

                        layerManager.active().shapes.list().forEach(function (shape) {
                            shape.moveTo(moveFactor);
                        });

                        layerManager.update();
                    });
                    layerManager.active(layerActive.uuid);

                    return true;
                }
            },
            size: {
                height: 0,
                width: 0
            },
            bounds: {
                x: 0,
                y: 0,
                height: 0,
                width: 0
            }
        }


    function initialize(config) {
        if (config == null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (typeof config == "function") {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }
        if (config.viewPort == null) {
            throw new Error('plane - initialize - config is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }


        viewPort = config.viewPort;

        // iniciando configurações para View

        // o centro inicial
        _view.center.x = viewPort.clientWidth / 2;
        _view.center.y = viewPort.clientHeight / 2;

        // os limites de tamanho inicial
        _view.bounds.height = viewPort.clientHeight;
        _view.bounds.width = viewPort.clientWidth;

        // os tamanhos que são fixos
        _view.size.height = viewPort.clientHeight;
        _view.size.width = viewPort.clientWidth;


        tool.event.start({
            viewPort: viewPort
        });

        return true;
    }

    function clear() {
        // reset em center
        //        center({
        //            factor: 1,
        //            center: {
        //                x: _center.position.x * -1,
        //                y: _center.position.y * -1
        //            }
        //        });

        // remove em todas as layers
        layerManager.remove();

        return true;
    }

    // plane.view.zoom =/ .9;  - more
    // plane.view.zoom =* .9; - less
    var view = {
        get zoom() {
            return _view.zoom;
        },
        set zoom(value) {

            var layerActive = layerManager.active(),
                zoomFactor = value / _view.zoom;

            // com o valor do middle anterior para retroceder os valores sem perder a medida do centro
            var middlePrevious = {
                x: ((viewPort.clientWidth - (viewPort.clientWidth * _view.zoom)) / 2) * -1,
                y: ((viewPort.clientHeight - (viewPort.clientHeight * _view.zoom)) / 2) * -1,
            };
            // ATENÇÃO - os sinais!
            _view.bounds.x += middlePrevious.x;
            _view.bounds.y += middlePrevious.y;

            _view.bounds.height *= _view.zoom;
            _view.bounds.width *= _view.zoom;

            // com o meio atualizando pelo zoom
            var middleCurrent = {
                x: ((viewPort.clientWidth - (viewPort.clientWidth * value)) / 2),
                y: (viewPort.clientHeight - (viewPort.clientHeight * value)) / 2,
            };
            // atualizando os limites
            _view.bounds.x += middleCurrent.x;
            _view.bounds.y += middleCurrent.y;

            layerManager.list().forEach(function (layer) {

                layerManager.active(layer.uuid);

                layerManager.active().shapes.list().forEach(function (shape) {
                    shape.moveTo(middlePrevious);
                    shape.scaleTo(zoomFactor);
                    shape.moveTo(middleCurrent);
                });

                layerManager.update();
            });
            layerManager.active(layerActive.uuid);

            _view.zoom = value;
        },
        get center() {
            return _view.center;
        },
        set center(value) {
            // verificamos se o novo status de centro é realmente diferente do atual
            if (value && (value.x != 0 || value.y != 0) && (value.x != _view.center.x || value.y != _view.center.y)) {

                var layerActive = layerManager.active(),
                    // fator de movimento - calculando e atualizando com o zoom atual
                    moveFactor = {
                        x: (value.x - _view.center.x) * _view.zoom,
                        y: (value.y - _view.center.y) * _view.zoom
                    }

                // adicionado ao histórico dos movimentos de centro
                centerHistory.add({
                    x: value.x - _view.center.x,
                    y: value.y - _view.center.y
                });

                // movimentando todos os shapes de todas as layers
                layerManager.list().forEach(function (layer) {

                    layerManager.active(layer.uuid);

                    layerManager.active().shapes.list().forEach(function (shape) {
                        shape.moveTo(moveFactor);
                    });

                    layerManager.update();
                });
                layerManager.active(layerActive.uuid);

                // atualizando os valores para o centro com seus movimentos
                _view.center.x += (value.x - _view.center.x);
                _view.center.y += (value.y - _view.center.y);
            }
        },
        get bounds() {
            var boundsHistory = {
                x: 0,
                y: 0
            };

            // calculando o centro através do histórico de movimentos
            centerHistory.list().forEach(function (itemHistory) {
                boundsHistory.x += itemHistory.x;
                boundsHistory.y += itemHistory.y;
            });

            // aplicando o zoom atual na soma 
            boundsHistory.x *= _view.zoom;
            boundsHistory.y *= _view.zoom;

            // somando aos movimentos de zoom
            // calculando os limites
            return {
                x: _view.bounds.x + boundsHistory.x,
                y: _view.bounds.y + boundsHistory.y,
                height: _view.bounds.height,
                width: _view.bounds.width
            };
        },
        get size() {
            return _view.size;
        }
    }






    exports.initialize = initialize;
    exports.clear = clear;
    exports.view = view;
    
    exports.layer = layer;
    exports.point = point;
    exports.shape = shape;
    exports.group = group;
    exports.tool = tool;

    exports.importer = importer;
    exports.exporter = exporter;
});