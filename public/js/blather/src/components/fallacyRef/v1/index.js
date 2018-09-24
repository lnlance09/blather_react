import "./style.css"
import { connect } from "react-redux"
import { Comment, Header, Segment } from "semantic-ui-react"
import BillPic from "images/avatar/small/mark.png"
import fallacies from "fallacies.json"
import PropTypes from "prop-types"
import React, { Component } from "react"
import RobPic from "images/avatar/small/matthew.png"

class FallacyRef extends Component {
	constructor(props) {
		super(props)
		this.state = {
			fallacy: null
		}
	}

	componentWillMount() {
		fallacies.map((fallacy, i) => {
			if (parseInt(fallacy.id, 10) === this.props.id) {
				this.setState({ fallacy: fallacy })
			}
			return true
		})
	}

	render() {
		const { fallacy } = this.state
		const fallacyConversation = dialogue =>
			dialogue.map((item, i) => {
				const pic = item.name === "Blathering Bill" ? BillPic : RobPic
				return (
					<Comment key={`${item.name}_${i}`}>
						<Comment.Avatar src={pic} />
						<Comment.Content>
							<Comment.Author as="a">{item.name}</Comment.Author>
							<Comment.Text>{item.message}</Comment.Text>
						</Comment.Content>
					</Comment>
				)
			})

		return (
			<div className="fallacyRef">
				{fallacy && (
					<div>
						<Header as="p" attached="top">
							What is a {fallacy.name}?
						</Header>
						<Segment attached className="fallacySegment">
							<p>{fallacy.description}</p>
							{this.props.showDialogue && (
								<Comment.Group>
									{fallacyConversation(fallacy.dialogue)}
								</Comment.Group>
							)}
						</Segment>
					</div>
				)}
			</div>
		)
	}
}

FallacyRef.propTypes = {
	id: PropTypes.number,
	showDialogue: PropTypes.bool
}

FallacyRef.defaultProps = {
	showDialogue: true
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacyRef,
	...ownProps
})

export default connect(
	mapStateToProps,
	{}
)(FallacyRef)
