import "/imports/api/availabilitiesCollection"; // Dont know what this is for..
import {Calendars} from "/imports/api/calendarsCollection";
import "/imports/logger";
import SlackAPI from 'node-slack';

const Slack = new SlackAPI("https://hooks.slack.com/services/" + process.env.FEEDSLACK);
//Import creates the collection on the server.
var verifyEmail = true;
var returnMailString = "Date your prof <noreply@wp12310502.server-he.de>";

Accounts.config({sendVerificationEmail: verifyEmail});

Meteor.startup(function () {
    // Listen to incoming HTTP requests, can only be used on the server
    WebApp.rawConnectHandlers.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
    logger.info('Meteor started!');
    // read environment variables from Meteor.settings
    if (Meteor.settings && Meteor.settings.env && _.isObject(Meteor.settings.env)) {
        for (var variableName in Meteor.settings.env) {
            process.env[variableName] = Meteor.settings.env[variableName];
        }
    }
    //get private key and add it to package
    reCAPTCHA.config({
        privatekey: process.env.RE_CAPTCHA
    });

    //add test user if missing
    if (Accounts.findUserByEmail("testuser@stud.fra-uas.de") === undefined) {
        Accounts.createUser({
            email: "testuser@stud.fra-uas.de",
            password: "testpass",
            profile: {name: "testname"}
        });
        console.log("testuser was missing - added successfully");
        var userid = Accounts.findUserByEmail("testuser@stud.fra-uas.de")._id;
        Meteor.users.update(userid, {$set: {"emails.0.verified": true}});
        console.log("...and verified");
    }

    //configure account email templates
    Accounts.emailTemplates.siteName = "Date your prof";
    Accounts.emailTemplates.from = returnMailString;

    //configure subject fields
    Accounts.emailTemplates.verifyEmail.subject = function (user) {
        return "Please verify your email, " + user.profile.name;
    };
    Accounts.emailTemplates.resetPassword.subject = function (user) {
        return "Password reset request from " + user.profile.name;
    };

    //configure text fields
    Accounts.emailTemplates.verifyEmail.text = function (user, url) {
        return "Thank you for choosing Date your prof, " + user.profile.name + "!\n"
            + " To activate your account, simply click the link below:\n\n"
            + url
            + "\n\n Thanks - Your Date your prof Team";
    };
    Accounts.emailTemplates.resetPassword.text = function (user, url) {
        return "A password reset has been requested by " + user.profile.name
            + "\n To reset your password, simply click the link below:\n\n"
            + url
            + "\n\n Thanks - Your Date your prof Team";
    };


});

Meteor.methods({
    "sendFeedback": function (name, email, place, message, server, currentBrowser, resolution, built) {
        //configure slack with an env variable
        let user = name;
        if (!user) user = "anonymous user";
        var git_title = "User reported: Error at " + place;
        var git_message = "**Delivered by:**%20" + user + "%0D%0A" +
                "**Server:**%20" + server + "%0D%0A" +
                "**Place:**%20" + place + "%0D%0A" +
                "**Description:**%20" + message + "%0D%0A" +
                "**Browser:**%20" + currentBrowser + "%0D%0A" +
                "**Resolution:**%20" + resolution + "%0D%0A" +
                "**Built:**%20" + built + "%0D%0A"
            ;
        Slack.send({
            text: user + " reported an error. Open a new Issue on <https://github.com/boredland/MeteorKalender/issues/new?title=" + git_title + "&body=" + git_message + "&labels=bug|Github>.",
            username: user,
            icon_url: "http://megaicons.net/static/img/icons_sizes/8/178/512/debug-bug-icon.png",
            attachments: [
                {
                    fallback: "An error has occurred to me.",
                    color: 'danger',
                    fields: [
                        {title: "Name", value: user},
                        {title: "E-Mail", value: email},
                        {title: "Server", value: server},
                        {title: "Place", value: place},
                        {title: "Description", value: message},
                        {title: "Browser", value: currentBrowser},
                        {title: "Resolution", value: resolution},
                        {title: "Built", value: built}
                    ]
                }
            ]
        });
    },

    "validateCaptcha": function (captchaData) {
        var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captchaData);
        if (!verifyCaptchaResponse.success) {
            console.log('reCAPTCHA check failed!', verifyCaptchaResponse);
            throw new Meteor.Error(422, 'reCAPTCHA Failed: ' + verifyCaptchaResponse.error);
            return false;
        } else
            console.log('reCAPTCHA verification passed!');

        return true;
    },

    "createUserAccount": function (options) {
        if (!Users.isAdmin(Meteor.userId())) {
            throw new Meteor.Error(403, "Access denied.");
        }

        var userOptions = {};
        if (options.username) userOptions.username = options.username;
        if (options.email) userOptions.email = options.email;
        if (options.password) userOptions.password = options.password;
        if (options.profile) userOptions.profile = options.profile;
        if (options.profile && options.profile.email) userOptions.email = options.profile.email;

        Accounts.createUser(userOptions);
    },
    "updateUserAccount": function (userId, options) {
        // only admin or users own profile
        if (!(Users.isAdmin(Meteor.userId()) || userId === Meteor.userId())) {
            throw new Meteor.Error(403, "Access denied.");
        }

        // non-admin user can change only profile
        if (!Users.isAdmin(Meteor.userId())) {
            var keys = Object.keys(options);
            if (keys.length !== 1 || !options.profile) {
                throw new Meteor.Error(403, "Access denied.");
            }
        }

        var userOptions = {};
        if (options.username) userOptions.username = options.username;
        if (options.email) userOptions.email = options.email;
        if (options.password) userOptions.password = options.password;
        if (options.profile) userOptions.profile = options.profile;
        if (options.profile && options.profile.email) {
            userOptions.email = options.profile.email;
        }
        if (options.roles) userOptions.roles = options.roles;

        if (userOptions.email) {
            var email = userOptions.email;
            delete userOptions.email;
            delete options.profile.email;
            Accounts.addEmail(userId, email, false);
            Accounts.emailTemplates.verifyEmail.text = function (user, url) {
                return 'You changed your e-mail address. Please confirm your new one by clicking on this link:' + url;
            };
            Accounts.sendVerificationEmail(userId, email);
        }

        var password = "";
        if (userOptions.password) {
            password = userOptions.password;
            delete userOptions.password;
        }

        if (userOptions) {
            for (var key in userOptions) {
                var obj = userOptions[key];
                if (_.isObject(obj)) {
                    for (var k in obj) {
                        userOptions[key + "." + k] = obj[k];
                    }
                    delete userOptions[key];
                }
            }
            Users.update(userId, {$set: userOptions}, function (error) {
                // do sth on success.
            });
        }

        if (password) {
            Accounts.setPassword(userId, password);
        }
    },
    "updateProfileEmail": function (userId, email) {
        var userOptions = {};
        if (email) userOptions.email = email;
        if (userOptions) {
            for (var key in userOptions) {
                var obj = userOptions[key];
                if (_.isObject(obj)) {
                    for (var k in obj) {
                        userOptions[key + "." + k] = obj[k];
                    }
                    delete userOptions[key];
                }
            }
            Users.update(userId, {$set: userOptions}, function (error) {
                // do sth on success.
            });
        }
    },

    /**
     *    Sends modified emails
     *
     *  @param options Expects an options object with the fields from, to, subject, text
     *
     */
    "sendMail": function (options) {
        this.unblock();
        options.from = returnMailString;
        options.subject = options.subject;
        options.text = options.text + "\n\n Thanks - Your Date your prof Team";
        Email.send(options);
    }
});

