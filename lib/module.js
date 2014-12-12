var define, require;

// http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
(function () {
    var registry = {},
        modules = {};

    define = function (name, dependencies, callback) {
        registry[name] = {
            dependencies: dependencies,
            callback: callback
        };
    };

    require = function (name) {

        if (modules[name]) {
            return modules[name];
        }
        modules[name] = {};

        var module = registry[name];
        if (!module) {
            throw new Error("Module '" + name + "' not found.");
        }

        var dependencies = module.dependencies,
            callback = module.callback,
            parameters = [],
            exports = {};

        for (var i = 0, l = dependencies.length; i < l; i++) {
            if (dependencies[i] == 'require') {
                parameters.push(require);
            } else if (dependencies[i] == 'exports') {
                parameters.push(exports);
            } else {
                parameters.push(require(dependencies[i]));
            }
        }

        var concrete = callback.apply(this, parameters);
        return modules[name] = exports || concrete;
    };
})();