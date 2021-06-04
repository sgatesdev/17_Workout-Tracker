const router = require('express').Router();
const Workout = require('../../models/Workout');

router.post('/workouts', (req,res) => {
    let newWorkout = new Workout(req.body);

    newWorkout.save((err,workout) => {
        if(err) return res.json(err);

        console.log(`Workout from ${workout.day} added!`);
        res.json(workout);
    });
});

router.put('/workouts/:id', async (req,res) => {
    // pull this workout out of database
    let currentWorkout = await Workout.findOne({ _id: req.params.id });
    // if it doesn't exist, send back an error
    if(!currentWorkout) {
        return res.json('Error! Workout not found.');
    }
    // take exercises array out of returned data
    // push new data into it 
    const { exercises } = currentWorkout;
    exercises.push(req.body);

    // update record in DB with new info
    const updatedRecord = await currentWorkout.save(
        { exercises: exercises }
    );

    if(!updatedRecord) {
        res.json({ message: 'Error updating record!' });
    }
    else {
        // send back updated record
        res.json(updatedRecord);
    }
    console.log(updatedRecord)
});


router.get('/workouts', async (req,res) => {
    // return day, exercise fields AND get total exercise duration
    let getDurations = await Workout.aggregate([
        {
            $project: {
                day: 1,
                exercises: 1,
                totalDuration: { $sum: "$exercises.duration" }
            }
        }
    ]);

    res.json(getDurations);
});

router.get('/workouts/range', async (req,res) => {
    const workouts = await Workout.find({}).limit(7);

    res.json(workouts);
});

module.exports = router;