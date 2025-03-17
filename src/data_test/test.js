import {users} from "./users_profile.json"

function getUser(_id){
    let data = null;

    users.forEach(el => {
        if (_id == el.id) {
            data = el
        }
    });
    return data;
}


export {getUser}


