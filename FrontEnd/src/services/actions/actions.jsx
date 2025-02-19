export const user_profile_data = "USER_PROFILE_DATA";
export const show_hide_ham_menu = "SHOW_HIDE_HAM_MENU";
export const change_body_nav_color = "CHANGE_BODY_NAV_COLOR";
export const show_hide_old_exp_prof_bar = "SHOW_HIDE_OLD_EXP_PROF_BAR";

export const userProfileData = (value)=>{
    return {type:user_profile_data, payload:value};
}
export const showHideHamMenu = (value)=>{
    return {type:show_hide_ham_menu, payload:value};
}
export const showHideOldExpProfBar = (value)=>{
    return {type:show_hide_old_exp_prof_bar, payload:value};
}
export const changeBodyNavColor = (value)=>{
    return {type:change_body_nav_color, payload:value}; 
}