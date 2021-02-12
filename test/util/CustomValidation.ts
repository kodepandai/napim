const niv = require('node-input-validator')

export const extendRule = () => {
    niv.extend('even', () => {
        console.log('even');

        return {
            name: "even",
            handler: (value: any) => {
                console.log('val', value);

                return false
            },
        };
    });
    niv.extend('unique', (args: any) => {
        console.log('arg', args);
        return {
            name: 'unique',
            handler: (v: any) => {
                return false;
            }
        }

    })

    niv.Messages.extend({
        even: 'The :attr value must be an even number.',
        unique: 'The attribute is unique.',
    })
}