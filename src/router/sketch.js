const express = require('express')
const multer = require('multer')
const { spawn } = require('child_process');
const shortId = require('shortid');   

const router = new express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './val')
    },
    filename: function (req, file, cb) {

        const uniqueFileName = shortId.generate();
        cb(null,uniqueFileName+ "_" +file.originalname) //Appending .jpg
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname){
            return cb(new Error('must be file'))
        }
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('must be png, jpg or jpeg'))
        }
        cb(undefined, true)
    }
    
})

const checkRange = (direction)=>{
    if(!direction) return "320"
    
    const range = ["110","210","310","410","510","610","710","810","120","220","320","420","520","620","720","820","130","230","330","430","530","630","730","830"]
    const newarr = range.filter((item)=> {return item===direction})
    
    if(newarr[0]) return newarr[0]
    return "320"
}

const imageResize = (size)=>{
    if(!size) return "320"
    if(size==="small") return "160"
    if(size==="medium") return "320"
    if(size==="large") return "480"
}

router.post('/sketch',upload.single('image'),async (req,res)=>{
    
    // 큐로하면 뭐가 좋을까
    // new) upload -> que.add -> redirect to /result -> send result 
    // ori) upload -> send result

    if(!req.file) res.status(400).send({error: "must have image"})
    const direction = checkRange(req.query.direction)
    const size= imageResize(req.query.size)

    const argument = ["./main.py", `--image-size=${size}`, `--direction=${direction}`,`--dir='${req.file.filename}'`]
    const pyProg = spawn('python3', argument,{shell: true})

    try {
            pyProg.stdout.on('data',(data)=>{
                console.log(data.toString())
            })
            pyProg.on('close', (code) => {
                console.log('runPython exit code : ' + code);
                    res.status(200).sendFile(req.file.filename,{ root: './out' })
                
            })  
    } catch (error) {
        res.send({error:error.message})
    }
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.post('/sketch/makegif',upload.single('image'),async (req,res)=>{
    if(!req.file) res.status(400).send({error: "must have image"})
    const size= imageResize(req.query.size)

    const argument = ["./main_gif.py", `--image-size=${size}`, `--dir='${req.file.filename}'`]
    const pyProg = spawn('python3', argument,{ shell: true })
    try {
        pyProg.stdout.on('data', function(data) {
             console.log(data.toString())
            })

        pyProg.on('close', (code) => {
            console.log('runPython exit code : ' + code);
            const makegif = spawn('python3',["./makegif.py",`--dir='${req.file.filename.split('.')[0]}'`],{shell:true})
            makegif.stdout.on('data',(data)=>{
                console.log(data.toString())
            })
            makegif.on('close', code =>{
                res.status(200).sendFile(req.file.filename.split('.')[0]+'.gif',{ root: '.' })
            })
            
        })  
        
    } catch (error) {
        res.send({error:error.message})
    }
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

module.exports= router