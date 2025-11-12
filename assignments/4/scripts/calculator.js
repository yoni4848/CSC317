const display = document.querySelector(".display");
const calculator = document.querySelector(".calculator");
let num1 = null;
let num2 = null;
let opp = null;
let waitingNum2 = false;
let resultShown = false;


const add = (num1, num2) => {
    return num1 + num2;
}
const sub = (num1, num2) => {
    return num1 - num2;
}
const mult = (num1, num2) => {
    return num1 * num2;
}
const div = (num1, num2) => {
    if (num2 === 0) {
        return "Err!";
    } else {
        return num1 / num2;
    }
}
const percent = (num1, num2) => {
    return (num1 * num2) / 100;
}

const calc = (num1, num2, opp) => {
    if (isNaN(num1) || isNaN(num2)) {
        return "Err!";
    }
    switch (opp) {
        case "+":
            return add(num1, num2);
        case "-":
            return sub(num1, num2);
        case "*":
            return mult(num1, num2);
        case "/":
            return div(num1, num2);
        case "%":
            return percent(num1, num2);
        default:
            return "Err!";
    }
}


calculator.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("num") || target.classList.contains("decimal")) {
        if (waitingNum2) {
            display.textContent = "";
            waitingNum2 = false;
        }
        if (display.textContent == "0" || resultShown) {
            display.textContent = target.textContent;
            if (resultShown){
                resultShown = false;
            }
        } else {
            display.textContent += target.textContent;
        }
    } else if (target.classList.contains("clear")) {
        display.textContent = "0";
    } else if (target.classList.contains("backspace")) {
        if (display.textContent.length === 1) {
            display.textContent = "0";
        } else {
            display.textContent = display.textContent.slice(0, -1);
        }
    } else if (target.classList.contains("opp")) {
        if (!waitingNum2) {
            num1 = Number(display.textContent);
            opp = target.getAttribute("data-value");
            waitingNum2 = true;
        }
    } else if (target.classList.contains("equals")){
        num2 = Number(display.textContent);
        let result = calc(num1, num2, opp);
        display.textContent = result.toString();
        resultShown = true;
    }

});