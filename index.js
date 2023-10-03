import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
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
let newTask = "";

app.get('/',async (req,res)=>{
    try{
        const tasks = await TodoList.find({});
        if(tasks.length === 0){
            TodoList.insertMany(defaultTasks);
        }
        res.render('index.ejs',{
            date_time : 'today',
            item : newTask,
            items : tasks,
        });
    } catch(err){
        console.log(err);
    }
});

app.post('/',(req,res)=>{
    newTask = req.body.task;
    defaultTasks.push(newTask);
    res.redirect('/');
})

app.listen(port,()=>{
    console.log(`Listening on port : ${port}`);
})