Accounts.onCreateUser(function (options, user_in) {
    user_in.roles = ["dozent"];
    if (options.profile) {
        options.profile.secure = Random.id();
        user_in.profile = options.profile;
    }
    Calendars.insert({
        userId: user_in._id,
        name: "Default calendar",
        location: "Default location",
        color: "#111111",
        published: true,
        linkslug: Random.id().substring(0, 4),
        defaultCalendar: true
    });
    return user_in;
});

Accounts.validateLoginAttempt(function (info) {

    // reject users with role "blocked"
    if (info.user && Users.isInRole(info.user._id, "blocked")) {
        throw new Meteor.Error(403, "Your account is blocked.");
    }

    if (verifyEmail && info.user && info.user.emails && info.user.emails.length && !info.user.emails[0].verified) {
        throw new Meteor.Error(499, "E-mail not verified.");
    }

    return true;
});


Users.before.insert(function (userId, doc) {
    if (doc.emails && doc.emails[0] && doc.emails[0].address) {
        doc.profile = doc.profile || {};
        doc.profile.email = doc.emails[0].address;
    }
});

Users.before.update(function (userId, doc, fieldNames, modifier, options) {
    if (modifier.$set && modifier.$set.emails && modifier.$set.emails.length && modifier.$set.emails[0].address) {
        modifier.$set.profile.email = modifier.$set.emails[0].address;
    }
});
if (Meteor.isServer) {
    Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {
        if (!!modifier.$set) {
            //check if the email was verified
            if (modifier.$set['emails.$.verified'] === true) {
                var verifiedMail = modifier.$pull['services.email.verificationTokens'];
                /* the mail we'd like to keep */
                var verifiedMail = verifiedMail.address;
                /* remove all other emails */
                for (var i = 0; i < doc.emails.length; i++) {
                    if (doc.emails[i].address !== verifiedMail) {
                        Accounts.removeEmail(doc._id, doc.emails[i].address);
                    }
                }
                /* Finally set the profiles email-adress to the new one */
                Users.update(doc._id, {$set: {'profile.email': verifiedMail}});
            }
        }
    });
    Push.Configure({
        gcm: {
            apiKey: process.env.GCMKEY,
            projectNumber: 460944506609
        }
        // production: true,
        // 'sound' true,
        // 'badge' true,
        // 'alert' true,
        // 'vibrate' true,
        // 'sendInterval': 15000, Configurable interval between sending
        // 'sendBatchSize': 1, Configurable number of notifications to send per batch
        // 'keepNotifications': false
    });
}

Accounts.onLogin(function (info) {

});

Accounts.urls.resetPassword = function (token) {
    return Meteor.absoluteUrl('reset_password/' + token);
};

Accounts.urls.verifyEmail = function (token) {
    return Meteor.absoluteUrl('verify_email/' + token);
};
