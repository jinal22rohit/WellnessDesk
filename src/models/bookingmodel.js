const mongoose = require( 'mongoose')

const bookingSchema = new mongoose.Schema({
  userID: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
    empID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'employee'
    },
    therapyId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'therapy'
    },
    date : {
        type : Date
    },
    time : {
        type : String
    },
    status: {
        type: String,
        enum: ["booked", "cancelled", "completed"],
        default: "booked",
        index: true
    }
})

// Allow a slot to be re-booked if the previous booking was cancelled.
// NOTE: If you already have the old unique index in MongoDB, you must drop it once:
// db.bookings.dropIndex("empID_1_date_1_time_1")
bookingSchema.index(
  { empID: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } }
)

module.exports = mongoose.model('booking' ,bookingSchema)