import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { sendContactMsg } from "pages/actions/about"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Container,
	Form,
	Header,
	Input,
	List,
	Menu,
	Message,
	Segment,
	TextArea,
	Transition
} from "semantic-ui-react"
import FallacyForm from "components/fallacyForm/v1/"
import Logo from "components/header/v1/images/logo.svg"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactSVG from "react-svg"
import store from "store"

class Home extends Component {
	constructor(props) {
		super(props)

		const currentState = store.getState()
		const user = currentState.user
		const auth = user.authenticated
		const bearer = user.bearer

		this.state = {
			auth,
			bearer,
			endTime: "",
			highlightedText: "",
			network: "",
			startTime: "",
			type: "twitter",
			user
		}
	}

	componentWillMount() {}

	render() {
		const {
			auth,
			bearer,
			endTime,
			highlightedText,
			id,
			network,
			pageInfo,
			startTime,
			type,
			user
		} = this.state
		const { page } = this.props

		return (
			<Provider store={store}>
				<div className="aboutPage">
					<DisplayMetaTags page="home" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						<div>
							<ReactSVG
								className="heroLogo"
								evalScripts="always"
								src={Logo}
								svgClassName="heroLogo"
							/>
							<Header as="h1" className="heroHeader" textAlign="center">
								Blather
								<Header.Subheader>Call out fallacious reasoning</Header.Subheader>
							</Header>
							<Input
								className="heroInput"
								fluid
								focus
								placeholder="Link to Tweet or YouTube video"
								size="big"
							/>
						</div>

						<FallacyForm
							authenticated={auth}
							bearer={bearer}
							commentId={type === "comment" ? id : null}
							endTime={endTime}
							handleSubmit={this.handleSubmit}
							highlightedText={highlightedText}
							history={this.props.history}
							network={network}
							objectId={id}
							pageInfo={page}
							sendNotification={this.props.sendNotification}
							startTime={startTime}
							type={type}
							user={user}
						/>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Home.propTypes = {
	page: {}
}

Home.defaultProps = {
	page: {}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.home,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		sendContactMsg
	}
)(Home)
