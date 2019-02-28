import numeral from "numeral"
import moment from "moment"
import momentDurationFormatSetup from "moment-duration-format"
import sanitizeHtml from "sanitize-html"
momentDurationFormatSetup(moment)

export const capitalizeWord = word => word.slice(0, 1).toUpperCase() + word.slice(1)

export const convertTimeToSeconds = time => {
	const times = time.split(":")
	if (times.length > 2) {
		return moment.duration(times[1] + ":" + times[2]).asSeconds() / 60 + times[0] * 60 * 60
	}
	return moment.duration(time).asSeconds() / 60
}

export const formatDuration = time => {
	if (time < 10) {
		time = `0${time}`
	}
	if (time < 60) {
		return `0:${time}`
	}
	return moment.duration(parseInt(time, 10), "seconds").format("m:ss")
}

export const formatGrammar = word => {
	const vowels = ["a", "e", "i", "o", "u"]
	return vowels.indexOf(word.toLowerCase().substring(0, 1)) === -1 ? "a" : "an"
}

export const formatNumber = (count, format = "0a") => numeral(count).format("0a")

export const formatPlural = (count, term) => {
	if (term.substr(term.length - 1) === "y") {
		const word = term.substring(0, term.length - 1)
		return parseInt(count, 10) === 1 ? term : `${word}ies`
	}
	return parseInt(count, 10) === 1 ? term : `${term}s`
}

export const sanitizeText = html => {
	return sanitizeHtml(html, {
		allowedTags: [
			"b",
			"i",
			"em",
			"strong",
			"a",
			"p",
			"ul",
			"ol",
			"li",
			"h1",
			"h2",
			"h3",
			"h4",
			"img"
		],
		allowedAttributes: {
			a: ["href"],
			img: ["src", "alt"]
		},
		allowedIframeHostnames: ["www.youtube.com"]
	})
}
