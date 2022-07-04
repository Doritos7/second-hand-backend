
const { ref, uploadBytes, deleteObject } =  require("firebase/storage")
const { storage } = require("../../config/firebaseConfig")
var path = require('path');
global.XMLHttpRequest = require("xhr2")

const uploudImage = async (req) => {
    try {
        // Grab the file
        const file = req.file;
        // Format the filename
        const fileName = req.user.id + '_' + Date.now() + '_' +  Math.floor(Math.random() * 100000) + path.extname(file.originalname)
        // Step 1. Create reference for file name in cloud storage 
        const imageRef = ref(storage, `images/${fileName}`)
        // Step 2. Upload the file in the bucket storage
        return await uploadBytes(imageRef, file.buffer, { contentType: 'image/jpeg' })
    } catch (error) {
        console.log(error)
        return response(res, 500, false, "Internal Server Error", null);
    }
}

const deleteImage = async (url) => {
    try {
        const imageRef = ref(storage, `images/${url}`)
        return await deleteObject(imageRef)
    } catch (error) {
        console.log(error)
        return response(res, 500, false, "Internal Server Error", null);
    }
}

module.exports = { uploudImage, deleteImage }