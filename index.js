const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = process.env.port || 3000;
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
const cookieparser = require('cookie-parser'); //session data store in cookie
const session = require('express-session');
app.use(cookieparser());
const oneday = 1000 * 60 * 60 * 24;
app.use(session({
    saveUninitialized: true, //session data(clint request) came then save
    resave: false, //one server =>many tab open {multipal request handel}
    secret: 'sujay2k0@3kd9or78', //security no hackabale
    cookie: { maxAge: oneday }
}));

//*router connection  (authnatication)
const router = require('./Routers/allrouter');
app.use('/users', authontication, router);
function authontication(req, res, next) {
    if (req.session.username) {
        next();
    }
    else {
        res.redirect('/');
    }
}

//*view engine
app.set('view engine', 'ejs');
//*End Point
app.get('/', (req, res) => {
    res.render('login');
})
//*Session use: and store data cookies
app.get('/login', (req, res) => { //login endpoint means submit 
    if (req.session.username) {
        res.redirect('/dashboard');
    }
    else {
        res.render('login');
    }
})
app.get('/dashboard', (req, res) => {
    if (req.session.username) {
        res.render('dashboard');
    }
    else {
        res.redirect('/login');
    }
})
//*Login
app.post('/login', (req, res) => {
    fs.readFile('./database.txt', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            //console.log(data);
            const alldata = JSON.parse(data);
            const viewdata = alldata.filter((item) => {
                if (item.username === req.body.uname && item.password === req.body.upass) {
                    return true;
                }
            })
            if (viewdata.length == 0) {
                res.send('/invalid password');
            }
            else {
                req.session.username = req.body.uname;
                const dynamic = {
                    name: "Dashboard-Page"
                }
                res.render('dashboard', { page: dynamic.name });
            }
        }
    })
})

//*Signup :
app.get('/signup', (req, res) => {
    res.render('signup');
})
app.post('/open', (req, res) => {
    const fromdata = {
        username: req.body.uname,
        password: req.body.upass
    }
    fs.readFile('./database.txt', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            //console.log(data);
            const objdata = JSON.parse(data) || [];
            objdata.push(fromdata);
            const listdata = JSON.stringify(objdata);
            console.log(listdata)
            fs.writeFile('./database.txt', listdata, (err, data) => {
                if (err) {
                    console.log(err);
                }
                else {
                    // res.send("Signup sucesfull");
                    res.redirect('/login');
                }
            })
        }
    })
})

//*pasword chane :

app.get('/password', (req, res) => {
    res.render('change');
})
app.post('/password', (req, res) => {
    const oldpassword = req.body.password;
    const newpassword = req.body.newpassword;
    const confirmpassword = req.body.conpassword;
    // console.log(oldpassword);
    // console.log(newpassword);
    // console.log(confirmpassword);
    if (newpassword === confirmpassword) {
        //res.send('sucessfull change'); 
        res.redirect('/login');
        console.log('password update');
    }
    else {
        res.send(`<h1>Not same new & confirm password</h1>`);
    }

})

//*Ejs page : Product
app.get('/users/product', (req, res) => {
    //res.render('product')
    fs.readFile('./product.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            //console.log(data);
            let productdata = JSON.parse(data);
            res.render('product',
                {
                    PRODUCT: productdata,
                    Name: "Prodcut Ejs page"
                });
        }
    })
})

//* Product details :

app.get('/productDetails/:id',(req,res)=>{
    fs.readFile('./product.json','utf-8',(err,data)=>{
        //console.log(data);
        let alldata=JSON.parse(data);
        let newdata=alldata.filter((item)=>{
            if(item.id==req.params.id){
                return true;
            }
             
        })  

        //!res.send(newdata);

        const djdata=newdata.forEach((x)=>{
            console.log(x);
        res.render('oneproduct',
        {
            Alldata:x,
            Name:"Chose Product Page:"
        });
        })
    })
}) 


//*Logout from 
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})
app.listen(port, () => {
    console.log(`Running the port no ${port}`);
})