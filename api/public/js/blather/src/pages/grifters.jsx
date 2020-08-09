import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Container, Divider, Header, Message, Segment } from "semantic-ui-react"
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

					<Message info size="big">
						<Message.Header as="h1" inverted>
							What is a grifter?
						</Message.Header>
						<Message.Content>
							A grifter is someone who gets paid to confirm the pre-existing opinions
							of their audience. This is usually done for money but attention and
							validation from strangers on the internet is also sometimes a motivating
							force.
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
