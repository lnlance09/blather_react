import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { DebounceInput } from "react-debounce-input"
import DefaultLayout from "layouts"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import SearchResults from "components/secondary/searchResults/v1/"
import store from "store"

const Tags = ({ history }) => {
	const [q, setQ] = useState("")

	useEffect(() => {}, [])

	const searchForResults = e => {
		const q = e.target.value
		setQ(q)
	}

	const SearchItems = () => <SearchResults history={history} q={q} type="tags" />

	return (
		<Provider store={store}>
			<div className="tagsPage">
				<DisplayMetaTags page="tags" />

				<DefaultLayout activeItem="tags" containerClassName="tagsPage" history={history}>
					<div className={`ui icon input fluid big inverted`}>
						<DebounceInput
							autoCapitalize="none"
							autoCorrect="off"
							debounceTimeout={500}
							minLength={2}
							onChange={searchForResults}
							placeholder="Search tags"
							value={q}
						/>
						<i aria-hidden="true" className="search icon" />
					</div>
					<div style={{ marginTop: "40px" }}>{SearchItems()}</div>
				</DefaultLayout>
			</div>
		</Provider>
	)
}

Tags.propTypes = {
	history: PropTypes.object
}

Tags.defaultProps = {}

const mapStateToProps = (state, ownProps) => ({
	...state.search,
	...ownProps
})

export default connect(mapStateToProps, {})(Tags)
