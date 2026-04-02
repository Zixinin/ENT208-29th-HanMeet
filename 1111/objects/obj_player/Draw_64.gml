if (show_text != "") {
    var box_w = 500;
    var box_h = 120;
    var cx = display_get_gui_width() / 2;
    var cy = display_get_gui_height() - 160;
    var x1 = cx - box_w / 2;
    var y1 = cy;

    // background
    draw_set_color(c_black);
    draw_set_alpha(0.8);
    draw_rectangle(x1, y1, x1 + box_w, y1 + box_h, false);
    draw_set_alpha(1);

    // border
    draw_set_color(c_white);
    draw_rectangle(x1, y1, x1 + box_w, y1 + box_h, true);

    // text
    draw_set_font(Fnt_chinese);
    draw_set_color(c_white);
    draw_set_halign(fa_left);
    draw_set_valign(fa_top);
    draw_text_ext(x1 + 20, y1 + 20, show_text, -1, box_w - 40);

    // reset
    draw_set_font(-1);
    draw_set_halign(fa_left);
    draw_set_alpha(1);
}