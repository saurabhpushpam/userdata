const express= require("express");
const get_route= express();

const user_controller= require("../controllers/userController");

const bodyParser= require("body-parser");
get_route.use(bodyParser.json());
get_route.use(bodyParser.urlencoded({extended: true}));
const auth= require("../middleware/auth");

const multer= require("multer");
const path= require("path");


get_route.use(express.static('public'));

const storage= multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, '../public/productImages'), function(err, success){

            if(err){
                throw err
            }

        });
    },
    
    filename: function(req, file, cb){

        const name= Date.now()+'-'+file.originalname;
        cb(null, name, function(error, success){

            if(error){
                throw error
            }

        });

    }
});

const upload= multer({storage: storage});

//get_route.get('/get-data', user_controller.getdetail);
get_route.get('/get-databyid/:id', auth, user_controller.getdetailbyid);
get_route.post('/register', user_controller.register_user);
get_route.post('/login', user_controller.user_login);
get_route.post('/post-data', upload.single('images'), auth, user_controller.insertproduct);
get_route.post('/update', upload.single('images'), auth, user_controller.updateproduct);
get_route.post('/delete/:id', auth,  user_controller.deleteproduct);
//get_route.get('/get-image/:image', user_controller.getimage);
get_route.get('/get-imagebyid/:id', auth, user_controller.getimagebyid);


module.exports= get_route;

// const auth= require("../middleware/auth");
// product_route.post('/add-product', upload.array('images', 8), auth, product_controller.addproduct);
//get_route.get('/get-data', user_controller.product);