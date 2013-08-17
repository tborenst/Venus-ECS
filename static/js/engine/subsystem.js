(function(){

	var Subsystem = function(engine, name){
		this.engine = engine;
		this.name = name;
		this.requirements = [[]];    // entities must have these components [[AND] OR [AND]]
		this.bindings = {};          // for sys.on(msg, callback)
	}

	Subsystem.prototype.getName = function(){
		return this.name;
	}

	/**
	 * setRequirements: given an array of component names, or array of arrays, 
	 * this subsystem operate on entities that have these components in such a way that:
	 * - [[ONE, TWO], [TWO, THREE]]: have components (ONE *and* TWO) *or* (TWO *and *THREE)
	 * - [ONE, TWO, THREE]: have components (ONE *and* TWO *and* THREE)
	 ***/
	Subsystem.prototype.setRequirements = function(names){
		if(Util.isArray(names[0])){
			this.requirements = names;
		} else {
			this.requirements = [names]
		}
	}

	Subsystem.prototype.getRequirements = function(){
		return this.requirements;
	}

	/**
	 * step: process all entities that fit the requirements for this subsystem 
	 * using this subsystem's process function.
	 * NOTE: round is an integer that signifies that count this subsystem's step function
	 * has been called during *this particular engine.step()* function.
	 ***/
	Subsystem.prototype.step = function(deltaTime, entityIds, entityLayer, round){
		// NO-OP by default
	}

	/**
	 * emit: send a message to all other listening subsystems with some data.
	 ***/
	Subsystem.prototype.emit = function(msg, data){
		this.engine.subsystemEmit.apply(this.engine, [msg, data]);
	}

	/**
	 * on: listen to an inter-subsystem message and process the data received
	 * with a callback.
	 ***/
	Subsystem.prototype.on = function(msg, callback){
		this.bindings[msg] = callback;
	}

	/**
	 * engineSendsData: for use by the ECS game engine. This method will check
	 * whether the subsystem is listening to a particular message, and if it 
	 * does, pass the data into its callback and execute it.
	 ***/
	Subsystem.prototype.engineSendsData = function(msg, data){
		var callback = this.bindings[msg];
		if(callback !== undefined){
			callback.apply(this, [data]);
		}
	}

	G.Subsystem = Subsystem;

})();