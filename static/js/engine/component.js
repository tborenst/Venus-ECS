(function(){

	var Component = function(name){
		this.name = name;
	}

	Component.prototype.getName = function(){
		return this.name;
	}

	Component.prototype.serialize = function(){
		throw "Error: serialization process not yet implemented [component: " + this.name + "]";
	}

	Component.prototype.deserialize = function(){
		throw "Error: deserialization process not yet implemented [component: " + this.name + "]";
	}

	G.Component = Component;

})();