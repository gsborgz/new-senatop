extends Area2D
class_name Teleport

@export var to: String
@export var new_position: Vector2i


func _ready() -> void:
	body_entered.connect(_on_body_entered)


func _on_body_entered(body: Node2D) -> void:
	if body.name != "Character":
		return
	
	var character = GameManager.get_player_character()
	
	character.toggle_movement_enabled(false)
	character.update_position(new_position)
	character.get_parent().remove_child(character)
	
	GameManager.set_scene("world/" + to)
