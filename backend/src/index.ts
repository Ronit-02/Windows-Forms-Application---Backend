import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 8000;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ping', (req: Request, res: Response) => {
    res.status(200).send("True");
});

app.post('/submit', (req: Request, res: Response) => {

    try{
        const formData = req.body;
        saveFormData(formData);

        res.status(200).json({ message: 'Form data saved successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/read/:id', (req: Request, res: Response) => {
    try{
        const id = parseInt(req.params.id);
        const submission = getSubmissionById(id);

        if(submission) {
            res.status(200).json(submission);
        } 
        else{
            res.status(404).json({ message: 'Submission not found' });
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/get-max-id', (req: Request, res: Response) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const submissions = JSON.parse(data);

        const maxId = submissions.length
        res.status(200).json({ maxId });
    } 
    catch (error) {
        console.error('Error reading form data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/search', (req: Request, res: Response) => {
    try{
        const email = req.query.email as string;
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const submissions = JSON.parse(data);
        const submission = submissions.find((submission: any) => submission.email.toLowerCase() === email);
        if (submission) {
            res.json(submission);
        } else {
            res.status(404).send({ error: 'Submission not found' });
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/delete/:id', (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const submissions = JSON.parse(data);

        const filteredSubmissions = submissions.filter((item: any) => item.id !== id);
        console.log(filteredSubmissions);

        fs.writeFileSync(DATA_FILE, JSON.stringify(filteredSubmissions, null, 2), 'utf-8');

        res.status(200).json({ message: 'Form data deleted successfully' });
    } 
    catch (error) {
        console.error('Error deleting form data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/update/:id', (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const formData = req.body;
        
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const submissions = JSON.parse(data);

        const index = submissions.findIndex((item: any) => item.id === id);
        if (index !== -1) {
            formData.id = id;
            submissions[index] = formData;
            fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
            res.status(200).json({ message: 'Form data updated successfully' });
        } else {
            res.status(404).json({ message: 'Submission not found' });
        }
    } 
    catch (error) {
        console.error('Error updating form data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const saveFormData = (formData: any) => {
    try{
        let submissions: any[] = [];
        if(fs.existsSync(DATA_FILE)){
            console.log('File exists')
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            submissions = JSON.parse(data);
        }

        // if(formData.id !== undefined){
        //     const index = submissions.findIndex((item) => item.id === formData.id);
        //     if(index !== -1){
        //         submissions[index] = formData;
        //     }
        //     else{
        //         submissions.push(formData);
        //     }
        // }
        // else{
            const id = submissions.length + 1;
            formData.id = id;
            submissions.push(formData);
        // }

        fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf8');
        console.log('Form data saved successfully')
    }
    catch(err){
        console.log(err);
    }
};

const getSubmissionById = (id: number) => {
    try{
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const submissions: any[] = JSON.parse(data);
        return submissions.find((item) => item.id === id);
    }
    catch(err){
        console.log(err);
    }
};

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})