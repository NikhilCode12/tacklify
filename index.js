import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb://127.0.0.1:27017/todoDB",{ useNewUrlParser: true, useUnifiedTopology: true}).then(db => {console.log("Database connected");}).catch(error => console.log("Could not connect to mongo db " + error));

const todoSchema = {
    name : {
        type : String,
        required : true
    }
};

const TodoList = mongoose.model('todoList',todoSchema);


let tasks = [];
let task = "";

app.get('/',(req,res)=>{
    res.render('index.ejs',{
        date_time : 'today',
        task : task,
        array : tasks
    });
})

app.post('/',(req,res)=>{
    task = req.body.task;
    tasks.push(task);
    res.redirect('/');
})

app.listen(port,()=>{
    console.log(`Listening on port : ${port}`);
})