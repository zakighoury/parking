const useRoutes = (app) => {
    // Welcome Route
    app.get("/", (req, res) => {
        res.send("welcome");
    });

    // User Routes
    const userRouter = require("../routes/user");
    app.use("/api/users", userRouter);

    // Auth Routes
    const authRouter = require("../routes/auth");
    app.use("/api/auth", authRouter);


    // // Image Routes
    // const imageRouter = require("../routes/image");
    // app.use("/api/images", imageRouter);

};

module.exports = useRoutes;