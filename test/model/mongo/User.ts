import { Document, Schema, model } from 'mongoose'

export interface UserModel extends Document {
    username: string,

}

const UserModelSchema: Schema = new Schema({
    username: {
        type: String
    }
})

export default model<UserModel>('user', UserModelSchema);