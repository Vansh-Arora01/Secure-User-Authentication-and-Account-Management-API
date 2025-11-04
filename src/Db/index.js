import mongoose from "mongoose";

const connectDb = async()=>{
    try {
      await  mongoose.connect(process.env.MONGO_URL)
      console.log("🔔 Mongo db is connected")
      
    } catch (error) {
        console.error("🚨 Mongo db Connection error",error)
        process.exit(1)
        
    }
}

export default connectDb;