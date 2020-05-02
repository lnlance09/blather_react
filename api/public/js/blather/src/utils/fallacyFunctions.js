import fallacies from "options/fallacies.json"

export const fallacyDropdownOptions = fallacies.map(fallacy => ({
	key: fallacy.name,
	text: fallacy.name,
	value: fallacy.id
}))
