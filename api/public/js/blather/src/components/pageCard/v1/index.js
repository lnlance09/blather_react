import "./style.css"
import { Card, Image, Label, Placeholder, Progress } from "semantic-ui-react"
import Linkify from "react-linkify"
import ImagePic from "images/images/image-square.png"
import PropTypes from "prop-types"
import React, { Component, Fragment } from "react"

class PageCard extends Component {
	render() {
		const OverallReliability = (props, progress) => {
			let color = "green"
			let label = "Very Reliable"
			let percent = 100

			if (props.fallacyCount > 5) {
				color = "yellow"
				label = "Borderline Grifter"
				percent = 50
			}

			if (props.fallacyCount > 10) {
				color = "red"
				label = "Grifter"
				percent = 1
			}

			if (progress) {
				return <Progress color={color} percent={percent} />
			}

			return <Label color={color}>{label}</Label>
		}

		return (
			<Card
				className="pageCard"
				fluid
				onClick={() =>
					this.props.history.push(
						`/pages/${this.props.type}/${
							this.props.type === "twitter" ? this.props.username : this.props.pageId
						}`
					)
				}
			>
				{this.props.loading ? (
					<Placeholder>
						<Placeholder.Image square />
					</Placeholder>
				) : (
					<Image
						onError={i => (i.target.src = ImagePic)}
						src={this.props.img}
						ui={false}
						wrapped
					/>
				)}
				<Card.Content>
					{this.props.loading ? (
						<Placeholder>
							<Placeholder.Header>
								<Placeholder.Line length="very short" />
								<Placeholder.Line length="medium" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="short" />
							</Placeholder.Paragraph>
						</Placeholder>
					) : (
						<Fragment>
							<Card.Header>{this.props.name}</Card.Header>
							<Card.Meta>{this.props.fallacyCount} fallacies</Card.Meta>
							<Card.Description>
								<Linkify properties={{ target: "_blank" }}>
									{this.props.description}
								</Linkify>
							</Card.Description>
						</Fragment>
					)}
				</Card.Content>
				{!this.props.loading && (
					<Card.Content extra>{OverallReliability(this.props, false)}</Card.Content>
				)}
			</Card>
		)
	}
}

PageCard.propTypes = {
	description: PropTypes.string,
	fallacyCount: PropTypes.string,
	img: PropTypes.string,
	loading: PropTypes.bool,
	name: PropTypes.string,
	pageId: PropTypes.string,
	type: PropTypes.string,
	username: PropTypes.string
}

PageCard.defaultProps = {}

export default PageCard
