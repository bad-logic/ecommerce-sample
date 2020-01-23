const sum = (a, b) => {
    if (a && b) {
        return a + b;
    }
    throw new Error('Invalid Arguments');
}


// console.log(sum(2));

try {
    console.log(sum(2));
} catch (err) {
    console.log("Error Occured");
}
console.log("this works");