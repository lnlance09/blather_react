import { toast } from "react-toastify"
import { getConfig } from "options/toast"
import request from "request"

toast.configure(getConfig())

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
