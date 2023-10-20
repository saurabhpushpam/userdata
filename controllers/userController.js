const userproduct = require("../models/productModel");
const user = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const bcryptjs= require('bcryptjs');

const config= require("../config/config");

const jwt= require("jsonwebtoken");

const nodemailer= require("nodemailer");

const randomstring= require("randomstring");



const create_token= async(id) =>{

    try{

        const token= await jwt.sign({_id:id }, config.secret_jwt);
        return token;

    }
    catch(error){
    res.status(400).send(error.message);
    }
}

const securePassword= async (password) => {
    try{
        const passwordHash= await bcryptjs.hash(password, 10);
        return passwordHash;
    }
     catch (error) {
       
        res.status(400).send(error.message);

     }
}

const register_user= async(req, res) =>{


    try{  

        const spassword= await securePassword(req.body.password);

        const users= new user({
             name: req.body.name,
             email: req.body.email,
             phone: req.body.phone,
             password: spassword,
             type: req.body.type


         

           // password: req.body.password,
            
            

        });



         const userData= await user.findOne({email: req.body.email});
         if(userData){
             res.status(200).send({success: false, msg: "This email is already exist"});

         }
         else{
             const user_data= await users.save();
             res.status(200).send({success: true, data: user_data});
         }

    }

    catch (error) {
        
       
        res.status(400).send(error.message);
    }
}

//login Method

 const user_login= async(req, res) => {
     try{

         const email= req.body.email;
         const password= req.body.password;


         const userData= await user.findOne({email: email});

         if(userData){

            // compare() is a function of bcryptjs, in that function we compare 2 values
            // first value "password" which user pass at the time of login
            // and second value "userData.password" means the original password stored in database

            const passwordmatch= await bcryptjs.compare(password, userData.password);

            if(passwordmatch){

                const tokenData= await create_token(userData._id);


                const userResult= {
                    _id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    phone: userData.phone,
                    type: userData.type,
                    token: tokenData
                    
                }

                const response= {
                    success: true,
                    msg: "User Details",
                    data: userResult

                }

                res.status(200).send(response);

            }
            else{
                res.status(200).send({success: false, msg:"login details are incorrect"});
            }

         }
         else{
            res.status(200).send({success: false, msg:"login details are incorrect"});
         }
     }
     catch (error){
         res.status(400).send(error.message);
     }
 }


// get all data
const getdetail = async (req, res) => {

    try {

        const data = await userproduct.find();
        const formattedData = data.map(item => ({

            id: item._id,
            title: item.title,
            description: item.description,
            price: item.price,
            image: item.images,
            imagePath: path.join(__dirname, '..', 'public/productImages', item.images) // Construct complete local image path

        }));

        // Send the formatted data as the response
        res.status(200).json(formattedData);


        //  res.status(200).send({success: true, msg: "All details :", data: data});

    } catch (error) {
        res.status(400).send(error.message);
    }

}


// get data by id
const getdetailbyid = async (req, res) => {
    try {

        //const id= req.body.id;
        const id = req.params.id;

        const data = await userproduct.findOne({ _id: id });

        if (data) {

            /*
                       const getImagePath = (imageName) => {
                           // Construct the path to the image in the 'public/images' directory
                           const imagePath = path.join(__dirname, '..', 'public', 'productImages', imageName);
                           return imagePath;
                       };
           
                       const imageName = data.images;
                       const imagePath = getImagePath(imageName);
                       const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
           
                       const responseData = {
                           id: data._id,
                           title: data.title,
                           description: data.description,
                           price: data.price,
                           images: data.images,
                           imagePath: imagePath,
                         //  image_Base64: `data:image/png;base64, ${imageBase64}`
                       };
           
                       res.json(responseData);
           */

            const imageName = data.images;
            const imagePath = path.join(__dirname, '..', 'public/productImages', imageName);
            res.status(200).send({ success: true, msg: "product details :", data: { data, imagePath } });

        } else {
            res.status(200).send({ success: false, msg: "id not found!" });
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}


// insert data
const insertproduct = async (req, res) => {

    try {

        const getdata = new userproduct({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            images: req.file.filename,
        });
        const product_data = await getdata.save();

        res.status(200).send({ success: true, msg: "product Details", data: product_data })

    }

    catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}


// update data
const updateproduct = async (req, res) => {
    try {

        const id = req.body.id;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const images = req.file.filename;

        const data = await userproduct.findOne({ _id: id });

        if (data) {

            const userData = await userproduct.findByIdAndUpdate({ _id: id }, {
                $set: {
                    title: title, description: description, price: price, images: images
                }
            });

            res.status(200).send({ success: true, msg: "your data has been updated" });

        } else {
            res.status(200).send({ success: false, msg: "id not found!" });
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}


// delete data
const deleteproduct = async (req, res) => {
    try {

        // const id= req.body.id;
        const id = req.params.id;


        const data = await userproduct.findOne({ _id: id });

        if (data) {

            const userData = await userproduct.deleteOne({ _id: id });

            res.status(200).send({ success: true, msg: "your data has been deleted" });

        } else {
            res.status(200).send({ success: false, msg: "id not found!" });
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}


// get image by imagename

const getimage = async (req, res) => {
    try {

        const image = req.params.image;


        const getImagePath = (imageName) => {
            // Construct the path to the image in the 'public/images' directory
            const imagePath = path.join(__dirname, '..', 'public', 'productImages', imageName);
            return imagePath;
        };

        const imageName = image;
        const imagePath = getImagePath(imageName);
        res.sendFile(imagePath);


    } catch (error) {
        res.status(400).send(error.message);
    }
}



// get image by id
const getimagebyid = async (req, res) => {
    try {

        const id = req.params.id;
        const data = await userproduct.findOne({ _id: id });
        if (data) {
            const image = data.images;

            const getImagePath = (imageName) => {
                // Construct the path to the image in the 'public/images' directory
                const imagePath = path.join(__dirname, '..', 'public', 'productImages', imageName);
                return imagePath;
            };


            const imageName = image;
            const imagePath = getImagePath(imageName);
            res.sendFile(imagePath);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}




module.exports = {
    getdetail,
    getdetailbyid,
    insertproduct,
    updateproduct,
    deleteproduct,
    getimage,
    getimagebyid,
    register_user,
    user_login

}