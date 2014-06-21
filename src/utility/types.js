define("utility/types", ['require', 'exports'], function (require, exports) {

    var String = {

        Format: function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        },
        Contains: function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        }

    }

    var Data = {

        Dictionary: (function () {

            function Dictionary() {
                this.store = new Array();
            }

            Dictionary.prototype = {
                add: function (key, value) {
                    this.store[key] = value;
                },
                find: function (key) {
                    return this.store[key];
                },
                remove: function (key) {
                    delete this.store[key];
                },
                count: function () {
                    return Object.keys(this.store).length;
                },
                list: function () {
                    var self = this;
                    return Object.keys(this.store).map(function (key) {
                        return self.store[key];
                    });
                }
            }

            return Dictionary;
        })()

    }

    exports.String = String;
    exports.Data = Data;
});