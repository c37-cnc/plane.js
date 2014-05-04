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

    var subscribers = [];

    return {

        subscribe: function () {


        },
        
//        notify: function(){
//            
//        },
//        
//        publish: function(){
//            
//        },
//        
//        advertise: function(){
//            
//        },

        unsubscribe: function () {

            
        }

    };

}(plane));