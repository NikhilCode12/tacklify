import express from 'express';
import bodyParser from 'body-parser';
const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

let tasks = [];
let task = "";

app.get('/',(req,res)=>{
    res.render('index.ejs',{
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