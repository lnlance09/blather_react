import "./css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Comment, Container, Grid, Header, Menu, Segment } from "semantic-ui-react"
import BillPic from "images/avatar/small/mark.png"
import fallacies from "fallacies.json"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import RobPic from "images/avatar/small/matthew.png"
import store from "store"

class Fallacies extends Component {
	constructor(props) {
		super(props)
		const name = this.props.match.params.id
		const parsedName = name ? name.split("_").join(" ") : false
		this.state = {
			activeItem: parsedName ? parsedName : "ad hominem abusive",
			intervalId: 0
		}
	}

	scrollStep() {
		console.log("scroll step")
		if (window.pageYOffset === 0) {
			// clearInterval(this.state.intervalId)
		}
		// window.scroll(0, window.pageYOffset - 50)
	}

	scrollToTop() {
		let intervalId = setInterval(this.scrollStep.bind(this), "16.66")
		this.setState({ intervalId: intervalId })
	}

	handleItemClick = (e, { name }) => {
		this.scrollToTop()
		this.setState({ activeItem: name })
		this.props.history.push(`/fallacies/${name.split(" ").join("_")}`)
	}

	render() {
		const { activeItem } = this.state
		const fallaciesSidebar = fallacies.map(fallacy => (
			<Menu.Item
				active={activeItem === fallacy.name.toLowerCase()}
				key={fallacy.id}
				name={fallacy.name.toLowerCase()}
				onClick={this.handleItemClick}
			/>
		))
		const fallaciesConversation = dialogue =>
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
		const fallaciesMain = fallacies.map((fallacy, i) => {
			if (fallacy.name.toLowerCase() === activeItem) {
				return (
					<div className="mainFallacy active" key={fallacy.id}>
						<Segment piles>
							<Header as="p" size="small">
								{fallacy.name}
							</Header>
							<p>{fallacy.description} </p>
							<Comment.Group>{fallaciesConversation(fallacy.dialogue)}</Comment.Group>
						</Segment>
					</div>
				)
			}
			return null
		})

		return (
			<Provider store={store}>
				<div className="fallaciesPage">
					<DisplayMetaTags page="fallacies" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container
						className="mainContainer"
						textAlign="left"
						ref={this.handleContextRef}>
						<Header as="h1" dividing>
							Fallacies
							<Header.Subheader>Plus a few other things...</Header.Subheader>
						</Header>

						<Grid>
							<Grid.Column width={5}>
								<Menu borderless secondary className="fallaciesMenu" fluid vertical>
									{fallaciesSidebar}
								</Menu>
							</Grid.Column>
							<Grid.Column className="rightSide" width={11}>
								{fallaciesMain}
							</Grid.Column>
						</Grid>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Fallacies.propTypes = {
	fallacies: PropTypes.object
}

export default Fallacies
