const validators = require('./validators');

describe('validators', () => {
    describe('isEmail', () => {
        it('should return true for valid email', () => {
            expect(validators.emailString('scott@gmail.com')).toBe(true);
        });
        it('should return false for invalid email', () => {
            expect(validators.emailString('scott')).toBe(false);
        });
    });
    // describe('isPassword', () => {
    //     it('should return true for valid password', () => {
    //     expect(validators.isPassword('Password1!')).toBe(true);
    //     });
    //     it('should return false for invalid password', () => {
    //     expect(validators.isPassword('password')).toBe(false);
    //     });
    // });
});

