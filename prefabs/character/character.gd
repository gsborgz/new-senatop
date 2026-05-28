extends CharacterBody2D
class_name Character

const CharacterScene := preload("res://prefabs/character/character.tscn")
const TILE_SIZE := 16
const CHAR_INDEX := 5
const WALK_SPEED := 4.0
const RUN_SPEED := 8.0
const DIRECTION_MAP := {
	Vector2.UP: "up", Vector2.DOWN: "down",
	Vector2.LEFT: "left", Vector2.RIGHT: "right",
}

@onready var _camera_2d: Camera2D = $Camera2D
@onready var _animation_tree: AnimationTree = $AnimationTree
@onready var _ray: RayCast2D = $RayCast2D

var _movement_enabled: bool = true
var _sprite: String = ""
var _is_moving: bool = false
var _input_direction: Vector2 = Vector2.DOWN
var _initial_position: Vector2 = Vector2.ZERO
var _percent_moved_to_next_tile: float = 0.0


static func instantiate(sprite: String, tile: Vector2i) -> Character:
	var character := CharacterScene.instantiate() as Character
	
	character.setup(sprite, tile)
	
	return character


func setup(sprite: String, tile: Vector2i) -> void:
	z_index = CHAR_INDEX
	_sprite = sprite
	
	update_position(tile)
	
	_initial_position = position


func update_position(tile: Vector2i) -> void:
	position = Vector2.ZERO
	
	var newPosition = Vector2(tile) * TILE_SIZE
	
	position = newPosition
	_initial_position = position


func toggle_movement_enabled(value: bool) -> void:
	_movement_enabled = value


func _ready() -> void:
	_set_blend_position()
	_update_camera_limits()


func _enter_tree() -> void:
	_update_camera_limits()


func _physics_process(delta: float) -> void:
	if !_is_moving:
		_process_player_input()
	elif _input_direction != Vector2.ZERO:
		_set_walking_state()
		_move(delta)
	else:
		_set_idle_state()
		_is_moving = false


func _process_player_input() -> void:
	if _input_direction.y == 0:
		_input_direction.x = int(Input.is_action_pressed("right")) - int(Input.is_action_pressed("left"))
	
	if _input_direction.x == 0:
		_input_direction.y = int(Input.is_action_pressed("down")) - int(Input.is_action_pressed("up"))
	
	if _input_direction != Vector2.ZERO:
		_set_blend_position()
		_initial_position = position
		_is_moving = true
	else:
		_set_idle_state()


func _move(delta) -> void:
	var desired_step: Vector2 = _input_direction * TILE_SIZE
	var current_speed = RUN_SPEED if Input.is_action_pressed("run") else WALK_SPEED
	
	_ray.target_position = desired_step
	_ray.force_raycast_update()
	
	if !_ray.is_colliding():
		_percent_moved_to_next_tile += current_speed * delta
		
		if _percent_moved_to_next_tile >= 1.0:
			position = _initial_position + (TILE_SIZE * _input_direction)
			_percent_moved_to_next_tile = 0.0
			_is_moving = false
		else:
			position = _initial_position + (TILE_SIZE * _input_direction * _percent_moved_to_next_tile)
	else:
		_is_moving = false
		_percent_moved_to_next_tile = 0.0


func _update_camera_limits() -> void:
	if not _camera_2d:
		return
	
	var tilemap: TileMapLayer = get_tree().get_nodes_in_group("main_layer").get(0)
	
	if not tilemap:
		return
	
	var used_rect := tilemap.get_used_rect()
	var tile_size := tilemap.tile_set.get_tile_size()
	
	_camera_2d.limit_left = used_rect.position.x * tile_size.x
	_camera_2d.limit_top = used_rect.position.y * tile_size.y
	_camera_2d.limit_right = (used_rect.position.x + used_rect.size.x) * tile_size.x
	_camera_2d.limit_bottom = (used_rect.position.y + used_rect.size.y) * tile_size.y


func _set_idle_state() -> void:
	_animation_tree["parameters/conditions/idle"] = true
	_animation_tree["parameters/conditions/walking"] = false


func _set_walking_state() -> void:
	_animation_tree["parameters/conditions/idle"] = false
	_animation_tree["parameters/conditions/walking"] = true


func _set_blend_position() -> void:
	_animation_tree.set("parameters/Idle/blend_position", _input_direction)
	_animation_tree.set("parameters/Walk/blend_position", _input_direction)
