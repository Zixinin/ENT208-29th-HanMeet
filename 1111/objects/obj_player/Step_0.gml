var spd = 5;

// movement
if (keyboard_check(vk_right)) x += spd;
if (keyboard_check(vk_left))  x -= spd;
if (keyboard_check(vk_up))    y -= spd;
if (keyboard_check(vk_down))  y += spd;

// typing effect
if (is_typing) {
    if (text_index < string_length(full_text)) {
        text_index += text_speed;
        show_text = string_copy(full_text, 1, text_index);
    }
}

// interaction
if (place_meeting(x, y, obj_item)) {
    if (keyboard_check_pressed(ord("E"))) {
        if (is_typing) {
            // skip to full text
            show_text = full_text;
            text_index = string_length(full_text);
            is_typing = false;
        } else {
            // start typing
            full_text = "Hello! This is the ENT class module. Hope you enjoy this game!";
            text_index = 0;
            show_text = "";
            is_typing = true;
        }
    }
}