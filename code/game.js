/*
	Box2d Tutorial Game
	Made using Box2d on the Html5 Canvas element
	
	Author : Billy Caballero
	billy.11080@gmail.com
	
*/

//Global game object
var global_game = null;

//start game once page has finished loaded
$(function() { 
	start_game();
});

function start_game()
{
	var g = new game();
	
	//store game pointer in a global object
	global_game = g;
	
	$(window).resize(function() {
		g.resize();
	});
	
	g.start();
}

function game()
{
	this.fps = 60;
	this.scale = 50;
	
	//global array of all objects to manage
	this.game_objects = [];
	
	this.points = 0;
	this.to_destroy = [];
	this.time_elapsed = 0;
}

game.prototype.resize = function()
{

	var canvas = this.canvas;
	
	//Set the canvas dimensions to match the window dimensions
	var w = window.innerWidth;
	var h = window.innerHeight;
	
	canvas.width = w;
	canvas.height = h;
	
	canvas.style.width = w   + "px";
	canvas.style.height = h  + "px";
	
	this.canvas_width = w ;
	this.canvas_height = h ;

	this.screen_height = 10;
	this.scale = this.canvas_height / this.screen_height;
	this.screen_width = this.canvas_width / this.scale;
}

game.prototype.setup = function()
{
	var canvas = document.getElementById("canvas");
	this.ctx = ctx = canvas.getContext('2d');
	this.canvas = canvas;
	
	//resize to correct size
	this.resize();
	
	//dimensions in metres
	var w = this.screen_width;
	var h = this.screen_height;
		
	//create the box2d world
	this.create_box2d_world();
	
	//lower slab
	this.game_objects.push(new wall({x : w/2 - 3.5, y: 1, width : 2, height:1, game : this}));
	this.game_objects.push(new wall({x : w/2 , y: 1, width : 2, height:1, game : this}));
	this.game_objects.push(new wall({x : w/2 + 3.5, y: 1, width : 2, height:1, game : this}));
	
	//the player
	this.player = new player({x : w/2, y: h/2 , game : this});
	this.game_objects.push(this.player);
	
	//attach event handlers for key presses
	this.player.start_handling();
	
	//setup collision handler too
	this.setup_collision_handler();
}

game.prototype.create_box2d_world = function()
{
	//10m/s2 downwards, cartesian coordinates remember - we shall keep slightly lesser gravity
	var gravity = new b2Vec2(0, -10);
	
	/*
		very important to do this, otherwise player will not move.
		basically dynamic bodies trying to slide over static bodies will go to sleep
	*/
	var doSleep = false;
	var world = new b2World(gravity , doSleep);
	
	//save in global object
	this.box2d_world = world;
}

//Start the game :) Setup and start ticking the clock
game.prototype.start = function()
{
	this.on = true;
	this.total_points = 0;
	
	this.setup();
	this.is_paused = false;
	
	//Start the Game Loop - TICK TOCK TICK TOCK TICK TOCK TICK TOCK
	this.tick();
}

game.prototype.redraw_world = function()
{
	//1. clear the canvas first - not doing this will cause tearing at world ends
	this.ctx.clearRect(0 , 0 , this.canvas_width , this.canvas_height);
	
	//dimensions in metres
	var w = this.screen_width;
	var h = this.screen_height;
	
	var img = img_res('orange_hills.png');
	this.ctx.drawImage(img, 0 , 0 , this.canvas_width, this.canvas_height);
	
	img = img_res('tree.png');
	this.ctx.drawImage(img,  (w/2 - 4.5) * this.scale , h/2 , 10 * this.scale, this.canvas_height);
	
	write_text({x : 25 , y : 25 , font : 'bold 15px arial' , color : '#fff' , text : 'Fruits ' + this.points , ctx : this.ctx})
	
	//Draw each object one by one , the tiles , the cars , the other objects lying here and there
	for(var i in this.game_objects)
	{
		this.game_objects[i].draw();
	}
}

game.prototype.tick = function(cnt)
{
	if(!this.is_paused && this.on)
	{

		//tick all objects, if dead then remove
		for(var i in this.game_objects)
		{
			if(this.game_objects[i].dead == true)
			{
				delete this.game_objects[i];
				continue;
			}
			
			this.game_objects[i].tick();
		}
		
		//garbage collect dead things
		this.perform_destroy();
		
		//Step the box2d engine ahead
		// The box2d_world.Step() method takes three parameters: the timestep in seconds and the number of internal iterations for the velocity and positions computations
		this.box2d_world.Step(1/20 , 8 , 3);
		
		//important to clear forces, otherwise forces will keep applying
		this.box2d_world.ClearForces();
		
		//redraw the world
		this.redraw_world();
		
		if(!this.is_paused && this.on)
		{
			var that = this;
			//game.fps times in 1000 milliseconds or 1 second
			this.timer = setTimeout( function() { that.tick(); }  , 1000/this.fps);
		}
	}
}

game.prototype.perform_destroy = function()
{
	for(var i in this.to_destroy)
	{
		this.to_destroy[i].destroy();
	}
}

game.prototype.get_offset = function(vector)
{
	return new b2Vec2(vector.x - 0, Math.abs(vector.y - this.screen_height));
}



//Setup collision handler
game.prototype.setup_collision_handler = function()
{
	var that = this;
	
	//Override a few functions of class b2ContactListener
	b2ContactListener.prototype.BeginContact = function (contact) 
	{
		//now come action time
		var a = contact.GetFixtureA().GetUserData();
		var b = contact.GetFixtureB().GetUserData();
		
		if(a instanceof player && b instanceof apple)
		{
			that.destroy_object(b);
			that.points++;
		}
		
		else if(b instanceof player && a instanceof apple)
		{
			that.destroy_object(a);
			that.points++;
		}
		//apple hits a wall
		else if(a instanceof apple && b instanceof wall)
		{
			that.destroy_object(a);
		}
	}
}

//schedule an object for destruction in next tick
game.prototype.destroy_object = function(obj)
{
	this.to_destroy.push(obj);
}
