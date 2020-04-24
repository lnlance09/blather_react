import { toast } from "react-toastify"
import request from "request"

toast.configure({
	autoClose: 4000,
	draggable: false
})

export const sendContactMsg = ({ callback, msg }) => dispatch => {
	request.post(
		`${window.location.origin}/api/contact/send`,
		{
			form: {
				msg
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				callback()
				toast.success("Your message has been sent")
			}
		}
	)
}
