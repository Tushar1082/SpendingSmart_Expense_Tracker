import { user_profile_data, show_hide_ham_menu, show_hide_old_exp_prof_bar, change_body_nav_color } from "../actions/actions";

const initialState = {
    userData: null,
    showHamMenu: false,
    changeNavColor: false,
    showHideProfBar: false
};

export function userReducer(state = initialState,action){
    switch(action.type){
        case user_profile_data:
            return {...state, userData: action.payload};
        case show_hide_ham_menu:
            return {...state, showHamMenu:action.payload};
        case show_hide_old_exp_prof_bar:
            return {...state, showHideProfBar:action.payload};
        case change_body_nav_color:
            return {...state, changeNavColor:action.payload}
        default:
            return state;
    }
}