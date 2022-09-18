const { validationResult } = require('express-validator');

const Workout = require('../models/workout');

exports.getWorkouts = async (req, res, next) => {
  const userId = req.userId;
  try {
    const workouts = await Workout.find({ creator: userId });

    res.status(200).json({
      workouts: workouts,
      message: 'Fetched workouts',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postWorkout = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const title = req.body.title;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const days = req.body.days;

  if (days && !Array.isArray(days)) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    return next(error);
  }

  if (days) {
    try {
      days.forEach(day => {
        if (day.exercises && !Array.isArray(day.exercises)) {
          const error = new Error('Validation failed');
          error.statusCode = 422;
          throw error;
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  if (days) {
    days.forEach(day => {
      day.workoutCount = 0;
      day.exerciseIndex = -1;
      if (day.exercises) {
        if (day.exercises.length > 20) {
          const error = new Error(
            'You cannot add more than 20 exercises per day'
          );
          error.statusCode = 422;
          return next(error);
        }
        day.exercises.forEach(ex => {
          ex.record = [];
          ex.weights = [];
        });
      }
    });
  }

  const workout = new Workout({
    title: title,
    startDate: startDate,
    endDate: endDate,
    days: days,
    creator: req.userId,
  });

  try {
    const workoutsCount = await Workout.find({
      creator: req.userId,
    }).countDocuments();
    if (workoutsCount >= 10) {
      const error = new Error('You cannot add more workouts');
      error.statusCode = 401;
      throw error;
    }
    const newWorkout = await workout.save();

    res.status(201).json({
      workout: newWorkout,
      message: 'Workout created',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addDay = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const workoutId = req.params.workoutId;
  const day = req.body.day;

  if (day) {
    if (day.exercises && !Array.isArray(day.exercises)) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      return next(error);
    }
  }

  try {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      const error = new Error('Workout does not exist');
      error.statusCode = 404;
      throw error;
    }

    if (workout.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    if (workout.days.length >= 10) {
      const error = new Error('You cannot add more days');
      error.statusCode = 401;
      throw error;
    }
    day.workoutCount = 0;
    day.exerciseIndex = -1;
    if (day.exercises) {
      if (day.exercises.length > 20) {
        const error = new Error(
          'You cannot add more than 20 exercises per day'
        );
        error.statusCode = 422;
        throw error;
      }
      day.exercises.forEach(ex => {
        ex.record = [];
        ex.weights = [];
      });
    }
    workout.days.push(day);
    const result = await workout.save();
    res.status(200).json({
      message: 'Day added',
      workout: result,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateDay = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const workoutId = req.params.workoutId;
  const dayId = req.query.day;

  if (!dayId) {
    const error = new Error('No day found');
    error.statusCode = 404;
    return next(error);
  }
  const dayTitle = req.body.title;
  const exercises = req.body.exercises;

  if (exercises && !Array.isArray(exercises)) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    return next(error);
  }

  try {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      const error = new Error('No workout found');
      error.statusCode = 404;
      throw error;
    }

    if (workout.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    const day = workout.days.find(
      day => day.id.toString() === dayId.toString()
    );
    if (!day) {
      const error = new Error('No day found');
      error.statusCode = 404;
      throw error;
    }

    day.title = dayTitle;

    exercises.forEach(ex => {
      const dbex = day.exercises.find(
        dbex => dbex._id.toString() === ex._id?.toString()
      );
      if (!dbex) {
        if (day.exercises.length >= 20) {
          const error = new Error(
            'You cannot add more than 20 exercises per day'
          );
          error.statusCode = 422;
          throw error;
        }
        ex.weights = [];
        ex.record = [];
        day.exercises.push(ex);
        console.log(day.exercises);
      } else {
        dbex.title = ex.title;
        dbex.reps = ex.reps;
        dbex.sets = ex.sets;
        dbex.rest = ex.rest;
        dbex.note = ex.note;
      }
    });

    const newWorkout = await workout.save();
    console.log(newWorkout.days[0].exercises);
    res.status(200).json({
      workout: newWorkout,
      message: 'Day updated correctly',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateExerciseIndex = async (req, res, next) => {
  const workoutId = req.params.workoutId;
  const dayId = req.query.day;

  if (!dayId) {
    const error = new Error('No day found');
    error.statusCode = 404;
    return next(error);
  }

  try {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      const error = new Error('No workout found');
      error.statusCode = 404;
      throw error;
    }

    if (workout.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    const day = workout.days.find(
      day => day.id.toString() === dayId.toString()
    );

    if (!day) {
      const error = new Error('No day found');
      error.statusCode = 404;
      throw error;
    }

    if (day.exerciseIndex >= day.exercises.length - 1) {
      day.exerciseIndex = -1;
      day.workoutCount++;
    } else {
      day.exerciseIndex++;
    }

    const newWorkout = await workout.save();
    res.status(200).json({
      workout: newWorkout,
      message: 'Exercise index updated correctly',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateExerciseSession = async (req, res, next) => {
  const weights = req.body.weights;

  if (!weights) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    return next(error);
  }
  console.log(weights);
  if (weights && !Array.isArray(weights)) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    return next(error);
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const workoutId = req.params.workoutId;
  const dayId = req.query.day;
  const exerciseId = req.query.exercise;
  const record = req.body.record;

  if (!dayId) {
    const error = new Error('No day found');
    error.statusCode = 404;
    return next(error);
  }

  if (!exerciseId) {
    console.log(req.query);
    const error = new Error('No exercise found');
    error.statusCode = 404;
    return next(error);
  }

  try {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      const error = new Error('No workout found');
      error.statusCode = 404;
      throw error;
    }

    if (workout.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    const day = workout.days.find(
      day => day.id.toString() === dayId.toString()
    );

    if (!day) {
      const error = new Error('No day found');
      error.statusCode = 404;
      throw error;
    }

    const exercise = day.exercises.find(
      exercise => exercise.id.toString() === exerciseId.toString()
    );

    if (!exercise) {
      const error = new Error('No exercise found');
      error.statusCode = 404;
      throw error;
    }

    if (exercise.sets !== weights.length) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      throw error;
    }

    if (day.exerciseIndex >= day.exercises.length - 1) {
      day.exerciseIndex = -1;
      day.workoutCount++;
    } else {
      day.exerciseIndex++;
    }

    exercise.weights.push(weights);
    exercise.record.push(record);

    const newWorkout = await workout.save();
    res.status(200).json({
      workout: newWorkout,
      message: 'Exercise session updated correctly',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteWorkout = async (req, res, next) => {
  const workoutId = req.params.workoutId;

  try {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      const error = new Error('Workout does not exist');
      error.statusCode = 404;
      throw error;
    }

    if (workout.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    await Workout.findByIdAndRemove(workoutId);

    res.status(200).json({ message: 'Workout deleted' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteDay = async (req, res, next) => {
  const workoutId = req.params.workoutId;
  const dayId = req.query.day;

  if (!dayId) {
    const error = new Error('No day found');
    error.statusCode = 404;
    return next(error);
  }

  try {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      const error = new Error('Workout does not exist');
      error.statusCode = 404;
      throw error;
    }

    if (workout.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    const day = workout.days.find(
      day => day.id.toString() === dayId.toString()
    );

    if (!day) {
      const error = new Error('No day found');
      error.statusCode = 404;
      throw error;
    }

    workout.days.pull({ _id: dayId });

    const savedWorkout = await workout.save();

    res.status(200).json({ workout: savedWorkout, message: 'Day deleted' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteExercise = async (req, res, next) => {
  const workoutId = req.params.workoutId;
  const dayId = req.query.day;
  const exerciseId = req.query.exercise;

  if (!dayId) {
    const error = new Error('No day found');
    error.statusCode = 404;
    return next(error);
  }

  if (!exerciseId) {
    const error = new Error('No exercise found');
    error.statusCode = 404;
    return next(error);
  }

  try {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      const error = new Error('Workout does not exist');
      error.statusCode = 404;
      throw error;
    }

    if (workout.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    const day = workout.days.find(
      day => day.id.toString() === dayId.toString()
    );

    if (!day) {
      const error = new Error('No day found');
      error.statusCode = 404;
      throw error;
    }

    const dayIndex = workout.days.findIndex(
      day => day.id.toString() === dayId.toString()
    );

    const exercise = day.exercises.find(
      exercise => exercise.id.toString() === exerciseId.toString()
    );

    if (!exercise) {
      const error = new Error('No exercise found');
      error.statusCode = 404;
      throw error;
    }

    workout.days[dayIndex].exercises.pull({ _id: exerciseId });

    if (
      workout.days[dayIndex].exerciseIndex >=
      workout.days[dayIndex].exercises.length
    ) {
      workout.days[dayIndex].exerciseIndex--;
    }

    const savedWorkout = await workout.save();

    res
      .status(200)
      .json({ workout: savedWorkout, message: 'Exercise deleted' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
