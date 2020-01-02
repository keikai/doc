window.onload = function(){
    //scroll side bar to the current visited page
    var currentPageOffsetTop = document.querySelector("a[href=\"" + window.location.pathname + "\"]").offsetTop;
    document.querySelector('.sidebar').scrollTop = currentPageOffsetTop;
}