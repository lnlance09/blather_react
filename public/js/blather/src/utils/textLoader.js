/**
 * @exports TextLoader
 *
 * Take the text and html and combine them to return a string. Also get the correct language from the application
 * in order to return the corresponding text
 * Note: We are using mustache since we want to return a {string} and not a react component
 */

/**
 * Load the text for the component
 *
 * @param {object} text - The component text in all languages
 * @param {string} component - The name of the component
 * @return {object} - The component text in the system language
 */
const load = (text, component) => {
	// @todo: may have to revisit this when we actually support multi-language
	// if we want to dynamically update the language, it'll belong in state / redux
	const lang = window.settings.language || "en"

	if (!component) {
		throw new Error("Please provide a component name for debugging purposes")
	}

	if (!lang) {
		throw new Error("Please set a default system language")
	}

	if (!text) {
		throw new Error(
			`${component} does not have a text file. Please create a text.json file for this module`
		)
	}

	if (!text[lang]) {
		throw new Error(`${component} does not have text in the requested language "${lang}". 
        Please add it to the text.json file of the component`)
	}

	return text[lang]
}

export default load
