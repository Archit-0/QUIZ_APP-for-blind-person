import mongoose from "mongoose";   
const {Schema } = mongoose;

//**result modle */
const resultModel = new Schema({
    username :{type: String},
    result: {type: Array},
    attempts : {type:Number, default:0},
    points : {type:Number, default:0},
    achiever:{type:String, default:''},
    createdAt: {type: Date, default : Date.now}
})

export default mongoose.model('Result',resultModel); 