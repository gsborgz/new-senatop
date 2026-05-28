extends Node
class_name WorldInstance

@onready var _world: Node2D = $World


func _ready() -> void:
	var playerChar = GameManager.get_player_character()
	
	_world.add_child(playerChar)
	
	playerChar.toggle_movement_enabled(true)
