var isSidebarReady = function () {
	if (document.body && document.querySelector('.sidebar')) {
        //scroll side bar to the current visited page
        var currentPageOffsetTop = document.querySelector("a[href=\"" + window.location.pathname + "\"]").offsetTop;
        document.querySelector('.sidebar').scrollTop = currentPageOffsetTop;
		return;
	}

	window.requestAnimationFrame(isSidebarReady);
};
// IE10 or above
window.requestAnimationFrame(isSidebarReady);