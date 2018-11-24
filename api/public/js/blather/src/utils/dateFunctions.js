import React from "react"
import Moment from "react-moment"

const hoursOffset = new Date().getTimezoneOffset() / 60
export const adjustTimezone = date => {
	let dateStr = date
	if (date !== undefined) {
		dateStr = Date.parse(date) !== undefined ? date.replace(/-/g, "/") : date
	}
	return new Date(dateStr).getTime() - hoursOffset * 3600000
}
export const dateDifference = (dateOne, dateTwo) => (
	<div>
		<Moment from={adjustTimezone(dateOne)} ago>
			{adjustTimezone(dateTwo)}
		</Moment>{" "}
		{new Date(dateOne) > new Date(dateTwo) ? "prior" : "later"}
	</div>
)
