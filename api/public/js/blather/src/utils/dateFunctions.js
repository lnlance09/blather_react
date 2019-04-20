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
	<span>
		<Moment ago from={adjustTimezone(dateOne)}>
			{adjustTimezone(dateTwo)}
		</Moment>{" "}
		{new Date(dateOne) > new Date(dateTwo) ? "prior" : "later"}
	</span>
)

export const formatTime = secs => {
	secs = parseInt(secs, 10)
	let hours = Math.floor(secs / 3600)
	let minutes = Math.floor((secs - hours * 3600) / 60)
	let seconds = secs - hours * 3600 - minutes * 60

	if (hours < 10) {
		hours = "0" + hours
	}
	if (minutes < 10) {
		minutes = "0" + minutes
	}
	if (seconds < 10) {
		seconds = "0" + seconds
	}
	return hours + ":" + minutes + ":" + seconds
}
