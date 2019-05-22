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
import { convertTimeToSeconds } from "utils/textFunctions"
import _ from "lodash"
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

	changeContradictionBeginTime = time => this.props.setContradictionBeginTime({ value: time })

	changeContradictionEndTime = time => this.props.setContradictionEndTime({ value: time })

	closeModal = () => {
		this.setState({
			explanation: "",
			id: "1",
			title: "",
			url: ""
		})
		this.props.toggleModal()
		this.props.clearContradiction()
		this.props.handleSubmit()
	}

	componentDidMount() {
		this.setState({ formVisible: true })
	}

	checkValidity = (c, type) => {
		const page = this.whichPage()
		let valid = true
		let msg = ""
		switch (type) {
			case "comment":
				if ((c.type === "comment" || c.type === "video") && page.id !== c.pageId) {
					msg = `Only comments and/or videos from ${
						page.name
					} can be used as evidence in cases of doublethink.`
					valid = false
				}
				if (c.type === "tweet") {
					msg = `Only comments and/or videos from ${
						page.name
					} can be used as evidence in cases of doublethink.`
					valid = false
				}
				break

			case "tweet":
				if (c.type === "comment") {
					msg = `YouTube comments can't be used to contradict tweets.`
					valid = false
				}
				if (c.type === "tweet" && page.id !== c.pageId) {
					msg = `Tweets can be used to show how they contradict other tweets. But, they have to be from the same account.`
					valid = false
				}
				break

			case "video":
				if (c.type === "comment" && page.id !== c.pageId) {
					msg = `Comments can be used as evidence of doublethink. But, they have to be from ${
						page.name
					}.`
					valid = false
				}
				break

			default:
				return {
					msg,
					valid
				}
		}

		return {
			msg,
			valid
		}
	}

	handleHoverOn = e => {
		let text = ""
		if (window.getSelection) {
			text = window.getSelection().toString()
		} else if (document.selection) {
			text = document.selection.createRange().text
		}
		this.setState({ highlightedText: text })
		this.props.setContradictionHighlight({ text })
	}

	onChangeAssignee = () => this.setState({ changed: true })

	onChangeContradiction = e => {
		if (e.keyCode === 8) {
			this.setState({ url: "" })
			this.props.clearContradiction()
		}
	}

	onChangeEndTime = time => this.props.setEndTime({ value: time })

	onChangeExplanation = (e, { value }) => this.setState({ explanation: value })

	onChangeFallacy = (e, { value }) => {
		this.props.clearContradiction()
		this.setState({ id: value })
	}

	onChangeStartTime = time => this.props.setBeginTime({ value: time })

	onChangeTitle = (e, { value }) => this.setState({ title: value })

	onPaste = e => {
		const value = e.clipboardData.getData("Text")
		this.setState({ url: value })
		this.props.parseContradiction({
			bearer: this.props.bearer,
			type: this.props.type,
			url: value
		})
	}

	onSubmitForm(e) {
		let type = this.props.type
		if (type === "video" && this.props.info.comment) {
			type = "comment"
		}
		const page = this.whichPage()
		const c = this.props.fallacy.contradiction

		let contradiction = null
		if (!_.isEmpty(c) && !c.error) {
			contradiction = JSON.stringify(c)
			const isValid = this.checkValidity(c, type)
			if (!isValid.valid) {
				return false
			}
		}

		const _state = store.getState()
		this.props.assignFallacy({
			bearer: this.props.bearer,
			contradiction,
			commentId: this.props.commentId,
			endTime: convertTimeToSeconds(_state.fallacyForm.endTime),
			explanation: this.state.explanation,
			fallacyId: this.state.id,
			highlightedText: this.props.highlightedText,
			network: this.props.network,
			objectId: this.props.objectId,
			pageId: page.id,
			startTime: convertTimeToSeconds(_state.fallacyForm.startTime),
			title: this.state.title
		})
	}

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
