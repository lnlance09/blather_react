import "./style.css"
import { Comment, Header, Icon, Image, Segment } from "semantic-ui-react"
import BillPic from "images/avatar/small/mark.png"
import fallacies from "options/fallacies.json"
import html2canvas from "html2canvas"
import ImagePic from "images/images/image-square.png"
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
			this.matchFallacy(this.props.id)
			return true
		})
	}

	componentDidUpdate(prevProps) {
		if (this.props.id !== prevProps.id) {
			this.matchFallacy(this.props.id)
		}
	}

	captureScreenshot = filename => {
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

	matchFallacy = id => {
		fallacies.map((fallacy, i) => {
			if (parseInt(fallacy.id, 10) === id) {
				this.setState({ fallacy })
			}
			return true
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

		const FallacyImg = props => (
			<Image
				centered={props.imageCentered}
				crossOrigin="anonymous"
				fluid={props.imageFluid}
				onError={i => (i.target.src = ImagePic)}
				rounded
				size={props.imageFluid ? null : "large"}
				src={`https://blather22.s3.amazonaws.com/reference/${fallacy.key}.jpg`}
				style={{ opacity: props.opacity }}
			/>
		)

		return this.props.justImage ? (
			<div>{fallacy && FallacyImg(this.props)}</div>
		) : (
			fallacy && (
				<Segment
					className={`fallacySegment ${this.props.click ? "click" : null}`}
					onClick={() => this.props.onClick(fallacy.id)}
					stacked={this.props.stacked}
					style={{ opacity: this.props.opacity }}
				>
					{this.props.includeHeader && (
						<Header as="p" size="medium">
							{fallacy.name}
						</Header>
					)}

					<p>{fallacy.description}</p>

					{this.props.showDialogue && (
						<Comment.Group>{FallacyConversation(fallacy.dialogue)}</Comment.Group>
					)}

					{this.props.showImage && FallacyImg(this.props)}

					{this.props.canScreenshot && (
						<span
							className="captureScreenshot"
							data-html2canvas-ignore
							onClick={() => this.captureScreenshot(fallacy.name)}
						>
							<Icon name="camera" /> capture screenshot
						</span>
					)}
				</Segment>
			)
		)
	}
}

FallacyRef.propTypes = {
	canScreenshot: PropTypes.bool,
	click: PropTypes.bool,
	id: PropTypes.number,
	imageCentered: PropTypes.bool,
	imageFluid: PropTypes.bool,
	includeHeader: PropTypes.bool,
	justImage: PropTypes.bool,
	onClick: PropTypes.func,
	opacity: PropTypes.string,
	stacked: PropTypes.bool,
	showDialogue: PropTypes.bool,
	showImage: PropTypes.bool
}

FallacyRef.defaultProps = {
	canScreenshot: true,
	click: false,
	imageCentered: false,
	imageFluid: false,
	includeHeader: true,
	justImage: false,
	onClick: () => null,
	opacity: "1",
	showDialogue: true,
	showImage: false,
	stacked: false
}

export default FallacyRef
