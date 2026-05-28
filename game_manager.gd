extends Node

var _theme_player: AudioStreamPlayer2D
var _current_scene_root: Node
var _player_character: Character
var _menu_opened: bool = false


func set_scene(scenePath: String) -> void:
	if _current_scene_root != null:
		_current_scene_root.queue_free()
	
	var sceneName := scenePath.split("/")
	var fileName := sceneName[sceneName.size() - 1]
	var sceneFullPath = "res://scenes/" + scenePath + "/" + fileName + ".tscn"
	
	get_tree().call_deferred("change_scene_to_file", sceneFullPath)


func get_menu_opened() -> bool:
	return _menu_opened


func set_menu_opened(value: bool) -> void:
	_menu_opened = value


func set_player_character(character: Character) -> void:
	_player_character = character


func get_player_character() -> Character:
	return _player_character


func _ready() -> void:
	_theme_player = AudioStreamPlayer2D.new()
	
	add_child(_theme_player)
	set_scene("character_selection")
