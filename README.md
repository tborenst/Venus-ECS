Venus: Entity Component System 
======

### Entity Component System
Venus is an Entity Component System meant for HTML5 game development. It allows you to easily modularize your code by using multiple inheritance, thus avoiding deep inheritance trees that can often be a nightmare to maintain. This project is mostly practice for me, for a similar (and probably more stable) ECS engine, try out [Crafty](http://craftyjs.com/).

Currently, most of these folders are empty since I want to clean up my code before putting it up. However, the barebones for Venus are all here in ./static/js/engine.

The way it works is this:
* __Entities__ are simply buckets with unique IDs that hold components. 
* __Components__ are data holders that define some sort of behavior (but usually contain only data, not logic). Example components could be a "phsyics component" that defines the coordinates and shape of a rigid body, or perhaps a "render component" that defines a spritesheet and possible animations that spritesheet could play.
* __SubSystems__ are the pieces of the program that contain the logic that operates on the data from the components. Subystems have requirements, and execute logic on all entities that answer those requirements.

### Example Code
###### Entity
```javascript
var player = V.makeEntity();
player.addComponent(new PhysicsComponent(0, 0, 50, 50, 0, 0)); // x, y, width, height, velx, vely
player.addComponent(new ControlComponent())                    // add keyboard controls
player.addComponent(new RenderComponent("./media/man.png"))    // add an image to entity

// tick the engine, presumably 60 times a second
setInterval(function(){
	V.step();
}, 1000/60);
```

###### Component
```javascript
var PhysicsComponent = V.makeComponent({
	// required fields: name and init function
	name: "physics",
	init: function(x, y, width, height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.velx = 0;
		this.vely = 0;
	},
	// optional logic
	updatePos: function(dT){
		this.x += this.velx * dT;
		this.y += this.vely * dT;
	}
});

// export to global object (so other scopes can refer to it)
V.addGlobal("PhysicsComponent", PhysicsComponent);
```

###### SubSystem
```javascript
var PhysicsSubsystem = V.makeSubsystem({
	// required fileds: name, init function, requirements, and step function
	name: "physics",
	init: function(){
		// empty in this example, but with a more complicated physics system
		// you could initialize things like gravity here...
	},
	requirements: ["physics"],
	step: function(deltaTime, entityIds, entityLayer, round){
		for(var i = 0; i < entityIds.length; i++){
			var entity = V.getEntity(entityIds[i]);
			var physicsComp = entity.getComponent("physics");
			physicsComp.updatePos(deltaTime);
		}
	}
});

V.addGlobal("PhysicsSubsystem", PhysicsSubsystem);
```

Note that the `step()` method takes in several arguments:
* `deltaTime` is the time that passed since that last global tick of the engine.
* `entityIds` is an array containing all entities from a specific layer that answer to the system's requirements.
* `layer` is the entity layer the system is currently operating on (Venus supports multiple entity layers, more on that below).
* `round` is the count of how many times this subsystem was called in this particular global tick of the engine. The reason this may be important is: if the subsystem had a set of requirements such as `[["physics, render"], ["tilemap"]]`, it would first operate on all entities that have components "physics" AND "render", and then again on all entities that have component "tilemap".

### Entity Layers
Venus supports the concept of entity layers. You can declare which layer an entity goes into by passing in an integer into `V.makeEntity()`:
```javascript
	var car = V.makeEntity(0);
	var plane = V.makeEntity(1);
```
In the above case, the `car` entity is placed in layer 0, and the `plane` entity in layer 1. Assuming both entities have a "render component", the rendering subsystem would operate on layer 0 first and 1 second, thus drawing the plane over the car. Likewise, if the entities had a "collision component", the physics subsystem would not register a collision between them since it would operate on the two layers separately.

### Saving State (serializing/deserializing)
When writing components, you may want to write serialize/deserialize functions to go with them. These functions will be used to save/load the state of the engine when saving or loading new levels or scenes. Following are two simple example serialization methods, of course other components may require more complicated methods than these.

```javascript
var PhysicsComponent = V.makeComponent({
	// ... continued from above
	serialize: function(){
		return JSON.stringify(this);
	},
	deserialize: function(json){
		var pc = new PhysicsComponent(json.x, json.y, json.width, json.height, json.velx, json.vely);
		return pc;
	}
});

// you must do this if you want the component to be serializable
V.addSRLZ("physics", PhysicsComponent); // component name, component class
```

Then, in order to save or load the state of the engine:
```javascript
	// save state
	var stateStr = V.serialize(); 
	// load state
	var stateJson = JSON.parse(stateStr);
	V.deserialize(stateJson);
```
If there are any problems with the serialization methods you wrote for any of your components, or if you forgot to `V.addSRLZ()`, Venus should let you know.

### Coming Soon
These are mostly done, but I want to clean them up before putting them here:
* Fully working physics/collision system (Separating Axis Theorem)
* Fully working rendering system that allows for multi-layered sprite animations
* Fully working "WASD" control system with events/triggers

These need to be written:
* Pub/Sub event system
* GUI for Venus (a sort of a level/scene editor)
* Node server to serve up the GUI and save/load levels/scenes

These need to be thought about:
* Add a way for easy networking with node.js and socket.io
* Further optimizations to the engine
