const express = require('express')
const dotenv = require("dotenv").config();
const cors = require("cors");
const authRoutes = require('./src/routes/authroutes');
const userroutes = require('./src/routes/userRoutes');


//import dbconnect here
const dbconnect = require("./src/config/dbconnect");
dbconnect();


const path = require("path");
const app = express();
// Serve uploaded images (multer saves to `src/uploads/`).
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

//middleware
app.use(cors({
  origin: "https://wellness-desk.vercel.app" // your vercel URL
}));
app.use(express.json());

//testing
app.get("/", (req, res) => {
  res.send("WellnessDesk API is running 🚀");
});


//ROUTES for authentication
app.use("/api/auth",authRoutes);

// token verify and welcome part 
app.use("/api/users",userroutes );


//user routes for admin to search specific user
const userRoutes = require("./src/routes/userRoutes");
app.use("/api/searching",userRoutes);


//therapy routes
const therapyroute = require("./src/routes/therapyRoutes");
app.use("/api/therapy",therapyroute);
// Backward-compatible alias (older links may reference /therapyImage)
app.use("/therapyImage", express.static(path.join(__dirname, "src", "uploads")));

//contact model routes
const contactroute = require("./src/routes/contact_routes");
app.use("/contact", contactroute );


//model routes
const spaRoutes = require("./src/routes/spa.routes");
app.use("/api", spaRoutes);

// employee model routes

const employeeR = require("./src/routes/employee_routes");
app.use("/api/employee",employeeR);
 
//booking model routes

const bookingRoutes = require("./src/routes/booking_routes");
app.use("/api/booking",bookingRoutes);

// ✅ Add these two lines after your booking routes
const analyticsRoutes = require("./src/routes/analyticRoutes");
app.use("/api/analytics", analyticsRoutes);



// Backward-compatible mounts (older frontend / testing)
app.use("/emp", employeeR);
app.use("/book", bookingRoutes);




// start server
const PORT = process.env.PORT || 7002
app.listen(PORT,()=>{console.log(`server is running on port ${PORT}`)});



