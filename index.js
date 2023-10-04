import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import axios from 'axios';
const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb://127.0.0.1:27017/todoDB",{ useNewUrlParser: true, useUnifiedTopology: true}).then(db => {console.log("Database connected");}).catch(error => console.log("Could not connect to mongo db " + error));

const todoSchema = { name : String };

const TodoList = mongoose.model('todoList',todoSchema);

const task1 = new TodoList( {name : 'Welcome to To-do list web app!'} );
const task2 = new TodoList( {name : 'Click the + button to add a new task in the list.'} );
const task3 = new TodoList( {name : 'Check the checkbox to mark a task completed.'} );

const defaultTasks = [task1,task2,task3];
const worldTimeAPIURL = 'http://worldtimeapi.org/api/ip';

app.get('/',async (req,res)=>{
    try{
        const localTime = await axios.get(worldTimeAPIURL);
        const currentTime = localTime.data.datetime.slice(11,19) + `${localTime.data.datetime.slice(11,13) < 12 ? ' AM' : ' PM'}`;
        const tasks = await TodoList.find({});
        if(tasks.length === 0){
            TodoList.insertMany(defaultTasks);
            res.redirect('/');
        }
        else{
            res.render('index.ejs',{
                time: {
                    dd: localTime.data.datetime.slice(8,10),
                    mm: months[parseInt(localTime.data.datetime.slice(5,7)) - 1],
                    yyyy: localTime.data.datetime.slice(0,4),
                    time: currentTime
                },
                items : tasks,
            });
        }
    } catch(err){
        console.log(err);
    }
});

app.post('/',(req,res)=>{
    const taskName = req.body.task;
    const newTask = new TodoList({ name: taskName });
    newTask.save();
    res.redirect('/');
})

app.listen(port,()=>{
    console.log(`Listening on port : ${port}`);
})

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug","Sept", "Oct", "Nov", "Dec"
];