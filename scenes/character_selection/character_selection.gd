extends Node

@onready var _character_1: TextureButton = $BoxContainer/Character1
#@onready var _character_2: TextureButton = $BoxContainer/Character2
#@onready var _character_3: TextureButton = $BoxContainer/Character3
#@onready var _character_4: TextureButton = $BoxContainer/Character4

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	_character_1.pressed.connect(_set_character_and_play.bind("player1"))
	#_character_2.pressed.connect(_set_character_and_play.bind("player2"))
	#_character_3.pressed.connect(_set_character_and_play.bind("player3"))
	#_character_4.pressed.connect(_set_character_and_play.bind("player4"))


func _set_character_and_play(sprite: String) -> void:
	var playerChar = Character.instantiate(sprite, Vector2(46, 46))
	
	GameManager.set_player_character(playerChar)
	GameManager.set_scene("world/overworld")
