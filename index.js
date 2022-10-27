const express = require("express");
const { dev } = require("./config");
const { connectDB } = require("./config/db");
const morgan = require("morgan");
const { clientError, serverError } = require("./controllers/error");
const userRoute = require("./routes/route.user");
const adminRoute = require("./routes/routes.admin");


const app = express();

const port = dev.app.port || 3002;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));


app.get("/test", (req,res) => {
    res.status(200).render("test")
});

app.listen (port, async() => {
    console.log(`server is running at http://localhost:${port}`);
    await connectDB();
});

app.use(userRoute);
app.use("/admin",adminRoute)
app.use(clientError);
app.use(serverError);

