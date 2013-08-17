(function(){

	var Entity = function(engine, id, layer){
		this.engine = engine;
		this.id = id;
		this.layer = (layer === undefined) ? 0 : layer;

		this.components = {}; // {name: component}
	}

	/**
	 * addComponent / removeComponent:
	 * Add (takes component object) and Remove (takes name of component)
	 * edit the component list for this entity and inform the engine of
	 * those changes.
	 * NOTE: support chaining.
	 ***/
	Entity.prototype.addComponent = function(component){
		this.components[component.getName()] = component;
		this.engine.inform(component.getName(), this.id, C.ADD);
		return this;
	}

	Entity.prototype.removeComponent = function(name){
		delete this.components[name];
		this.engine.inform(name, this.id, C.REMOVE);
		return this;
	}

	/**
	 * get/has/getAll: some utility methods.
	 ***/
	Entity.prototype.getComponent = function(name){
		return this.components[name];
	}

	Entity.prototype.getAllComponents = function(){
		return this.components;
	}

	Entity.prototype.hasComponent = function(name){
		return (this.components[name] !== undefined);
	}

	Entity.prototype.getId = function(){
		return this.id;
	}

	/**
	 * serialize / deserialize: serialization processes for entities.
	 ***/
	Entity.prototype.serialize = function(){
		var ser = {};
		ser.id = this.id;
		ser.layer = this.layer;
		ser.components = {};

		for(var name in this.components){
			var comp = this.components[name];
			ser.components[name] = comp.serialize();
		}

		return JSON.stringify(ser);
	}

	Entity.prototype.deserialize = function(engine, json){
		var entity = engine.makeEntity(json.layer);

		for(var name in json.components){
			var masterComponent = SRLZ[name];
			if(masterComponent === undefined){
				throw "Error: component [" + name + "] is not in the global SRLZ dictionary";
			}
			var serializedComponent = json.components[name];
			var component = masterComponent.deserialize(JSON.parse(serializedComponent));
			entity.addComponent(component);
		}

		return entity;
	}

	/**
	 * destroy: removes any reference to this entity from this engine. If
	 * no additional references exist, it should be garbage collected.
	 ***/
	Entity.prototype.destroy = function(){
		// engine removes reference from all component lists
		for(var name in this.components){
			this.engine.inform(name, this.id, C.REMOVE);
		}
		// delete reference
		this.engine.deleteEntity(this.id, this.layer);
	}

	G.Entity = Entity;
	
})();