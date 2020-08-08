import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Container } from "semantic-ui-react"
import DefaultLayout from "layouts"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import store from "store"

const Grifters = ({ history }) => {
	useEffect(() => {}, [])

	return (
		<Provider store={store}>
			<div className="tagsPage">
				<DisplayMetaTags page="grifters" />

				<DefaultLayout
					activeItem="grifters"
					containerClassName="griftersPage"
					history={history}
				>
					<Container className="mainContainer" textAlign="center"></Container>
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
