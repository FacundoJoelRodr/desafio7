import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ticketSchema = new mongoose.Schema({

    code:{ type: String, required: true, unique:true},
    purchase_datetime:{ type: Date, required: true},
    amount:{ type: Number, required: true},
    purchaser:{ type: String, required: true}

},{timestamps:true});

productSchema.plugin(mongoosePaginate);

export default mongoose.model('tickets', ticketSchema);