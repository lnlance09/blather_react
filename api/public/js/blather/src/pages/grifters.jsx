import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Divider, Header, Message } from "semantic-ui-react"
import { DebounceInput } from "react-debounce-input"
import DefaultLayout from "layouts"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import SearchResults from "components/secondary/searchResults/v1/"
import store from "store"

const Grifters = ({ history }) => {
	const [q, setQ] = useState("")

	useEffect(() => {}, [])

	const searchForResults = e => {
		const q = e.target.value
		setQ(q)
	}

	const SearchItems = () => <SearchResults history={history} q={q} type="grifters" />

	return (
		<Provider store={store}>
			<div className="griftersPage">
				<DisplayMetaTags page="grifters" />

				<DefaultLayout
					activeItem="grifters"
					containerClassName="griftersPage"
					history={history}
				>
					<Header as="h1" inverted>
						Grifters
					</Header>
					<div className={`ui icon input fluid big inverted`}>
						<DebounceInput
							autoCapitalize="none"
							autoCorrect="off"
							debounceTimeout={500}
							minLength={2}
							onChange={searchForResults}
							placeholder="Find a grifter"
							value={q}
						/>
						<i aria-hidden="true" className="search icon" />
					</div>

					<Divider hidden />

					<Message size="large">
						<Message.Header as="h1" inverted>
							What is a grifter?
						</Message.Header>
						<Message.Content>
							A grifter is someone who is in the business of telling gullible people
							exactly what they want to hear, regardless of whether it makes sense or
							not. Grifters are typically on the path of least resistance and their
							strategy often consists of little more than repeating a handful of tired
							talking points to a group of people that's very desperate to have their
							pre-existing opinions confirmed.
						</Message.Content>
					</Message>

					<Divider hidden />

					{SearchItems()}
				</DefaultLayout>
			</div>
		</Provider>
	)
}

Grifters.propTypes = {
	history: PropTypes.object
}

Grifters.defaultProps = {}

const mapStateToProps = (state, ownProps) => ({
	...state.search,
	...ownProps
})

export default connect(mapStateToProps, {})(Grifters)
