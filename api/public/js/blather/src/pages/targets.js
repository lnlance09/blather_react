import "./css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider, connect } from "react-redux"
import { Container, Header, Image, Message, Segment } from "semantic-ui-react"
import FallacyForm from "components/fallacyForm/v1/"
import FallaciesList from "components/fallaciesList/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import ParagraphPic from "images/short-paragraph.png"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import ThumbnailPic from "images/image.png"

class Targets extends Component {
	constructor(props) {
		super(props)
		const userId = this.props.match.params.userId
		const pageId = this.props.match.params.pageId
		const currentState = store.getState()
		const authenticated = currentState.user.authenticated
		const bearer = currentState.user.bearer
		this.state = {
			authenticated,
			bearer,
			pageId,
			userId
		}

		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleSubmit = () => this.setState({ submitted: this.state.submitted ? false : true })

	render() {
		const { authenticated, bearer, pageId, userId } = this.state
		const DisplayFallacies = props => {
			if (props.info) {
				return (
					<div className="fallaciesWrapper">
						<Header dividing size="small">
							Fallacies
						</Header>
						<FallaciesList
							emptyMsgHeader={false}
							emptyMsgContent={``}
							objectId={props.info.id}
							source="post"
							{...props}
						/>
					</div>
				)
			}
		}

		return (
			<Provider store={store}>
				<div className="targetsPage">
					<PageHeader {...this.props} />
					<Container
						className="mainContainer"
						text
						textAlign="left"
					>
						
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Targets.propTypes = {
	fallacyCount: PropTypes.number
}

Targets.defaultProps = {
	data: null
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.post,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{ }
)(Targets)
