const mongoose = require("mongoose");

let dbconnect = async () => {
  // await mongoose.connect(`mongodb://localhost:27017/PlotVista`)
  await mongoose.connect(
    "mongodb://subaranjani_03:suba03@ac-c3llxlm-shard-00-00.k1ixxyu.mongodb.net:27017,ac-c3llxlm-shard-00-01.k1ixxyu.mongodb.net:27017,ac-c3llxlm-shard-00-02.k1ixxyu.mongodb.net:27017/PlotVista?ssl=true&replicaSet=atlas-jll1c6-shard-0&authSource=admin&appName=Cluster0",
  );
};
dbconnect()
  .then(() => console.log("db connect"))
  .catch((err) => console.log("dberr", err));
