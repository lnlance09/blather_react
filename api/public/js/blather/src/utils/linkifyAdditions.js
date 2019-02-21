import { linkify } from "react-linkify"

export const linkHashtags = url => {
	linkify.add("#", {
		validate: function(text, pos, self) {
			var tail = text.slice(pos)
			if (!self.re.twitter) {
				self.re.twitter = new RegExp(
					"^([a-zA-Z0-9_]){1,20}(?!_)(?=$|" + self.re.src_ZPCc + ")"
				)
			}

			if (self.re.twitter.test(tail)) {
				if (pos >= 2 && tail[pos - 2] === "#") {
					return false
				}
				return tail.match(self.re.twitter)[0].length
			}
			return 0
		},
		normalize: function(match) {
			match.url = url + match.url.replace(/^#/, "")
		}
	})
}

export const linkMentions = network => {
	linkify.add("@", {
		validate: function(text, pos, self) {
			var tail = text.slice(pos)
			if (!self.re.twitter) {
				self.re.twitter = new RegExp(
					"^([a-zA-Z0-9_]){1,15}(?!_)(?=$|" + self.re.src_ZPCc + ")"
				)
			}

			if (self.re.twitter.test(tail)) {
				if (pos >= 2 && tail[pos - 2] === "@") {
					return false
				}
				return tail.match(self.re.twitter)[0].length
			}
			return 0
		},
		normalize: function(match) {
			match.url =
				window.location.origin + "/pages/" + network + "/" + match.url.replace(/^@/, "")
		}
	})
}
