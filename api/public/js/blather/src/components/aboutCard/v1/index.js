import "./style.css"
import { updateAbout } from "components/authentication/v1/actions"
import { linkMentions, linkHashtags } from "utils/linkifyAdditions"
import { connect, Provider } from "react-redux"
import { Button, Card, Icon, TextArea } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component } from "react"
import Linkify from "react-linkify"
import store from "store"

class AboutCard extends Component {
	constructor(props) {
		super(props)
		this.state = {
			editing: false,
			value: props.description
		}

		linkMentions(props.network)
		if (props.network === "facebook") {
			linkHashtags("https://www.facebook.com/hashtag/")
		}
		if (props.network === "twitter") {
			linkHashtags("https://www.twitter.com/hashtag/")
		}

		this.onChangeText = this.onChangeText.bind(this)
		this.updateDescription = this.updateDescription.bind(this)
	}

	onChangeText = (e, { value }) => this.setState({ value })

	updateDescription = () => {
		this.setState({ editing: false })
		this.props.updateAbout({
			bearer: this.props.bearer,
			bio: this.state.value
		})
	}

	render() {
		const { editing, value } = this.state
		const description =
			this.props.type === "page" ? this.props.description : this.props.data.bio
		const translateLink = text => {
			if (this.props.linkify) {
				return <Linkify properties={{ target: "_blank" }}>{text}</Linkify>
			}
			return text
		}
		return (
			<Provider store={store}>
				<Card className="aboutCard" fluid>
					<Card.Content>
						<Card.Header>
							{this.props.title}
							{this.props.canEdit && (
								<Icon
									className="editAboutIcon"
									name={editing ? "close" : "pencil"}
									onClick={() =>
										this.setState({
											editing: editing ? false : true
										})
									}
								/>
							)}
						</Card.Header>
					</Card.Content>
					<Card.Content>
						<Card.Description>
							{editing && (
								<Card.Description>
									<TextArea
										className="aboutTextarea"
										onChange={this.onChangeText}
										placeholder="What do you believe and why?"
										rows={5}
										value={value}
									/>
									<Button
										color="blue"
										compact
										fluid
										onClick={this.updateDescription}
									>
										Update
									</Button>
								</Card.Description>
							)}
							{!editing && <div>{translateLink(description)}</div>}
						</Card.Description>
					</Card.Content>
				</Card>
			</Provider>
		)
	}
}

AboutCard.propTypes = {
	bearer: PropTypes.string,
	canEdit: PropTypes.bool,
	description: PropTypes.string,
	network: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string,
	updateAbout: PropTypes.func
}

AboutCard.defaultProps = {
	canEdit: false,
	network: "twitter",
	type: "page",
	updateAbout: updateAbout
}

const mapStateToProps = (state, ownProps) => ({
	...state.user,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ updateAbout }
)(AboutCard)
