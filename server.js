const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');


const PORT = process.env.PORT || 3001;


const app = express();

// express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// gets the index.html page
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

//gets the notes.html page
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// gets the current notes saved in the database
app.get("/api/notes", (req, res) =>{
    fs.readFile("./db/db.json", "utf8", (err, data) =>{
        if(err){
            console.log(err);
            return;
        }
        const parsedNotes = JSON.parse(data);
        res.json(parsedNotes);
    });
});

// adds a new note to the database
app.post("/api/notes", (req, res)=>{
    const {title, text} = req.body;
    let newNote;

    if(title && text){
        newNote = {
            title, 
            text,
            id: uuidv4(),
        };

    }

    fs.readFile("./db/db.json", "utf8", (err, data) =>{
        console.log(data);
        if(err){
            console.log(err);
        }
        else{
            const currentNotes = JSON.parse(data);

            currentNotes.push(newNote);

            fs.writeFile("db/db.json", JSON.stringify(currentNotes, null, 4), (writeErr) => {
                writeErr ? console.log(writeErr) : console.info("Added new note!");
                res.sendFile(path.resolve('./db/db.json'));
            })
        }
    })
});

// deletes a note from the database
app.delete("/api/notes/:id", (req, res) =>{
    const {id} = req.params;

    fs.readFile("./db/db.json", "utf8", (err, data) =>{
        if(err){
            console.log(err);
        }
        else{
            const currentNotes = JSON.parse(data);

            const newNotes = currentNotes.filter((note) => {
                 return note.id != id; 
            });

            fs.writeFile("db/db.json", JSON.stringify(newNotes, null, 4), (writeErr) => {
                writeErr ? console.log(writeErr) : console.info("Removed note!");
                res.sendFile(path.resolve('./db/db.json'));
            })
        }
    })

});

app.listen(PORT, ()=>{
    console.log(`App listening at http://localhost:${PORT}`);
});