import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Container } from "semantic-ui-react"
import DefaultLayout from "layouts"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import store from "store"

const Tags = ({ history }) => {
	useEffect(() => {}, [])

	return (
		<Provider store={store}>
			<div className="tagsPage">
				<DisplayMetaTags page="tags" />

				<DefaultLayout activeItem="tags" containerClassName="tagsPage" history={history}>
					<Container className="mainContainer" textAlign="center"></Container>
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
