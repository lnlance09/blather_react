import React from "react"
import MetaTags from "react-meta-tags"
import { capitalizeWord } from "./textFunctions"

export const DisplayMetaTags = ({ page, props, state }) => {
	const description =
		"Blather is an educational tool that allows users to analyze and pinpoint the accuracy of claims made on social media."
	const img = ""
	let metaTags = {}

	switch (page) {
		case "about":
			metaTags = {
				description: description,
				img,
				title: capitalizeWord(state.activeItem)
			}
			break
		case "bot":
			metaTags = {
				description:
					"Free Speech Warriors in a nutshell. 90% of the arguments that you'll ever hear from them online. Turn on shitty grammar mode to be a real FSW.",
				img,
				title: "Free Speech Warrior Bot"
			}
			break
		case "createDiscussion":
			metaTags = {
				description:
					"Start a discussion where everyone plays by the same set of rules and intellectually dishonest debate tactics are called out. Change your mind if the evidence is compelling.",
				img,
				title: "Change my mind"
			}
			break
		case "discussion":
			metaTags = {
				description: "",
				img,
				title: props.title
			}
			break
		case "discussions":
			metaTags = {
				description: "",
				img,
				title: "Discussions"
			}
			break
		case "fallacies":
			metaTags = {
				description: "",
				img,
				title: "Fallacies"
			}
			break
		case "fallacy":
			metaTags = {
				description: "",
				img,
				title: props.title
			}
			break
		case "feed":
			metaTags = {
				description: "",
				img,
				title: "Home"
			}
			break
		case "pages":
			if (props.error) {
				metaTags = {
					description: "",
					img,
					title: "Not found"
				}
			} else {
				metaTags = {
					description: `${props.name}'s profile on Blather`,
					img,
					title: props.name
				}
			}
			break
		case "post":
			metaTags = {
				description: "",
				img,
				title: ""
			}

			if (props.error) {
				metaTags = {
					description: "This post does not exist",
					img,
					title: "Not found"
				}
			}

			if (props.info) {
				let title = ""
				if (props.type === "comment") {
					title = `Comment by ${
						props.info.comment.user ? props.info.comment.user.title : ""
					}`
				}
				if (props.type === "tweet") {
					title = `Tweet by ${props.info.user ? props.info.user.name : ""}`
				}
				if (props.type === "video") {
					title = props.info.title
				}
				metaTags = {
					description: `Does the logic in this ${
						props.type
					} make sense? Call out fallacious reasoning and ask this creator of this content to explain his or her self.`,
					img,
					title: title
				}
			}
			break
		case "search":
			metaTags = {
				description: "",
				img,
				title: `Search results for '${
					props.q === undefined || props.q === null ? "" : props.q
				}'`
			}
			break
		case "settings":
			metaTags = {
				description: "",
				img,
				title: "Settings"
			}
			break
		case "signin":
			metaTags = {
				description: "",
				img,
				title: "Sign in"
			}
			break
		case "tags":
			metaTags = {
				description: `${props.name} tag on Blather`,
				img,
				title: props.name
			}
			break
		case "target":
			metaTags = {
				description: `${props.user.name}'s criticisms of ${props.page.name}`,
				img,
				title: `${props.user.name}'s review of ${props.page.name}`
			}
			break
		case "users":
			metaTags = {
				description: `${
					props.user.name
				}'s discussions, fallacies and archived links on Blather`,
				img,
				title: props.user.name
			}
			break
		default:
			metaTags = {
				description: description,
				img,
				title: ""
			}
			break
	}

	return (
		<MetaTags>
			<title>{metaTags.title} - Blather</title>
			<meta name="description" content={metaTags.description} />
		</MetaTags>
	)
}
