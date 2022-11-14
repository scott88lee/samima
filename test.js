function check(word) {
    return word.length >= 8 || {message: "Too short"};
}

console.log( check("123412567") );