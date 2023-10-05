import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import axios from 'axios';
const app = express();
const worldTimeAPIURL = 'http://worldtimeapi.org/api/ip';
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb+srv://admin-nikhil:test9958@tododb.dflpn5o.mongodb.net/todoDB",{ useNewUrlParser: true, useUnifiedTopology: true}).then(db => {console.log("Database connected");}).catch(error => console.log("Could not connect to mongo db " + error));

const todoSchema = { name : String };

const TodoList = mongoose.model('todoList',todoSchema);

const task1 = new TodoList( {name : 'Welcome to tacklify todo app.'} );
const task2 = new TodoList( {name : 'Click + button to add a new task.'} );
const task3 = new TodoList( {name : 'Click - button to delete a completed task.'} );

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
        const customListName = req.params.customListName.charAt(0).toUpperCase() +  req.params.customListName.toLowerCase().slice(1);
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
});

app.post('/remove',async (req,res)=>{
    try{
        const checkedTaskId = req.body.checkbox;
        const listname = req.body.listName;

        if(listname !== 'Welcome'){
            await CustomTodoList.findOneAndUpdate({name : listname}, {$pull : { xitems : {_id : checkedTaskId}}});
            res.redirect('/' + listname);
        } else{
            await TodoList.findByIdAndRemove({_id : checkedTaskId});
            res.redirect('/');
        }
    }
    catch(err){
        console.log(err);
    }
});

let port = process.env.PORT;
if(port == null || port == "") { port = 3000 };

app.listen(port,()=>{
    console.log(`Todo App Rendering Successful!`);
})

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug","Sept", "Oct", "Nov", "Dec"
];