
/*
	Player object
	monkey art from
	http://www.vickiwenderlich.com/2011/06/game-art-pack-monkey-platformer/
*/
function player(options)
{
	this.height = 1.0;
	this.width = 0.66;
	
	this.x = options.x;
	this.y = options.y;
	this.game = options.game;
	this.age = 0;
		
	this.do_move_left = false;
	this.do_move_right = false;
	this.max_hor_vel = 2;
	this.max_ver_vel = 4;
	this.can_move_up = true;
	
	var info = { 
		'density' : 10 ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_dynamicBody ,
		'restitution' : 0.0 ,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
}

player.prototype.tick = function()
{
	if(this.is_out())
	{
		//turn off the game
		this.game.on = false;
		
		start_game();
	}
	
	if(this.do_move_left)
	{
		this.add_velocity(new b2Vec2(-1,0));
	}
	
	if(this.do_move_right)
	{
		this.add_velocity(new b2Vec2(1,0));
	}
	
	if(this.do_move_up && this.can_move_up)
	{
		
		this.add_velocity(new b2Vec2(0,6));
		this.can_move_up = false;
	}
	
	this.age++;
}

player.prototype.add_velocity = function(vel)
{
	var b = this.body;
	var v = b.GetLinearVelocity();
	
	v.Add(vel);
	
	//check for max horizontal and vertical velocities and then set
	if(Math.abs(v.y) > this.max_ver_vel)
	{
		v.y = this.max_ver_vel * v.y/Math.abs(v.y);
	}
	
	if(Math.abs(v.x) > this.max_hor_vel)
	{
		v.x = this.max_hor_vel * v.x/Math.abs(v.x);
	}
	
	//set the new velocity
	b.SetLinearVelocity(v);
}

player.img = img_res('monkey.png');

player.prototype.draw = function()
{
	if(this.body == null)
	{
		return false;
	}
	//draw_body(this.body, this.game.ctx);
	
	var c = this.game.get_offset(this.body.GetPosition());
	
	var scale = this.game.scale;
	
	var sx = c.x * scale;
	var sy = c.y * scale;
	
	var width = this.width * scale;
	var height = this.height * scale;
	
	this.game.ctx.translate(sx, sy);
	this.game.ctx.drawImage(player.img , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}

player.prototype.jump = function()
{
	//if player is already in vertical motion, then cannot jump
	if(Math.abs(this.body.GetLinearVelocity().y) > 0.0)
	{
		return false;
	}
	this.do_move_up = true;
}

player.prototype.is_out = function()
{
	//if player has fallen below the 0 level of y axis in the box2d coordinates, then he is out
	if(this.body.GetPosition().y - this.height< 0)
	{
		console.log(this.height);
		return true;
	}
	
	return false;
}


/*
* Events KeyBoard  Player
*/

player.prototype.start_handling = function()
{
	var that = this;
	
	$(document).on('keydown.game' , function(e)
	{
		that.key_down(e);
		return false;
	});
	
	$(document).on('keyup.game' ,function(e)
	{
		that.key_up(e);
		return false;
	});
}

player.prototype.key_down = function(e)
{
	var code = e.keyCode;
	
	//LEFT
	if(code == 37)
	{
		this.do_move_left = true;
	}
	//UP
	else if(code == 38)
	{
		this.jump();
	}
	//RIGHT
	else if(code == 39)
	{
		this.do_move_right = true;
	}
}

player.prototype.key_up = function(e)
{
	var code = e.keyCode;
	
	//UP KEY
	if(code == 38)
	{
		this.do_move_up = false;
		this.can_move_up = true;
	}
	//LEFT
	else if(code == 37)
	{
		this.do_move_left = false;
	}
	//RIGHT
	else if(code == 39)
	{
		this.do_move_right = false;
	}
}

/*
* End Events KeyBoard
*/
