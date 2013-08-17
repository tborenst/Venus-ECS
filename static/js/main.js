window.onload = function(){
	Util.include(
		["./js/engine/venus.js"],
		 Main);
}

var Main = function(){
	// make globals readily available in this scope
	Util.dumpToScope(G, this);

	setInterval(function(){
		V.step();
	}, 1000/60);

}