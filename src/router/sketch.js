const express = require('express')
const multer = require('multer')
const { spawn } = require('child_process');

const router = new express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './val')
    },
    filename: function (req, file, cb) {
      cb(null,file.originalname) //Appending .jpg
    },
    fileFilter(req, file, cb) {
        if(!file){
            return cb(new Error('must be file'))
        }
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('must be png, jpg or jpeg'))
        }
        cb(undefined, true)
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 1000000
    }
    
})

router.post('/sketch',upload.single('image'),async (req,res)=>{
    const argument = ["./main.py", "--image-size=320", "--direction=810"]
    const pyProg = spawn('python3', argument)
    try {
        if(!req.file) {
            res.status(400).send("must need be file")
        }
        else if(!req.file.originalname.match(/\.(jpg|jpeg|png)$/)){
            res.status(400).send("must be png jpg jpeg")
        }
        else{
            pyProg.stdout.on('data', function(data) {
            console.log('runPython func stdout : ' + data.toString());
            })
            pyProg.on('close', (code) => {
                console.log('runPython exit code : ' + code);
                    res.status(200).sendFile(req.file.originalname,{ root: './out' })
                
            })  
        }
    } catch (error) {
        res.send({error:error.message})
    }
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

module.exports= router