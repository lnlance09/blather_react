import "./style.css"
import { formatGrammar } from "utils/textFunctions"
import { connect } from "react-redux"
import { Comment, Header, Icon, Segment } from "semantic-ui-react"
import BillPic from "images/avatar/small/mark.png"
import fallacies from "fallacies.json"
import html2canvas from "html2canvas"
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

	componentDidMount() {
		fallacies.map((fallacy, i) => {
			if (parseInt(fallacy.id, 10) === this.props.id) {
				this.setState({ fallacy })
			}
			return true
		})
	}

	componentWillUpdate(newProps) {
		if (this.props.id !== newProps.id) {
			fallacies.map((fallacy, i) => {
				if (parseInt(fallacy.id, 10) === newProps.id) {
					this.setState({ fallacy })
				}
				return true
			})
		}
	}

	captureScreenshot(filename) {
		html2canvas(document.getElementById("fallacySegment"), {
			scale: 2
		}).then(canvas => {
			const ctx = canvas.getContext("2d")
			ctx.globalAlpha = 1
			let img = canvas.toDataURL("image/png")
			let link = document.createElement("a")
			link.download =
				filename
					.toLowerCase()
					.split(" ")
					.join("-") + ".png"
			link.href = img
			link.click()
		})
	}

	render() {
		const { fallacy } = this.state
		const FallacyConversation = dialogue =>
			dialogue.map((item, i) => {
				const pic = item.name === "Blathering Bill" ? BillPic : RobPic
				return (
					<Comment key={`${item.name}_${i}`}>
						<Comment.Avatar src={pic} />
						<Comment.Content>
							<Comment.Author>{item.name}</Comment.Author>
							<Comment.Text>{item.message}</Comment.Text>
						</Comment.Content>
					</Comment>
				)
			})

		return (
			<div className="fallacyRef">
				{fallacy && (
					<div>
						<Segment
							className="fallacySegment"
							id="fallacySegment"
							stacked={this.props.stacked}
						>
							{this.props.includeHeader && (
								<Header as="p" size="medium">
									What is {formatGrammar(fallacy.name)} <i>{fallacy.name}</i>?
								</Header>
							)}
							<p>{fallacy.description}</p>
							{this.props.showDialogue && (
								<Comment.Group>
									{FallacyConversation(fallacy.dialogue)}
								</Comment.Group>
							)}
						</Segment>
						{this.props.canScreenshot && (
							<span
								className="captureScreenshot"
								data-html2canvas-ignore
								onClick={() => this.captureScreenshot(fallacy.name)}
							>
								<Icon name="camera" /> capture screenshot
							</span>
						)}
					</div>
				)}
			</div>
		)
	}
}

FallacyRef.propTypes = {
	canScreenshot: PropTypes.bool,
	id: PropTypes.number,
	includeHeader: PropTypes.bool,
	stacked: PropTypes.bool,
	showDialogue: PropTypes.bool
}

FallacyRef.defaultProps = {
	canScreenshot: true,
	includeHeader: true,
	showDialogue: true,
	stacked: false
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacyRef,
	...ownProps
})

export default connect(
	mapStateToProps,
	{}
)(FallacyRef)
