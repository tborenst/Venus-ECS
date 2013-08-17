Venus: Entity Component System 
======

### Entity Component System
Venus is an Entity Component System meant for HTML5 game development. It allows you to easily modularize your code by using multiple inheritance, thus avoiding deep inheritance trees that can often be a nightmare to maintain.

The way it works is this:
* __Entities__ are simply buckets with unique IDs that hold components. 
* __Components__ are data holders that define some sort of behavior (but usually contain only data, not logic). Example components could be a "phsyics component" that defines the coordinates and shape of a rigid body, or perhaps a "render component" that defines a spritesheet and possible animations that spritesheet could play.
* __Subsystems__ are the pieces of the program that contain the logic that operates on the data from the components. Subystems have requirements, and execute logic on all entities that answer those requirements.
