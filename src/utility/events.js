/**
In other terms, producers publish
information on a software bus (an event
manager) and consumers subscribe to the
information they want to receive from
that bus. 


Subscribers register
their interest in events by typically
calling a subscribe() operation on the
event service, without knowing the effective
sources of these events. This subscription
information remains stored in
the event service and is not forwarded
to publishers. The symmetric operation
unsubscribe() terminates a subscription.

To generate an event, a publisher typically
calls a publish() operation. The
event service propagates the event to all
relevant subscribers; it can thus be viewed
as a proxy for the subscribers.
*/
plane.utility.events = (function (plane) {
    "use strict";

    Object.prototype.addEventListener = function (type, fn) {

        if ((this[type]) && (this[type] instanceof Function)) {
            var firstFn = this[type];

            this[type] = [];
            this[type].push(firstFn);
            this[type].push(fn);

            return this;
        } else if ((this[type]) && (this[type] instanceof Array)) {
            this[type].push(fn);
        } else {
            this[type] = fn;
        }

        return this;
    }

    Object.prototype.dispatchEvent = function (type, params) {

        if ((this[type] == undefined) || (this[type] == null)) {
            throw new Error('Event is not defined');
        }

        if (this[type] instanceof Function) {
            this[type](params);
        } else if (this[type] instanceof Array) {
            for (var i = 0; i <= this[type].length - 1; i++) {
                this[type][i].call(this, params);
            }
        }

        return this;
    }

})(plane);