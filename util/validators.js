const passwordLength = (password) => {
    return password.length >= 8;
}

const containsNumber = (password) => {
    return /\d/.test(password);
}

const containsUpperCase = (password) => {
    return /[A-Z]/.test(password);
}

const containsLowerCase = (password) => {
    return /[a-z]/.test(password);
}

const containsSpecialChar = (password) => {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
}

const emailString = (email) => {
    //check valid email string
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
}

module.exports = {
    passwordLength,
    containsNumber,
    containsUpperCase,
    containsLowerCase,
    containsSpecialChar,
    emailString
}