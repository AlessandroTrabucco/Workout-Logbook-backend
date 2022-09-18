const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  reps: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
  },
  rest: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  record: [{ type: String }],
  weights: [{ type: [{ type: Number }] }],
});

const daySchema = new Schema({
  title: { type: String, required: true },
  workoutCount: { type: Number, required: true },
  exerciseIndex: { type: Number, required: true },
  exercises: [exerciseSchema],
});

const workoutSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  days: [daySchema],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Workout', workoutSchema);
