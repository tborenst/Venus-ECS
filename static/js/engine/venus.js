// constants
var C = {
	// commands
	ADD: "ADD",
	REMOVE: "REMOVE"
}
window.C = C;

// globals
var G = {};
window.G = G;

// serialization globals
var SRLZ = {};
window.SRLZ = SRLZ;

Util.include(["./js/engine/entity.js",
			  "./js/engine/component.js",
			  "./js/engine/subsystem.js"],
function(){

	// engine
	(function(){
		var uid = 0;
		var Venus = function(){
			this.entities = [];    // [{id: entity}, ...] (starts empty, changes in makeEntity())
			this.components = {};  // {name: [entity_id...]} 
			this.subsystems = {};  // {name: subsystem}
		}
		window.V = new Venus();

		//=================//
		// GENERAL METHODS //
		//=================//

		/**
		 * addConstant: registers a global constant that can be accessed
		 * in the 'C' object. 
		 * NOTE: can be used like so: V.addConstant("GOOD");
		 ***/
		Venus.prototype.addConstant = function(key, val){
			if(val !== undefined){
				C[key] = val;	
			} else {
				C[key] = key;
			}	
		}

		/**
		 * addGlobal: registers a global object that can be accessed
		 * in the 'G' object.
		 ***/
		Venus.prototype.addGlobal = function(key, val){
			if(val !== undefined){
				G[key] = val;	
			} else {
				G[key] = key;
			}
		}

		/**
		 * addSRLZ: registers a component class to a name that can then
		 * be used to deserialize components based on that class.
		 ***/
		Venus.prototype.addSRLZ = function(name, compClass){
			SRLZ[name] = new compClass();
		}

		//=======================//
		// SERIALIZATION METHODS //
		//=======================//

		/**
		 * serialize: returns a string that contains the current state of the
		 * engine. It can be deserialized using the deserialize function.
		 ***/
		Venus.prototype.serialize = function(){
			var serializedEntities = [];

			for(var i = 0; i < this.entities.length; i++){
				var entityLayer = this.entities[i];
				var serializedLayer = {};
				for(var j in entityLayer){
					serializedLayer[j] = entityLayer[j].serialize();
				}
				serializedEntities.push(serializedLayer);
			}

			return JSON.stringify({entities: serializedEntities});
		}

		/**
		 * deserialize: given a json object, parsed using a string given from
		 * the serialize function, revert the engine to the state given by that
		 * json.
		 ***/
		Venus.prototype.deserialize = function(json){
			uid = 0;
			this.entities = [{}];
			this.components = {};

			var Entity = G.Entity;

			for(var i = 0; i < json.entities.length; i++){
				var serializedLayer = json.entities[i];
				for(var j in serializedLayer){
					Entity.prototype.deserialize(this, JSON.parse(serializedLayer[j]));
				}
			}
		}

		//================//
		// ENTITY METHODS //
		//================//

		var Entity = G.Entity;

		/**
		 * makeEntity: returns a new entity with a unique ID.
		 * NOTE: layer - designated entity layer (default 0)
		 ***/
		Venus.prototype.makeEntity = function(layer){
			if(layer === undefined){
				layer = 0; 
			}
		 	var id = uid++;
		 	var entity = new Entity(this, id, layer);

		 	if(this.entities[layer] === undefined){
		 		this.entities[layer] = {};
		 	}

		 	this.entities[layer][id] = entity;
		 	return entity;
		}

		/**
		 * getEntity: by id.
		 ***/
		Venus.prototype.getEntity = function(id, layer){
			// if given layer
			if(layer !== undefined){
				return this.entities[layer][id];
			}

			// otherwise search through all layers
			for(var i = 0; i < this.entities.length; i++){
				var entityLayer = this.entities[i];
				if(entityLayer !== undefined && entityLayer[id] !== undefined){
					return entityLayer[id];
				}
			}

			// if not found, return null
			return null;
		}

		/**
		 * deleteEntity: delete reference of entity from entities list only. 
		 * Before calling this you should destroy() the entity itself (i.e. 
		 * remove all of its components).
		 ***/
		Venus.prototype.deleteEntity = function(id, layer){
			// if given layer
			if(layer !== undefined){
				delete this.entities[layer][id];
			} else {
				// otherwise search through all layers
				for(var i = 0; i < this.entities.length; i++){
					var entityLayer = this.entities[i];
					if(entityLayer[id] !== undefined){
						delete entityLayer[id];
					}
				}
			}
		}

		/**
		 * entityIsInLayer: is the entity with 'id' in layer 'layer'?
		 ***/
		Venus.prototype.entityIsInLayer = function(id, layer){
			if(this.entities[layer] !== undefined && (id in this.entities[layer])){
				return true;
			} else {
				return false;
			}
		}

		/**
		 * inform: let the engine know that you have added/removed
		 * a component to/from an entity.
		 ***/
		Venus.prototype.inform = function(name, entityid, status){
			if(status === C.ADD){
				if(this.components[name] === undefined){
					this.components[name] = [entityid];
				} else {
					this.components[name].push(entityid);
				}
			}

			if(status === C.REMOVE){
				if(this.components[name] === undefined){
					return;
				} else {
					if(Util.isInArray(entityid, this.components[name])){
						Util.removeFromArray(entityid, this.components[name]);
					}
				}
			}
		}

		//===================//
		// COMPONENT METHODS //
		//===================//

		Venus.prototype.Component = G.Component;

		/**
		 * makeComponent: returns a component class object.
		 * Required properties in data:
		 * - name: name of component.
		 * - init: the constructor to instances of this class.
		 ***/

		Venus.prototype.makeComponent = function(data){
			var name = data.name;
			var init = data.init;

			var Component = function(){
				this.name = name;
				init.apply(this, arguments);
			}
			Util.extend(Component, G.Component);

			delete data.name;

			for(var key in data){
				var val = data[key];
				Component.prototype[key] = val;
			}

			return Component;
		}

		//===================//
		// SUBSYSTEM METHODS //
		//===================//

		/**
		 * makeSubsystem: returns an already-instantiated subsystem object.
		 * Requires properties in data:
		 * - name: name of subsystem.
		 * - init: the constructor to instantiate this object's class with.
		 * - requirements: array of names of required components (or array of arrays).
		 ***/

		Venus.prototype.makeSubsystem = function(data){
			var name = data.name;
			var init = data.init;
			var reqs; 
			if(data.requirements === undefined){
				reqs = [[]];
			} else if(Util.isArray(data.requirements[0])){
				reqs = data.requirements;
			} else {
				reqs = [data.requirements];
			}
			var self = this;

			var Subsystem = function(){
				this.engine = self;
				this.name = name;
				init.apply(this, arguments);
				this.requirements = reqs;
			}
			Util.extend(Subsystem, G.Subsystem);

			delete data.name;

			for(var key in data){
				var val = data[key];
				Subsystem.prototype[key] = val;
			}

			var system = new Subsystem();
			this.addSystem(system);

			return system;
		}

		/**
		 * add/remove: add or remove a system to the engine's main loop.
		 ***/
		Venus.prototype.addSystem = function(system){
			this.subsystems[system.getName()] = system;
		}

		Venus.prototype.removeSystem = function(name){
			delete this.subsystems[name];
		}

		/**
		 * filterEntities: get only the entities that have components matching
		 * requirements, from the specified layer.
		 * NOTE: requirements work like so [[AND] OR [AND]]
		 ***/

		Venus.prototype.filterEntities = function(componentNames, layer){
			var entityLists = [];
			for(var i = 0; i < componentNames.length; i++){
				var name = componentNames[i];
				if(this.components[name] !== undefined){
					var list = [];
					for(var j = 0; j < this.components[name].length; j++){
						if(this.entityIsInLayer(this.components[name][j], layer)){
							list.push(this.components[name][j]);
						}
					}
					entityLists.push(list);
				} else {
					return [];
				}
			}
			return Util.arrayIntersection.apply(this, entityLists);
		}

		/**
		 * subsystemEmit: send a particular message and associated data to
		 * all subsystems (they choose whether to ignore it or not).
		 ***/
		Venus.prototype.subsystemEmit = function(msg, data){
			for(var name in this.subsystems){
				var subsystem = this.subsystems[name];
				subsystem.engineSendsData(msg, data);
			}
		}

		/**
		 * step: for every subsystem, get all entities that fit their 
		 * requirements, and call their step function.
		 ***/
		Venus.prototype.step = function(deltaTime){
			for(var name in this.subsystems){
				var subsystem = this.subsystems[name];
				var requirements = subsystem.getRequirements();
				// for every layer...
				for(var i = 0; i < this.entities.length; i++){
					// for every requirement...
					for(var j = 0; j < requirements.length; j++){
						var reqs = requirements[j];
						var ids = this.filterEntities(reqs, i);
						subsystem.step(deltaTime, ids, i, i+j);
					}
				}
			}
		}

	})();

});