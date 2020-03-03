var isSidebarReady = function () {
	if (document.body //detect the body is loaded
		&& document.querySelector('.sidebar')) {
		//scroll side bar to the current visited page
		var elCurrentAnchor = document.querySelector("a[href=\"" + window.location.pathname + "\"]");
        var currentPageOffsetTop = elCurrentAnchor.offsetTop;
		document.querySelector('.sidebar').scrollTop = currentPageOffsetTop - 20; //20px is a margin space

		//mark the current page CSS class
		elCurrentAnchor.classList.add('current');
		return;
	}

	window.requestAnimationFrame(isSidebarReady);
};
// IE10 or above
window.requestAnimationFrame(isSidebarReady);