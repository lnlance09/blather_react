import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import DefaultLayout from "layouts"
import PropTypes from "prop-types"
import React, { useEffect } from "react"
import store from "store"

const Notifications = ({ history }) => {
	useEffect(() => {}, [])

	return (
		<Provider store={store}>
			<div className="notificationsPage">
				<DisplayMetaTags page="notifications" />

				<DefaultLayout
					activeItem="notifications"
					containerClassName="notificationsPage"
					history={history}
				></DefaultLayout>
			</div>
		</Provider>
	)
}

Notifications.propTypes = {
	history: PropTypes.object
}

Notifications.defaultProps = {}

const mapStateToProps = (state, ownProps) => ({
	...state.search,
	...ownProps
})

export default connect(mapStateToProps, {})(Notifications)
