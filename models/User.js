// const UserSchema = new mongoose.Schema({
//     username: String,
//     email: String,
//     cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }
//   });

const UserSchema = new mongoose.Schema({
    email: {
    type: String,
    required: true,
    },
    username: {
    type: String,
    required: true
    },
    avatar: { type: String, default: "" }
    
    })