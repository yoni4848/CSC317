const display = document.querySelector(".display");
const calculator = document.querySelector(".calculator");
let num1 = null;
let num2 = null;
let opp = null;
let waitingNum2 = false;


calculator.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("num") || target.classList.contains("decimal")) {
        if (display.textContent == "0") {
            display.textContent = target.textContent;
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
    }

});