const display = document.querySelector(".display");
const calculator = document.querySelector(".calculator");


calculator.addEventListener("click", (event)=>{
    console.log("hello")
    console.log(event.target.getAttribute("data-value"));
});