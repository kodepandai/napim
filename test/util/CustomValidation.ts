import {extendRule, extendMessages} from 'napim'
const CustomValidation = () => {
    console.log('custom validation')
    extendRule('even', (args) => {
        return {
            name: 'even',
            handler: (val: any)=>{
                console.log('even validation', val, args);
                return false
           }
       }
    });

    extendRule('unique', (args) => {
        return {
            name: 'unique',
            handler: (val: any)=>{
                console.log('unique validation', val, args);
                return false
           }
       }
    });

    extendMessages({
        even: 'The :attr value must be an even number.',
        unique: 'The attribute is unique.',
    })
}
export default CustomValidation