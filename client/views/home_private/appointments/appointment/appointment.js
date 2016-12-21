var pageSession = getDefaultPageSession();

Template.Appointment.events({
    "click #dataview-cancel-button": function(e) {
        // Das hier sollte halt dann ein Inhalt aus einem Freitextfeld im Modaldialog sein.
        var reason;
        e.preventDefault();
        var prompt = bootbox.prompt({
            animate: false,
            title: "Please provide a reason for your cancellation:",
            inputType: "textarea",
            value: "Ex.: Sadly i am ill today.",
            callback: function(result){
                if (result === null) {
                    // Prompt dismissed
                } else {
                    reason = result;
                    prompt.modal('hide');
                    bootbox.dialog({
                        title: "Cancel appointment",
                        animate: false,
                        message: "Would would you like to do with the availability?",
                        buttons: {
                            yescancel: {
                                label: "Yes, and delete availability",
                                className: "btn-primary",
                                callback: function() {
                                    Meteor.call('booking.cancelByOwner',getCurrentAvailabilityId(),reason, function(error, result){
                                        if (!error){
                                            Meteor.call('availabilities.remove',getCurrentAvailabilityId());
                                            Router.go('home_private.appointments');
                                        }
                                    });
                                }
                            },
                            yeskeep: {
                                label: "Yes, and keep availability",
                                className: "btn-primary",
                                callback: function () {
                                    Meteor.call('booking.cancelByOwner',getCurrentAvailabilityId(),reason,function (error,result) {
                                        if (!error){
                                            Router.go('home_private.appointments');
                                        }
                                    });
                                }
                            },
                            no: {
                                label: "No",
                                className: "btn-default"
                            }
                        }
                    })
                }
            }
        });
    },
    "click #Back-button": function(e, t) {
        e.preventDefault();
        history.back();
    }
});

Template.Appointment.helpers({
    getPageSession: function () {
        return pageSession
    },
    getAppointment: function () {
        return Availabilities.findOne({})
    }
});
