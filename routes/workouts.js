const express = require('express');

const { body } = require('express-validator');

const workoutsController = require('../controllers/workouts');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/workouts', isAuth, workoutsController.getWorkouts);

router.patch(
  '/workout/:workoutId',
  isAuth,
  [
    body('day.title', 'Invalid title')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('day.exercises.*.title', 'Invalid title')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('day.exercises.*.reps', 'Invalid reps')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('day.exercises.*.sets').trim().isInt().withMessage('Invalid sets'),
    body('day.exercises.*.rest').trim().isInt().withMessage('Invalid rest'),
    body('day.exercises.*.note', 'Invalid note')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
  ],
  workoutsController.addDay
);

router.post(
  '/workout',
  isAuth,
  [
    body('title', 'Invalid title')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').isISO8601().withMessage('Invalid end date'),
    body('days.*.title', 'Invalid title')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('days.*.exercises.*.title', 'Invalid title')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('days.*.exercises.*.reps', 'Invalid reps')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('days.*.exercises.*.sets').trim().isInt().withMessage('Invalid sets'),
    body('days.*.exercises.*.rest').trim().isInt().withMessage('Invalid rest'),
    body('days.*.exercises.*.note', 'Invalid note')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
  ],
  workoutsController.postWorkout
);

router.put(
  '/workout/:workoutId',
  isAuth,
  [
    body('title', 'Invalid title')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('exercises.*.title', 'Invalid title')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('exercises.*.reps', 'Invalid reps')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
    body('exercises.*.sets').trim().isInt().withMessage('Invalid sets'),
    body('exercises.*.rest').trim().isInt().withMessage('Invalid rest'),
    body('exercises.*.note', 'Invalid note')
      .isString()
      .trim()
      .isLength({ min: 1, max: 20 }),
  ],
  workoutsController.updateDay
);

router.patch(
  '/workout/exerciseIndex/:workoutId',
  isAuth,
  workoutsController.updateExerciseIndex
);

router.patch(
  '/workout/exerciseSession/:workoutId',
  isAuth,
  [
    body('weights.*').isNumeric().withMessage('Invalid weights'),
    body('record').isString().withMessage('Invalid record').trim(),
  ],
  workoutsController.updateExerciseSession
);

router.delete('/workout/:workoutId', isAuth, workoutsController.deleteWorkout);

router.delete('/workout/day/:workoutId', isAuth, workoutsController.deleteDay);

router.delete(
  '/workout/exercise/:workoutId',
  isAuth,
  workoutsController.deleteExercise
);

module.exports = router;
