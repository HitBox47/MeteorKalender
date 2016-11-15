/**
 * Created by tobi on 15.11.16.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
export const Availabilities = new Mongo.Collection("availabilities");

if (Meteor.isServer) {
    // publication of Availabilities should only run on the server
    Meteor.publish('allAvailabilities', function tasksPublication() {
        return Availabilities.find();
    });
}

//methods can be called in every .js file which has "import { Meteor } from 'meteor/meteor';" .
Meteor.methods({
    'availabilities.insert'(userId, startDate, endDate, categoryId) {

        //if user doesnt have an ID (not logged in), he is not allowed to perform that action.
        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        /*
         checks whether values are of an excepted Type. This way a DB schema can be "enforced".
         ToDo: Replace it by aldeed:simple-schema
         */
        check(userId, String);
        check(categoryId, String);
        check(startDate, Date);
        check(endDate, Date);

        //finally, data are inserted into the collection
        Availabilities.insert({
            userId: userId,
            startDate: startDate,
            endDate: endDate,
            categoryId: categoryId,
            bookedBy: 'not booked yet'
        });
    },
});