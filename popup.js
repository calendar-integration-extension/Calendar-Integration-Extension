var el = document.querySelector('demo');
if(el){
    el.addEventListener("click", myFunction);

    function myFunction() {
        document.getElementById("demo").style.color = "red";        
    }
}