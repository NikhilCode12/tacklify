import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import axios from 'axios';
const app = express();
const port = 3000;
const worldTimeAPIURL = 'http://worldtimeapi.org/api/ip';
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb://127.0.0.1:27017/todoDB",{ useNewUrlParser: true, useUnifiedTopology: true}).then(db => {console.log("Database connected");}).catch(error => console.log("Could not connect to mongo db " + error));

const todoSchema = { name : String };

const TodoList = mongoose.model('todoList',todoSchema);

const task1 = new TodoList( {name : 'Welcome to To-do list web app!'} );
const task2 = new TodoList( {name : 'Click the + button to add a new task in the list.'} );
const task3 = new TodoList( {name : 'Check the checkbox to mark a task completed.'} );

const defaultTasks = [task1,task2,task3];

const customTodoSchema = {
    name : String,
    xitems : [todoSchema] 
}

const CustomTodoList = mongoose.model('customList',customTodoSchema);

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
                title : 'Welcome',
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

app.get('/:customListName',async (req,res)=>{
    try{
        const localTime = await axios.get(worldTimeAPIURL);
        const currentTime = localTime.data.datetime.slice(11,19) + `${localTime.data.datetime.slice(11,13) < 12 ? ' AM' : ' PM'}`;
        const customListName = req.params.customListName;
        const cList = await CustomTodoList.findOne({name : customListName});

        if(!cList){
            const list = new CustomTodoList({
                name : customListName,
                xitems : defaultTasks
            });
            list.save();
            res.redirect('/' + customListName);
        }
        else{
            res.render('index.ejs',{
                title : cList.name,
                time: {
                    dd: localTime.data.datetime.slice(8,10),
                    mm: months[parseInt(localTime.data.datetime.slice(5,7)) - 1],
                    yyyy: localTime.data.datetime.slice(0,4),
                    time: currentTime
                },
                items: cList.xitems,
            });
        }
    }catch(err){
        console.log(err);
    }
});

app.post('/', async (req,res)=>{
    const taskName = req.body.task;
    const listName = req.body.list;
    const newTask = new TodoList({ name: taskName });

    if(listName === 'Welcome'){
        newTask.save();
        res.redirect('/');
    } else{
        const newItem  = await CustomTodoList.findOne({name : listName});
        newItem.xitems.push(newTask);
        newItem.save();
        res.redirect('/'+ listName);
    }
})

app.post('/remove',async (req,res)=>{
    const checkedTaskId = req.body.checkbox;
    await TodoList.findByIdAndRemove({_id : checkedTaskId});
    res.redirect('/');
});

app.listen(port,()=>{
    console.log(`Listening on port : ${port}`);
})

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug","Sept", "Oct", "Nov", "Dec"
];