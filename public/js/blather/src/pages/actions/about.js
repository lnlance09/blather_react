import * as constants from '../constants';
import request from 'request';

export const sendContactMsg = ({msg}) => dispatch => {
    request.post(`${window.location.origin}/api/contact/send`, {
        form: {
            msg
        },
        json: true
    }, function(err, response, body) {
         dispatch({
            type: constants.SEND_CONTACT_MSG,
            payload: body
        })

         if(!body.error) {
            setTimeout(() => {
                dispatch({
                    type: constants.RESET_CONTACT_FORM
                })
            }, 5000);
         }
    })
}
