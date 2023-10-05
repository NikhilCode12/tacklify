var itemSound = new Audio();
itemSound.src = '/public/sounds/item.mp3';
var trashSound = new Audio();
trashSound.src = '/public/sounds/trash.mp3';

var addButton = document.getElementById('add-new');
var removeButton = document.getElementById('checks');
addButton.addEventListener('click',()=>{ itemSound.play() });
removeButton.addEventListener('click',()=>{ trashSound.play() });